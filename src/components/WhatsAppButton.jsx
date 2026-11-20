import { IconWhatsApp } from '../ui/Icons';

const NUMBER = '255613328915';
const MESSAGE = 'Hello Report Safi, I need help with title selection.';

/** Floating chat shortcut — opens WhatsApp with the support number prefilled. */
export default function WhatsAppButton() {
  const href = `https://wa.me/${NUMBER}?text=${encodeURIComponent(MESSAGE)}`;
  return (
    <a
      className="whatsapp-fab"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Report Safi on WhatsApp"
      title="Chat with us on WhatsApp"
    >
      <IconWhatsApp size={24} />
    </a>
  );
}
