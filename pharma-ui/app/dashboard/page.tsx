"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const Dashboard = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login"); // 🚫 redirect if not logged in
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return <h2 style={{ padding: "20px" }}>Loading dashboard...</h2>;
  }

  return (
    <div style={styles.container}>
      <h1>📊 Dashboard</h1>

      <div style={styles.cardContainer}>
        <div style={styles.card}>
          <h3>🔍 Search Medicine</h3>
          <p>Find medicines in inventory</p>
          <button onClick={() => router.push("/search")} style={styles.button}>
            Go
          </button>
        </div>

        <div style={styles.card}>
          <h3>🏥 Inventory</h3>
          <p>Manage your stock & medicines</p>
          <button onClick={() => router.push("/inventory")} style={styles.button}>
            Open
          </button>
        </div>

        <div style={styles.card}>
          <h3>➕ Add Medicine</h3>
          <p>Insert new medicine records</p>
          <button onClick={() => router.push("/scan")} style={styles.button}>
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: "30px",
  },
  cardContainer: {
    display: "flex",
    gap: "20px",
    marginTop: "20px",
    flexWrap: "wrap",
  },
  card: {
    width: "250px",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    background: "white",
  },
  button: {
    marginTop: "10px",
    padding: "8px 12px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};