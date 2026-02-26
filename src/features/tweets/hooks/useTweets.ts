import { useState, useEffect } from 'react'
import type { Tweet } from '../../../core/types'
import { DEFAULT_TWEET_COUNT } from '../../../core/constants'
import { computeDiff } from '../../edit-mode/utils/diff'

export function useTweets() {
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

  const enterEditMode = (id: number) => {
    setTweets(tweets.map(tweet => {
      if (tweet.id === id) {
        // Exit version view if viewing a version
        const textToEdit = tweet.viewingVersion !== undefined && tweet.versions
          ? tweet.versions.find(v => v.versionNumber === tweet.viewingVersion)?.text || tweet.text
          : tweet.text
        
        return {
          ...tweet,
          isEditing: true,
          originalText: tweet.originalText || textToEdit,
          text: textToEdit,
          viewingVersion: undefined,
          currentVersionIndex: undefined,
          showDiff: false,
          showMenu: false
        }
      }
      return tweet
    }))
  }

  const exitEditMode = (id: number) => {
    setTweets(tweets.map(tweet => {
      if (tweet.id === id) {
        // Restore to the version being viewed, or latest version
        const versions = tweet.versions || []
        if (tweet.viewingVersion !== undefined && versions.length > 0) {
          const version = versions.find(v => v.versionNumber === tweet.viewingVersion)
          if (version) {
            return {
              ...tweet,
              isEditing: false,
              text: version.text
            }
          }
        }
        // Restore to latest version or original
        const latestVersion = versions.length > 0 ? versions[versions.length - 1] : null
        return {
          ...tweet,
          isEditing: false,
          text: latestVersion?.text || tweet.originalText || tweet.text
        }
      }
      return tweet
    }))
  }

  const lockChanges = (id: number) => {
    setTweets(tweets.map(tweet => {
      if (tweet.id === id) {
        // If already locked, unlock it
        if (tweet.isLocked) {
          return {
            ...tweet,
            isLocked: false
          }
        }
        
        // Otherwise, lock it and create a new version
        const versions = tweet.versions || []
        const nextVersionNumber = versions.length + 1
        const currentText = tweet.text
        const originalText = tweet.originalText || currentText
        
        // Always create a new version on lock
        const newVersion = {
          text: currentText,
          timestamp: Date.now(),
          versionNumber: nextVersionNumber,
          isOriginal: false
        }
        
        versions.push(newVersion)
        
        return {
          ...tweet,
          isEditing: false,
          isLocked: true,
          showDiff: false,
          versions,
          originalText: originalText,
          viewingVersion: undefined,
          currentVersionIndex: undefined
        }
      }
      return tweet
    }))
  }

  const switchToVersion = (id: number, versionNumber: number) => {
    setTweets(tweets.map(tweet => {
      if (tweet.id === id) {
        const versions = tweet.versions || []
        const version = versions.find(v => v.versionNumber === versionNumber)
        if (version) {
          return {
            ...tweet,
            viewingVersion: versionNumber,
            currentVersionIndex: versions.findIndex(v => v.versionNumber === versionNumber),
            text: version.text,
            showDiff: false,
            isEditing: false
          }
        }
      }
      return tweet
    }))
  }

  const exitVersionView = (id: number) => {
    setTweets(tweets.map(tweet => {
      if (tweet.id === id) {
        const versions = tweet.versions || []
        const latestVersion = versions.length > 0 ? versions[versions.length - 1] : null
        return {
          ...tweet,
          viewingVersion: undefined,
          currentVersionIndex: undefined,
          text: latestVersion?.text || tweet.originalText || tweet.text,
          showDiff: false
        }
      }
      return tweet
    }))
  }

  const showDiff = (id: number) => {
    setTweets(tweets.map(tweet => {
      if (tweet.id === id) {
        const versions = tweet.versions || []
        if (versions.length > 0) {
          // If viewing a specific version, compare with previous version
          if (tweet.viewingVersion !== undefined) {
            const currentVersion = versions.find(v => v.versionNumber === tweet.viewingVersion)
            const previousVersionNumber = tweet.viewingVersion - 1
            
            if (previousVersionNumber >= 1) {
              const previousVersion = versions.find(v => v.versionNumber === previousVersionNumber)
              if (currentVersion && previousVersion) {
                const diff = computeDiff(previousVersion.text, currentVersion.text)
                return {
                  ...tweet,
                  showDiff: !tweet.showDiff,
                  diff
                }
              }
            } else if (previousVersionNumber === 0) {
              // Compare with original
              const originalText = tweet.originalText || ''
              if (currentVersion) {
                const diff = computeDiff(originalText, currentVersion.text)
                return {
                  ...tweet,
                  showDiff: !tweet.showDiff,
                  diff
                }
              }
            }
          } else {
            // Not viewing a specific version - compare latest with previous
            if (versions.length >= 2) {
              const latestVersion = versions[versions.length - 1]
              const previousVersion = versions[versions.length - 2]
              const diff = computeDiff(previousVersion.text, latestVersion.text)
              return {
                ...tweet,
                showDiff: !tweet.showDiff,
                diff
              }
            } else if (versions.length === 1) {
              // Only one version - compare with original
              const latestVersion = versions[0]
              const originalText = tweet.originalText || ''
              const diff = computeDiff(originalText, latestVersion.text)
              return {
                ...tweet,
                showDiff: !tweet.showDiff,
                diff
              }
            }
          }
        }
        return {
          ...tweet,
          showDiff: !tweet.showDiff
        }
      }
      return tweet
    }))
  }

  const clearAll = () => {
    if (confirm('Are you sure you want to clear all tweets?')) {
      setTweets(Array.from({ length: DEFAULT_TWEET_COUNT }, (_, i) => ({
        id: i + 1,
        text: ''
      })))
    }
  }

  const approveTweet = (id: number) => {
    setTweets(tweets.map(tweet => 
      tweet.id === id 
        ? { ...tweet, isApproved: !tweet.isApproved }
        : tweet
    ))
  }

  return {
    tweets,
    setTweets,
    updateTweet,
    addTweet,
    removeTweet,
    toggleMenu,
    deleteTweet,
    enterEditMode,
    exitEditMode,
    lockChanges,
    approveTweet,
    switchToVersion,
    exitVersionView,
    showDiff,
    clearAll,
  }
}

