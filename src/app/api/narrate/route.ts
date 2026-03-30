import { NextRequest, NextResponse } from 'next/server';
import { orchestrator } from '@/lib/ai/orchestrator';
import { narrativeDeduplicator } from '@/lib/utils/deduplication';

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

    const validActions = ['shop_talk', 'talk', 'generate_skill', 'gift', 'exploration_event', 'divine_intervention'];
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: `Invalid action: ${action}` }, { status: 400 });
    }

    // REQUEST DEDUPLICATION:
    // Generate a deduplication key from action and relevant parameters.
    // Duplicate requests (same action + params) within 5 seconds will return
    // the same response instead of making a new API call.
    const dedupeKey = narrativeDeduplicator.generateKey(action, {
      npcName: body.npcName,
      playerName: body.playerName,
      userMessage: body.userMessage,
      npcMood: body.npcMood,
      godTheme: body.godTheme,
      bondLevel: body.bondLevel,
      level: body.level,
      location: body.location,
      firstMeeting: body.firstMeeting,
    });

    const response = await narrativeDeduplicator.deduplicate(dedupeKey, async () => {
      // Delegate all narrative logic to the Divine Orchestrator
      return await orchestrator.generate(body);
    });

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
