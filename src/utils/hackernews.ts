import type { Comment, Story } from '@/types/hackernews';

export async function fetchStory(id: number): Promise<Story | null> {
  try {
    const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error(`Error fetching story ${id}:`, error);
    return null;
  }
}

export async function fetchStoryComments(storyId: string | number): Promise<Comment[]> {
  try {
    const story = await fetchStory(Number(storyId));
    if (!story?.kids) return [];
    
    const comments = await Promise.all(
      story.kids.slice(0, 10).map(id => fetchComment(id))
    );
    return comments.filter((comment): comment is Comment => comment !== null);
  } catch (error) {
    console.error(`Error fetching comments for story ${storyId}:`, error);
    return [];
  }
}

async function fetchComment(id: number, depth = 0): Promise<Comment | null> {
  if (depth > 3) return null;
  
  try {
    const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
    if (!response.ok) return null;
    const comment: Comment = await response.json();
    
    if (comment.kids?.length) {
      const replies = await Promise.all(
        comment.kids.map(kidId => fetchComment(kidId, depth + 1))
      );
      comment.replies = replies.filter((reply): reply is Comment => reply !== null);
    }
    
    return comment;
  } catch (error) {
    console.error(`Error fetching comment ${id}:`, error);
    return null;
  }
} 