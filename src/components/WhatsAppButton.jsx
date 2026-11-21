import { IconWhatsApp } from '../ui/Icons';

const NUMBER = '255613328915';
const MESSAGE = 'Habari Report Safi, ninahitaji msaada kuhusu uteuzi wa mada ya utafiti / ripoti.';

/** Floating chat shortcut — opens WhatsApp with the support number prefilled. */
export default function WhatsAppButton() {
  const href = `https://wa.me/${NUMBER}?text=${encodeURIComponent(MESSAGE)}`;
  return (
    <a
      className="whatsapp-fab"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Wasiliana na Report Safi kupitia WhatsApp"
      title="Wasiliana nasi WhatsApp kwa msaada wa haraka"
    >
      <IconWhatsApp size={24} />
    </a>
  );
}
