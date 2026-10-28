import { CompanionDirectory } from '../components/CompanionDirectory'

type Props = {
  pageState: 'normal' | 'loading' | 'empty' | 'error'
  onRetry: () => void
  onOpenCompanion: (companionId: string) => void
  onChatWithCompanion: (companionId: string) => void
  onOrderWithCompanion: (companionId: string) => void
}

export function TalentsPage({ pageState, onRetry, onOpenCompanion, onChatWithCompanion, onOrderWithCompanion }: Props) {
  return <div className="client-content talents-page">
    <h1 className="client-visually-hidden">大神</h1>
    <CompanionDirectory
      pageState={pageState}
      onRetry={onRetry}
      onOpenCompanion={onOpenCompanion}
      onChatWithCompanion={onChatWithCompanion}
      onOrderWithCompanion={onOrderWithCompanion}
    />
  </div>
}
