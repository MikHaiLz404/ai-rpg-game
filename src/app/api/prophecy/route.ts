import { NextRequest, NextResponse } from 'next/server';
import { getGameClient } from '@/lib/openclaw/client';
import { prophecyDeduplicator } from '@/lib/utils/deduplication';

interface GameState {
  day: number;
  gold: number;
  bonds: Record<string, number>;
  skills: string[];
  turnsLeft: number;
}

const GOD_TO_AGENT: Record<string, string> = {
  leo: 'emily',
  arena: 'ember',
  draco: 'mochi',
};

const GOD_PROMPTS: Record<string, { name: string; role: string; style: string; adviceFocus: string }> = {
  leo: {
    name: 'เลโอ',
    role: 'เทพสงคราม ผู้เชี่ยวชาญด้านการต่อสู้',
    style: 'พูดตรง ห้วน ท้าทาย เน้นเรื่องการรบและความแข็งแกร่ง',
    adviceFocus: 'วิเคราะห์ว่าผู้เล่นมีสกิลพอจะสู้หรือไม่ และแนะนำให้เน้นฝึกซ้อมใน Arena'
  },
  arena: {
    name: 'อารีน่า',
    role: 'ราชินีแห่งวิหาร ผู้เชี่ยวชาญด้านสายสัมพันธ์',
    style: 'พูดสละสลวย ลึกลับ เหมือนกวี เน้นเรื่องความผูกพันและพลังภายใน',
    adviceFocus: 'วิเคราะห์สายสัมพันธ์ และแนะนำให้คุยหรือให้ของขวัญเทพเพื่อรับพลังใหม่'
  },
  draco: {
    name: 'ดราโก้',
    role: 'มังกรบรรพกาล ผู้เชี่ยวชาญด้านยุทธศาสตร์ภาพรวม',
    style: 'พูดช้า มีน้ำหนัก อ้างอิงอดีต เน้นเรื่องกลยุทธ์และจังหวะเวลา',
    adviceFocus: 'วิเคราะห์การบริหารเงินทองและเวลาที่เหลือ แนะนำเรื่องการซื้อของหรือเก็บออม'
  },
};

function buildPromptForGod(godId: string, gameState: GameState): string {
  const god = GOD_PROMPTS[godId];
  if (!god) return '';
  const bondLevel = gameState.bonds[godId] || 0;
  const totalSkills = gameState.skills.length;
  return `[ROLEPLAY MODE] คุณคือ ${god.name} (${god.role})
สไตล์: ${god.style}
สถานะ: วัน ${gameState.day}/20, ทอง ${gameState.gold}, สกิล ${totalSkills}, Bond ${bondLevel}
หน้าที่: ให้คำแนะนำเชิงกลยุทธ์ 1 ประโยคสั้นๆ โดยเน้น: ${god.adviceFocus}
ตอบเป็นภาษาไทย อยู่ในบทบาทเทพเจ้าเท่านั้น`;
}

function getFallback(godId: string): string {
  const fallbacks: Record<string, string> = {
    leo: '"เจ้าต้องฝึกให้หนักกว่านี้ ถ้าอยากรอดจากเงื้อมมือ Hydra"',
    arena: '"หัวใจที่ว่างเปล่าไม่อาจสัมผัสถึงพลังที่แท้จริง จงสร้างสายสัมพันธ์เถิด"',
    draco: '"เวลาคือทรัพยากรที่แพงที่สุด บริหารมันให้ดีก่อนที่จะสายเกินไป"',
  };
  return fallbacks[godId] || '"..."';
}

const DAILY_EVENT_TEMPLATES = [
  { title: 'เทศกาลจาริกแสวงบุญ', description: 'เหล่าสาวกแห่กันมาที่วิหาร! วันนี้ยอดขายทองจะเพิ่มขึ้นเป็น 2 เท่า', emoji: '🎊', effect: { type: 'gold_boost', value: 2.0 } },
  { title: 'มาตรการคว่ำบาตรจากสภา', description: 'สภาเทพสั่งจำกัดทรัพยากร! วันนี้ต้นทุนการเติมของเพิ่มขึ้น 50%', emoji: '🛑', effect: { type: 'restock_penalty', value: 1.5 } },
  { title: 'ความโปรดปรานจากเบื้องบน', description: 'ทวยเทพมอบความเมตตา! วันนี้ต้นทุนการเติมของลดลง 30%', emoji: '✨', effect: { type: 'restock_discount', value: 0.7 } },
  { title: 'ช่วงเวลาแห่งการฝึกฝน', description: 'สนามรบกำลังเรียกร้อง! วันนี้การชนะใน Arena จะได้รับ IP เพิ่มขึ้น', emoji: '⚔️', effect: { type: 'ip_boost', value: 5 } },
  { title: 'วันหยุดพักผ่อนของเหล่าเทพ', description: 'เหล่าเทพออกไปพักผ่อน... วันนี้การเพิ่ม Bond จากการคุยจะยากขึ้น', emoji: '💤', effect: { type: 'bond_penalty', value: 0.5 } },
];

async function generateViaOpenClaw(gameState: GameState): Promise<{ godId: string; text: string; usage: any; prompt: string; logs: string[] }[] | null> {
  const gatewayUrl = process.env.OPENCLAW_GATEWAY_URL;
  const gatewayToken = process.env.OPENCLAW_GATEWAY_TOKEN;
  if (!gatewayUrl || !gatewayToken) return null;
  
  const client = getGameClient();
  try {
    if (!client.isConnected()) await client.connect();
    const results = await Promise.allSettled(Object.entries(GOD_TO_AGENT).map(async ([godId, agentName]) => {
      const prompt = buildPromptForGod(godId, gameState);
      const sessionKey = `agent:main:mission-control-${agentName}`;
      try {
        const result = await client.sendChatAndWait(sessionKey, prompt, 25000);
        return { godId, text: result.response, prompt, usage: { total_tokens: Math.ceil((prompt.length + result.response.length) / 2) }, logs: result.logs };
      } catch (err) {
        client.log(`[PROPHECY] OpenClaw generated error: ${err instanceof Error ? err.message : String(err)}`);
        return { godId, text: getFallback(godId), usage: { total_tokens: 0 }, prompt: '', logs: client.getLogs() }; 
      }
    }));
    return results.map(r => r.status === 'fulfilled' ? r.value : { godId: 'unknown', text: '"..."', usage: { total_tokens: 0 }, prompt: '', logs: client.getLogs() });
  } catch (err) {
    client.log(`[PROPHECY] OpenClaw connection error: ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }
}

async function generateAIDailyEvent(gameState: GameState, apiKey: string): Promise<{ event: any; usage: any; prompt: string }> {
  const selectedTemplate = DAILY_EVENT_TEMPLATES[Math.floor(Math.random() * DAILY_EVENT_TEMPLATES.length)];
  
  if (!apiKey || apiKey.includes('000000')) {
    return { event: selectedTemplate, usage: { total_tokens: 0 }, prompt: 'Template fallback' };
  }

  const systemPrompt = `คุณคือผู้ดูแลระบบเหตุการณ์ในเกม RPG "Gods' Arena" หน้าที่ของคุณคือสุ่มเลือก 1 เหตุการณ์จากรายการที่กำหนด และบรรยายให้ดูน่าตื่นเต้น 1 ประโยค`;
  const userPrompt = `เลือกจาก: ${JSON.stringify(DAILY_EVENT_TEMPLATES)}\n\nตอบเป็น JSON เท่านั้น: {"title": "...", "description": "...", "effect": {"type": "...", "value": 1.0}, "emoji": "..."}`;
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'HTTP-Referer': 'http://localhost:3000', 'X-Title': 'AI RPG Game' },
      body: JSON.stringify({ model: 'google/gemini-2.0-flash-001', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }], max_tokens: 150 })
    });
    const data = await response.json();
    const cleaned = data.choices?.[0]?.message?.content.replace(/```(?:json)?\s*/g, '').replace(/```\s*/g, '').trim();
    return { event: JSON.parse(cleaned), usage: data.usage || { total_tokens: 0 }, prompt: userPrompt };
  } catch {
    return { event: selectedTemplate, usage: { total_tokens: 0 }, prompt: 'Error fallback' };
  }
}

export async function POST(request: NextRequest) {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
  try {
    const gameState: GameState = await request.json();

    // Basic request validation
    if (!gameState || typeof gameState !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    if (typeof gameState.day !== 'number' || typeof gameState.gold !== 'number') {
      return NextResponse.json({ error: 'Missing required fields: day and gold' }, { status: 400 });
    }

    // REQUEST DEDUPLICATION:
    // Generate a deduplication key from game state parameters.
    // Duplicate requests (same day + gold + bonds + skills) within 10 seconds will return
    // the same response instead of making new API calls.
    const dedupeKey = prophecyDeduplicator.generateKey('prophecy', {
      day: gameState.day,
      gold: gameState.gold,
      bonds: gameState.bonds,
      skills: gameState.skills,
    });

    const response = await prophecyDeduplicator.deduplicate(dedupeKey, async () => {
      return await generateProphecyResponse(gameState, OPENROUTER_API_KEY);
    });

    return NextResponse.json(response);
  } catch { return NextResponse.json({ source: 'fallback', prophecies: [] }); }
}

/**
 * Internal function to generate prophecy response.
 * This is wrapped by deduplication in the POST handler.
 */
async function generateProphecyResponse(gameState: GameState, OPENROUTER_API_KEY: string) {
  const openclawResult = await generateViaOpenClaw(gameState);

  const dailyEventData = await generateAIDailyEvent(gameState, OPENROUTER_API_KEY);

  if (openclawResult) {
    return {
      source: 'openclaw',
      prophecies: openclawResult.map(r => ({ godId: r.godId, godName: GOD_PROMPTS[r.godId]?.name, text: r.text, usage: r.usage, prompt: r.prompt })),
      dailyEvent: dailyEventData.event,
      eventUsage: dailyEventData.usage,
      eventPrompt: dailyEventData.prompt,
      gatewayLogs: openclawResult.flatMap(r => r.logs || [])
    };
  }

  const results: any[] = [];
  for (const godId of ['leo', 'arena', 'draco']) {
      const prompt = buildPromptForGod(godId, gameState);
      try {
          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${OPENROUTER_API_KEY}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ model: 'google/gemini-2.0-flash-001', messages: [{role:'system', content:prompt}], max_tokens: 100 })
          });
          const data = await response.json();
          results.push({ godId, text: data.choices?.[0]?.message?.content || getFallback(godId), usage: data.usage });
      } catch { results.push({ godId, text: getFallback(godId), usage: { total_tokens: 0 } }); }
  }

  return {
    source: 'openrouter',
    prophecies: results,
    dailyEvent: dailyEventData.event,
    eventUsage: dailyEventData.usage,
    eventPrompt: dailyEventData.prompt
  };
}
