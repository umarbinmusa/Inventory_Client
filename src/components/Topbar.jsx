import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bars3Icon,
  MoonIcon,
  SunIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { ROLE_LABELS } from "../utils/roles.js";
import NotificationsBell from "./NotificationsBell.jsx";

const Topbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchValue.trim()) return;
    navigate(`/products?q=${encodeURIComponent(searchValue.trim())}`);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = user?.fullName
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-surface px-4 dark:border-border-dark dark:bg-surface-dark sm:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-md p-2 text-ink-dim hover:bg-canvas dark:text-ink-dark-dim dark:hover:bg-canvas-dark lg:hidden"
        aria-label="Open menu"
      >
        <Bars3Icon className="h-5 w-5" />
      </button>

      <form onSubmit={handleSearchSubmit} className="relative hidden max-w-sm flex-1 sm:block">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-dim dark:text-ink-dark-dim" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search products, SKUs, barcodes…"
          className="w-full rounded-md border border-border bg-canvas py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-dim dark:border-border-dark dark:bg-canvas-dark dark:text-ink-dark dark:placeholder:text-ink-dark-dim"
        />
      </form>

      <div className="ml-auto flex items-center gap-2">
        <NotificationsBell />

        <button
          onClick={toggleTheme}
          className="rounded-md p-2 text-ink-dim hover:bg-canvas dark:text-ink-dark-dim dark:hover:bg-canvas-dark"
          aria-label="Toggle dark mode"
        >
          {theme === "dark" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-md py-1.5 pl-1.5 pr-2 hover:bg-canvas dark:hover:bg-canvas-dark"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-xs font-semibold text-white">
              {initials || "?"}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium leading-tight text-ink dark:text-ink-dark">
                {user?.fullName}
              </p>
              <p className="text-xs leading-tight text-ink-dim dark:text-ink-dark-dim">
                {ROLE_LABELS[user?.role] || user?.role}
              </p>
            </div>
            <ChevronDownIcon className="h-4 w-4 text-ink-dim dark:text-ink-dark-dim" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-md border border-border bg-surface py-1 shadow-card dark:border-border-dark dark:bg-surface-dark">
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 text-sm text-ink hover:bg-canvas dark:text-ink-dark dark:hover:bg-canvas-dark"
              >
                Your profile
              </Link>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
                className="block w-full px-3 py-2 text-left text-sm text-stock-out hover:bg-canvas dark:hover:bg-canvas-dark"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
