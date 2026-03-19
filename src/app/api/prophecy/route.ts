import { NextRequest, NextResponse } from 'next/server';
import { getGameClient } from '@/lib/openclaw/client';

interface GameState {
  day: number;
  gold: number;
  bonds: Record<string, number>;
  skills: string[];
  turnsLeft: number;
}

// Map: godId → OpenClaw agent name
const GOD_TO_AGENT: Record<string, string> = {
  leo: 'emily',    // Emily → เลโอ (เทพสงคราม)
  arena: 'ember',  // Ember → อารีน่า (ราชินี)
  draco: 'mochi',  // Mochi → ดราโก้ (มังกร)
};

const GOD_PROMPTS: Record<string, { name: string; role: string; style: string }> = {
  leo: {
    name: 'เลโอ',
    role: 'เทพสงคราม ผู้เชี่ยวชาญด้านการต่อสู้',
    style: 'พูดตรง ห้วน ท้าทาย เน้นเรื่องการรบและความแข็งแกร่ง',
  },
  arena: {
    name: 'อารีน่า',
    role: 'ราชินีแห่งวิหาร ผู้เชี่ยวชาญด้านสายสัมพันธ์และพลังศักดิ์สิทธิ์',
    style: 'พูดสละสลวย ลึกลับ เหมือนกวี เน้นเรื่องความผูกพันและพลังภายใน',
  },
  draco: {
    name: 'ดราโก้',
    role: 'มังกรบรรพกาล ผู้เชี่ยวชาญด้านยุทธศาสตร์ภาพรวม',
    style: 'พูดช้า มีน้ำหนัก อ้างอิงอดีต เน้นเรื่องกลยุทธ์และจังหวะเวลา',
  },
};

function buildPromptForGod(godId: string, gameState: GameState): string {
  const god = GOD_PROMPTS[godId];
  if (!god) return '';

  const bondLevel = gameState.bonds[godId] || 0;
  const totalSkills = gameState.skills.length;
  const urgency = gameState.turnsLeft <= 5 ? 'วิกฤต เหลือเวลาน้อยมาก' : gameState.turnsLeft <= 10 ? 'เร่งด่วน' : 'ยังมีเวลา';

  return `[ROLEPLAY MODE] คุณกำลังเล่นบทเป็น ${god.name} (${god.role}) ในเกม "Gods' Arena (วิหารแห่งเทพ)"
สไตล์การพูด: ${god.style}

สถานะเกมของผู้เล่น Minju:
- วัน: ${gameState.day}/20 (${urgency} — เหลือ ${gameState.turnsLeft} วัน)
- ทอง: ${gameState.gold}
- Bond กับ ${god.name}: ${bondLevel}
- สกิลทั้งหมดของ Kane: ${totalSkills} ชิ้น (${gameState.skills.join(', ') || 'ยังไม่มี'})

เป้าหมาย: Minju ต้องเอาชนะ Vampire Lord ภายใน 20 วัน

ให้คำทำนายหรือคำแนะนำเชิงกลยุทธ์ 1-2 ประโยคสั้นๆ ตามสไตล์ของ ${god.name}
ตอบเป็นภาษาไทย อยู่ในบทบาทเท่านั้น ห้ามออกนอกเรื่อง`;
}

function getFallback(godId: string, gameState: GameState): string {
  const bondLevel = gameState.bonds[godId] || 0;
  const totalSkills = gameState.skills.length;
  const fallbacks: Record<string, string> = {
    leo: bondLevel < 5
      ? '"เจ้ายังอ่อนเกินไป มาหาข้าบ่อยกว่านี้ แล้วข้าจะให้พลังที่เจ้าต้องการ"'
      : '"ดี เจ้าเริ่มแข็งแกร่งขึ้น แต่ Vampire Lord ไม่ใช่ศัตรูธรรมดา — เตรียมตัวให้มากกว่านี้"',
    arena: totalSkills < 2
      ? '"ดอกไม้ที่ยังไม่บาน ไม่อาจต้านพายุได้ เจ้าต้องสะสมพลังให้มากกว่านี้"'
      : '"ข้าเห็นแสงสว่างในตัวเจ้ามากขึ้น แต่ความมืดยังรอเจ้าอยู่ข้างหน้า"',
    draco: gameState.turnsLeft <= 5
      ? '"ฮึ่ม... เวลาใกล้หมดแล้ว ข้าเคยเห็นมนุษย์ที่รีรอจนสายเกินไป — อย่าเป็นเหมือนพวกเขา"'
      : '"อย่ารีบร้อน ข้าเคยเห็นอารยธรรมที่เข้มแข็งที่สุดล่มสลายเพราะวางแผนผิด — ใช้เวลาให้คุ้ม"',
  };
  return fallbacks[godId] || '"..."';
}

// --- OpenClaw Gateway Strategy ---
async function generateViaOpenClaw(gameState: GameState): Promise<{ godId: string; text: string; usage: any; prompt: string }[] | null> {
  const gatewayUrl = process.env.OPENCLAW_GATEWAY_URL;
  const gatewayToken = process.env.OPENCLAW_GATEWAY_TOKEN;
  
  if (!gatewayUrl || !gatewayToken) return null;

  try {
    const client = getGameClient();
    if (!client.isConnected()) {
      await client.connect();
    }

    const results = await Promise.allSettled(
      Object.entries(GOD_TO_AGENT).map(async ([godId, agentName]) => {
        const prompt = buildPromptForGod(godId, gameState);
        const sessionKey = `agent:main:mission-control-${agentName}`;

        try {
          const response = await client.sendChatAndWait(sessionKey, prompt, 25000);
          return {
            godId,
            text: response,
            prompt,
            usage: {
              prompt_tokens: Math.ceil(prompt.length / 2),
              completion_tokens: Math.ceil(response.length / 2),
              total_tokens: Math.ceil((prompt.length + response.length) / 2)
            }
          };
        } catch (err) {
          return { godId, text: getFallback(godId, gameState), usage: { total_tokens: 0 }, prompt: '' };
        }
      })
    );

    return results.map(r => r.status === 'fulfilled' ? r.value : { godId: 'unknown', text: '"..."', usage: { total_tokens: 0 }, prompt: '' });
  } catch (err) {
    return null;
  }
}

// --- Sequential Council Dialogue ---
async function generateCouncilDialogue(gameState: GameState, apiKey: string): Promise<{ godId: string; text: string; usage: any; prompt: string }[]> {
  const godOrder = ['leo', 'arena', 'draco'];
  const results: { godId: string; text: string; usage: any; prompt: string }[] = [];
  const priorStatements: string[] = [];

  const bonds = { leo: gameState.bonds['leo'] || 0, arena: gameState.bonds['arena'] || 0, draco: gameState.bonds['draco'] || 0 };
  const avgBond = Math.round((bonds.leo + bonds.arena + bonds.draco) / 3);
  const urgency = gameState.turnsLeft <= 5 ? 'วิกฤต' : 'ปกติ';

  const gameContext = `สถานะ: วัน ${gameState.day}/20 (${urgency}) ทอง ${gameState.gold} Bondเฉลี่ย ${avgBond}`;

  for (const godId of godOrder) {
    const god = GOD_PROMPTS[godId];
    if (!god) continue;

    const councilContext = priorStatements.length > 0 ? `\n\nพรรคพวกพูดว่า:\n${priorStatements.join('\n')}` : '';
    const systemPrompt = `คุณคือ ${god.name} ในสภาทวยเทพ RPG`;
    const userPrompt = `${gameContext}${councilContext}\n\nพูด 1 ประโยคสั้นๆ`;
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'AI RPG Game',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-001',
          messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
          max_tokens: 100,
        }),
      });
      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || getFallback(godId, gameState);
      results.push({ godId, text, usage: data.usage || { total_tokens: 0 }, prompt: fullPrompt });
      priorStatements.push(`${god.name}: ${text}`);
    } catch {
      results.push({ godId, text: getFallback(godId, gameState), usage: { total_tokens: 0 }, prompt: fullPrompt });
    }
  }
  return results;
}

// Daily Event
async function generateAIDailyEvent(gameState: GameState, apiKey: string): Promise<{ event: any; usage: any; prompt: string }> {
  const systemPrompt = `สร้าง Daily Event RPG JSON`;
  const userPrompt = `วัน ${gameState.day}/20`;
  const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
        max_tokens: 100,
      }),
    });
    const data = await response.json();
    const cleaned = data.choices?.[0]?.message?.content.replace(/```(?:json)?\s*/g, '').replace(/```\s*/g, '').trim();
    return { event: JSON.parse(cleaned), usage: data.usage || { total_tokens: 0 }, prompt: fullPrompt };
  } catch {
    return { event: null, usage: { total_tokens: 0 }, prompt: fullPrompt };
  }
}

export async function POST(request: NextRequest) {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
  try {
    const gameState: GameState = await request.json();
    const openclawResult = await generateViaOpenClaw(gameState);

    if (openclawResult) {
      const dailyEventData = await generateAIDailyEvent(gameState, OPENROUTER_API_KEY);
      return NextResponse.json({
        source: 'openclaw',
        prophecies: openclawResult.map(r => ({
          godId: r.godId,
          godName: GOD_PROMPTS[r.godId]?.name,
          text: r.text,
          usage: r.usage,
          prompt: r.prompt
        })),
        dailyEvent: dailyEventData.event,
        eventUsage: dailyEventData.usage,
        eventPrompt: dailyEventData.prompt
      });
    }

    const [councilResults, dailyEventData] = await Promise.all([
      generateCouncilDialogue(gameState, OPENROUTER_API_KEY),
      generateAIDailyEvent(gameState, OPENROUTER_API_KEY),
    ]);

    return NextResponse.json({
      source: 'openrouter',
      prophecies: councilResults,
      dailyEvent: dailyEventData.event,
      eventUsage: dailyEventData.usage,
      eventPrompt: dailyEventData.prompt
    });
  } catch (error) {
    return NextResponse.json({ source: 'fallback', prophecies: [] });
  }
}
