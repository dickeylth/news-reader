import { NextResponse, type NextRequest } from 'next/server';
import { fetchStory } from '@/utils/hackernews';

const ITEMS_PER_PAGE = 10;

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '0');
  
  try {
    const response = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
    const storyIds = await response.json();
    
    const start = page * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const currentBatch = storyIds.slice(start, end);

    const stories = await Promise.all(
      currentBatch.map(async (id: number) => {
        const story = await fetchStory(id);
        return story;
      })
    );

    const validStories = stories.filter(story => story !== null);
    return NextResponse.json(validStories);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stories: ' + error }, { status: 500 });
  }
} 