import { NextResponse, type NextRequest } from 'next/server';
import { fetchStory, fetchStoryComments } from '@/utils/hackernews';

export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id
  try {
    const story = await fetchStory(Number(id));
    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    const comments = await fetchStoryComments(id);
    return NextResponse.json({ story, comments });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch story: ' + error }, { status: 500 });
  }
} 