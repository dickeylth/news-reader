import { formatTime } from '@/utils/date';
import type { Story } from '@/types/hackernews';

export default function StoryItem({ story, isSelected }: { story: Story; isSelected?: boolean }) {
  return (
    <div className={`bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer
      ${isSelected ? 'ring-2 ring-orange-500' : ''}`}>
      <h2 className="text-xl font-semibold text-gray-900 hover:text-orange-500">
        {story.title}
      </h2>
      <div className="mt-2 text-sm text-gray-600 flex flex-wrap gap-2">
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
    </div>
  );
} 