import { component$ } from '@builder.io/qwik';
import { formatTime } from '~/utils/date';
import type { Story } from '~/types/hackernews';

export const StoryItem = component$<{ story: Story }>(({ story }) => {
  return (
    <li class="bg-white p-4 rounded-lg shadow">
      <a href={`/story/${story.id}`} class="block">
        <h2 class="text-xl font-semibold text-gray-900 hover:text-orange-500">
          {story.title}
        </h2>
        <div class="mt-2 text-sm text-gray-600 flex flex-wrap gap-2">
          <span>{story.score} points</span>
          <span>•</span>
          <span>by {story.by}</span>
          <span>•</span>
          <span>created {formatTime(story.time)}</span>
          {story.descendants > 0 && (
            <>
              <span>•</span>
              <span>{story.descendants} comments</span>
              {story.time !== story.lastCommentTime && (
                <>
                  <span>•</span>
                  <span>last comment {formatTime(story.lastCommentTime)}</span>
                </>
              )}
            </>
          )}
        </div>
      </a>
    </li>
  );
}); 