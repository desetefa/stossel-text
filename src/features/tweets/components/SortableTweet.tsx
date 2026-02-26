import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Tweet } from '../../../core/types'
import { TweetCard } from './TweetCard'

interface SortableTweetProps {
  tweet: Tweet
  index: number
  tweets: Tweet[]
  onUpdate: (text: string) => void
  onDelete: () => void
  onEnterEditMode: () => void
  onExitEditMode: () => void
  onLockChanges: () => void
  onApprove: () => void
  onSwitchToVersion: (versionNumber: number) => void
  onShowDiff: () => void
}

export function SortableTweet({
  tweet,
  index,
  tweets,
  onUpdate,
  onDelete,
  onEnterEditMode,
  onExitEditMode,
  onLockChanges,
  onApprove,
  onSwitchToVersion,
  onShowDiff,
}: SortableTweetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tweet.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className={`tweet-card ${isDragging ? 'dragging' : ''}`}>
      <div className="tweet-drag-handle" {...attributes} {...listeners}>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
        </svg>
      </div>
      <TweetCard
        tweet={tweet}
        index={index}
        tweets={tweets}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onEnterEditMode={onEnterEditMode}
        onExitEditMode={onExitEditMode}
        onLockChanges={onLockChanges}
        onApprove={onApprove}
        onSwitchToVersion={onSwitchToVersion}
        onShowDiff={onShowDiff}
      />
    </div>
  )
}

