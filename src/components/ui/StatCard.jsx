const StatCard = ({ label, value, icon: Icon, tone = "default", suffix }) => {
  const toneClasses = {
    default: "text-ink dark:text-ink-dark",
    low: "text-stock-low",
    out: "text-stock-out",
    ok: "text-stock-ok",
  };

  return (
    <div className="card flex items-start justify-between p-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-ink-dim dark:text-ink-dark-dim">
          {label}
        </p>
        <p className={`figure mt-1.5 text-2xl font-semibold ${toneClasses[tone]}`}>
          {value}
          {suffix && <span className="ml-1 text-sm font-normal text-ink-dim dark:text-ink-dark-dim">{suffix}</span>}
        </p>
      </div>
      {Icon && (
        <div className="rounded-md bg-canvas p-2 dark:bg-canvas-dark">
          <Icon className="h-5 w-5 text-ink-dim dark:text-ink-dark-dim" />
        </div>
      )}
    </div>
  );
};

export default StatCard;
