import { useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import './App.css'
import { MAX_CHARACTERS } from './core/constants'
import { useTweets } from './features/tweets/hooks/useTweets'
import { SortableTweet } from './features/tweets/components/SortableTweet'

function App() {
  const {
    tweets,
    setTweets,
    updateTweet,
    addTweet,
    deleteTweet,
    enterEditMode,
    exitEditMode,
    lockChanges,
    approveTweet,
    switchToVersion,
    showDiff,
    clearAll,
  } = useTweets()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setTweets((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  // Close version dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.version-dropdown-container')) {
        // Version dropdown closing is handled by component state
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [tweets])

  const exportToEmail = () => {
    let body = ''
    let tweetNumber = 1
    
    tweets.forEach((tweet) => {
      // Skip empty tweets
      if (!tweet.text.trim()) return
      
      const remaining = MAX_CHARACTERS - tweet.text.length
      body += `${tweetNumber})\n\n`
      body += `${tweet.text}\n\n`
      body += `(${Math.abs(remaining)} CHARACTERS REMAINING)\n\n`
      tweetNumber++
    })

    // Create mailto link with the formatted body
    const subject = `Tweets - ${new Date().toISOString().split('T')[0]}`
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    
    // Open default mail client
    window.location.href = mailtoLink
  }

  return (
    <div className="app">
      <header className="header">
        <h1>📱 Tweet Manager</h1>
        <p className="subtitle">Create and manage your video tweets</p>
      </header>

      <div className="controls">
        <button onClick={addTweet} className="btn btn-secondary">
          ➕ Add Tweet
        </button>
        <button onClick={clearAll} className="btn btn-secondary">
          🗑️ Clear All
        </button>
        <button onClick={exportToEmail} className="btn btn-primary">
          📧 Export to Email
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={tweets.map((tweet) => tweet.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="tweets-container">
            {tweets.map((tweet, index) => (
              <SortableTweet
                key={tweet.id}
                tweet={tweet}
                index={index}
                tweets={tweets}
                onUpdate={(text) => updateTweet(tweet.id, text)}
                onDelete={() => deleteTweet(tweet.id)}
                onEnterEditMode={() => enterEditMode(tweet.id)}
                onExitEditMode={() => exitEditMode(tweet.id)}
                onLockChanges={() => lockChanges(tweet.id)}
                onApprove={() => approveTweet(tweet.id)}
                onSwitchToVersion={(versionNumber) => switchToVersion(tweet.id, versionNumber)}
                onShowDiff={() => showDiff(tweet.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <footer className="footer">
        <p>💡 Your tweets are automatically saved to your browser</p>
      </footer>
    </div>
  )
}

export default App
