/**
 * orchestrator.ts - The AI "Brain" of Gods' Arena
 * 
 * Handles rule-based routing, agent-to-agent simulation, and
 * provider switching (OpenRouter / OpenClaw fallback).
 */

import { getGameClient } from '@/lib/openclaw/client';

export type AIProvider = 'openrouter' | 'openclaw' | 'fallback' | 'council_simulation' | 'error';
export type AIServiceLevel = 'speed' | 'quality' | 'reasoning';

export interface OrchestratorRequest {
  action: string;
  npcName: string;
  playerName?: string;
  userMessage?: string;
  playerContext?: any;
  serviceLevel?: AIServiceLevel;
  // Specific fields from existing logic
  npcMood?: string;
  npcPersonality?: string;
  npcSpeechStyle?: string;
  godTheme?: string;
  bondLevel?: number;
  level?: number;
  wantedItem?: string;
  offeredGold?: number;
  location?: string;
  foundItem?: string;
  enemyName?: string;
  damage?: number;
}

export interface OrchestratorResponse {
  narrative: string;
  source: AIProvider;
  model: string;
  usage?: any;
  prompt?: string;
}

const NPC_TO_AGENT: Record<string, string> = {
  'เลโอ': 'emily',
  'อารีน่า': 'ember',
  'ดราโก้': 'mochi',
};

class DivineOrchestrator {
  private OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
  private USE_OPENROUTER_FOR_GODS = true;

  /**
   * Main entry point for generating AI narratives
   */
  async generate(req: OrchestratorRequest): Promise<OrchestratorResponse> {
    const rules = this.evaluateRules(req);
    
    // Simulate Agent-to-Agent (Council)
    if (this.shouldTriggerCouncil(req)) {
      return this.handleCouncilSimulation(req);
    }

    // Try OpenClaw if configured and NOT disabled for gods
    if (NPC_TO_AGENT[req.npcName] && !this.USE_OPENROUTER_FOR_GODS) {
        const fullPrompt = this.buildFullPrompt(req);
        const openclawNarrative = await this.generateViaOpenClaw(req.npcName, fullPrompt);
        if (openclawNarrative) {
            return {
                narrative: openclawNarrative,
                source: 'openclaw',
                model: `OpenClaw: ${NPC_TO_AGENT[req.npcName]}`,
                prompt: fullPrompt,
                usage: { total_tokens: Math.ceil((fullPrompt.length + openclawNarrative.length)/2) }
            };
        }
    }

    return this.callOpenRouter(rules.model, req);
  }

  private evaluateRules(req: OrchestratorRequest) {
    let model = 'google/gemini-2.0-flash-001';

    // Rule: Quality for high bonds
    if (req.action === 'talk' && (req.bondLevel || 0) >= 12) {
      model = 'anthropic/claude-3.5-sonnet';
    }

    return { model };
  }

  private async generateViaOpenClaw(npcName: string, prompt: string): Promise<string | null> {
    const agentName = NPC_TO_AGENT[npcName];
    if (!agentName) return null;
    try {
      const client = getGameClient();
      if (!client.isConnected()) await client.connect();
      const sessionKey = `agent:main:mission-control-${agentName}`;
      return await client.sendChatAndWait(sessionKey, prompt, 20000);
    } catch (err) { return null; }
  }

  private async handleCouncilSimulation(req: OrchestratorRequest): Promise<OrchestratorResponse> {
    // 1. Get Leo's opinion
    const res1 = await this.callOpenRouter('google/gemini-2.0-flash-001', {
      ...req,
      action: 'talk',
      npcName: 'เลโอ',
      userMessage: req.userMessage || 'ข้าขอคำปรึกษาจากสภาเทพ'
    });

    // 2. Get Arena's judgment
    const res2 = await this.callOpenRouter('google/gemini-2.0-flash-001', {
      ...req,
      action: 'talk',
      npcName: 'อารีน่า',
      userMessage: `เลโอเพิ่งกล่าวว่า: "${res1.narrative}". ในฐานะราชินี ท่านมีความเห็นอย่างไรต่อคำพูดของเขาและผู้เล่น ${req.playerName}?`
    });

    return {
      narrative: `[เลโอ]: ${res1.narrative}\n\n[อารีน่า]: ${res2.narrative}`,
      source: 'council_simulation',
      model: 'multi-agent-chain'
    };
  }

  private shouldTriggerCouncil(req: OrchestratorRequest): boolean {
    const message = req.userMessage?.toLowerCase() || '';
    return message.includes('สภาเทพ') || message.includes('council');
  }

  private async callOpenRouter(model: string, req: OrchestratorRequest): Promise<OrchestratorResponse> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey.includes('000000')) {
        return { 
            narrative: req.userMessage ? `"ฮึ... ก็พอฟังได้ เล่าต่อเถอะ"` : `"ยินดีต้อนรับ..."`, 
            source: 'fallback', 
            model: 'Hardcoded' 
        };
    }

    const systemPrompt = this.buildSystemPrompt(req);
    const userPrompt = this.buildUserPrompt(req);

    try {
      const response = await fetch(this.OPENROUTER_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Gods Arena Orchestrator',
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.8,
        })
      });

      const data = await response.json();
      return {
        narrative: data.choices?.[0]?.message?.content || '',
        source: 'openrouter',
        model: model,
        usage: data.usage,
        prompt: `${systemPrompt}\n\n${userPrompt}`
      };
    } catch (err) {
      return { narrative: "The gods are silent...", source: 'error', model: 'Error' };
    }
  }

  private buildFullPrompt(req: OrchestratorRequest): string {
    return `${this.buildSystemPrompt(req)}\n\n${this.buildUserPrompt(req)}`;
  }

  private buildSystemPrompt(req: OrchestratorRequest): string {
    if (req.action === 'generate_skill') {
        return `คุณคือเกมดีไซเนอร์ของเกม RPG แฟนตาซี "Gods' Arena" ออกแบบสกิลการต่อสู้ที่เป็นเอกลักษณ์`;
    }

    if (req.action === 'shop_talk') {
        return `คุณคือ ${req.npcName} ลูกค้าในร้าน Celestial Emporium บุคลิก: ${req.npcMood}. จ่ายได้ ${req.offeredGold} gold สำหรับ ${req.wantedItem}. กฎ: สั้นๆ 1-2 ประโยค ภาษาไทย ห้ามหลุดบท`;
    }

    if (req.action === 'talk') {
        const bondDesc = (req.bondLevel || 0) >= 12 ? 'สนิทมาก พูดคุยเหมือนเพื่อนรัก' : (req.bondLevel || 0) >= 8 ? 'ค่อนข้างสนิท เริ่มไว้ใจ' : (req.bondLevel || 0) >= 5 ? 'รู้จักกันพอสมควร' : 'ยังไม่สนิทนัก';
        return `คุณคือ ${req.npcName} เทพในเกม RPG "Gods' Arena (วิหารแห่งเทพ)"

=== บุคลิกภาพ ===
${req.npcPersonality || req.npcMood}

=== สไตล์การพูด ===
${req.npcSpeechStyle || 'พูดให้เข้ากับบุคลิกของเทพ'}

=== ระดับความสัมพันธ์ ===
Bond Level: ${req.bondLevel || 1} — ${bondDesc}

=== ข้อมูลความคืบหน้าของผู้เล่น (Player Context) ===
วันที่: ${req.playerContext?.day || 1}
เงินทอง: ${req.playerContext?.gold || 0} ทอง
ชัยชนะใน Arena: ${req.playerContext?.arenaWins || 0} ครั้ง
ไอเทมในกระเป๋า: ${req.playerContext?.items || 'ไม่มี'}
ความสัมพันธ์กับเทพองค์อื่น: ${req.playerContext?.relationships || 'ไม่มีข้อมูล'}

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
    }

    if (req.action === 'gift') {
        return `คุณคือ ${req.npcName} ในเกม RPG "Gods' Arena" เพิ่งได้รับ "${req.wantedItem}" จากผู้เล่น (Bond: ${req.bondLevel})`;
    }

    if (req.action === 'exploration_event') {
        return `คุณคือ ${req.npcName} บรรยายการสำรวจ ${req.location} พบ ${req.foundItem} สไตล์เทพ 1-2 ประโยค ภาษาไทย`;
    }

    return `คุณเป็นผู้บรรยายการต่อสู้ในเกม RPG "Gods' Arena" 1-2 ประโยค ภาษาไทย`;
  }

  private buildUserPrompt(req: OrchestratorRequest): string {
    if (req.action === 'generate_skill') {
        return `สร้างสกิลต่อสู้ใหม่สำหรับ Kane (แชมเปี้ยนนักธนู) ที่ได้รับจากเทพ ${req.npcName}
ธีมของเทพ: ${req.godTheme}
Bond Level: ${req.level}
ตอบเป็น JSON เท่านั้น: {"name": "...", "description": "...", "multiplier": 2.0, "type": "physical"}`;
    }

    if (req.action === 'shop_talk') {
        return `คุณเดินเข้าร้านมาหา ${req.playerName} เพื่อซื้อ ${req.wantedItem}`;
    }

    if (req.action === 'talk') {
        return req.userMessage ? `ผู้เล่น ${req.playerName} พูดว่า: "${req.userMessage}"` : `ผู้เล่น ${req.playerName} เข้ามาทักทายคุณ ท่ามกลางความคืบหน้าของเขา`;
    }

    if (req.action === 'gift') {
        return `แสดงความขอบคุณหรือปฏิกิริยาตามบุคลิก 1 ประโยคสั้นๆ ภาษาไทย`;
    }

    if (req.action === 'exploration_event') {
        return `Kane และ Minju พบสิ่งนี้ บรรยายตามบุคลิกของคุณ`;
    }

    const actionDescriptions: Record<string, string> = {
        talk: 'engages in conversation',
        gift: 'receives a gift',
        shop_talk: 'enters the shop'
    };

    return `${req.playerName} ${actionDescriptions[req.action] || 'ลงมือ'} ใส่ ${req.enemyName || 'ศัตรู'} ดาเมจ ${req.damage || 0}`;
  }
}

export const orchestrator = new DivineOrchestrator();
