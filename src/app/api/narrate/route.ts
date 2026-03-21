import { NextRequest, NextResponse } from 'next/server';
import { getGameClient } from '@/lib/openclaw/client';

// Deterministic fallback skills per god (indexed by level-1)
const FALLBACK_SKILLS: Record<string, { name: string; description: string; multiplier: number; type: string }[]> = {
  'เลโอ': [
    { name: 'War Cry', description: 'เสียงกึกก้องจากสมรภูมิ', multiplier: 1.5, type: 'physical' },
    { name: 'Blade Storm', description: 'พายุดาบแห่งเทพสงคราม', multiplier: 2.0, type: 'physical' },
    { name: 'Olympian Fury', description: 'ความโกรธแค้นแห่งโอลิมปัส', multiplier: 2.5, type: 'physical' },
    { name: 'God of War', description: 'พลังสูงสุดของเทพสงคราม', multiplier: 3.0, type: 'physical' },
    { name: 'Eternal Vanguard', description: 'หอกนำทัพนิรันดร์', multiplier: 2.8, type: 'physical' },
  ],
  'อารีน่า': [
    { name: 'Holy Light', description: 'แสงศักดิ์สิทธิ์แห่งราชินี', multiplier: 1.5, type: 'magical' },
    { name: 'Starfall', description: 'ฝนดาวตกจากสวรรค์', multiplier: 2.0, type: 'magical' },
    { name: 'Crown Judgment', description: 'คำพิพากษาแห่งมงกุฎ', multiplier: 2.5, type: 'magical' },
    { name: 'Divine Radiance', description: 'รัศมีสูงสุดแห่งวิหาร', multiplier: 3.0, type: 'magical' },
    { name: 'Celestial Bond', description: 'สายสัมพันธ์เบื้องบน', multiplier: 2.8, type: 'magical' },
  ],
  'ดราโก้': [
    { name: 'Dragon Breath', description: 'ลมหายใจมังกรบรรพกาล', multiplier: 1.5, type: 'magical' },
    { name: 'Ancient Tremor', description: 'แผ่นดินไหวแห่งยุคโบราณ', multiplier: 2.0, type: 'physical' },
    { name: 'Wyrm Coil', description: 'ขดพญานาคสยบศัตรู', multiplier: 2.5, type: 'physical' },
    { name: 'Primordial Flame', description: 'เปลวไฟดั้งเดิมแห่งโลก', multiplier: 3.0, type: 'magical' },
    { name: 'Epoch Crusher', description: 'พลังทำลายกาลเวลา', multiplier: 2.8, type: 'magical' },
  ],
};

const NPC_TO_AGENT: Record<string, string> = {
  'เลโอ': 'emily',
  'อารีน่า': 'ember',
  'ดราโก้': 'mochi',
};

// Configuration: Set to true to use OpenRouter directly for gods (bypassing OpenClaw)
const USE_OPENROUTER_FOR_GODS = true;

async function generateViaOpenClaw(npcName: string, prompt: string): Promise<string | null> {
  const agentName = NPC_TO_AGENT[npcName];
  if (!agentName) return null;
  const gatewayUrl = process.env.OPENCLAW_GATEWAY_URL;
  const gatewayToken = process.env.OPENCLAW_GATEWAY_TOKEN;
  if (!gatewayUrl || !gatewayToken) return null;
  try {
    const client = getGameClient();
    if (!client.isConnected()) await client.connect();
    const sessionKey = `agent:main:mission-control-${agentName}`;
    return await client.sendChatAndWait(sessionKey, prompt, 20000);
  } catch (err) { return null; }
}

export async function POST(request: NextRequest) {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
  try {
    const { 
      action, playerName, npcName, npcMood, godTheme, level, userMessage, 
      enemyName, damage, wantedItem, offeredGold, npcPersonality, 
      npcSpeechStyle, bondLevel, location, foundItem, playerContext 
    } = await request.json();

    const actionDescriptions: Record<string, string> = {
      talk: 'engages in conversation',
      gift: 'receives a gift',
      shop_talk: 'enters the shop'
    };

    let systemPrompt = '';
    let userPrompt = '';

    if (action === 'generate_skill') {
      systemPrompt = `คุณคือเกมดีไซเนอร์ของเกม RPG แฟนตาซี "Gods' Arena" ออกแบบสกิลการต่อสู้ที่เป็นเอกลักษณ์`;
      userPrompt = `สร้างสกิลต่อสู้ใหม่สำหรับ Kane (แชมเปี้ยนนักธนู) ที่ได้รับจากเทพ ${npcName}
ธีมของเทพ: ${godTheme}
Bond Level: ${level}
ตอบเป็น JSON เท่านั้น: {"name": "...", "description": "...", "multiplier": 2.0, "type": "physical"}`;
    } else if (action === 'shop_talk') {
      systemPrompt = `คุณคือ ${npcName} ลูกค้าในร้าน Celestial Emporium บุคลิก: ${npcMood}. จ่ายได้ ${offeredGold} gold สำหรับ ${wantedItem}. กฎ: สั้นๆ 1-2 ประโยค ภาษาไทย ห้ามหลุดบท`;
      userPrompt = `คุณเดินเข้าร้านมาหา ${playerName} เพื่อซื้อ ${wantedItem}`;
    } else if (action === 'talk') {
      const bondDesc = bondLevel >= 12 ? 'สนิทมาก พูดคุยเหมือนเพื่อนรัก' : bondLevel >= 8 ? 'ค่อนข้างสนิท เริ่มไว้ใจ' : bondLevel >= 5 ? 'รู้จักกันพอสมควร' : 'ยังไม่สนิทนัก';
      
      systemPrompt = `คุณคือ ${npcName} เทพในเกม RPG "Gods' Arena (วิหารแห่งเทพ)"

=== บุคลิกภาพ ===
${npcPersonality || npcMood}

=== สไตล์การพูด ===
${npcSpeechStyle || 'พูดให้เข้ากับบุคลิกของเทพ'}

=== ระดับความสัมพันธ์ ===
Bond Level: ${bondLevel || 1} — ${bondDesc}

=== ข้อมูลความคืบหน้าของผู้เล่น (Player Context) ===
วันที่: ${playerContext?.day || 1}
เงินทอง: ${playerContext?.gold || 0} ทอง
ชัยชนะใน Arena: ${playerContext?.arenaWins || 0} ครั้ง
ไอเทมในกระเป๋า: ${playerContext?.items || 'ไม่มี'}
ความสัมพันธ์กับเทพองค์อื่น: ${playerContext?.relationships || 'ไม่มีข้อมูล'}

=== ความรู้เกี่ยวกับเทพองค์อื่น (Divine Knowledge) ===
ในวิหารแห่งนี้มีเทพ 3 องค์หลักที่รู้จักกันดี:
1. เลโอ (Leo): เทพแห่งสงครามและความกล้าหาญ ดุดัน แต่รักเกียรติ
2. อารีน่า (Arena): ราชินีแห่งวิหาร ทรงอำนาจ เยือกเย็น และสง่างาม
3. ดราโก้ (Draco): มังกรบรรพกาลผู้รอบรู้ สุขุม และมองการณ์ไกล
* คุณรู้จักเทพทั้ง 2 องค์ที่เหลือเป็นอย่างดีในฐานะเพื่อนร่วมวิหาร *

กฎการตอบ:
- ตอบสั้นๆ 1-2 ประโยค เป็นภาษาไทย
- *** สำคัญ: นำข้อมูลความคืบหน้าของผู้เล่น หรือการพูดถึงเทพองค์อื่นมาใช้ในการสนทนาด้วย (เช่น ถ้าผู้เล่นเอ่ยชื่อ 'เลโอ' คุณต้องจำได้ว่าเขาคือใคร) ***
- พูดตามบุคลิกอย่างเคร่งครัด ห้ามหลุดบทบาท`;
      
      userPrompt = userMessage ? `ผู้เล่น ${playerName} พูดว่า: "${userMessage}"` : `ผู้เล่น ${playerName} เข้ามาทักทายคุณ ท่ามกลางความคืบหน้าของเขา`;
    } else if (action === 'gift') {
        systemPrompt = `คุณคือ ${npcName} ในเกม RPG "Gods' Arena" เพิ่งได้รับ "${wantedItem}" จากผู้เล่น (Bond: ${bondLevel})`;
        userPrompt = `แสดงความขอบคุณหรือปฏิกิริยาตามบุคลิก 1 ประโยคสั้นๆ ภาษาไทย`;
    } else if (action === 'exploration_event') {
        systemPrompt = `คุณคือ ${npcName} บรรยายการสำรวจ ${location} พบ ${foundItem} สไตล์เทพ 1-2 ประโยค ภาษาไทย`;
        userPrompt = `Kane และ Minju พบสิ่งนี้ บรรยายตามบุคลิกของคุณ`;
    } else {
      systemPrompt = `คุณเป็นผู้บรรยายการต่อสู้ในเกม RPG "Gods' Arena" 1-2 ประโยค ภาษาไทย`;
      userPrompt = `${playerName} ${actionDescriptions[action] || 'ลงมือ'} ใส่ ${enemyName || 'ศัตรู'} ดาเมจ ${damage || 0}`;
    }

    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    // Try OpenClaw if configured and NOT disabled for gods
    if (NPC_TO_AGENT[npcName] && !USE_OPENROUTER_FOR_GODS) {
        const openclawNarrative = await generateViaOpenClaw(npcName, fullPrompt);
        if (openclawNarrative) {
            return NextResponse.json({ narrative: openclawNarrative, source: 'openclaw', model: `OpenClaw: ${NPC_TO_AGENT[npcName]}`, prompt: fullPrompt, usage: { prompt_tokens: Math.ceil(fullPrompt.length/2), completion_tokens: Math.ceil(openclawNarrative.length/2), total_tokens: Math.ceil((fullPrompt.length + openclawNarrative.length)/2) } });
        }
    }

    if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY.includes('000000')) {
        let fallback = userMessage ? `"ฮึ... ก็พอฟังได้ เล่าต่อเถอะ"` : `"ยินดีต้อนรับ..."`;
        return NextResponse.json({ narrative: fallback, source: 'fallback', model: 'Hardcoded', prompt: fullPrompt, usage: { total_tokens: 0 } });
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${OPENROUTER_API_KEY}`, 'Content-Type': 'application/json', 'HTTP-Referer': 'http://localhost:3000', 'X-Title': 'AI RPG Game' },
      body: JSON.stringify({ model: 'google/gemini-2.0-flash-001', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }], max_tokens: 200, temperature: 0.8 })
    });

    if (!response.ok) throw new Error('AI API failed');
    const data = await response.json();
    return NextResponse.json({ narrative: data.choices?.[0]?.message?.content || '', source: 'openrouter', model: 'google/gemini-2.0-flash-001', prompt: fullPrompt, usage: data.usage || { total_tokens: 0 } });
  } catch (error) { return NextResponse.json({ narrative: "The gods are silent...", source: 'error', model: 'Error', prompt: '', usage: { total_tokens: 0 } }); }
}
