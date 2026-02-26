import { useState, useEffect, useRef } from 'react'
import type { Tweet } from '../../../core/types'
import { MAX_CHARACTERS } from '../../../core/constants'
import { getRemainingChars } from '../../../core/utils'
import { DiffView } from '../../edit-mode/components/DiffView'
import { EditControls } from '../../edit-mode/components/EditControls'
import profilePic from '../../../assets/stossel-profile-pic.jpg'

interface TweetCardProps {
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

export function TweetCard({
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
}: TweetCardProps) {
  const [showVersionDropdown, setShowVersionDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const remaining = getRemainingChars(tweet.text, MAX_CHARACTERS)
  const isOverLimit = remaining < 0
  const isWarning = remaining >= 0 && remaining <= 20

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowVersionDropdown(false)
      }
    }
    
    if (showVersionDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showVersionDropdown])

  // Get all versions including original
  const allVersions = tweet.versions || []
  const hasVersions = allVersions.length > 0
  const isViewingVersion = tweet.viewingVersion !== undefined
  const isEmpty = !tweet.text.trim() && !hasVersions && !tweet.isLocked
  // A tweet is editable if: it's in edit mode, it's empty (new tweet), or it's not locked yet
  const isEditable = tweet.isEditing || isEmpty || !tweet.isLocked
  const currentVersionNumber = hasVersions ? allVersions.length : 1

  // Get display text based on state
  const getDisplayText = () => {
    if (tweet.showDiff && tweet.diff) {
      return null // Will show diff view
    }
    if (isViewingVersion && hasVersions) {
      const version = allVersions.find(v => v.versionNumber === tweet.viewingVersion)
      return version?.text || tweet.text
    }
    return tweet.text
  }

  const displayText = getDisplayText()

  return (
    <>
      <div className="tweet-header">
        <div className="tweet-avatar">
          <img src={profilePic} alt="Profile" className="avatar-img" />
        </div>
        <div className="tweet-content-wrapper">
          <div className="tweet-meta">
            <div className="tweet-author">
              <span className="tweet-name">John Stossel</span>
              <svg viewBox="0 0 22 22" className="verified-badge">
                <path fill="currentColor" d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"/>
              </svg>
              <span className="tweet-handle">@JohnStossel</span>
              <span className="tweet-date">· Oct 4</span>
            </div>
            <div className="tweet-header-actions">
              <div className="version-dropdown-container" ref={dropdownRef}>
                <button
                  onClick={() => setShowVersionDropdown(!showVersionDropdown)}
                  className="btn-header btn-version"
                  title={hasVersions ? `v${currentVersionNumber}${isViewingVersion ? ` (viewing v${tweet.viewingVersion})` : ''}` : `Version ${currentVersionNumber} (not locked yet)`}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
                  </svg>
                  <span className="version-label">v{currentVersionNumber}</span>
                </button>
                {showVersionDropdown && (
                  <div className="version-dropdown">
                    <div className="version-dropdown-header">Versions</div>
                    {hasVersions ? (
                      allVersions.map((version) => (
                        <button
                          key={version.versionNumber}
                          onClick={() => {
                            onSwitchToVersion(version.versionNumber)
                            setShowVersionDropdown(false)
                          }}
                          className={`version-item ${tweet.viewingVersion === version.versionNumber ? 'active' : ''}`}
                        >
                          <span className="version-number">v{version.versionNumber}</span>
                          <span className="version-date">
                            {new Date(version.timestamp).toLocaleString()}
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="version-item version-placeholder">
                        <span className="version-number">v1</span>
                        <span className="version-date">Not locked yet</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={onLockChanges}
                className="btn-header btn-lock"
                title={tweet.isLocked && !tweet.isEditing ? "Unlock Tweet" : !isEditable ? "Lock Changes (Start typing or click Edit first)" : isViewingVersion ? "Lock Changes (Exit version view first)" : "Lock Changes"}
                disabled={(!isEditable && !tweet.isLocked) || isViewingVersion}
              >
                {tweet.isLocked && !tweet.isEditing ? (
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h1.9c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1V8H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          <div className="tweet-text-container">
            {tweet.showDiff && tweet.diff ? (
              <DiffView diff={tweet.diff} />
            ) : (
              <textarea
                value={displayText || ''}
                onChange={(e) => onUpdate(e.target.value)}
                placeholder={`Tweet ${index + 1}`}
                className="tweet-input"
                disabled={!isEditable || isViewingVersion}
                readOnly={isViewingVersion}
              />
            )}
          </div>
          
          {tweet.isEditing && (
            <EditControls
              onLock={onLockChanges}
              onCancel={onExitEditMode}
            />
          )}
          
          <div className="tweet-footer">
            <div className="tweet-actions">
              <button className="action-btn">
                <svg viewBox="0 0 24 24" className="action-icon">
                  <path fill="currentColor" d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"/>
                </svg>
              </button>
              <button className="action-btn">
                <svg viewBox="0 0 24 24" className="action-icon">
                  <path fill="currentColor" d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"/>
                </svg>
              </button>
              <button className="action-btn">
                <svg viewBox="0 0 24 24" className="action-icon">
                  <path fill="currentColor" d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"/>
                </svg>
              </button>
              <button className="action-btn">
                <svg viewBox="0 0 24 24" className="action-icon">
                  <path fill="currentColor" d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"/>
                </svg>
              </button>
            </div>
            
            <div className="tweet-footer-actions">
              <button
                onClick={onApprove}
                className="btn-footer btn-approve"
                title={tweet.isApproved ? "Unapprove Tweet" : "Approve Tweet"}
                disabled={isViewingVersion}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </button>
              
              <button
                onClick={onEnterEditMode}
                className="btn-footer btn-edit"
                title={isViewingVersion ? "Edit Tweet (Exit version view first)" : isEditable ? "Edit Tweet (Exit edit mode first)" : "Edit Tweet"}
                disabled={isViewingVersion || isEditable}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
              
              <button
                onClick={onShowDiff}
                className="btn-footer btn-diff"
                title={!hasVersions ? "Show Diff (No versions available)" : hasVersions && allVersions.length < 2 && !tweet.originalText ? "Show Diff (Need at least 2 versions)" : tweet.showDiff ? "Hide Diff" : "Show Diff"}
                disabled={!hasVersions || (allVersions.length < 2 && !tweet.originalText)}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                </svg>
              </button>
              
              <button
                onClick={onDelete}
                className="btn-footer btn-delete"
                title={tweets.length <= 1 ? "Delete Tweet (Need at least one tweet)" : "Delete Tweet"}
                disabled={tweets.length <= 1}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
              </button>
            </div>
            
            <div className="tweet-stats">
              <span 
                className={`char-count ${isOverLimit ? 'over-limit' : ''} ${isWarning ? 'warning' : ''}`}
              >
                {isOverLimit ? `-${Math.abs(remaining)}` : remaining}
              </span>
              <svg className={`char-circle ${isOverLimit ? 'over-limit' : ''} ${isWarning ? 'warning' : ''}`} width="20" height="20" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="8.5" fill="none" strokeWidth="2"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
