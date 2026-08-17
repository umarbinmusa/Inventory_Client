import { Outlet } from "react-router-dom";

const TICKER_ROWS = [
  "SKU-10482  QTY  128   $  24.00",
  "SKU-20911  QTY   64   $ 108.50",
  "SKU-33520  QTY  512   $   3.25",
  "SKU-41007  QTY   12   $ 340.00",
  "SKU-58890  QTY  256   $  18.75",
  "SKU-60214  QTY   38   $  92.10",
];

const AuthLayout = () => {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-brand-600 lg:flex lg:flex-col lg:justify-between lg:p-10">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white/15 font-display text-base font-bold text-white">
            L
          </div>
          <span className="font-display text-lg font-semibold text-white">Ledger</span>
        </div>

        <div>
          <h1 className="max-w-sm font-display text-3xl font-semibold leading-tight text-white">
            Every item, every count, kept straight.
          </h1>
          <p className="mt-3 max-w-sm text-sm text-brand-100">
            Stock, purchases, and sales tracked in one running ledger — down to the last unit.
          </p>
        </div>

        <div
          className="figure select-none space-y-1.5 text-xs text-brand-100/70"
          aria-hidden="true"
        >
          {TICKER_ROWS.map((row) => (
            <div key={row}>{row}</div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-500 font-display text-sm font-bold text-white">
              L
            </div>
            <span className="font-display text-base font-semibold text-ink dark:text-ink-dark">
              Ledger
            </span>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
