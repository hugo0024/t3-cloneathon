import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: conversationId } = await params;

    // Verify the conversation belongs to the user
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single();

    if (convError || !conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    const { data: messages, error } = await supabase
      .from('messages')
      .select(
        `
        *,
        attachments (
          id,
          filename,
          file_type,
          file_size,
          file_url,
          created_at
        ),
        message_quality_metrics (
          quality_score,
          coherence_score,
          relevance_score,
          completeness_score,
          clarity_score,
          readability_score,
          response_time,
          word_count,
          sentence_count,
          average_sentence_length,
          prompt_tokens,
          completion_tokens,
          total_tokens,
          cost,
          temperature,
          top_p,
          finish_reason,
          calculated_at
        )
      `
      )
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      );
    }

    // Transform messages to include qualityMetrics
    const transformedMessages = messages?.map((message: any) => {
      const qualityData = message.message_quality_metrics?.[0];

      if (qualityData) {
        return {
          ...message,
          qualityMetrics: {
            qualityScore: qualityData.quality_score || 0,
            coherenceScore: qualityData.coherence_score || 0,
            relevanceScore: qualityData.relevance_score || 0,
            completenessScore: qualityData.completeness_score || 0,
            clarityScore: qualityData.clarity_score || 0,
            readabilityScore: qualityData.readability_score || 0,
            responseTime: qualityData.response_time || 0,
            wordCount: qualityData.word_count || 0,
            sentenceCount: qualityData.sentence_count || 0,
            averageSentenceLength: qualityData.average_sentence_length || 0,
            tokenUsage: {
              promptTokens: qualityData.prompt_tokens || 0,
              completionTokens: qualityData.completion_tokens || 0,
              totalTokens: qualityData.total_tokens || 0,
            },
            cost: qualityData.cost || 0,
            temperature: qualityData.temperature,
            topP: qualityData.top_p,
            finishReason: qualityData.finish_reason,
            calculatedAt: qualityData.calculated_at,
          },
          // Remove the raw quality metrics data
          message_quality_metrics: undefined,
        };
      }

      return {
        ...message,
        message_quality_metrics: undefined,
      };
    });

    return NextResponse.json({ messages: transformedMessages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: conversationId } = await params;
    const { role, content } = await request.json();

    if (!role || !content) {
      return NextResponse.json(
        { error: 'Role and content are required' },
        { status: 400 }
      );
    }

    if (!['user', 'assistant', 'system'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Verify the conversation belongs to the user
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single();

    if (convError || !conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Insert the new message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role,
        content,
      })
      .select()
      .single();

    if (messageError || !message) {
      return NextResponse.json(
        { error: 'Failed to create message' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
