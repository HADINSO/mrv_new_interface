import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { useSidebar } from "../context/SidebarContext";
import { ThemeToggleButton } from "../components/common/ThemeToggleButton";
import { LogoutButton } from "../components/auth/LogoutButton";
import { useAuth } from "../context/AuthContext";

const AppHeader: React.FC = () => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const { isAuthenticated } = useAuth();

  const handleToggle = () => {
    if (window.innerWidth >= 1024) toggleSidebar();
    else toggleMobileSidebar();
  };

  const toggleApplicationMenu = () => setApplicationMenuOpen(!isApplicationMenuOpen);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-[9999] w-full backdrop-blur-md bg-white/90 dark:bg-gray-900/90 border-b border-gray-200 dark:border-gray-800 shadow-md">
      <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
        {/* --- Sección Izquierda: Menú y Logo --- */}
        <div className="flex items-center justify-between w-full gap-2 px-4 py-3 lg:px-0 lg:py-4">
          {/* Botón Menú / Sidebar */}
          <button
            onClick={handleToggle}
            aria-label="Abrir o cerrar menú lateral"
            className="flex items-center justify-center w-10 h-10 text-green-600 border border-green-200 rounded-lg shadow-sm hover:bg-green-50 transition duration-300 ease-in-out dark:text-green-400 dark:border-green-700 dark:hover:bg-green-900/30"
          >
            {isMobileOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.22 7.28a.75.75 0 011.06 0L12 11.94l4.72-4.72a.75.75 0 111.06 1.06L13.06 12l4.72 4.72a.75.75 0 11-1.06 1.06L12 13.06l-4.72 4.72a.75.75 0 11-1.06-1.06L10.94 12 6.22 7.28z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
                <path
                  d="M1 1h16M1 7h10M1 13h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>

          {/* Logo */}
          <Link to="/" className="lg:hidden">
            <img
              className="dark:hidden"
              src="/images/LOGO-2-0.png"
              alt="Logo"
              width={120}
              height={45}
            />
            <img
              className="hidden dark:block"
              src="./images/logo/logo-dark.svg"
              alt="Logo oscuro"
            />
          </Link>

          {/* Botón Menú de Aplicación (3 puntos) */}
          <button
            onClick={toggleApplicationMenu}
            className="flex items-center justify-center w-10 h-10 text-green-600 rounded-lg hover:bg-green-50 transition dark:text-green-400 dark:hover:bg-green-900/30 lg:hidden"
            aria-label="Abrir menú de aplicación"
          >
            <svg width="24" height="24" fill="none">
              <circle cx="6" cy="12" r="1.5" fill="currentColor" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
              <circle cx="18" cy="12" r="1.5" fill="currentColor" />
            </svg>
          </button>

          {/* --- Buscador --- */}
          <div className="hidden lg:block flex-1 ml-6">
            <form>
              <div className="relative">
                <span className="absolute -translate-y-1/2 left-4 top-1/2 text-green-600 dark:text-green-400">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8.5 2a6.5 6.5 0 014.86 10.72l4.6 4.6a1 1 0 11-1.42 1.42l-4.6-4.6A6.5 6.5 0 118.5 2zM4 8.5a4.5 4.5 0 109 0 4.5 4.5 0 00-9 0z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Buscar o ejecutar comando..."
                  className="h-11 w-full rounded-lg border border-green-200 bg-white/60 py-2.5 pl-12 pr-14 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-4 focus:ring-green-400/40 focus:border-green-400 outline-none transition-all dark:border-green-800 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-gray-400"
                />
                <button
                  type="button"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs px-2 py-1 border border-green-300 bg-green-50 text-green-700 rounded-md dark:border-green-800 dark:bg-green-900/30 dark:text-green-300"
                >
                  ⌘ K
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* --- Menú Derecho: Modo, Logout --- */}
        <div
          className={`${isApplicationMenuOpen ? "flex" : "hidden"
            } items-center justify-between w-full gap-4 px-5 py-4 lg:flex lg:justify-end lg:px-0`}
        >
          <div className="flex items-center gap-3">
            <ThemeToggleButton />
            {isAuthenticated && <LogoutButton />}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
