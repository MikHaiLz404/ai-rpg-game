import { NextRequest, NextResponse } from 'next/server';
import { orchestrator } from '@/lib/ai/orchestrator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Basic request validation
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Validate required fields based on action type
    const { action } = body;
    if (!action || typeof action !== 'string') {
      return NextResponse.json({ error: 'Missing required field: action' }, { status: 400 });
    }

    const validActions = ['shop_talk', 'talk', 'generate_skill', 'gift', 'exploration_event', 'combat'];
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: `Invalid action: ${action}` }, { status: 400 });
    }

    // Delegate all narrative logic to the Divine Orchestrator
    const response = await orchestrator.generate(body);

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Narrate API Error]:', error);
    return NextResponse.json({
      narrative: "The gods are silent...",
      source: 'error',
      model: 'Error',
      prompt: '',
      usage: { total_tokens: 0 }
    });
  }
}
