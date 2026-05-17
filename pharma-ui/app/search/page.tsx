"use client";

import { useState, useEffect, useCallback } from "react";
import MedicineCard from "../../components/MedicineCard";
import API from "../../lib/api";

interface SearchResult {
  medicine_id: number;
  brand_name: string;
  generic_name: string;
  dosage_form?: string;
  manufacturer?: string;
  stock: number;
  expiry_date: string;
  price: number;
  user_id: number;
}

const LIMIT = 15;

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Fetch Medicines
  const fetchMedicines = useCallback(
    async (reset = false) => {
      setLoading(true);

      try {
        const currentOffset = reset ? 0 : offset;

        const user_id = localStorage.getItem("token");

        const res = await API.get("/search", {
          params: {
            query,
            limit: LIMIT,
            offset: currentOffset,
            user_id,
          },
        });

        const data = Array.isArray(res.data) ? res.data : [];

        if (reset) {
          setResults(data);
          setOffset(LIMIT);
        } else {
          setResults((prev) => [...prev, ...data]);
          setOffset((prev) => prev + LIMIT);
        }

        setHasMore(data.length === LIMIT);
      } catch (err) {
        console.error(err);

        if (reset) {
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    },
    [query, offset]
  );

  // Initial Load
  useEffect(() => {
    fetchMedicines(true);
  }, []);

  // Search Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSearched(true);
    setOffset(0);

    await fetchMedicines(true);
  };

  // Load More
  const loadMore = async () => {
    await fetchMedicines(false);
  };

  return (
    <div
      className="page-container"
      style={{
        minHeight: "calc(100vh - 56px)",
        padding: "24px",
      }}
    >
      {/* Header */}
      <div
        className="fade-in"
        style={{
          textAlign: "center",
          marginBottom: "40px",
        }}
      >
        <p
          className="section-label"
          style={{
            justifyContent: "center",
            display: "flex",
          }}
        >
          Medicine Search
        </p>

        <h1
          style={{
            fontSize: "clamp(2rem, 4vw, 3.5rem)",
            fontWeight: 700,
            color: "var(--clr-on-surface)",
            marginBottom: "8px",
          }}
        >
          Find any medicine
        </h1>

        <p
          style={{
            fontSize: "var(--fs-body-md)",
            color: "var(--clr-on-surface-variant)",
            marginBottom: "28px",
          }}
        >
          Search medicines from other pharmacies
        </p>

        {/* Search Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            maxWidth: "780px",
            margin: "0 auto",
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            placeholder="e.g. Paracetamol, Crocin..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input-field"
            style={{
              flex: 1,
              minWidth: "240px",
              fontSize: "16px",
              padding: "14px 18px",
              borderRadius: "12px",
            }}
          />

          <button
            type="submit"
            className="btn-secondary"
            style={{
              padding: "14px 24px",
              flexShrink: 0,
              borderRadius: "12px",
              cursor: "pointer",
            }}
          >
            Search
          </button>
        </form>
      </div>

      {/* Loading */}
      {loading && results.length === 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "48px 0",
          }}
        >
          <div
            className="spinner"
            style={{
              width: 36,
              height: 36,
            }}
          />
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="fade-in">
          <p
            style={{
              fontSize: "14px",
              color: "var(--clr-on-surface-variant)",
              marginBottom: "20px",
            }}
          >
            {results.length} medicine
            {results.length !== 1 ? "s" : ""}
            {query && (
              <>
                {" "}
                found for <strong>"{query}"</strong>
              </>
            )}
          </p>

          {/* Responsive Grid */}
          {/* Responsive Grid */}
          <div
            style={{
              display: "grid",

              // 1 card mobile
              // 2 cards tablet
              // 3 cards desktop
              gridTemplateColumns:
                "repeat(auto-fit, minmax(280px, 1fr))",

              gap: "20px",
              width: "100%",
            }}
          >
            {results.map((r, i) => (
              <MedicineCard
                key={`${r.medicine_id}-${i}`}
                brand_name={r.brand_name}
                generic_name={r.generic_name}
                dosage_form={r.dosage_form}
                manufacturer={r.manufacturer}
                stock={r.stock}
                expiry_date={r.expiry_date}
                price={r.price}
              />

              
            )
            
            )
            }
          </div>

          {/* Load More */}
          {hasMore && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "36px",
              }}
            >
              <button
                onClick={loadMore}
                className="btn-secondary"
                disabled={loading}
                style={{
                  padding: "14px 28px",
                  borderRadius: "12px",
                  cursor: "pointer",
                }}
              >
                {loading ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Empty */}
      {!loading && searched && results.length === 0 && (
        <div
          className="fade-in"
          style={{
            textAlign: "center",
            padding: "80px 24px",
          }}
        >
          <div
            style={{
              fontSize: "56px",
              marginBottom: "18px",
            }}
          >
            🔍
          </div>

          <div
            style={{
              fontSize: "28px",
              fontWeight: 700,
              marginBottom: "10px",
              color: "var(--clr-on-surface)",
            }}
          >
            No medicines found
          </div>

          <div
            style={{
              fontSize: "16px",
              color: "var(--clr-on-surface-variant)",
            }}
          >
            Try another medicine name
          </div>
        </div>
      )}
    </div>
  );
}