import { NextRequest, NextResponse } from 'next/server';

// Using OpenRouter for free AI access
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || 'sk-or-v1-0000000000000000000000000000000000000000000000000000000000000000';

export async function POST(request: NextRequest) {
  try {
    const { action, playerName, enemyName, damage } = await request.json();

    const actionDescriptions: Record<string, string> = {
      attack: 'attacks fiercely',
      defend: 'takes a defensive stance',
      heal: 'channels healing magic',
      fireball: 'unleashes a powerful fire spell',
    };

    const prompt = `Write a short, dramatic narrative (1-2 sentences) about a turn-based RPG battle.
    
Context:
- ${playerName} ${actionDescriptions[action]}
- Enemy is ${enemyName}
- Damage dealt: ${damage}

Keep it exciting and descriptive. Format in Thai or English.`;

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
        max_tokens: 100,
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
