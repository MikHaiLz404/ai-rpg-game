import { NextRequest, NextResponse } from 'next/server';

// Using OpenRouter for free AI access
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const { action, playerName, npcName, npcMood, godTheme, level, userMessage, enemyName, damage } = await request.json();

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

    // If no API key, return a fallback message immediately to avoid 500 error
    if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY.includes('000000')) {
        console.warn('No OpenRouter API Key found. Using fallback narrative.');
        return NextResponse.json({ 
            narrative: userMessage 
                ? `[Divine Silence] ${npcName} acknowledges your words: "${userMessage.substring(0, 20)}..."` 
                : `${npcName} watches you with divine curiosity, waiting for your next move.`
        });
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
