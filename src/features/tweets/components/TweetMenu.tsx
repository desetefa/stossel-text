import type { Tweet } from '../../../core/types'

interface TweetMenuProps {
  tweet: Tweet
  tweets: Tweet[]
  onEdit: () => void
  onDelete: () => void
  onToggleDiff: () => void
  onShowHistory: () => void
}

export function TweetMenu({ 
  tweet, 
  tweets, 
  onEdit, 
  onDelete, 
  onToggleDiff, 
  onShowHistory 
}: TweetMenuProps) {
  if (!tweet.showMenu) return null

  const canEdit = !tweet.isEditing && !tweet.isLocked

  return (
    <div className="dropdown-menu">
      {canEdit && (
        <button
          onClick={onEdit}
          className="dropdown-item"
        >
          <svg viewBox="0 0 24 24" width="18.75" height="18.75">
            <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
          </svg>
          Edit Tweet
        </button>
      )}
      {tweet.isLocked && (
        <>
          <button
            onClick={onToggleDiff}
            className="dropdown-item"
          >
            <svg viewBox="0 0 24 24" width="18.75" height="18.75">
              <path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
            </svg>
            {tweet.showDiff ? 'Hide Changes' : 'Show Changes'}
          </button>
          {tweet.versions && tweet.versions.length > 0 && (
            <button
              onClick={onShowHistory}
              className="dropdown-item"
            >
              <svg viewBox="0 0 24 24" width="18.75" height="18.75">
                <path fill="currentColor" d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
              </svg>
              View History
            </button>
          )}
        </>
      )}
      {tweets.length > 1 && (
        <button
          onClick={onDelete}
          className="dropdown-item delete"
        >
          <svg viewBox="0 0 24 24" width="18.75" height="18.75">
            <path fill="currentColor" d="M16 6V4.5C16 3.12 14.88 2 13.5 2h-3C9.11 2 8 3.12 8 4.5V6H3v2h1.06l.81 11.21C4.98 20.78 6.28 22 7.86 22h8.27c1.58 0 2.88-1.22 3-2.79L19.93 8H21V6h-5zm-6-1.5c0-.28.22-.5.5-.5h3c.27 0 .5.22.5.5V6h-4V4.5zm7.13 14.57c-.04.52-.47.93-1 .93H7.86c-.53 0-.96-.41-1-.93L6.07 8h11.85l-.79 11.07zM9 17v-6h2v6H9zm4 0v-6h2v6h-2z"/>
          </svg>
          Delete Tweet
        </button>
      )}
    </div>
  )
}

