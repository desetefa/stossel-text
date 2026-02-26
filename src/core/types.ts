export interface TweetVersion {
  text: string
  timestamp: number
  versionNumber: number
  isOriginal: boolean
}

export interface DiffSegment {
  text: string
  type: 'unchanged' | 'added' | 'removed'
}

export interface Tweet {
  id: number
  text: string
  originalText?: string
  isEditing?: boolean
  isLocked?: boolean
  isApproved?: boolean
  showDiff?: boolean
  showMenu?: boolean
  currentVersionIndex?: number
  viewingVersion?: number
  versions?: TweetVersion[]
  diff?: DiffSegment[]
}

