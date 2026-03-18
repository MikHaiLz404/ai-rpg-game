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

// Map: Thai NPC name → OpenClaw agent name
const NPC_TO_AGENT: Record<string, string> = {
  'เลโอ': 'emily',
  'อารีน่า': 'ember',
  'ดราโก้': 'mochi',
};

async function generateViaOpenClaw(npcName: string, prompt: string): Promise<string | null> {
  const agentName = NPC_TO_AGENT[npcName];
  if (!agentName) return null;

  const gatewayUrl = process.env.OPENCLAW_GATEWAY_URL;
  const gatewayToken = process.env.OPENCLAW_GATEWAY_TOKEN;
  
  if (!gatewayUrl || !gatewayToken) return null;

  try {
    const client = getGameClient();
    if (!client.isConnected()) {
      await client.connect();
    }

    const sessionKey = `agent:main:mission-control-${agentName}`;
    console.log(`[Narrate] Requesting from OpenClaw agent: ${agentName}...`);
    const response = await client.sendChatAndWait(sessionKey, prompt, 20000);
    return response;
  } catch (err) {
    console.warn(`[Narrate] OpenClaw failed for ${npcName}:`, err instanceof Error ? err.message : err);
    return null;
  }
}

export async function POST(request: NextRequest) {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';

  try {
    const { action, playerName, npcName, npcMood, godTheme, level, userMessage, enemyName, damage, wantedItem, offeredGold, npcPersonality, npcSpeechStyle, bondLevel, location, foundItem } = await request.json();

    const actionDescriptions: Record<string, string> = {
      attack: 'attacks fiercely',
      defend: 'takes a defensive stance',
      heal: 'channels healing magic',
      fireball: 'unleashes a powerful fire spell',
      talk: 'engages in conversation',
      gift: 'receives a gift',
      divine_intervention: 'intervenes with divine power',
      exploration_event: 'discovers something during exploration'
    };

    let systemPrompt = '';
    let userPrompt = '';

    if (action === 'generate_skill') {
      systemPrompt = `คุณคือเกมดีไซเนอร์ของเกม RPG แฟนตาซี "Gods' Arena" ออกแบบสกิลการต่อสู้ที่เป็นเอกลักษณ์`;
      userPrompt = `สร้างสกิลต่อสู้ใหม่สำหรับ Kane (แชมเปี้ยนนักธนู) ที่ได้รับจากเทพ ${npcName}
ธีมของเทพ: ${godTheme}
Bond Level: ${level}

ตอบเป็น JSON เท่านั้น ห้ามมีข้อความอื่น:
{
  "name": "ชื่อสกิล (ภาษาไทยหรืออังกฤษ)",
  "description": "คำอธิบายสั้นๆ สไตล์มหากาพย์",
  "multiplier": ตัวเลขระหว่าง 1.5 ถึง 3.0,
  "type": "physical" หรือ "magical"
}`;
    } else if (action === 'shop_talk') {
      systemPrompt = `คุณคือ ${npcName} ลูกค้าที่เดินเข้ามาในร้าน "Celestial Emporium" ร้านขายของวิเศษในเกม RPG "Gods' Arena (วิหารแห่งเทพ)"
บุคลิก: ${npcMood}

สถานการณ์: คุณเดินเข้ามาในร้านเพื่อซื้อของ คุณต้องการ "${wantedItem}" และพร้อมจ่าย ${offeredGold} gold

กฎการตอบ:
- ตอบสั้นๆ 1-2 ประโยค เป็นบทสนทนาเท่านั้น ห้ามมีคำนำหน้า
- พูดให้เข้ากับบุคลิกตัวละคร — บอกว่าอยากได้อะไร ทำไมถึงต้องการ
- ใช้ภาษาไทย
- ห้ามออกจากบทบาท ห้ามพูดถึงตัวเองว่าเป็น AI`;
      userPrompt = `คุณเดินเข้ามาในร้านของ ${playerName} เพื่อซื้อ ${wantedItem} — พูดทักทายและบอกว่าต้องการอะไร`;
    } else if (action === 'talk') {
      const bondDesc = bondLevel >= 12 ? 'สนิทมาก เปิดใจ พูดคุยเหมือนเพื่อนรัก'
        : bondLevel >= 8 ? 'ค่อนข้างสนิท เริ่มไว้ใจ แสดงด้านอ่อนโยนบ้าง'
        : bondLevel >= 5 ? 'รู้จักกันพอสมควร เริ่มเปิดใจ'
        : 'ยังไม่สนิทนัก ระมัดระวัง';

      systemPrompt = `คุณคือ ${npcName} เทพในเกม RPG "Gods' Arena (วิหารแห่งเทพ)"

=== บุคลิกภาพ ===
${npcPersonality || npcMood}

=== สไตล์การพูด ===
${npcSpeechStyle || 'พูดให้เข้ากับบุคลิกของเทพ'}

=== ระดับความสัมพันธ์ ===
Bond Level: ${bondLevel || 1} — ${bondDesc}
(ยิ่งสนิทมาก ยิ่งเปิดเผย อบอุ่น และแสดงอารมณ์มากขึ้น)

สถานการณ์: ผู้เล่นมาเยี่ยมเยือนที่หมู่บ้านเพื่อสร้างสายสัมพันธ์กับคุณ

กฎการตอบ:
- ตอบสั้นๆ 1-2 ประโยค เป็นบทสนทนาเท่านั้น ห้ามมีคำนำหน้า
- พูดตามสไตล์และบุคลิกที่กำหนดอย่างเคร่งครัด — ห้ามพูดเหมือนกันทุกตัวละคร
- ปรับน้ำเสียงตามระดับ Bond — สนิทน้อย=ทางการ สนิทมาก=เป็นกันเอง
- ตอบภาษาเดียวกับที่ผู้เล่นพูด (ถ้าพูดไทยก็ตอบไทย ถ้าพูดอังกฤษก็ตอบอังกฤษ)
- ห้ามออกจากบทบาท ห้ามพูดถึงตัวเองว่าเป็น AI`;
      if (userMessage) {
        userPrompt = `ผู้เล่น ${playerName} พูดว่า: "${userMessage}"`;
      } else {
        userPrompt = `ผู้เล่น ${playerName} เข้ามาหาคุณที่หมู่บ้านเพื่อสร้างสายสัมพันธ์ พูดทักทายตามสไตล์ของคุณ`;
      }
    } else if (action === 'gift') {
        systemPrompt = `คุณคือ ${npcName} ในเกม RPG "Gods' Arena" คุณเพิ่งได้รับของขวัญจากผู้เล่น`;
        userPrompt = `ผู้เล่นมอบ "${wantedItem || 'ของบางอย่าง'}" ให้คุณ (Bond Level: ${bondLevel})
แสดงความขอบคุณหรือปฏิกิริยาตามบุคลิกของคุณ 1 ประโยคสั้นๆ ภาษาไทย`;
    } else if (action === 'exploration_event') {
      // Dynamic narration by the companion god with highest bond
      if (npcPersonality) {
        systemPrompt = `คุณคือ ${npcName} เทพในเกม RPG "Gods' Arena" กำลังคอยดูแลและให้กำลังใจผู้เล่นระหว่างออกสำรวจ

=== บุคลิกภาพ ===
${npcPersonality}

=== สไตล์การพูด ===
${npcSpeechStyle || 'พูดให้เข้ากับบุคลิกของเทพ'}

กฎการตอบ:
- ตอบสั้นๆ 1-2 ประโยค ตามสไตล์ของคุณ
- แสดงความเป็นห่วงหรือชื่นชม Kane และ Minju ตามบุคลิก
- ใช้ภาษาไทย ห้ามออกจากบทบาท`;
        userPrompt = `Minju และ Kane กำลังสำรวจ ${location || 'พื้นที่ลึกลับ'}: ${foundItem || 'ค้นพบสิ่งน่าสนใจ'}
บรรยายหรือให้กำลังใจตามสไตล์ของคุณ`;
      } else {
        systemPrompt = `คุณเป็นผู้บรรยายการผจญภัยในเกม RPG "Gods' Arena" บรรยายสั้น กระชับ 1-2 ประโยค เป็นภาษาไทย`;
        userPrompt = `${playerName || 'Minju'} กำลังสำรวจ ${location || 'พื้นที่ลึกลับ'}: ${foundItem || 'ค้นพบสิ่งน่าสนใจ'}
บรรยายให้ตื่นเต้น`;
      }
    } else {
      systemPrompt = `คุณเป็นผู้บรรยายการต่อสู้ในเกม RPG "Gods' Arena" บรรยายสั้น กระชับ ดราม่า 1-2 ประโยค เป็นภาษาไทย`;
      userPrompt = `${playerName} ${actionDescriptions[action] || 'ลงมือ'} ใส่ ${enemyName || 'ศัตรูปริศนา'} สร้างดาเมจ ${damage || 0}
บรรยายฉากนี้ให้ตื่นเต้น`;
    }

    // Combine for OpenClaw if needed
    const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;

    // Strategy 1: Try OpenClaw
    if (NPC_TO_AGENT[npcName]) {
        const openclawNarrative = await generateViaOpenClaw(npcName, combinedPrompt);
        if (openclawNarrative) {
            return NextResponse.json({ narrative: openclawNarrative, source: 'openclaw' });
        }
    }

    // If no OpenClaw or failed, use OpenRouter
    // If no API key, return a fallback message immediately
    if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY.includes('000000')) {
        console.warn('No OpenRouter API Key found. Using fallback narrative.');
        let fallback = '';
        if (action === 'shop_talk') {
            fallback = `สวัสดี ${playerName}! ข้ามาหา ${wantedItem} น่ะ มีของชิ้นนี้อยู่มั้ย? ยินดีจ่าย ${offeredGold} gold เลย`;
        } else if (action === 'talk') {
            const talkFallbacks: Record<string, { greet: string; reply: string }> = {
                'เลโอ': {
                    greet: `"เจ้ามาอีกแล้วหรือ? ดี — ข้าเริ่มเบื่อที่นี่พอดี"`,
                    reply: `"ฮึ... ก็พอฟังได้ เล่าต่อเถอะ"`,
                },
                'อารีน่า': {
                    greet: `"ยินดีต้อนรับ ผู้มาเยือน... ลมวันนี้พัดพาเรื่องราวน่าสนใจมาให้ข้า"`,
                    reply: `"น่าสนใจ... เจ้ามีความคิดที่ลึกซึ้งกว่าที่ข้าคาดไว้"`,
                },
                'ดราโก้': {
                    greet: `"ฮึ่ม... เจ้ามาถึงแล้วหรือ นั่งลงเถิด ข้ามีเรื่องจะเล่า"`,
                    reply: `"ฮึ่ม... ข้าเคยเห็นเรื่องคล้ายกันเมื่อหมื่นปีก่อน"`,
                },
            };
            const npcFallback = talkFallbacks[npcName] || { greet: `"..."`, reply: `"..."` };
            fallback = userMessage ? npcFallback.reply : npcFallback.greet;
        } else if (action === 'generate_skill') {
            const pool = FALLBACK_SKILLS[npcName] || FALLBACK_SKILLS['เลโอ'];
            const idx = Math.min((level || 1) - 1, pool.length - 1);
            fallback = JSON.stringify(pool[Math.max(0, idx)]);
        } else if (action === 'gift') {
            const giftFallbacks: Record<string, string> = {
                'เลโอ': '"ฮึ... ของดี ข้ารับไว้"',
                'อารีน่า': '"ขอบใจ... ของชิ้นนี้ข้าชอบ"',
                'ดราโก้': '"ฮึ่ม... เจ้านำของมาให้ข้าหรือ น่าสนใจ"',
            };
            fallback = giftFallbacks[npcName] || '"ขอบคุณ..."';
        } else if (action === 'exploration_event') {
            fallback = `${playerName} ค้นพบสิ่งลึกลับระหว่างการสำรวจ!`;
        } else {
            fallback = `${playerName} โจมตี ${enemyName || 'ศัตรู'} อย่างรุนแรง สร้างดาเมจ ${damage || 0}!`;
        }
        return NextResponse.json({ narrative: fallback, source: 'fallback' });
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'AI RPG Game',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 200,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenRouter Error:', errorData);
      throw new Error('AI API failed');
    }

    const data = await response.json();
    const narrative = data.choices?.[0]?.message?.content || '';

    return NextResponse.json({ narrative, source: 'openrouter' });
  } catch (error) {
    console.error('Narrate error:', error);
    return NextResponse.json(
      { narrative: "The gods are silent at this moment, but their presence remains felt.", source: 'error' },
      { status: 200 }
    );
  }
}
