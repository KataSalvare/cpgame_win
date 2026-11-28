import insufficient from '../assets/dialog-icons/insufficient.webp'
import payment from '../assets/dialog-icons/payment.webp'
import purchase from '../assets/dialog-icons/purchase.webp'
import withdrawal from '../assets/dialog-icons/withdrawal.webp'
import exchange from '../assets/dialog-icons/exchange.webp'
import premium from '../assets/dialog-icons/premium.webp'

const illustrations = { insufficient, payment, purchase, withdrawal, exchange, premium }

export function DialogIllustration({ kind }: { kind: keyof typeof illustrations }) {
  return <img className="dialog-illustration" src={illustrations[kind]} alt="" aria-hidden="true" />
}
