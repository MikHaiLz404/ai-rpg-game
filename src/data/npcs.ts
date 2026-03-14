import { NPC } from '../types';

export const npcs: NPC[] = [
  {
    id: 'hermes',
    name: 'Hermes',
    nameTH: 'เฮอร์มีส',
    description: 'Messenger of the Gods',
    image: '👞',
    dialogue: [
      {
        id: 'intro',
        text: 'Greetings, mortal!',
        textTH: 'สวัสดี มนุษย์!',
        choices: [
          { textTH: 'ทักทาย', text: 'Hello', nextId: 'chat1' },
          { textTH: 'ลาก่อน', text: 'Goodbye', nextId: 'end' }
        ]
      },
      {
        id: 'chat1',
        text: 'Want to hear a secret?',
        textTH: 'อยากฟังความลับไหม?',
        choices: [
          { textTH: 'อยาก', text: 'Yes', nextId: 'secret', bondChange: 5 },
          { textTH: 'ไม่อยาก', text: 'No', nextId: 'end' }
        ]
      },
      {
        id: 'secret',
        text: 'The arena hides many secrets...',
        textTH: 'อารีน่าซ่อนความลับมากมาย...',
        choices: [
          { textTH: 'ขอบคุณ', text: 'Thanks', nextId: 'end' }
        ]
      }
    ]
  },
  {
    id: 'aphrodite',
    name: 'Aphrodite',
    nameTH: 'อโฟรไดที',
    description: 'Goddess of Love',
    image: '💕',
    dialogue: [
      {
        id: 'intro',
        text: 'Hello, beautiful one!',
        textTH: 'สวัสดี คนงาม!',
        choices: [
          { textTH: 'สวัสดี', text: 'Hello', nextId: 'chat1', bondChange: 3 }
        ]
      },
      {
        id: 'chat1',
        text: 'Would you like to bond with me?',
        textTH: 'อยากสร้างสายสัมพันธ์กับฉันไหม?',
        choices: [
          { textTH: 'อยาก', text: 'Yes', nextId: 'end', bondChange: 10 }
        ]
      }
    ]
  }
];
