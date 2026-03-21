import { NextRequest, NextResponse } from 'next/server';
import { getGameClient } from '@/lib/openclaw/client';

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
  const urgency = gameState.turnsLeft <= 5 ? 'วิกฤต' : 'ปกติ';

  return `[ROLEPLAY MODE] คุณคือ ${god.name} (${god.role})
สไตล์: ${god.style}

สถานะปัจจุบัน:
- วัน: ${gameState.day}/20
- ทอง: ${gameState.gold}
- สกิลที่ Kane มี: ${totalSkills} ชิ้น
- ระดับความสนิทกับคุณ: ${bondLevel}

หน้าที่: ในสภาทวยเทพวันนี้ ให้คำแนะนำเชิงกลยุทธ์ 1 ประโยคสั้นๆ โดยเน้นเรื่อง: ${god.adviceFocus}
*** กฎ: ต้องวิเคราะห์จากข้อมูล "สถานะปัจจุบัน" จริงๆ (เช่น ถ้าทองน้อยให้เตือนเรื่องเงิน, ถ้าสกิลน้อยให้เตือนเรื่องความแข็งแกร่ง) ***
ตอบเป็นภาษาไทย อยู่ในบทบาทเทพเจ้าเท่านั้น`;
}

function getFallback(godId: string, gameState: GameState): string {
  const fallbacks: Record<string, string> = {
    leo: '"เจ้าต้องฝึกให้หนักกว่านี้ ถ้าอยากรอดจากเงื้อมมือ Vampire Lord"',
    arena: '"หัวใจที่ว่างเปล่าไม่อาจสัมผัสถึงพลังที่แท้จริง จงสร้างสายสัมพันธ์เถิด"',
    draco: '"เวลาคือทรัพยากรที่แพงที่สุด บริหารมันให้ดีก่อนที่จะสายเกินไป"',
  };
  return fallbacks[godId] || '"..."';
}

async function generateViaOpenClaw(gameState: GameState): Promise<{ godId: string; text: string; usage: any; prompt: string }[] | null> {
  const gatewayUrl = process.env.OPENCLAW_GATEWAY_URL;
  const gatewayToken = process.env.OPENCLAW_GATEWAY_TOKEN;
  if (!gatewayUrl || !gatewayToken) return null;
  try {
    const client = getGameClient();
    if (!client.isConnected()) await client.connect();
    const results = await Promise.allSettled(Object.entries(GOD_TO_AGENT).map(async ([godId, agentName]) => {
      const prompt = buildPromptForGod(godId, gameState);
      const sessionKey = `agent:main:mission-control-${agentName}`;
      try {
        const response = await client.sendChatAndWait(sessionKey, prompt, 25000);
        return { godId, text: response, prompt, usage: { total_tokens: Math.ceil((prompt.length + response.length) / 2) } };
      } catch { return { godId, text: getFallback(godId, gameState), usage: { total_tokens: 0 }, prompt: '' }; }
    }));
    return results.map(r => r.status === 'fulfilled' ? r.value : { godId: 'unknown', text: '"..."', usage: { total_tokens: 0 }, prompt: '' });
  } catch { return null; }
}

async function generateCouncilDialogue(gameState: GameState, apiKey: string): Promise<{ godId: string; text: string; usage: any; prompt: string }[]> {
  const godOrder = ['leo', 'arena', 'draco'];
  const results: { godId: string; text: string; usage: any; prompt: string }[] = [];
  for (const godId of godOrder) {
    const god = GOD_PROMPTS[godId];
    if (!god) continue;
    const systemPrompt = `คุณคือ ${god.name} (${god.role}) สไตล์: ${god.style}`;
    const userPrompt = `ให้คำแนะนำ 1 ประโยคสั้นๆ ภาษาไทย จากสถานะ: วัน ${gameState.day}, ทอง ${gameState.gold}, สกิล ${gameState.skills.length}. เน้นเรื่อง: ${god.adviceFocus}`;
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'HTTP-Referer': 'http://localhost:3000', 'X-Title': 'AI RPG Game' },
        body: JSON.stringify({ model: 'google/gemini-2.0-flash-001', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }], max_tokens: 100 })
      });
      const data = await response.json();
      results.push({ godId, text: data.choices?.[0]?.message?.content || getFallback(godId, gameState), usage: data.usage || { total_tokens: 0 }, prompt: fullPrompt });
    } catch { results.push({ godId, text: getFallback(godId, gameState), usage: { total_tokens: 0 }, prompt: fullPrompt }); }
  }
  return results;
}

async function generateAIDailyEvent(gameState: GameState, apiKey: string): Promise<{ event: any; usage: any; prompt: string }> {
  const systemPrompt = `สร้าง Daily Event RPG JSON ภาษาไทย: {"title": "...", "description": "...", "effect": "..."}`;
  const userPrompt = `วัน ${gameState.day}/20`;
  const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'HTTP-Referer': 'http://localhost:3000', 'X-Title': 'AI RPG Game' },
      body: JSON.stringify({ model: 'google/gemini-2.0-flash-001', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }], max_tokens: 100 })
    });
    const data = await response.json();
    const cleaned = data.choices?.[0]?.message?.content.replace(/```(?:json)?\s*/g, '').replace(/```\s*/g, '').trim();
    return { event: JSON.parse(cleaned), usage: data.usage || { total_tokens: 0 }, prompt: fullPrompt };
  } catch { return { event: null, usage: { total_tokens: 0 }, prompt: fullPrompt }; }
}

export async function POST(request: NextRequest) {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
  try {
    const gameState: GameState = await request.json();
    const openclawResult = await generateViaOpenClaw(gameState);
    if (openclawResult) {
      const dailyEventData = await generateAIDailyEvent(gameState, OPENROUTER_API_KEY);
      return NextResponse.json({ source: 'openclaw', prophecies: openclawResult.map(r => ({ godId: r.godId, godName: GOD_PROMPTS[r.godId]?.name, text: r.text, usage: r.usage, prompt: r.prompt })), dailyEvent: dailyEventData.event, eventUsage: dailyEventData.usage, eventPrompt: dailyEventData.prompt });
    }
    const [councilResults, dailyEventData] = await Promise.all([ generateCouncilDialogue(gameState, OPENROUTER_API_KEY), generateAIDailyEvent(gameState, OPENROUTER_API_KEY) ]);
    return NextResponse.json({ source: 'openrouter', prophecies: councilResults, dailyEvent: dailyEventData.event, eventUsage: dailyEventData.usage, eventPrompt: dailyEventData.prompt });
  } catch { return NextResponse.json({ source: 'fallback', prophecies: [] }); }
}
