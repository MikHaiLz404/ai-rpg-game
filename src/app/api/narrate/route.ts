import { NextRequest, NextResponse } from 'next/server';

// Using OpenRouter for free AI access
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || 'sk-or-v1-0000000000000000000000000000000000000000000000000000000000000000';

export async function POST(request: NextRequest) {
  try {
    const { action, playerName, enemyName, damage, npcName, npcMood, godTheme, level, userMessage } = await request.json();

    const actionDescriptions: Record<string, string> = {
      attack: 'attacks fiercely',
      defend: 'takes a defensive stance',
      heal: 'channels healing magic',
      fireball: 'unleashes a powerful fire spell',
      talk: 'engages in conversation',
    };

    let prompt = '';

    if (action === 'generate_skill') {
      prompt = `Act as a game designer for a fantasy RPG. Create a unique, powerful combat skill for a champion named Kane.
      The skill is granted by the God ${npcName} who has the theme: ${godTheme}.
      This is for Bond Level ${level}.

      Output exactly in this JSON format:
      {
        "name": "Skill Name",
        "description": "Short epic description",
        "multiplier": number between 1.5 and 3.0,
        "type": "physical" or "magical"
      }`;
    } else if (action === 'talk') {
      if (userMessage) {
        prompt = `Act as ${npcName}, a God in a fantasy RPG. Personality: ${npcMood}.
        The player (${playerName}) says: "${userMessage}"
        
        Respond to the player in character. Keep it short (1-2 sentences). 
        You can be mysterious, arrogant, kind, or wise depending on your personality.
        Format: Just the dialogue. Language: Thai or English (Match the language of the player).`;
      } else {
        prompt = `Act as ${npcName}, a God in a fantasy RPG. Personality: ${npcMood}.
        The player (${playerName}) wants to bond with you.

        Provide a short, meaningful monologue (2 sentences) that asks the player for their opinion on a divine matter or shares a secret prophecy. 
        Format: Just the dialogue. Language: Thai or English.`;
      }
    } else {
      prompt = `Write a short, dramatic narrative (1-2 sentences) about a turn-based RPG battle.
        
Context:
- ${playerName} ${actionDescriptions[action] || 'performs an action'}
- Enemy is ${enemyName || 'a mysterious foe'}
- Damage dealt: ${damage || 0}

Keep it exciting and descriptive. Format: Just the narrative text. Language: Thai or English.`;
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
        model: 'meta-llama/llama-3.2-3b-instruct:free',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      throw new Error('AI API failed');
    }

    const data = await response.json();
    const narrative = data.choices?.[0]?.message?.content || '';

    return NextResponse.json({ narrative });
  } catch (error) {
    console.error('Narrate error:', error);
    return NextResponse.json(
      { error: 'Failed to generate narrative' },
      { status: 500 }
    );
  }
}
