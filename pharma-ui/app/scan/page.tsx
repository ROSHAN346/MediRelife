"use client";

import { useState } from "react";
import API from "../../lib/api";
import BarcodeScanner from "react-qr-barcode-scanner";
import Tesseract from "tesseract.js";
import { url } from "inspector";

export default function ScanPage() {
    const [step, setStep] = useState("choose");
    const [form, setForm] = useState({
        brand_name: "",
        generic_name: "",
        dosage_form: "Tablet",
        manufacturer: "",
        stock_qty: "",
        expiry_date: "",
        price: ""
    });

    const [terms, setTerms] = useState(false);

    // ---------------- QR ----------------
    const handleQR = (err, result) => {
        if (result) {
            console.log("QR:", result.text);
            // You can call validate here if needed
        }
    };

    // ---------------- OCR ----------------
    const handleOCR = async (e) => {
        console.log("📸 OCR triggered");

        const file = e.target.files[0];

        if (!file) {
            console.log("❌ No file selected");
            return;
        }

        console.log("✅ File:", file.name, file.type, file.size);

        try {
            const result = await Tesseract.recognize(file, "eng", {
                logger: (m) => console.log("OCR:", m),
            });

            const text = result.data.text;

            console.log("📊 Confidence:", result.data.confidence);
            console.log("📄 RAW TEXT:", JSON.stringify(text));

            if (!text || text.trim() === "") {
                alert("❌ No text detected. Try a clearer image.");
                return;
            }

            // now here we can use llm so we can generate structured data from unstructured text but for now we will just pick the longest line as brand name

            // Clean & extract best line
            const lines = text
                .split("\n")
                .map((l) => l.trim())
                .filter((l) => l.length > 3);

            if (lines.length === 0) {
                alert("❌ No valid text found");
                return;
            }

            // pick best candidate (longest line)
            const best = lines.sort((a, b) => b.length - a.length)[0];

            console.log("🏷 Detected Brand:", best);

            // Fill form + move to next step
            setForm((prev) => ({
                ...prev,
                brand_name: best,
            }));

            setStep("form");

        } catch (err) {
            console.error("❌ OCR ERROR:", err);
            alert("OCR failed. Check console.");
        }
    };

    // ---------------- FORM ----------------
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const submit = async () => {
        if (!terms) return alert("Accept terms");

        console.log("FINAL PAYLOAD:", {
            ...form,
            stock_qty: Number(form.stock_qty),
            price: Number(form.price),
            user_id: localStorage.getItem("token"), // 🔥 REQUIRED
        });

        await API.post("/insert-full", {
            ...form,
            stock_qty: Number(form.stock_qty),
            price: Number(form.price),
            user_id: localStorage.getItem("token"), // 🔥 REQUIRED
        });
        alert("✅ Added");

        window.location.href = "/dashboard";
        setStep("choose");
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">

            <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-md">

                <h2 className="text-2xl font-bold mb-4 text-center">
                    📱 Add Medicine
                </h2>

                {/* STEP 1 */}
                {step === "choose" && (
                    <div className="space-y-4">

                        <button
                            onClick={() => setStep("qr")}
                            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
                        >
                            📷 Scan QR / Barcode
                        </button>

                        {/* ✅ FIXED FILE INPUT */}
                        <label className="block cursor-pointer border p-3 rounded-lg text-center">
                            <span className="text-sm text-gray-500">
                                Upload image for OCR
                            </span>

                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onClick={(e) => (e.target.value = null)} 
                                onChange={(e) => {
                                    console.log("🔥 FILE CHANGE TRIGGERED");
                                    handleOCR(e);
                                }}
                            />
                        </label>

                    </div>
                )}

                {/* STEP 2 */}
                {step === "qr" && (
                    <div className="text-center">
                        <BarcodeScanner
                            width={300}
                            height={300}
                            onUpdate={handleQR}
                        />

                        <button
                            onClick={() => setStep("choose")}
                            className="mt-4 text-blue-500"
                        >
                            ← Back
                        </button>
                    </div>
                )}

                {/* STEP 3 */}
                {step === "form" && (
                    <div className="space-y-3">

                        <h3 className="font-semibold">🧾 Medicine</h3>

                        <input
                            name="brand_name"
                            value={form.brand_name}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                            placeholder="Brand"
                        />

                        <input
                            name="generic_name"
                            value={form.generic_name}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                            placeholder="Generic"
                        />

                        <input
                            name="dosage_form"
                            value={form.dosage_form}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                        />

                        <input
                            name="manufacturer"
                            value={form.manufacturer}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                            placeholder="Manufacturer"
                        />

                        <h3 className="font-semibold mt-2">📦 Inventory</h3>



                        <input
                            name="stock_qty"
                            type="number"
                            placeholder="Stock"
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                        />

                        <input
                            name="expiry_date"
                            type="date"
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                        />

                        <input
                            name="price"
                            type="number"
                            placeholder="Price"
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                        />

                        <label className="flex items-center space-x-2 text-sm">
                            <input
                                type="checkbox"
                                onChange={(e) => setTerms(e.target.checked)}
                            />
                            <span>Accept Terms</span>
                        </label>

                        <button
                            onClick={submit}
                            className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
                        >
                            Submit
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}