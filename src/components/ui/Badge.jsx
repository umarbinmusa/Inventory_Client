const TONE_CLASSES = {
  ok: "bg-stock-ok/10 text-stock-ok",
  low: "bg-stock-low/10 text-stock-low",
  out: "bg-stock-out/10 text-stock-out",
  neutral: "bg-canvas text-ink-dim dark:bg-canvas-dark dark:text-ink-dark-dim",
  brand: "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300",
};

const Badge = ({ children, tone = "neutral" }) => (
  <span
    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${TONE_CLASSES[tone] || TONE_CLASSES.neutral}`}
  >
    {children}
  </span>
);

export default Badge;
