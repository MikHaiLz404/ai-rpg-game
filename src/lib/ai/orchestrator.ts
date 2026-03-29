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
  // First meeting tracking - if true for a godId, they speak directly (no Herald)
  firstMeeting?: Record<string, boolean>;
}

export interface OrchestratorResponse {
  narrative: string;
  source: AIProvider;
  model: string;
  usage?: any;
  prompt?: string;
  gatewayLogs?: string[];
}

const NPC_TO_AGENT: Record<string, string> = {
  'เลโอ': 'emily',
  'อารีน่า': 'ember',
  'ดราโก้': 'mochi',
};

class DivineOrchestrator {
  private OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
  private USE_OPENROUTER_FOR_GODS = false;

  /**
   * Main entry point for generating AI narratives
   */
  async generate(req: OrchestratorRequest): Promise<OrchestratorResponse> {
    // Apply Herald Logic: If firstMeeting[godId] is false/undefined, God sends a Herald instead
    const isTalkAction = ['talk', 'shop_talk', 'gift'].includes(req.action);
    // Map Thai god names to IDs
    const GOD_NAME_TO_ID: Record<string, string> = {
      'เลโอ': 'leo',
      'อารีน่า': 'arena',
      'ดราโก้': 'draco',
    };
    const baseNameForHerald = req.npcName.replace('ผู้ส่งสารของ', '').replace(' (Herald)', '').trim();
    const godId = GOD_NAME_TO_ID[baseNameForHerald];
    const hasMet = godId ? (req.firstMeeting?.[godId] === true) : true;

    if (isTalkAction && !hasMet && !req.npcName.includes('Herald')) {
      req.npcName = `ผู้ส่งสารของ${req.npcName} (Herald)`;
    }

    const rules = this.evaluateRules(req);
    
    // Simulate Agent-to-Agent (Council)
    if (this.shouldTriggerCouncil(req)) {
      return this.handleCouncilSimulation(req);
    }

    // Try OpenClaw if configured and NOT disabled for gods
    const baseName = req.npcName.replace('ผู้ส่งสารของ', '').replace(' (Herald)', '').trim();
    if (NPC_TO_AGENT[baseName] && !this.USE_OPENROUTER_FOR_GODS) {
        const fullPrompt = this.buildFullPrompt(req);
        const openclawResult = await this.generateViaOpenClaw(req.npcName, fullPrompt);
        if (openclawResult.success && openclawResult.response) {
            return {
                narrative: openclawResult.response,
                source: 'openclaw',
                model: `OpenClaw: ${NPC_TO_AGENT[baseName]}`,
                prompt: fullPrompt,
                usage: { total_tokens: Math.ceil((fullPrompt.length + openclawResult.response.length)/2) },
                gatewayLogs: openclawResult.logs
            };
        } else {
            // Failed, fallback but append logs
            const fallbackRes = await this.callOpenRouter(rules.model, req);
            fallbackRes.gatewayLogs = openclawResult.logs;
            return fallbackRes;
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

    // Rule: Urgency - Use better models as the deadline approaches (Day 15+)
    if ((req.playerContext?.day || 0) >= 15 && model === 'google/gemini-2.0-flash-001') {
      model = 'openai/gpt-4o-mini';
    }

    return { model };
  }

  private async generateViaOpenClaw(npcName: string, prompt: string): Promise<{ success: boolean; response?: string; logs: string[] }> {
    // Extract base god name if it's a Herald
    const baseName = npcName.replace('ผู้ส่งสารของ', '').replace(' (Herald)', '').trim();
    const agentName = NPC_TO_AGENT[baseName];
    if (!agentName) return { success: false, logs: [] };
    const client = getGameClient();
    try {
      if (!client.isConnected()) await client.connect();
      const sessionKey = `agent:main:mission-control-${agentName}`;
      const result = await client.sendChatAndWait(sessionKey, prompt, 20000);
      return { success: true, response: result.response, logs: result.logs };
    } catch (err) { 
      client.log(`[ORCHESTRATOR] OpenClaw generated error: ${err instanceof Error ? err.message : String(err)}`);
      return { success: false, logs: client.getLogs() }; 
    }
  }

  private async handleCouncilSimulation(req: OrchestratorRequest): Promise<OrchestratorResponse> {
    const req1 = { ...req, action: 'talk', npcName: 'เลโอ', userMessage: req.userMessage || 'ข้าขอคำปรึกษาจากสภาเทพ' };
    let res1Text = '';
    let councilLogs: string[] = [];
    
    if (!this.USE_OPENROUTER_FOR_GODS) {
        const p1 = this.buildFullPrompt(req1 as any);
        const r1 = await this.generateViaOpenClaw('เลโอ', p1);
        if (r1.success && r1.response) {
            res1Text = r1.response;
        }
        councilLogs.push(...r1.logs);
    }
    if (!res1Text) {
        const res1 = await this.callOpenRouter('google/gemini-2.0-flash-001', req1 as any);
        res1Text = res1.narrative;
    }

    const req2 = { ...req, action: 'talk', npcName: 'อารีน่า', userMessage: `เลโอเพิ่งกล่าวว่า: "${res1Text}". ในฐานะราชินี ท่านมีความเห็นอย่างไรต่อคำพูดของเขาและผู้เล่น ${req.playerName}?` };
    let res2Text = '';

    if (!this.USE_OPENROUTER_FOR_GODS) {
        const p2 = this.buildFullPrompt(req2 as any);
        const r2 = await this.generateViaOpenClaw('อารีน่า', p2);
        if (r2.success && r2.response) {
            res2Text = r2.response;
        }
        councilLogs.push(...r2.logs);
    }
    if (!res2Text) {
        const res2 = await this.callOpenRouter('google/gemini-2.0-flash-001', req2 as any);
        res2Text = res2.narrative;
    }

    return {
      narrative: `[เลโอ]: ${res1Text}\n\n[อารีน่า]: ${res2Text}`,
      source: 'council_simulation',
      model: this.USE_OPENROUTER_FOR_GODS ? 'multi-agent-chain (openrouter)' : 'multi-agent-chain (openclaw)',
      gatewayLogs: councilLogs.length > 0 ? councilLogs : undefined
    };
  }

  private shouldTriggerCouncil(req: OrchestratorRequest): boolean {
    const message = req.userMessage?.toLowerCase() || '';
    return message.includes('สภาเทพ') || message.includes('council');
  }

  private async callOpenRouter(model: string, req: OrchestratorRequest): Promise<OrchestratorResponse> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey.includes('000000')) {
        // Feature: Expanded Offline Variety (Randomized Fallbacks)
        const fallbacks: Record<string, string[]> = {
          talk: [
            `"เจ้ากำลังก้าวไปข้างหน้าในเส้นทางที่ข้าจับตามองอยู่"`,
            `"พลังของเจ้าเพิ่มพูนขึ้น แต่จงอย่าประมาทศัตรูในเงามืด"`,
            `"วิหารแห่งนี้จะต้อนรับผู้ที่คู่ควรเสมอ เจ้าคือหนึ่งในนั้นหรือไม่?"`,
            `"เรื่องราวของเจ้ากำลังถูกบันทึกไว้ในตำนานแห่งโอลิมปัส"`,
            `"จงรักษาสายสัมพันธ์นี้ไว้ เพราะมันจะเป็นพลังให้เจ้าในยามวิกฤต"`
          ],
          shop_talk: [
            `"เจ้ามีของที่ข้ากำลังตามหาอยู่หรือไม่?"`,
            `"ราคาไม่ใช่ปัญหา ถ้าของชิ้นนั้นคุ้มค่าพอ"`,
            `"ร้านของเจ้าเริ่มเป็นที่เลื่องลือไปถึงหูของเหล่าทวยเทพแล้วนะ"`,
            `"ข้าหวังว่าการค้าขายในวันนี้จะนำพาโชคลาภมาให้เจ้า"`
          ],
          gift: [
            `"ของชิ้นนี้ถูกใจข้ายิ่งนัก เจ้าช่างรู้ใจข้าจริงๆ"`,
            `"ข้าขอรับไว้ด้วยความยินดี พลังของข้าจะคุ้มครองเจ้า"`,
            `"ช่างเป็นน้ำใจที่ประเสริฐ ข้าจะจดจำการกระทำนี้ไว้"`,
            `"ของขวัญที่ล้ำค่าที่สุดคือความจริงใจที่เจ้ามอบให้"`
          ]
        };

        const category = fallbacks[req.action] || fallbacks.talk;
        const randomText = category[Math.floor(Math.random() * category.length)];

        return { 
            narrative: req.userMessage ? randomText : `"ยินดีต้อนรับสู่โชคชะตาของเจ้า..."`, 
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
    const isHerald = req.npcName.includes('Herald');
    const day = req.playerContext?.day || 1;
    const urgency = day >= 18 ? 'วิกฤต (เหลือเวลาอีกไม่กี่วัน!)' : day >= 15 ? 'เร่งด่วน' : 'ปกติ';

    if (req.action === 'generate_skill') {
        return `คุณคือเกมดีไซน์เนอร์ของเกม RPG แฟนตาซี "Gods' Arena" ออกแบบสกิลการต่อสู้ที่เป็นเอกลักษณ์`;
    }

    if (req.action === 'shop_talk') {
        let prompt = `คุณคือ ${req.npcName} ลูกค้าในร้าน Celestial Emporium บุคลิก: ${req.npcMood}. จ่ายได้ ${req.offeredGold} gold สำหรับ ${req.wantedItem}. กฎ: สั้นๆ 1-2 ประโยค ภาษาไทย ห้ามหลุดบท`;
        if (isHerald) prompt += ` (คุณมาในนามของเทพเพราะเขายังไม่สนใจผู้เล่นคนนี้)`;
        return prompt;
    }

    if (req.action === 'talk') {
        const bondDesc = (req.bondLevel || 0) >= 12 ? 'สนิทมาก พูดคุยเหมือนเพื่อนรัก' : (req.bondLevel || 0) >= 8 ? 'ค่อนข้างสนิท เริ่มไว้ใจ' : (req.bondLevel || 0) >= 5 ? 'รู้จักกันพอสมควร' : 'ยังไม่สนิทนัก';
        
        let prompt = `คุณคือ ${req.npcName} เทพในเกม RPG "Gods' Arena (วิหารแห่งเทพ)"

=== บริบทปัจจุบัน (Urgency) ===
วันที่: ${day}/20
ระดับความเร่งด่วน: ${urgency}

=== บุคลิกภาพ ===
${req.npcPersonality || req.npcMood}
${isHerald ? 'กฎ: คุณคือผู้ส่งสาร เทพของคุณยุ่งเกินไปที่จะคุยกับคนแปลกหน้าแบบนี้ วางท่าเล็กน้อย' : ''}

=== สไตล์การพูด ===
${req.npcSpeechStyle || 'พูดให้เข้ากับบุคลิกของเทพ'}

=== ระดับความสัมพันธ์ ===
Bond Level: ${req.bondLevel || 1} — ${bondDesc}

=== ข้อมูลความคืบหน้าของผู้เล่น (Player Context) ===
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
- *** สำคัญ: หากระดับความเร่งด่วนคือ "วิกฤต" หรือ "เร่งด่วน" ให้แสดงความกังวลเรื่องเวลาในบทสนทนาด้วย ***
- หากเป็น Herald ให้ย้ำว่าเทพส่งคุณมาแทนเพราะผู้เล่นยังไม่คู่ควร
- พูดตามบุคลิกอย่างเคร่งครัด ห้ามหลุดบทบาท`;
        return prompt;
    }

    if (req.action === 'gift') {
        return `คุณคือ ${req.npcName} ในเกม RPG "Gods' Arena" เพิ่งได้รับ "${req.wantedItem}" จากผู้เล่น (Bond: ${req.bondLevel})`;
    }

    if (req.action === 'exploration_event') {
        return `คุณคือ ${req.npcName} บรรยายการสำรวจ ${req.location} พบ ${req.foundItem} สไตล์เทพ 1-2 ประโยค ภาษาไทย`;
    }

    if (req.action === 'divine_intervention') {
        return `คุณคือผู้บรรยายการต่อสู้ในเกม RPG "Gods' Arena" เมื่อเทพแสดงพลังเหนือธรรมชาติ ${req.npcName} บรรยาย 1-2 ประโยค ภาษาไทย ที่น่าตื่นตาตื่นใจ`;
    }

    return `คุณเป็นผู้บรรยายการต่อสู้ในเกม RPG "Gods' Arena" 1-2 ประโยค ภาษาไทย`;
  }

  private buildUserPrompt(req: OrchestratorRequest): string {
    if (req.action === 'generate_skill') {
        return `สร้างสกิลต่อสนะใหม่สำหรับ Kane (แชมเปี้ยนนักธนู) ที่ได้รับจากเทพ ${req.npcName}
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

    if (req.action === 'divine_intervention') {
        return `เทพ ${req.npcName} ทำการโจมตีพิเศษต่อ ${req.enemyName} สร้างความเสียหาย ${req.damage} หน่วย บรรยายเหตุการณ์นี้ 1-2 ประโยค ภาษาไทย`;
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
