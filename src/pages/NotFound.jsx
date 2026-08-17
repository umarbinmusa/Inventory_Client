import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-canvas px-6 text-center dark:bg-canvas-dark">
    <p className="figure text-sm text-ink-dim dark:text-ink-dark-dim">ERROR 404</p>
    <h1 className="font-display text-2xl font-semibold text-ink dark:text-ink-dark">
      This page isn't in the ledger
    </h1>
    <p className="max-w-sm text-sm text-ink-dim dark:text-ink-dark-dim">
      The page you're looking for doesn't exist or hasn't been built yet.
    </p>
    <Link to="/dashboard" className="btn-primary mt-2">
      Back to dashboard
    </Link>
  </div>
);

export default NotFound;
