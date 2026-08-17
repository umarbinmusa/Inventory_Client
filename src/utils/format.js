export const currency = (n) =>
  `$${Number(n ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const dateShort = (value) => {
  if (!value) return "—";
  const d = new Date(Number.isNaN(Number(value)) ? value : Number(value));
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const dateTimeShort = (value) => {
  if (!value) return "—";
  const d = new Date(Number.isNaN(Number(value)) ? value : Number(value));
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
