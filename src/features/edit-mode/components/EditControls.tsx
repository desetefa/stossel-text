interface EditControlsProps {
  onLock: () => void
  onCancel: () => void
}

export function EditControls({ onLock, onCancel }: EditControlsProps) {
  return (
    <div className="edit-mode-controls">
      <button
        onClick={onLock}
        className="btn btn-primary btn-small"
      >
        Lock
      </button>
      <button
        onClick={onCancel}
        className="btn btn-secondary btn-small"
      >
        Cancel
      </button>
    </div>
  )
}

