"use client";
import API from "@/lib/api";
import { useState, useMemo, useEffect } from "react";

/* ── Types ── */
interface Batch {
  id: string;  brand: string; generic: string; batchNo: string;
  vendorScore: number; vendorName: string; expiry: string;
  daysLeft: number; qty: number; unit: string; mrp: number;
  askPrice: number; distance: number;
}
interface CartItem {
  batchId: string; brand: string; batchNo: string;
  askPrice: number; mrp: number; unit: string; orderQty: number;
}

/* ── Static data ── */

/* ── Helpers ── */
const pct = (mrp: number, ask: number) => Math.round(((mrp - ask) / mrp) * 100);
const fmt = (n: number) => "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const sclr = (s: number) => s >= 0.9 ? "var(--clr-stable)" : s >= 0.8 ? "var(--clr-approaching)" : "var(--clr-urgent)";

function expiryBadge(d: number) {
  if (d < 30) return { label: `Urgent · ${d}d`, bg: "var(--clr-urgent-bg)", color: "var(--clr-urgent)", border: "var(--clr-urgent)" };
  if (d < 60) return { label: `Due · ${d}d`, bg: "var(--clr-approaching-bg)", color: "var(--clr-approaching)", border: "var(--clr-approaching)" };
  return { label: `${d}d left`, bg: "var(--clr-stable-bg)", color: "var(--clr-stable)", border: "var(--clr-stable)" };
}

/* ── Column grid ── */
const COLS = "2.8fr 2fr 1.6fr 0.8fr 2fr 1.4fr";

/* ── Sub-components ── */
function Th({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: "var(--fs-label-sm)", fontWeight: 600, color: "var(--clr-on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.05em", padding: "8px 12px" }}>
      {children}
    </div>
  );
}

function Pill({ label, bg, color, border }: { label: string; bg: string; color: string; border: string }) {
  return (
    <span style={{ fontSize: "var(--fs-label-sm)", fontWeight: 600, background: bg, color, border: `1px solid ${border}`, borderRadius: "var(--r-full)", padding: "2px 8px", display: "inline-block", whiteSpace: "nowrap", lineHeight: 1.6 }}>
      {label}
    </span>
  );
}

/* ── Main Page ── */
export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [BATCHES, setBATCHES] = useState<Batch[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [radius, setRadius] = useState(5);
  const [expWin, setExpWin] = useState<30 | 60 | 90 | null>(null);
  const [rowQty, setRowQty] = useState<Record<string, string>>({});
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [done, setDone] = useState(false);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const user_id = localStorage.getItem("token");

        console.log("Fetching medicines for user_id:", user_id);
        const res = await API.get("/search", {
          params: {
            query: "",
            user_id
          }
        });

        const temp = await API.get("/user/details", {
          params: {
            user_id
          }
        });

        console.log("User Details:", temp.data);

        setUser(temp.data);

        setBATCHES(res.data || []);
      } catch (error) {
        console.error("Search API error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
  }, []);

  
  const batches = useMemo(() =>
    BATCHES.filter(b => {
      const q = search.toLowerCase();
      if (q && !b.brand.toLowerCase().includes(q) && !b.generic.toLowerCase().includes(q)) return false;
      if (b.distance > radius) return false;
      if (expWin !== null && b.daysLeft > expWin) return false;
      return true;
    }),
    [search, radius, expWin]
  );

  if (loading) {
    return <div style={{ padding: 40 }}>Loading medicines...</div>;
  }

  const gq = (id: string) => Math.max(1, Number(rowQty[id] ?? "1"));
  const add = (b: Batch) => setCart(p => ({ ...p, [b.id]: { batchId: b.id, brand: b.brand, batchNo: b.batchNo, askPrice: b.askPrice, mrp: b.mrp, unit: b.unit, orderQty: gq(b.id) } }));
  const upd = (id: string, v: number) => {
    if (v < 1) { const n = { ...cart }; delete n[id]; setCart(n); }
    else setCart(p => ({ ...p, [id]: { ...p[id], orderQty: v } }));
  };

  const items = Object.values(cart);
  const totAsk = items.reduce((s, i) => s + i.askPrice * i.orderQty, 0);
  const totMrp = items.reduce((s, i) => s + i.mrp * i.orderQty, 0);
  const saved = totMrp - totAsk;
  const savePct = totMrp > 0 ? Math.round((saved / totMrp) * 100) : 0;

  const base: React.CSSProperties = { fontFamily: "var(--font-geist-sans, Inter, system-ui, sans-serif)" };

  return (
    <div style={{ ...base, minHeight: "calc(100vh - 64px)", background: "var(--clr-bg)", padding: "32px 24px", boxSizing: "border-box" }}>
      <style>{`
        .btn-fx { transition: all 0.15s ease; cursor: pointer; }
        .btn-fx:hover { filter: brightness(1.1) drop-shadow(0 2px 4px rgba(0,0,0,0.1)); transform: translateY(-1px); }
        .btn-fx:active { filter: brightness(0.95); transform: translateY(1px); box-shadow: none; }
        .row-fx:hover { background-color: var(--clr-surface-container-low) !important; }
      `}</style>
      <main style={{ maxWidth: 1440, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 24, alignItems: "start" }}>

        {/* ══ LEFT 8 COLS – Catalog ══ */}
        <section style={{ gridColumn: "span 8", display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Page header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: "var(--clr-on-surface)", letterSpacing: "-0.02em", lineHeight: "32px" }}>MedBridge Marketplace</h1>
              <p style={{ margin: 0, fontSize: 13, color: "var(--clr-outline)", display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                Licensed B2B near-expiry exchange
                <span style={{ width: 4, height: 4, background: "var(--clr-outline)", borderRadius: "50%" }}></span>
                Secure Escrow Protected
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ padding: "4px 8px", background: "var(--clr-stable-bg)", color: "var(--clr-stable)", fontSize: 11, fontWeight: 600, borderRadius: 9999, display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 6, height: 6, background: "var(--clr-stable)", borderRadius: "50%" }}></span> Live
              </span>
              <span style={{ padding: "4px 12px", background: "var(--clr-surface-container)", color: "var(--clr-primary)", fontSize: 11, fontWeight: 600, borderRadius: 9999 }}>
                {batches.length} Batches Found
              </span>
            </div>
          </div>

          {/* Filters */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, background: "var(--clr-surface)", padding: 12, border: "1px solid var(--clr-outline-variant)", borderRadius: 12, boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", border: "1px solid var(--clr-outline-variant)", borderRadius: 8, background: "#fff", flex: 1, maxWidth: 320 }}>
              <span style={{ color: "var(--clr-outline)", fontSize: 16 }}>🔍</span>
              <input
                placeholder="Search by brand name or salt..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ flex: 1, border: "none", outline: "none", fontSize: 13, background: "transparent", color: "var(--clr-on-surface)" }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", border: "1px solid var(--clr-outline-variant)", borderRadius: 8, background: "#fff" }}>
              <span style={{ color: "var(--clr-urgent)", fontSize: 16 }}>📍</span>
              <select value={radius} onChange={e => setRadius(Number(e.target.value))}
                style={{ border: "none", outline: "none", fontSize: 13, background: "transparent", color: "var(--clr-on-surface)" }}>
                {[2, 5, 10, 25, 50].map(r => <option key={r} value={r}>{r} km</option>)}
              </select>
            </div>

            <div style={{ width: 1, height: 24, background: "var(--clr-outline-variant)" }}></div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: "var(--clr-on-surface-variant)" }}>Expiry:</span>
              <div style={{ display: "flex", gap: 8 }}>
                {([30, 60, 90] as const).map(w => (
                  <button key={w} onClick={() => setExpWin(expWin === w ? null : w)} className="btn-fx"
                    style={{
                      fontSize: 13, padding: "4px 12px", borderRadius: 9999, border: "1px solid var(--clr-outline-variant)",
                      background: expWin === w ? "var(--clr-primary)" : "transparent",
                      color: expWin === w ? "var(--clr-on-primary)" : "var(--clr-on-surface)"
                    }}>
                    &lt;{w}d
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ══ LEFT 8 COLS – Catalog Table ══ */}
          <div style={{ display: "flex", flexDirection: "column", background: "var(--clr-surface-container-lowest)", borderRadius: 12, border: "1px solid var(--clr-outline-variant)", overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>

            {/* Table head */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", background: "var(--clr-surface-container)", borderBottom: "1px solid var(--clr-outline-variant)", padding: "12px 16px" }}>
              <div style={{ gridColumn: "span 4", fontSize: 11, fontWeight: 600, color: "var(--clr-on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Item Details</div>
              <div style={{ gridColumn: "span 3", fontSize: 11, fontWeight: 600, color: "var(--clr-on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Batch & Vendor</div>
              <div style={{ gridColumn: "span 2", fontSize: 11, fontWeight: 600, color: "var(--clr-on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Expiry</div>
              <div style={{ gridColumn: "span 1", fontSize: 11, fontWeight: 600, color: "var(--clr-on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Qty</div>
              <div style={{ gridColumn: "span 2", fontSize: 11, fontWeight: 600, color: "var(--clr-on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>Pricing & Action</div>
            </div>

            {/* Table rows */}
            <div style={{ display: "flex", flexDirection: "column", maxHeight: "calc(100vh - 220px)", overflowY: "auto", background: "var(--clr-surface-container-lowest)" }}>
              {batches.length === 0
                ? <div style={{ padding: 40, textAlign: "center", color: "var(--clr-outline)", fontSize: 13 }}>No batches match your filters.</div>
                : batches.map((b, i) => {
                  const bg = expiryBadge(b.daysLeft);
                  const disc = pct(b.mrp, b.askPrice);
                  const inCart = !!cart[b.id];
                  return (
                    <div key={b.id} className="row-fx" style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", borderBottom: "1px solid var(--clr-outline-variant)", background: inCart ? "var(--clr-surface-container-low)" : "transparent", transition: "background 0.15s", padding: "12px 16px" }}>

                      {/* 1 Item */}
                      <div style={{ gridColumn: "span 4", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--clr-on-surface)", lineHeight: 1.25 }}>{b.brand}</div>
                        <div style={{ fontSize: 13, color: "var(--clr-outline)", fontStyle: "italic", marginTop: 2 }}>{b.generic}</div>
                      </div>

                      {/* 2 Batch & Vendor */}
                      <div style={{ gridColumn: "span 3", display: "flex", flexDirection: "column", justifyContent: "center", gap: 2 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--clr-on-surface)", fontFamily: "monospace" }}>{b.batchNo}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span style={{ fontSize: 13, color: "var(--clr-primary)", fontWeight: 700 }}>{b.vendorScore.toFixed(2)}</span>
                          <span style={{ fontSize: 13, color: "var(--clr-on-surface-variant)" }}>{b.vendorName}</span>
                        </div>
                      </div>

                      {/* 3 Expiry */}
                      <div style={{ gridColumn: "span 2", display: "flex", alignItems: "center" }}>
                        <Pill {...bg} />
                      </div>

                      {/* 4 Qty */}
                      <div style={{ gridColumn: "span 1", display: "flex", alignItems: "center" }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--clr-on-surface)", fontFamily: "monospace" }}>
                          {b.qty} <span style={{ fontSize: 10, color: "var(--clr-outline)", fontWeight: 400, textTransform: "uppercase", marginLeft: 4 }}>{b.unit}s</span>
                        </span>
                      </div>

                      {/* 5 Pricing & Action */}
                      <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 12, color: "var(--clr-outline)", textDecoration: "line-through" }}>{fmt(b.mrp)}</span>
                          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--clr-on-surface)" }}>{fmt(b.askPrice)}</span>
                        </div>
                        <span style={{ fontSize: 11, color: "var(--clr-primary)", fontWeight: 700, marginTop: 2 }}>{disc}% OFF MRP</span>

                        <button onClick={() => add(b)} className="btn-fx"
                          style={{
                            marginTop: 8, fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 4, border: "none",
                            display: "flex", alignItems: "center", gap: 4,
                            background: inCart ? "var(--clr-stable)" : "var(--clr-on-surface)",
                            color: "#fff", whiteSpace: "nowrap", fontFamily: "var(--font-geist-sans)"
                          }}>
                          {inCart ? "✓ Added" : "+ Add to Cart"}
                        </button>
                      </div>

                    </div>
                  );
                })}
            </div>
          </div>

        </section>

        {/* ══ RIGHT 35% – Order Builder ══ */}
        {/* ══ RIGHT 4 COLS – Order Builder ══ */}
        <aside style={{ gridColumn: "span 4", display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Buyer compliance card */}
          <div style={{ background: "var(--clr-surface-container-lowest)", border: "1px solid var(--clr-outline-variant)", borderRadius: 12, padding: 20, boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--clr-outline)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Buyer Account</div>
              <span style={{ display: "flex", alignItems: "center", gap: 4, padding: "2px 8px", background: "var(--clr-stable-bg)", color: "var(--clr-stable)", fontSize: 10, fontWeight: 700, borderRadius: 9999, border: "1px solid var(--clr-stable)" }}>
                <span style={{ fontSize: 12 }}>✓</span> VERIFIED
              </span>
            </div>
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "var(--clr-on-surface)" }}>{user?.name}</h3>
              <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "var(--clr-on-surface-variant)" }}>Drug Lic: GJ-DL-20/21-2024-0041892  {user?.email}</p>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["Form 20 ✓", "Form 21 ✓", "GST Active"].map(t => (
                <span key={t} style={{ padding: "4px 8px", background: "var(--clr-surface-container)", color: "var(--clr-on-surface-variant)", fontSize: 11, borderRadius: 4, border: "1px solid rgba(0,0,0,0.05)" }}>{t}</span>
              ))}
            </div>
          </div>

          {/* Order Draft */}
          <div style={{ background: "var(--clr-surface-container-lowest)", border: "1px solid var(--clr-outline-variant)", borderRadius: 12, boxShadow: "0 1px 2px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", maxHeight: "calc(100vh - 180px)" }}>
            {/* Header */}
            <div style={{ padding: 20, borderBottom: "1px solid var(--clr-outline-variant)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--clr-on-surface)" }}>Order Draft</span>
                <span style={{ width: 20, height: 20, background: "var(--clr-on-surface)", color: "#fff", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%" }}>{items.length}</span>
              </div>
              {items.length > 0 && (
                <button onClick={() => setCart({})} className="btn-fx" style={{ fontSize: 11, color: "var(--clr-error)", fontWeight: 700, textTransform: "uppercase", background: "none", border: "none" }}>Clear All</button>
              )}
            </div>

            {/* Items */}
            <div style={{ padding: 20, overflowY: "auto", display: "flex", flexDirection: "column", gap: 20, flex: 2, minHeight: 320 }}>
              {items.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🛒</div>
                  <div style={{ fontSize: 13, color: "var(--clr-outline)" }}>No items added yet.</div>
                  <div style={{ fontSize: 12, color: "var(--clr-outline-variant)", marginTop: 4 }}>Click &quot;+ Add to Cart&quot; on any row to begin.</div>
                </div>
              ) : items.map(item => (
                <div key={item.batchId} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--clr-on-surface)" }}>{item.brand}</p>
                    <p style={{ margin: "2px 0 0 0", fontSize: 13, color: "var(--clr-outline)" }}>{item.batchNo} • {fmt(item.askPrice)}/{item.unit.toLowerCase()}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--clr-outline-variant)", borderRadius: 4 }}>
                        <button onClick={() => upd(item.batchId, item.orderQty - 1)} className="btn-fx" style={{ padding: "4px 8px", color: "var(--clr-outline)", background: "none", border: "none", fontSize: 16 }}>−</button>
                        <span style={{ padding: "0 12px", fontSize: 13, fontWeight: 700, borderLeft: "1px solid var(--clr-outline-variant)", borderRight: "1px solid var(--clr-outline-variant)", color: "var(--clr-on-surface)", display: "flex", alignItems: "center" }}>{item.orderQty}</span>
                        <button onClick={() => upd(item.batchId, item.orderQty + 1)} className="btn-fx" style={{ padding: "4px 8px", color: "var(--clr-outline)", background: "none", border: "none", fontSize: 16 }}>+</button>
                      </div>
                    </div>
                  </div>
                  <span style={{ fontWeight: 700, color: "var(--clr-on-surface)" }}>{fmt(item.askPrice * item.orderQty)}</span>
                </div>
              ))}
            </div>

            {/* Checkout panel */}
            <div style={{ padding: 14, gap: 12, background: "var(--clr-surface-container-low)", borderTop: "1px solid var(--clr-outline-variant)", borderBottomLeftRadius: 12, borderBottomRightRadius: 12, display: "flex", flexDirection: "column", flexShrink: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--clr-outline)" }}>
                <span>Total MRP Value</span>
                <span>{fmt(totMrp)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <span style={{ fontSize: 18, fontWeight: 600, color: "var(--clr-on-surface)" }}>Order Total</span>
                <span style={{ fontSize: 24, fontWeight: 600, color: "var(--clr-on-surface)" }}>{fmt(totAsk)}</span>
              </div>

              {saved > 0 && (
                <div style={{ background: "var(--clr-stable-bg)", border: "1px solid rgba(22, 163, 74, 0.2)", borderRadius: 8, padding: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--clr-stable)", fontWeight: 700, marginBottom: 8 }}>
                    <span>💰 Net Savings vs MRP</span>
                    <span>{fmt(saved)}</span>
                  </div>
                  <div style={{ width: "100%", background: "rgba(22, 163, 74, 0.2)", height: 8, borderRadius: 9999, overflow: "hidden" }}>
                    <div style={{ background: "var(--clr-stable)", height: "100%", width: `${Math.min(savePct, 100)}%` }}></div>
                  </div>
                  <p style={{ margin: "8px 0 0 0", fontSize: 10, color: "var(--clr-stable)", fontWeight: 700, textAlign: "right", textTransform: "uppercase", letterSpacing: "0.05em" }}>{savePct}% Avg. Margin Saved</p>
                </div>
              )}

              {done ? (
                <div style={{ background: "var(--clr-stable-bg)", border: "1px solid var(--clr-stable)", borderRadius: 12, padding: 16, textAlign: "center" }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>✅</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--clr-stable)" }}>Escrow Order Initialized</div>
                  <div style={{ fontSize: 12, color: "var(--clr-stable)", marginTop: 4 }}>Ref: ESC-{Date.now().toString().slice(-8)}</div>
                  <button onClick={() => { setDone(false); setCart({}); }} className="btn-fx" style={{ marginTop: 12, padding: "6px 14px", background: "none", border: "1px solid var(--clr-stable)", color: "var(--clr-stable)", borderRadius: 4, fontWeight: 600 }}>Start New Order</button>
                </div>
              ) : (
                <>
                  <button id="btn-escrow-order" onClick={() => { if (items.length > 0) setDone(true); }} disabled={items.length === 0} className="btn-fx" style={{ width: "100%", background: items.length === 0 ? "var(--clr-outline-variant)" : "var(--clr-on-surface)", color: "#fff", padding: "16px 0", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontWeight: 700, border: "none", cursor: items.length === 0 ? "not-allowed" : "pointer", fontFamily: "var(--font-geist-sans)" }}>
                    🔒 Initialize Secure Escrow Order
                  </button>
                  <p style={{ margin: 0, fontSize: 10, color: "var(--clr-outline)", textAlign: "center", padding: "0 16px", fontStyle: "italic" }}>Form 19 purchase invoice upload will be strictly required upon transit completion to release escrow funds.</p>
                </>
              )}
            </div>
          </div>

        </aside>
      </main>
    </div>
  );
}
