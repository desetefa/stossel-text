import type { DiffSegment } from '../../../core/types'

// Simple diff algorithm - compares original and edited text
export function computeDiff(original: string, edited: string): DiffSegment[] {
  if (original === edited) {
    return [{ text: original, type: 'unchanged' }]
  }
  
  const segments: DiffSegment[] = []
  
  // Split into words while preserving spaces
  const originalParts = original.split(/(\s+)/)
  const editedParts = edited.split(/(\s+)/)
  
  // Use a simple approach: show removed parts from original, then added parts from edited
  // For unchanged parts, show them normally
  
  let origIdx = 0
  let editIdx = 0
  
  while (origIdx < originalParts.length || editIdx < editedParts.length) {
    if (origIdx >= originalParts.length) {
      // Only in edited - all added
      if (editIdx < editedParts.length) {
        segments.push({ 
          text: editedParts.slice(editIdx).join(''), 
          type: 'added' 
        })
      }
      break
    }
    
    if (editIdx >= editedParts.length) {
      // Only in original - all removed
      if (origIdx < originalParts.length) {
        segments.push({ 
          text: originalParts.slice(origIdx).join(''), 
          type: 'removed' 
        })
      }
      break
    }
    
    if (originalParts[origIdx] === editedParts[editIdx]) {
      // Match found - add unchanged
      segments.push({ text: originalParts[origIdx], type: 'unchanged' })
      origIdx++
      editIdx++
    } else {
      // Find next match in both sequences
      let origMatch = -1
      let editMatch = -1
      
      // Look ahead in original for current edited part
      for (let i = origIdx + 1; i < originalParts.length; i++) {
        if (originalParts[i] === editedParts[editIdx]) {
          origMatch = i
          break
        }
      }
      
      // Look ahead in edited for current original part
      for (let i = editIdx + 1; i < editedParts.length; i++) {
        if (editedParts[i] === originalParts[origIdx]) {
          editMatch = i
          break
        }
      }
      
      if (origMatch !== -1 && (editMatch === -1 || origMatch - origIdx <= editMatch - editIdx)) {
        // Original part was removed
        segments.push({ 
          text: originalParts.slice(origIdx, origMatch).join(''), 
          type: 'removed' 
        })
        origIdx = origMatch
      } else if (editMatch !== -1) {
        // Edited part was added
        segments.push({ 
          text: editedParts.slice(editIdx, editMatch).join(''), 
          type: 'added' 
        })
        editIdx = editMatch
      } else {
        // No match found - mark as changed
        segments.push({ text: originalParts[origIdx], type: 'removed' })
        segments.push({ text: editedParts[editIdx], type: 'added' })
        origIdx++
        editIdx++
      }
    }
  }
  
  return segments
}

