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
async function generateViaOpenClaw(gameState: GameState): Promise<{ godId: string; text: string }[] | null> {
  const gatewayUrl = process.env.OPENCLAW_GATEWAY_URL;
  const gatewayToken = process.env.OPENCLAW_GATEWAY_TOKEN;
  
  console.log('[Prophecy] Gateway Config:', { url: gatewayUrl, hasToken: !!gatewayToken });
  if (!gatewayUrl || !gatewayToken) {
    console.warn('[Prophecy] Missing Gateway configuration');
    return null;
  }

  try {
    const client = getGameClient();
    console.log(`[Prophecy] Gateway URL: ${gatewayUrl}`);
    
    if (!client.isConnected()) {
      console.log('[Prophecy] Client not connected, initiating connection...');
      await client.connect();
    }
    console.log('[Prophecy] Client connected/authenticated successfully');

    // Send prompts to all 3 agents in parallel
    const results = await Promise.allSettled(
      Object.entries(GOD_TO_AGENT).map(async ([godId, agentName]) => {
        const prompt = buildPromptForGod(godId, gameState);
        const sessionKey = `agent:main:mission-control-${agentName}`;

        try {
          console.log(`[Prophecy] Requesting from agent: ${agentName} (key: ${sessionKey})...`);
          const response = await client.sendChatAndWait(sessionKey, prompt, 25000);
          console.log(`[Prophecy] Agent ${agentName} responded successfully. Length: ${response.length}`);
          return { godId, text: response };
        } catch (err) {
          console.warn(`[Prophecy] Agent ${agentName} failed or timed out:`, err instanceof Error ? err.message : err);
          return { godId, text: getFallback(godId, gameState) };
        }
      })
    );

    return results.map(r => r.status === 'fulfilled' ? r.value : { godId: 'unknown', text: '"..."' });
  } catch (err) {
    console.error('[Prophecy] OpenClaw Gateway error:', err instanceof Error ? err.message : err);
    return null;
  }
}

// --- OpenRouter Fallback Strategy ---
async function generateViaOpenRouter(godId: string, gameState: GameState, apiKey: string): Promise<string> {
  const god = GOD_PROMPTS[godId];
  if (!god) return '"..."';

  if (!apiKey || apiKey.includes('000000')) {
    return getFallback(godId, gameState);
  }

  const systemPrompt = `คุณคือ ${god.name} ${god.role} ในเกม "Gods' Arena"
สไตล์: ${god.style}

คุณกำลังให้คำทำนายและคำแนะนำแก่ Minju (ผู้เล่น) เกี่ยวกับการเตรียมตัวสู้ Vampire Lord
วิเคราะห์สถานะเกมแล้วให้คำแนะนำ 1-2 ประโยคสั้นๆ ตามสไตล์ของคุณ
ห้ามออกจากบทบาท พูดภาษาไทย`;

  const bondLevel = gameState.bonds[godId] || 0;
  const totalSkills = gameState.skills.length;
  const urgency = gameState.turnsLeft <= 5 ? 'วิกฤต' : gameState.turnsLeft <= 10 ? 'เร่งด่วน' : 'ยังมีเวลา';

  const userPrompt = `สถานะเกม:
- วัน: ${gameState.day}/20 (${urgency} — เหลือ ${gameState.turnsLeft} วัน)
- ทอง: ${gameState.gold}
- Bond กับ ${god.name}: ${bondLevel}
- สกิลทั้งหมดของ Kane: ${totalSkills} ชิ้น (${gameState.skills.join(', ') || 'ยังไม่มี'})

ให้คำทำนายหรือคำแนะนำสั้นๆ`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'AI RPG Game - Divine Council',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 150,
        temperature: 0.9,
      }),
    });
    if (!response.ok) throw new Error('API failed');
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '"..."';
  } catch {
    return getFallback(godId, gameState);
  }
}

// --- God-to-God Council Dialogue (Sequential) ---
// Each god sees what previous gods said, creating a conversational flow
async function generateCouncilDialogue(gameState: GameState, apiKey: string): Promise<{ godId: string; text: string }[]> {
  const godOrder = ['leo', 'arena', 'draco'];
  const results: { godId: string; text: string }[] = [];
  const priorStatements: string[] = [];

  const bondLevel = (id: string) => gameState.bonds[id] || 0;
  const totalSkills = gameState.skills.length;
  const urgency = gameState.turnsLeft <= 5 ? 'วิกฤต เหลือเวลาน้อยมาก' : gameState.turnsLeft <= 10 ? 'เร่งด่วน' : 'ยังมีเวลา';

  const gameContext = `สถานะเกม:
- วัน: ${gameState.day}/20 (${urgency} — เหลือ ${gameState.turnsLeft} วัน)
- ทอง: ${gameState.gold}
- Bond: เลโอ=${bondLevel('leo')}, อารีน่า=${bondLevel('arena')}, ดราโก้=${bondLevel('draco')}
- สกิลของ Kane: ${totalSkills} ชิ้น (${gameState.skills.join(', ') || 'ยังไม่มี'})
- เป้าหมาย: เอาชนะ Vampire Lord ภายใน 20 วัน`;

  if (!apiKey || apiKey.includes('000000')) {
    // Fallback: use conversation-style hardcoded fallbacks
    return generateCouncilFallback(gameState);
  }

  for (const godId of godOrder) {
    const god = GOD_PROMPTS[godId];
    if (!god) continue;

    const councilContext = priorStatements.length > 0
      ? `\n\n=== คำพูดของเทพองค์ก่อน ===\n${priorStatements.join('\n')}\n\nตอบโต้หรือเสริมความเห็นของเทพองค์ก่อน ตามสไตล์ของคุณ เช่น เห็นด้วย โต้แย้ง หรือเพิ่มมุมมองใหม่`
      : '';

    const systemPrompt = `คุณคือ ${god.name} (${god.role}) ในสภาแห่งทวยเทพ เกม "Gods' Arena"
สไตล์: ${god.style}

คุณกำลังประชุมร่วมกับเทพองค์อื่นเพื่อหารือเรื่องสถานการณ์ของ Minju (ผู้เล่น)
พูด 1-2 ประโยค ตามสไตล์ของคุณ ภาษาไทย อยู่ในบทบาท
ห้ามพูดว่าตัวเองเป็น AI ห้ามออกนอกเรื่อง`;

    const userPrompt = `${gameContext}${councilContext}

${priorStatements.length === 0 ? 'คุณเป็นคนเริ่มพูดก่อน — เปิดประเด็นเรื่องสถานการณ์ของ Minju' : ''}`;

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'AI RPG Game - Divine Council',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-001',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 120,
          temperature: 0.9,
        }),
      });
      if (!response.ok) throw new Error('API failed');
      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || getFallback(godId, gameState);
      results.push({ godId, text });
      priorStatements.push(`${god.name}: ${text}`);
    } catch {
      const text = getFallback(godId, gameState);
      results.push({ godId, text });
      priorStatements.push(`${god.name}: ${text}`);
    }
  }

  return results;
}

function generateCouncilFallback(gameState: GameState): { godId: string; text: string }[] {
  const turnsLeft = gameState.turnsLeft;
  const totalSkills = (gameState.skills || []).length;
  const bondLeo = gameState.bonds['leo'] || 0;

  if (turnsLeft <= 5) {
    return [
      { godId: 'leo', text: '"เวลาเหลือน้อยแล้ว! เราต้องหยุดถกเถียงและลงมือสู้ได้แล้ว!"' },
      { godId: 'arena', text: '"เลโอพูดถูก... แต่ความเร่งร้อนก็เป็นศัตรูได้เหมือนกัน — Minju ต้องใช้ทุกสิ่งที่มีอย่างฉลาด"' },
      { godId: 'draco', text: '"ฮึ่ม... ข้าเห็นด้วยกับทั้งสอง เวลาเหลือน้อย แต่การวางแผนดีหนึ่งครั้ง ดีกว่าการบุกไปตายสิบครั้ง"' },
    ];
  } else if (totalSkills < 2) {
    return [
      { godId: 'leo', text: '"Kane ยังมีสกิลน้อยเกินไป — ถ้าไม่มีอาวุธที่ดี จะสู้ Vampire Lord ได้ยังไง?"' },
      { godId: 'arena', text: '"ข้าเห็นด้วย... สายสัมพันธ์ยังไม่แน่นแฟ้นพอ Minju ควรมาหาพวกเราบ่อยกว่านี้"' },
      { godId: 'draco', text: '"ฮึ่ม... อย่ากังวลมากนัก ยังมีเวลา — แต่ต้องใช้อย่างคุ้มค่า"' },
    ];
  } else {
    return [
      { godId: 'leo', text: `"${bondLeo >= 5 ? 'Minju เริ่มแข็งแกร่งขึ้น ข้าพอใจ' : 'เจ้ายังมาหาข้าไม่พอ'} — แต่ Vampire Lord ไม่ใช่ศัตรูธรรมดา"` },
      { godId: 'arena', text: '"ข้าเห็นศักยภาพในตัว Minju... แต่ต้องสะสมพลังให้มากกว่านี้ก่อนจะถึงวันชี้ชะตา"' },
      { godId: 'draco', text: '"ฮึ่ม... ข้าเคยเห็นนักรบที่เก่งกว่านี้ล้มเหลว เพราะประมาท — Minju อย่าทำผิดพลาดเดียวกัน"' },
    ];
  }
}

export async function POST(request: NextRequest) {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';

  try {
    const gameState: GameState = await request.json();

    // Strategy 1: Try OpenClaw Gateway (multi-agent orchestration)
    const openclawResult = await generateViaOpenClaw(gameState);

    if (openclawResult) {
      console.log('[Prophecy] Generated via OpenClaw Gateway');
      return NextResponse.json({
        source: 'openclaw',
        prophecies: openclawResult.map(r => ({
          godId: r.godId,
          godName: GOD_PROMPTS[r.godId]?.name || r.godId,
          emoji: r.godId === 'leo' ? '⚔️' : r.godId === 'arena' ? '👑' : '🐉',
          text: r.text,
          agentName: GOD_TO_AGENT[r.godId] || null,
        })),
      });
    }

    // Strategy 2: Fallback to OpenRouter API — God-to-God Council Dialogue
    console.log('[Prophecy] Falling back to OpenRouter API (council dialogue)');
    const councilResults = await generateCouncilDialogue(gameState, OPENROUTER_API_KEY);

    return NextResponse.json({
      source: 'openrouter',
      prophecies: councilResults.map(r => ({
        godId: r.godId,
        godName: GOD_PROMPTS[r.godId]?.name || r.godId,
        emoji: r.godId === 'leo' ? '⚔️' : r.godId === 'arena' ? '👑' : '🐉',
        text: r.text,
      })),
    });
  } catch (error) {
    console.error('Prophecy error:', error);
    return NextResponse.json({
      source: 'fallback',
      prophecies: [
        { godId: 'leo', godName: 'เลโอ', emoji: '⚔️', text: '"..."' },
        { godId: 'arena', godName: 'อารีน่า', emoji: '👑', text: '"..."' },
        { godId: 'draco', godName: 'ดราโก้', emoji: '🐉', text: '"..."' },
      ],
    });
  }
}
