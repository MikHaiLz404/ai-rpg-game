import { NextRequest, NextResponse } from 'next/server';

interface GameState {
  day: number;
  gold: number;
  bonds: Record<string, number>;
  skills: string[];
  turnsLeft: number;
}

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

async function generateGodAdvice(
  godId: string,
  gameState: GameState,
  apiKey: string
): Promise<string> {
  const god = GOD_PROMPTS[godId];
  if (!god) return '';

  const bondLevel = gameState.bonds[godId] || 0;
  const totalSkills = gameState.skills.length;
  const urgency = gameState.turnsLeft <= 5 ? 'วิกฤต เหลือเวลาน้อยมาก' : gameState.turnsLeft <= 10 ? 'เร่งด่วน' : 'ยังมีเวลา';

  const systemPrompt = `คุณคือ ${god.name} ${god.role} ในเกม "Gods' Arena"
สไตล์: ${god.style}

คุณกำลังให้คำทำนายและคำแนะนำแก่ Minju (ผู้เล่น) เกี่ยวกับการเตรียมตัวสู้ Vampire Lord
วิเคราะห์สถานะเกมแล้วให้คำแนะนำ 1-2 ประโยคสั้นๆ ตามสไตล์ของคุณ
ห้ามออกจากบทบาท พูดภาษาไทย`;

  const userPrompt = `สถานะเกม:
- วัน: ${gameState.day}/20 (${urgency} — เหลือ ${gameState.turnsLeft} วัน)
- ทอง: ${gameState.gold}
- Bond กับ ${god.name}: ${bondLevel}
- สกิลทั้งหมดของ Kane: ${totalSkills} ชิ้น (${gameState.skills.join(', ') || 'ยังไม่มี'})

ให้คำทำนายหรือคำแนะนำสั้นๆ`;

  if (!apiKey || apiKey.includes('000000')) {
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
    return '"ข้ารู้สึกถึงพลังบางอย่าง... แต่ยังไม่ชัดเจน"';
  }
}

export async function POST(request: NextRequest) {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';

  try {
    const gameState: GameState = await request.json();

    // Generate advice from all 3 gods in parallel
    const [leoAdvice, arenaAdvice, dracoAdvice] = await Promise.all([
      generateGodAdvice('leo', gameState, OPENROUTER_API_KEY),
      generateGodAdvice('arena', gameState, OPENROUTER_API_KEY),
      generateGodAdvice('draco', gameState, OPENROUTER_API_KEY),
    ]);

    return NextResponse.json({
      prophecies: [
        { godId: 'leo', godName: 'เลโอ', emoji: '⚔️', text: leoAdvice },
        { godId: 'arena', godName: 'อารีน่า', emoji: '👑', text: arenaAdvice },
        { godId: 'draco', godName: 'ดราโก้', emoji: '🐉', text: dracoAdvice },
      ],
    });
  } catch (error) {
    console.error('Prophecy error:', error);
    return NextResponse.json({
      prophecies: [
        { godId: 'leo', godName: 'เลโอ', emoji: '⚔️', text: '"..."' },
        { godId: 'arena', godName: 'อารีน่า', emoji: '👑', text: '"..."' },
        { godId: 'draco', godName: 'ดราโก้', emoji: '🐉', text: '"..."' },
      ],
    });
  }
}
