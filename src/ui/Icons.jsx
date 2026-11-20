/**
 * Hand-drawn icon set (1.6px stroke, currentColor).
 * Keeping these inline avoids an icon-font dependency and lets every icon
 * inherit text colour from its container.
 */
function Svg({ size = 20, children, className, strokeWidth = 1.6, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconSearch = (p) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.6-3.6" />
  </Svg>
);

export const IconCheck = (p) => (
  <Svg {...p}>
    <path d="M20 6L9 17l-5-5" />
  </Svg>
);

export const IconCheckCircle = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 12.2l2.4 2.4 4.6-5" />
  </Svg>
);

export const IconX = (p) => (
  <Svg {...p}>
    <path d="M18 6L6 18M6 6l12 12" />
  </Svg>
);

export const IconArrowRight = (p) => (
  <Svg {...p}>
    <path d="M4 12h15" />
    <path d="M13 6l6 6-6 6" />
  </Svg>
);

export const IconArrowLeft = (p) => (
  <Svg {...p}>
    <path d="M20 12H5" />
    <path d="M11 6l-6 6 6 6" />
  </Svg>
);

export const IconChevronLeft = (p) => (
  <Svg {...p}>
    <path d="M15 5l-7 7 7 7" />
  </Svg>
);

export const IconChevronRight = (p) => (
  <Svg {...p}>
    <path d="M9 5l7 7-7 7" />
  </Svg>
);

export const IconChevronDown = (p) => (
  <Svg {...p}>
    <path d="M5 9l7 7 7-7" />
  </Svg>
);

export const IconFileText = (p) => (
  <Svg {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5" />
    <path d="M9 13h6M9 17h4" />
  </Svg>
);

export const IconFolder = (p) => (
  <Svg {...p}>
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </Svg>
);

export const IconLayers = (p) => (
  <Svg {...p}>
    <path d="M12 3l9 5-9 5-9-5z" />
    <path d="M3 13l9 5 9-5" />
  </Svg>
);

export const IconUsers = (p) => (
  <Svg {...p}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3 20c0-3.3 2.7-5.4 6-5.4s6 2.1 6 5.4" />
    <path d="M16 5.5a3.2 3.2 0 0 1 0 6" />
    <path d="M18 14.9c2 .8 3.4 2.6 3.4 5.1" />
  </Svg>
);

export const IconClipboard = (p) => (
  <Svg {...p}>
    <path d="M9 4h6v3H9z" />
    <path d="M15 5.5h2.5A1.5 1.5 0 0 1 19 7v12.5A1.5 1.5 0 0 1 17.5 21h-11A1.5 1.5 0 0 1 5 19.5V7a1.5 1.5 0 0 1 1.5-1.5H9" />
    <path d="M8.5 11h7M8.5 15h5" />
  </Svg>
);

export const IconHistory = (p) => (
  <Svg {...p}>
    <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1" />
    <path d="M3.5 4.5V9H8" />
    <path d="M12 8v4.4l3 1.8" />
  </Svg>
);

export const IconGauge = (p) => (
  <Svg {...p}>
    <path d="M4 18a8 8 0 1 1 16 0" />
    <path d="M12 18l4.2-5.4" />
    <circle cx="12" cy="18" r="1.4" />
  </Svg>
);

export const IconUpload = (p) => (
  <Svg {...p}>
    <path d="M12 16V4" />
    <path d="M7.5 8.5L12 4l4.5 4.5" />
    <path d="M4 16v2.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V16" />
  </Svg>
);

export const IconDownload = (p) => (
  <Svg {...p}>
    <path d="M12 4v12" />
    <path d="M7.5 11.5L12 16l4.5-4.5" />
    <path d="M4 16v2.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V16" />
  </Svg>
);

export const IconPlus = (p) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const IconPencil = (p) => (
  <Svg {...p}>
    <path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17z" />
    <path d="M14.5 6.5l3 3" />
  </Svg>
);

export const IconPower = (p) => (
  <Svg {...p}>
    <path d="M12 4v8" />
    <path d="M7.5 6.6a7 7 0 1 0 9 0" />
  </Svg>
);

export const IconLock = (p) => (
  <Svg {...p}>
    <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
    <path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" />
    <path d="M12 14.5v2.5" />
  </Svg>
);

export const IconShield = (p) => (
  <Svg {...p}>
    <path d="M12 3l7 2.8v5.4c0 4.4-3 7.6-7 9.8-4-2.2-7-5.4-7-9.8V5.8z" />
    <path d="M9 12.2l2.2 2.2 4-4.4" />
  </Svg>
);

export const IconPhone = (p) => (
  <Svg {...p}>
    <path d="M6.4 3.5h3l1.4 4-2 1.4a12 12 0 0 0 6.3 6.3l1.4-2 4 1.4v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.4 5.7a2 2 0 0 1 2-2.2z" />
  </Svg>
);

export const IconMail = (p) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3.6 6.4L12 12.6l8.4-6.2" />
  </Svg>
);

export const IconPin = (p) => (
  <Svg {...p}>
    <path d="M12 21s7-5.7 7-11a7 7 0 1 0-14 0c0 5.3 7 11 7 11z" />
    <circle cx="12" cy="10" r="2.6" />
  </Svg>
);

export const IconClock = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.2V12l3.2 2" />
  </Svg>
);

export const IconAlert = (p) => (
  <Svg {...p}>
    <path d="M12 4.5l8.5 15h-17z" />
    <path d="M12 10v4" />
    <path d="M12 17.2v.1" />
  </Svg>
);

export const IconInfo = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11v5.2" />
    <path d="M12 7.9v.1" />
  </Svg>
);

export const IconHash = (p) => (
  <Svg {...p}>
    <path d="M9.5 4L7.5 20M16.5 4l-2 16M4.5 9h15M3.5 15h15" />
  </Svg>
);

export const IconBook = (p) => (
  <Svg {...p}>
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v14H6.5A2.5 2.5 0 0 0 4 19.5z" />
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H19v4H6.5A2.5 2.5 0 0 1 4 19.5z" />
  </Svg>
);

export const IconBuilding = (p) => (
  <Svg {...p}>
    <path d="M4 21V6l7-3v18" />
    <path d="M11 10h8a1 1 0 0 1 1 1v10" />
    <path d="M3 21h18" />
    <path d="M7 9v.1M7 13v.1M7 17v.1M15 14v.1M15 18v.1" />
  </Svg>
);

export const IconGraduation = (p) => (
  <Svg {...p}>
    <path d="M2.5 8.5L12 4.5l9.5 4-9.5 4z" />
    <path d="M6.5 10.7v4.6c0 1.4 2.5 2.7 5.5 2.7s5.5-1.3 5.5-2.7v-4.6" />
    <path d="M21.5 8.8v5.4" />
  </Svg>
);

export const IconCopy = (p) => (
  <Svg {...p}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15H4.5A1.5 1.5 0 0 1 3 13.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V5" />
  </Svg>
);

export const IconPrinter = (p) => (
  <Svg {...p}>
    <path d="M7 9V4h10v5" />
    <rect x="4" y="9" width="16" height="7" rx="1.6" />
    <path d="M7 14h10v6H7z" />
  </Svg>
);

export const IconMenu = (p) => (
  <Svg {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Svg>
);

export const IconFilter = (p) => (
  <Svg {...p}>
    <path d="M4 6h16l-6 7v5.5l-4 1.8V13z" />
  </Svg>
);

export const IconRefresh = (p) => (
  <Svg {...p}>
    <path d="M20 12a8 8 0 1 1-2.4-5.7" />
    <path d="M20.5 4v4.5H16" />
  </Svg>
);

export const IconEye = (p) => (
  <Svg {...p}>
    <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12z" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
);

export const IconUndo = (p) => (
  <Svg {...p}>
    <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H9" />
    <path d="M7.5 5L3.5 9l4 4" />
  </Svg>
);

export const IconQuote = (p) => (
  <Svg {...p}>
    <path d="M9.5 6.5C7 8 5.5 10.4 5.5 13.4v4.1h5.2v-5.2H8.4c0-1.9.7-3.3 2.3-4.3z" />
    <path d="M18.5 6.5C16 8 14.5 10.4 14.5 13.4v4.1h5.2v-5.2h-2.3c0-1.9.7-3.3 2.3-4.3z" />
  </Svg>
);

export const IconShoppingBag = (p) => (
  <Svg {...p}>
    <path d="M6 7h12l1 13H5L6 7z" />
    <path d="M9 7V6a3 3 0 0 1 6 0v1" />
  </Svg>
);

export const IconSliders = (p) => (
  <Svg {...p}>
    <path d="M4 6h16M4 12h16M4 18h16" />
    <circle cx="9" cy="6" r="2" fill="currentColor" />
    <circle cx="15" cy="12" r="2" fill="currentColor" />
    <circle cx="11" cy="18" r="2" fill="currentColor" />
  </Svg>
);

export const IconUserCheck = (p) => (
  <Svg {...p}>
    <circle cx="9" cy="8" r="3.4" />
    <path d="M3 20c0-3.3 2.7-5.4 6-5.4s6 2.1 6 5.4" />
    <path d="M16 11.5l2 2 3.8-4" />
  </Svg>
);

/** WhatsApp chat bubble — used by the floating contact button. */
export const IconWhatsApp = (p) => (
  <Svg {...p}>
    <path
      d="M20.5 3.6A11.7 11.7 0 0 0 12.1.5C6 .5 1 5.5 1 11.6c0 2 .5 3.8 1.5 5.5L.6 23.4l6.4-1.9a11.5 11.5 0 0 0 5.1 1.3c6.1 0 11.1-5 11.1-11.1 0-3-1.2-5.8-3.1-7.9z"
      fill="currentColor"
      stroke="none"
    />
    <path
      d="M17.4 14.7c-.3.8-1.6 1.5-2.2 1.6-.6.1-1.2.1-2-.1-.5-.1-1.1-.3-1.8-.7-3.2-1.4-5.3-4.6-5.4-4.8-.2-.3-1.3-1.8-1.3-3.3 0-1.6.8-2.4 1.1-2.7.3-.3.6-.4.8-.4h.6c.2 0 .5 0 .7.5l.9 2.2c.1.3.1.6.1.8l-.4.7c-.2.3-.4.5-.2.8.2.3.7 1.2 1.6 1.9 1.1 1 1.9 1.3 2.2 1.5.3.1.5.1.7-.2l.9-1c.2-.3.4-.2.7-.1l2.1 1c.3.2.5.3.6.4.1.2.1.6-.2 1.3z"
      fill="var(--fab-icon, #25d366)"
      stroke="none"
    />
  </Svg>
);

/** Report Safi monogram — a ledger page with a check, used as the site mark. */
export function BrandMark({ size = 38 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <rect x="1.5" y="1.5" width="45" height="45" rx="9" fill="#07131c" />
      <rect x="1.5" y="1.5" width="45" height="45" rx="9" fill="none" stroke="#e6a83b" strokeWidth="1.5" />
      <path d="M13 12.5h14.5L34 19v16.5a1.5 1.5 0 0 1-1.5 1.5h-19A1.5 1.5 0 0 1 12 35.5v-21A1.5 1.5 0 0 1 13.5 13z" fill="none" stroke="#F4F1EA" strokeWidth="2" strokeLinejoin="round" />
      <path d="M27.5 12.5V19H34" fill="none" stroke="#F4F1EA" strokeWidth="2" strokeLinejoin="round" />
      <path d="M16.5 26.5l3.4 3.4 6.6-7" fill="none" stroke="#e6a83b" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16.5 33.5h8" stroke="#F4F1EA" strokeWidth="1.8" strokeLinecap="round" opacity=".7" />
    </svg>
  );
}
