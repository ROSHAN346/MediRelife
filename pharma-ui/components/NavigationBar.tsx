"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const Navbar = () => {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [pharmacyName, setPharmacyName] = useState("");

  // check token on load
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedPharmacyName = localStorage.getItem("pharmacy_name");

    setIsLoggedIn(!!token);
    setPharmacyName(storedPharmacyName || "");
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    window.location.href = "/signin";
  };

  const linkClass = (href: string) =>
    `text-sm font-medium transition-colors ${
      pathname === href ? "text-white" : "text-blue-100 hover:text-white"
    }`;

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-200 bg-blue-600">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3 text-white">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            MediRelife
          </Link>
          {pharmacyName && (
            <span className="hidden text-xs font-medium text-blue-100 sm:inline">
              {pharmacyName}
            </span>
          )}
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md border border-blue-500 px-2 py-1 text-white transition hover:bg-blue-700 md:hidden"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-label="Toggle navigation"
          aria-expanded={isMenuOpen}
        >
          <span className="text-lg">☰</span>
        </button>

        <div className="hidden items-center gap-5 md:flex">
          <Link href="/" className={linkClass("/")}>Home</Link>
          <Link href="/search" className={linkClass("/search")}>Search</Link>

          {/* 🔐 Only show Inventory if logged in */}
          {isLoggedIn && (
            <Link href="/dashboard" className={linkClass("/dashboard")}>
              DashBoard
            </Link>
          )}
          {isLoggedIn && (
            <Link href="/inventory" className={linkClass("/inventory")}>
              Inventory
            </Link>
          )}

          {/* 🔐 Auth buttons */}
          {!isLoggedIn ? (
            <Link href="/signin" className={linkClass("/signin")}>
              Login
            </Link>
          ) : (
            <button
              onClick={handleLogout}
              className="rounded-md bg-red-500 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-red-600"
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {isMenuOpen && (
        <div className="border-t border-blue-500 bg-blue-600 px-4 py-3 md:hidden">
          <div className="flex flex-col gap-3 text-sm">
            <Link href="/" className={linkClass("/")}>Home</Link>
            <Link href="/search" className={linkClass("/search")}>Search</Link>

            {isLoggedIn && (
              <Link href="/dashboard" className={linkClass("/dashboard")}>
                DashBoard
              </Link>
            )}
            {isLoggedIn && (
              <Link href="/inventory" className={linkClass("/inventory")}>
                Inventory
              </Link>
            )}

            {!isLoggedIn ? (
              <Link href="/signin" className={linkClass("/signin")}>
                Login
              </Link>
            ) : (
              <button
                onClick={handleLogout}
                className="w-full rounded-md bg-red-500 px-3 py-2 text-left font-semibold text-white transition hover:bg-red-600"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;