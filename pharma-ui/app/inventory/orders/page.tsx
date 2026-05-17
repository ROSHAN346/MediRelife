"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api";

interface Shipment {
  inventory_id: number;
  medicine_id: number;

  brand_name: string;
  generic_name: string;

  stock_qty: number;
  expiry_date: string;
  price: number;
  des_user: string;

  status?: string;
}

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const user_id = localStorage.getItem("token");

        console.log("Fetching shipments for user_id:", user_id);
        setUserId(user_id || "Unknown User");

        const res = await API.post(`/orders/${user_id}`);

        console.log("Shipments response:", res.data);

        setShipments(
          Array.isArray(res.data) ? res.data : []
        );
      } catch (error) {
        console.error(
          "Error fetching shipments:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchShipments();
  }, []);

  // Loading UI
  if (loading) {
    return (
      <div
        style={{
          padding: "40px",
          minHeight: "100vh",
          background: "#f8fafc",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "700",
          }}
        >
          Loading Orders...
        </h1>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "30px",
        minHeight: "100vh",
        background: "#f8fafc",
      }}
    >
      {/* Header */}
      <h1
        style={{
          fontSize: "32px",
          fontWeight: "700",
          marginBottom: "24px",
          color: "#111827",
        }}
      >
        My Orders
      </h1>

      {/* Empty State */}
      {shipments.length === 0 ? (
        <div
          style={{
            background: "white",
            padding: "40px",
            borderRadius: "16px",
            textAlign: "center",
            boxShadow:
              "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <h2
            style={{
              fontSize: "22px",
              marginBottom: "10px",
            }}
          >
            No Orders Yet
          </h2>

          <p style={{ color: "#6b7280" }}>
            Your order requests will appear here.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",

            // Responsive Grid
            gridTemplateColumns:
              "repeat(auto-fit, minmax(320px, 1fr))",

            gap: "20px",
          }}
        >
          {shipments.map((shipment) => (
            <div
              key={`${shipment.inventory_id}-${shipment.medicine_id}`}
              style={{
                background: "white",
                padding: "20px",
                borderRadius: "18px",

                boxShadow:
                  "0 4px 12px rgba(0,0,0,0.08)",

                borderLeft: "6px solid #2563eb",

                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {/* Top */}
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: "20px",
                      fontWeight: "700",
                      color: "#111827",
                      marginBottom: "4px",
                    }}
                  >
                    {shipment.brand_name}
                  </h3>

                  <p
                    style={{
                      color: "#6b7280",
                      fontSize: "14px",
                    }}
                  >
                    {shipment.generic_name}
                  </p>
                </div>

                <span
                  style={{
                    padding: "6px 12px",
                    borderRadius: "999px",

                    background:
                      shipment.status ===
                      "Delivered"
                        ? "#dcfce7"
                        : shipment.status ===
                          "Pending"
                        ? "#fef3c7"
                        : "#dbeafe",

                    color: "#111827",

                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  {shipment.status || "Processing"}
                </span>
              </div>

              {/* Details */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap: "12px",
                  marginTop: "8px",
                }}
              >
                <InfoItem
                  label="Inventory ID"
                  value={String(
                    shipment.inventory_id
                  )}
                />

                <InfoItem
                  label="Medicine ID"
                  value={String(
                    shipment.medicine_id
                  )}
                />

                <InfoItem
                  label="Stock"
                  value={`${shipment.stock_qty} units`}
                />

                <InfoItem
                  label="Price"
                  value={`₹${shipment.price}`}
                />

                <InfoItem
                  label="Expiry"
                  value={shipment.expiry_date}
                />

                <InfoItem
                  label="Destination User"
                  value={shipment.des_user}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: "12px",
          color: "#6b7280",
          fontWeight: "600",
          marginBottom: "4px",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: "15px",
          fontWeight: "600",
          color: "#111827",
        }}
      >
        {value}
      </div>
    </div>
  );
}