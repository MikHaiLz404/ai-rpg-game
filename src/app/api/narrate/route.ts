import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';

  try {
    const { action, playerName, npcName, npcMood, godTheme, level, userMessage, enemyName, damage, wantedItem, offeredGold } = await request.json();

    const actionDescriptions: Record<string, string> = {
      attack: 'attacks fiercely',
      defend: 'takes a defensive stance',
      heal: 'channels healing magic',
      fireball: 'unleashes a powerful fire spell',
      talk: 'engages in conversation',
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
      systemPrompt = `คุณคือ ${npcName} เทพในเกม RPG "Gods' Arena (วิหารแห่งเทพ)"
บุคลิก: ${npcMood}

สถานการณ์: ผู้เล่นมาเยี่ยมเยือนที่หมู่บ้านเพื่อสร้างสายสัมพันธ์กับคุณ

กฎการตอบ:
- ตอบสั้นๆ 1-2 ประโยค เป็นบทสนทนาเท่านั้น ห้ามมีคำนำหน้า
- พูดให้เข้ากับบุคลิกของเทพ — ลึกลับ สง่างาม หรือดุดัน ตามแต่ตัวละคร
- ตอบภาษาเดียวกับที่ผู้เล่นพูด (ถ้าพูดไทยก็ตอบไทย ถ้าพูดอังกฤษก็ตอบอังกฤษ)
- ห้ามออกจากบทบาท ห้ามพูดถึงตัวเองว่าเป็น AI`;
      if (userMessage) {
        userPrompt = `ผู้เล่น ${playerName} พูดว่า: "${userMessage}"`;
      } else {
        userPrompt = `ผู้เล่น ${playerName} เข้ามาหาคุณที่หมู่บ้านเพื่อสร้างสายสัมพันธ์ พูดทักทายหรือแบ่งปันคำทำนายสั้นๆ ที่น่าสนใจ`;
      }
    } else {
      systemPrompt = `คุณเป็นผู้บรรยายการต่อสู้ในเกม RPG "Gods' Arena" บรรยายสั้น กระชับ ดราม่า 1-2 ประโยค เป็นภาษาไทย`;
      userPrompt = `${playerName} ${actionDescriptions[action] || 'ลงมือ'} ใส่ ${enemyName || 'ศัตรูปริศนา'} สร้างดาเมจ ${damage || 0}
บรรยายฉากนี้ให้ตื่นเต้น`;
    }

    // If no API key, return a fallback message immediately to avoid 500 error
    if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY.includes('000000')) {
        console.warn('No OpenRouter API Key found. Using fallback narrative.');
        let fallback = '';
        if (action === 'shop_talk') {
            fallback = `สวัสดี ${playerName}! ข้ามาหา ${wantedItem} น่ะ มีของชิ้นนี้อยู่มั้ย? ยินดีจ่าย ${offeredGold} gold เลย`;
        } else if (action === 'talk') {
            fallback = userMessage
                ? `${npcName} พิจารณาคำพูดของเจ้าอย่างลึกซึ้ง แล้วพยักหน้ารับ`
                : `${npcName} ยิ้มให้เจ้าอย่างอบอุ่น "ยินดีที่ได้พบ ${playerName} วันนี้อากาศดีนะ"`;
        } else if (action === 'generate_skill') {
            fallback = JSON.stringify({ name: 'Divine Strike', description: 'พลังศักดิ์สิทธิ์จากเทพ', multiplier: 1.8, type: 'magical' });
        } else {
            fallback = `${playerName} โจมตี ${enemyName || 'ศัตรู'} อย่างรุนแรง สร้างดาเมจ ${damage || 0}!`;
        }
        return NextResponse.json({ narrative: fallback });
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

    return NextResponse.json({ narrative });
  } catch (error) {
    console.error('Narrate error:', error);
    return NextResponse.json(
      { narrative: "The gods are silent at this moment, but their presence remains felt." },
      { status: 200 } // Return 200 with fallback to prevent UI crash
    );
  }
}
