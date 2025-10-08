import { useState, useEffect, useRef } from 'react'
import './App.css'
import profilePic from './assets/stossel-profile-pic.jpg'

interface Tweet {
  id: number
  text: string
  showMenu?: boolean
}

const MAX_CHARACTERS = 280
const DEFAULT_TWEET_COUNT = 8

function App() {
  const [tweets, setTweets] = useState<Tweet[]>(() => {
    // Try to load from localStorage
    const saved = localStorage.getItem('tweets')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        // If parsing fails, return default
      }
    }
    // Default: 8 empty tweets
    return Array.from({ length: DEFAULT_TWEET_COUNT }, (_, i) => ({
      id: i + 1,
      text: ''
    }))
  })

  // Auto-save to localStorage whenever tweets change
  useEffect(() => {
    localStorage.setItem('tweets', JSON.stringify(tweets))
  }, [tweets])

  const updateTweet = (id: number, text: string) => {
    setTweets(tweets.map(tweet => 
      tweet.id === id ? { ...tweet, text } : tweet
    ))
  }

  const addTweet = () => {
    const newId = Math.max(...tweets.map(t => t.id), 0) + 1
    setTweets([...tweets, { id: newId, text: '' }])
  }

  const removeTweet = (id: number) => {
    if (tweets.length > 1) {
      setTweets(tweets.filter(tweet => tweet.id !== id))
    }
  }

  const toggleMenu = (id: number) => {
    setTweets(tweets.map(tweet => 
      tweet.id === id 
        ? { ...tweet, showMenu: !tweet.showMenu }
        : { ...tweet, showMenu: false }
    ))
  }

  const deleteTweet = (id: number) => {
    removeTweet(id)
  }

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.tweet-menu-container')) {
        setTweets(tweets.map(tweet => ({ ...tweet, showMenu: false })))
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [tweets])

  const clearAll = () => {
    if (confirm('Are you sure you want to clear all tweets?')) {
      setTweets(Array.from({ length: DEFAULT_TWEET_COUNT }, (_, i) => ({
        id: i + 1,
        text: ''
      })))
    }
  }

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

  const getRemainingChars = (text: string) => MAX_CHARACTERS - text.length

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

      <div className="tweets-container">
        {tweets.map((tweet, index) => {
          const remaining = getRemainingChars(tweet.text)
          const isOverLimit = remaining < 0
          const isWarning = remaining >= 0 && remaining <= 20

          return (
            <div key={tweet.id} className="tweet-card">
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
                    {tweets.length > 1 && (
                      <div className="tweet-menu-container">
                        <button
                          onClick={() => toggleMenu(tweet.id)}
                          className="btn-more"
                          title="More options"
                        >
                          <svg viewBox="0 0 24 24" width="18.75" height="18.75">
                            <path fill="currentColor" d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
                          </svg>
                        </button>
                        {tweet.showMenu && (
                          <div className="dropdown-menu">
                            <button
                              onClick={() => deleteTweet(tweet.id)}
                              className="dropdown-item delete"
                            >
                              <svg viewBox="0 0 24 24" width="18.75" height="18.75">
                                <path fill="currentColor" d="M16 6V4.5C16 3.12 14.88 2 13.5 2h-3C9.11 2 8 3.12 8 4.5V6H3v2h1.06l.81 11.21C4.98 20.78 6.28 22 7.86 22h8.27c1.58 0 2.88-1.22 3-2.79L19.93 8H21V6h-5zm-6-1.5c0-.28.22-.5.5-.5h3c.27 0 .5.22.5.5V6h-4V4.5zm7.13 14.57c-.04.52-.47.93-1 .93H7.86c-.53 0-.96-.41-1-.93L6.07 8h11.85l-.79 11.07zM9 17v-6h2v6H9zm4 0v-6h2v6h-2z"/>
                              </svg>
                              Delete Tweet
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <textarea
                    value={tweet.text}
                    onChange={(e) => updateTweet(tweet.id, e.target.value)}
                    placeholder={`Tweet ${index + 1}`}
                    className="tweet-input"
                  />
                  
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
            </div>
          )
        })}
      </div>

      <footer className="footer">
        <p>💡 Your tweets are automatically saved to your browser</p>
      </footer>
    </div>
  )
}

export default App
