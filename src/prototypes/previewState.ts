import { useState } from 'react'

export interface PrototypePreviewProps<TState extends string = string> {
  previewState?: TState
  onPreviewStateChange?: (state: TState) => void
  entryView?: string
}

export function usePrototypeState<TState extends string>(
  initialState: TState,
  { previewState, onPreviewStateChange }: PrototypePreviewProps<TState>
) {
  const [localState, setLocalState] = useState(initialState)
  const isControlled = previewState !== undefined
  const state = previewState ?? localState

  const setState = (nextState: TState) => {
    if (!isControlled) setLocalState(nextState)
    onPreviewStateChange?.(nextState)
  }

  return [state, setState] as const
}
