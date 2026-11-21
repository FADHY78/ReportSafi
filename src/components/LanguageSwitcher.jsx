import { useLanguage } from '../lib/i18n';
import { cls } from '../lib/utils';

export default function LanguageSwitcher({ className = '' }) {
  const { lang, setLang } = useLanguage();

  return (
    <div
      className={cls('lang-switcher', className)}
      role="group"
      aria-label="Language selection / Chagua lugha"
    >
      <button
        type="button"
        className={cls('lang-btn', lang === 'sw' && 'is-active')}
        onClick={() => setLang('sw')}
        aria-pressed={lang === 'sw'}
        title="Badili lugha kuwa Kiswahili"
      >
        SW
      </button>
      <span className="lang-divider" aria-hidden="true">|</span>
      <button
        type="button"
        className={cls('lang-btn', lang === 'en' && 'is-active')}
        onClick={() => setLang('en')}
        aria-pressed={lang === 'en'}
        title="Switch language to English"
      >
        EN
      </button>
    </div>
  );
}
