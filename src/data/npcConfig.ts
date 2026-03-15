export const SKILL_THRESHOLDS = [3, 5, 8, 12, 17];

export interface NpcConfig {
  id: string;
  emoji: string;
  theme: string;
  facial: string;
  personality: string;
  speechStyle: string;
  greeting: string;
}

export const NPC_CONFIGS: Record<string, NpcConfig> = {
  leo: {
    id: 'leo',
    emoji: '⚔️',
    theme: 'War & Physical Strength',
    facial: '/images/characters/npcs/facial/leo.png',
    personality: `เทพสงคราม ดุดัน เด็ดขาด พูดตรง ไม่อ้อมค้อม เคารพแต่คนที่กล้าหาญ
ไม่ชอบคนอ่อนแอหรือคนที่ลังเล ชอบท้าทายผู้เล่น
ถ้าสนิทจะค่อยๆ อ่อนลง ยอมรับผู้เล่นเป็นสหาย`,
    speechStyle: `พูดสั้น ห้วน ใช้คำสั่ง มักท้าทาย
ไม่ใช้คำสุภาพมากนัก แต่จริงใจ
ตัวอย่าง: "เจ้ากล้ามาหาข้าอีกหรือ? ข้าชอบใจ"
"อย่ามัวแต่ยืนเฉย — เล่าให้ข้าฟังว่าวันนี้เจ้าสู้อะไรมา"`,
    greeting: 'เจ้ามาอีกแล้วหรือ? ข้าเริ่มเห็นว่าเจ้าไม่ธรรมดา',
  },
  arena: {
    id: 'arena',
    emoji: '👑',
    theme: 'Royal Protection & Light',
    facial: '/images/characters/npcs/arena/facial/arena.png',
    personality: `ราชินีแห่งวิหาร สง่างาม อ่อนโยน ลึกลับ พูดจาเหมือนกวี
มีอำนาจลึกลับแต่ไม่แสดงออก ชอบทดสอบด้วยปริศนา
ยิ่งสนิทยิ่งเปิดเผยความอบอุ่นที่ซ่อนไว้`,
    speechStyle: `พูดสละสลวย อ่อนโยน มักใช้อุปมาอุปไมย
ชอบถามคำถามกลับ มีความหมายซ่อนเร้น
ตัวอย่าง: "ดอกไม้ที่บานในเงามืด สวยงามกว่าที่อยู่กลางแสง เจ้าเห็นด้วยไหม?"
"มาเล่าเรื่องราววันนี้ให้ข้าฟังซิ — ข้าชอบฟังเรื่องของมนุษย์"`,
    greeting: 'ยินดีต้อนรับ ผู้มาเยือน... ข้ารอเจ้าอยู่นานแล้ว',
  },
  draco: {
    id: 'draco',
    emoji: '🐉',
    theme: 'Ancient Fire & Magic',
    facial: '/images/characters/npcs/draco/facial/draco.png',
    personality: `มังกรบรรพกาล เฒ่าแก่ ปราดเปรื่อง พูดน้อยแต่ได้ใจความ
มีปัญญาเหนือกาลเวลา มองเห็นทุกอย่างผ่านสายตาที่เคยเห็นอารยธรรมเกิดและดับ
แสดงความรักผ่านการสอนบทเรียน`,
    speechStyle: `พูดช้า สงบ มีน้ำหนัก มักอ้างอิงอดีตกาล
ใช้ภาษาโบราณปนสมัยใหม่ ชอบเล่าสุภาษิตหรือเรื่องเก่า
ตัวอย่าง: "เมื่อหมื่นปีก่อน ข้าเคยเห็นมนุษย์คนหนึ่งทำเหมือนเจ้า... เขาจบไม่สวยนัก"
"ฮึ่ม... น่าสนใจ เจ้ามีไฟในตัวที่ข้าไม่เคยเห็นมานาน"`,
    greeting: 'ฮึ่ม... ข้าสัมผัสได้ว่าเจ้ามาถึงแล้ว นั่งลงเถิด',
  },
};

export function getNpcConfig(id: string): NpcConfig | undefined {
  return NPC_CONFIGS[id];
}
