"use client";

import { useState } from "react";
import { ParentProfile } from "@/lib/types";

interface SetupProps {
  onComplete: (parents: [ParentProfile, ParentProfile]) => void;
}

export default function Setup({ onComplete }: SetupProps) {
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name1.trim() || !name2.trim()) return;
    onComplete([
      { id: "parent1", name: name1.trim(), emoji: "🧡" },
      { id: "parent2", name: name2.trim(), emoji: "💜" },
    ]);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight" style={{ color: "#3d2e1f" }}>
            Division
          </h1>
          <p className="mt-3 text-lg" style={{ color: "#8b6a4f" }}>
            See the labor. Share the load.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div
            className="rounded-2xl p-6 space-y-5"
            style={{ background: "white", boxShadow: "0 1px 3px rgba(61,46,31,0.08)" }}
          >
            <p className="text-sm font-medium" style={{ color: "#8b6a4f" }}>
              Who are the two parents?
            </p>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#3d2e1f" }}>
                🧡 Parent one
              </label>
              <input
                type="text"
                value={name1}
                onChange={(e) => setName1(e.target.value)}
                placeholder="First name"
                className="w-full px-4 py-3 rounded-xl border text-base focus:outline-none focus:ring-2"
                style={{
                  borderColor: "#e4dbc9",
                  background: "#faf8f5",
                  color: "#3d2e1f",
                }}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#3d2e1f" }}>
                💜 Parent two
              </label>
              <input
                type="text"
                value={name2}
                onChange={(e) => setName2(e.target.value)}
                placeholder="First name"
                className="w-full px-4 py-3 rounded-xl border text-base focus:outline-none focus:ring-2"
                style={{
                  borderColor: "#e4dbc9",
                  background: "#faf8f5",
                  color: "#3d2e1f",
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!name1.trim() || !name2.trim()}
            className="w-full py-3.5 rounded-xl font-semibold text-base transition-all disabled:opacity-40"
            style={{
              background: name1.trim() && name2.trim() ? "#ea7522" : "#d3c4a7",
              color: "white",
            }}
          >
            Get started
          </button>
        </form>
      </div>
    </div>
  );
}
