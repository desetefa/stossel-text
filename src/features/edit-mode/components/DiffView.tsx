import type { DiffSegment } from '../../../core/types'

interface DiffViewProps {
  diff: DiffSegment[]
}

export function DiffView({ diff }: DiffViewProps) {
  return (
    <div className="tweet-diff-view">
      {diff.map((segment, idx) => (
        <span
          key={idx}
          className={`diff-segment diff-${segment.type}`}
        >
          {segment.text}
        </span>
      ))}
    </div>
  )
}

