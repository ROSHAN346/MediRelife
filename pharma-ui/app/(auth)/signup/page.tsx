"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const signup = async () => {
    // 🔍 Basic validation
    if (!form.name || !form.email || !form.password) {
      alert("All fields are required");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:8000/signup",
        form
      );

      const token = res.data.user_id;

      // 🔐 Store JWT
      localStorage.setItem("token", token);

      alert("✅ Signup successful");

      // 🚀 Redirect to home/dashboard
      router.push("/dashboard");

    } catch (err: any) {
      console.error(err);
      alert("❌ " + (err.response?.data?.detail || "Signup failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-80">

        <h2 className="text-2xl font-bold text-center mb-4">
          📝 Signup
        </h2>

        <input
          name="name"
          placeholder="Full Name"
          onChange={handleChange}
          className="w-full border p-2 mb-3 rounded"
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleChange}
          className="w-full border p-2 mb-3 rounded"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          className="w-full border p-2 mb-4 rounded"
        />

        <button
          onClick={signup}
          disabled={loading}
          className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
        >
          {loading ? "Creating..." : "Signup"}
        </button>

        <p className="text-sm text-center mt-3">
          Already have an account?{" "}
          <span
            onClick={() => router.push("/signin")}
            className="text-blue-500 cursor-pointer"
          >
            Login
          </span>
        </p>

      </div>
    </div>
  );
}