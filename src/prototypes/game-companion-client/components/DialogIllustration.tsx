import insufficient from '../assets/dialog-icons/insufficient.webp'
import payment from '../assets/dialog-icons/payment.webp'
import purchase from '../assets/dialog-icons/purchase.webp'
import withdrawal from '../assets/dialog-icons/withdrawal.webp'
import exchange from '../assets/dialog-icons/exchange.webp'
import premium from '../assets/dialog-icons/premium.webp'
import cancelOrder from '../assets/dialog-icons/cancel-order.webp'
import cancelMatch from '../assets/dialog-icons/cancel-match.webp'
import startService from '../assets/dialog-icons/start-service.webp'
import resumeService from '../assets/dialog-icons/resume-service.webp'
import finishService from '../assets/dialog-icons/finish-service.webp'
import confirmComplete from '../assets/dialog-icons/confirm-complete.webp'
import acceptOrder from '../assets/dialog-icons/accept-order.webp'
import rejectOrder from '../assets/dialog-icons/reject-order.webp'

const illustrations = { insufficient, payment, purchase, withdrawal, exchange, premium, cancelOrder, cancelMatch, startService, resumeService, finishService, confirmComplete, acceptOrder, rejectOrder }
export type DialogIllustrationKind = keyof typeof illustrations

export function DialogIllustration({ kind }: { kind: DialogIllustrationKind }) {
  return <img className="dialog-illustration" src={illustrations[kind]} alt="" aria-hidden="true" />
}
