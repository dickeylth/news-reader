import { formatTime } from '@/utils/date';
import type { Story } from '@/types/hackernews';

interface StoryItemProps {
  story: Story;
  isSelected?: boolean;
  onClick: () => void;
  isSkeleton?: boolean;
}

export default function StoryItem({ story, isSelected, onClick, isSkeleton }: StoryItemProps) {
  const skeletonClass = isSkeleton ? 'text-gray-200 bg-gray-200 rounded' : '';
  
  return (
    <div 
      onClick={onClick}
      className={`bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer
        ${isSelected ? 'ring-2 ring-orange-500' : ''}`}
    >
      <h2 className={`text-xl font-semibold text-gray-900 hover:text-orange-500 ${skeletonClass}`}>
        {story.title}
      </h2>
      <div className="mt-2 text-sm text-gray-600 flex flex-wrap gap-2">
        <span className={skeletonClass}>{story.score} points</span>
        <span>•</span>
        <span className={skeletonClass}>by {story.by}</span>
        <span>•</span>
        <span className={skeletonClass}>created {formatTime(story.time)}</span>
        {story.descendants > 0 && (
          <>
            <span>•</span>
            <span className={skeletonClass}>{story.descendants} comments</span>
          </>
        )}
      </div>
    </div>
  );
} 