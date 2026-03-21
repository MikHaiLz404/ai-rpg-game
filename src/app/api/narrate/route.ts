import { NextRequest, NextResponse } from 'next/server';
import { orchestrator } from '@/lib/ai/orchestrator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
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
