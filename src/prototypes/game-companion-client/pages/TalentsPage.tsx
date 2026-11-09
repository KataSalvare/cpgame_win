import { CompanionDirectory } from '../components/CompanionDirectory'
import { companions, talentsPageCompanionMockData } from '../data/mockData'
import { BackToTopButton } from '../components/BackToTopButton'

type Props = {
  pageState: 'normal' | 'loading' | 'empty' | 'error'
  onRetry: () => void
  onOpenCompanion: (companionId: string) => void
  onChatWithCompanion: (companionId: string) => void
}

export function TalentsPage({ pageState, onRetry, onOpenCompanion, onChatWithCompanion }: Props) {
  return <div className="client-content talents-page">
    <h1 className="client-visually-hidden">大神</h1>
    <CompanionDirectory
      pageState={pageState}
      showTalentCategoryFilter
      companionSource={[...companions, ...talentsPageCompanionMockData]}
      onRetry={onRetry}
      onOpenCompanion={onOpenCompanion}
      onChatWithCompanion={onChatWithCompanion}
    />
    <BackToTopButton />
  </div>
}
