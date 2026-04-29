"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // check token on load
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    window.location.href = "/signin";
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.left}>
        <h2>Medicine App</h2>
      </div>

      <div style={styles.right}>
        <Link href="/" style={styles.link}>Home</Link>

        <Link href="/search" style={styles.link}>Search</Link>

        {/* 🔐 Only show Inventory if logged in */}
        {isLoggedIn && (
          <Link href="/inventory" style={styles.link}>
            Inventory
          </Link>
        )}

        {/* 🔐 Auth buttons */}
        {!isLoggedIn ? (
          <Link href="/signin" style={styles.link}>
            Login
          </Link>
        ) : (
          <button onClick={handleLogout} style={styles.button}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

const styles: { [key: string]: React.CSSProperties } = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 20px",
    background: "#2563eb",
    color: "white",
  },
  left: {
    fontSize: "18px",
    fontWeight: "bold",
  },
  right: {
    display: "flex",
    gap: "15px",
    alignItems: "center",
  },
  link: {
    color: "white",
    textDecoration: "none",
    fontSize: "16px",
  },
  button: {
    background: "red",
    border: "none",
    padding: "6px 12px",
    color: "white",
    borderRadius: "5px",
    cursor: "pointer",
  },
};