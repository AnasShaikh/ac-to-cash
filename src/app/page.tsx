"use client";

import { useState } from "react";

/* ── option data ── */
const AC_TYPES = ["Split", "Window", "Inverter", "Cassette", "Other"];
const CONDITIONS = ["Working", "Needs Repair", "Not Working"];
const BRANDS = ["LG", "Samsung", "Daikin", "Voltas", "Blue Star", "Hitachi", "Carrier", "Lloyd", "Godrej", "Other"];
const TONNAGES = ["0.75 Ton", "1 Ton", "1.5 Ton", "2 Ton", "2+ Ton"];
const AGES = ["< 1 yr", "1-2 yrs", "3-4 yrs", "5-7 yrs", "8+ yrs"];


type Form = {
  name: string;
  phone: string;
  city: string;
  acType: string;
  brand: string;
  tonnage: string;
  age: string;
  condition: string;

  address: string;
  notes: string;
};

const blank: Form = {
  name: "", phone: "", city: "", acType: "", brand: "", tonnage: "",
  age: "", condition: "", address: "", notes: "",
};

export default function Home() {
  const [f, setF] = useState<Form>(blank);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [serverErr, setServerErr] = useState("");

  const set = (key: keyof Form, val: string) => {
    setF((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: "" }));
  };

  const validate = () => {
    const e: Partial<Record<keyof Form, string>> = {};
    if (!f.name.trim()) e.name = "Required";
    if (!f.phone.trim()) e.phone = "Required";
    else if (!/^[6-9]\d{9}$/.test(f.phone.trim())) e.phone = "Enter valid 10-digit number";
    if (!f.acType) e.acType = "Select one";
    if (!f.condition) e.condition = "Select one";
    if (!f.address.trim()) e.address = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    setServerErr("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      if (!res.ok) throw new Error();
      setDone(true);
      setF(blank);
    } catch {
      setServerErr("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  /* ── success state ── */
  if (done) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
            <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Query Submitted!</h2>
          <p className="text-slate-500 mb-6">Our team will call you within a few hours with the best offer for your AC.</p>
          <button
            onClick={() => setDone(false)}
            className="text-emerald-600 font-semibold hover:underline cursor-pointer"
          >
            Submit another query
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-start justify-center px-4 py-6 pb-12">
      <div className="w-full max-w-lg">
        {/* ── Brand ── */}
        <div className="text-center mb-5">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            AC<span className="text-emerald-600">to</span>Cash
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-0.5">Mumbai</p>
          <p className="text-slate-400 text-xs mt-0.5">Sell your old AC in minutes</p>
        </div>

        <form onSubmit={submit}>
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
            {/* ── Section 1: About You ── */}
            <div className="px-5 pt-5 pb-4">
              <SectionLabel text="About You" />
              <div className="space-y-3 mt-3">
                <Input label="Full Name" value={f.name} error={errors.name}
                  onChange={(v) => set("name", v)} placeholder="Your name" />
                <Input label="Phone" value={f.phone} error={errors.phone}
                  onChange={(v) => set("phone", v)} placeholder="10-digit number"
                  inputMode="numeric" maxLength={10} />
              </div>
            </div>

            <Divider />

            {/* ── Section 2: AC Details ── */}
            <div className="px-5 pt-4 pb-4">
              <SectionLabel text="AC Details" />

              <ChipGroup label="Type" options={AC_TYPES} value={f.acType}
                onChange={(v) => set("acType", v)} error={errors.acType} />

              <ChipGroup label="Condition" options={CONDITIONS} value={f.condition}
                onChange={(v) => set("condition", v)} error={errors.condition}
                colors={{ "Working": "emerald", "Needs Repair": "amber", "Not Working": "red" }} />

              <ChipGroup label="Brand" options={BRANDS} value={f.brand}
                onChange={(v) => set("brand", v)} scrollable />

              <ChipGroup label="Tonnage" options={TONNAGES} value={f.tonnage}
                onChange={(v) => set("tonnage", v)} />

              <ChipGroup label="Age" options={AGES} value={f.age}
                onChange={(v) => set("age", v)} />
            </div>

            <Divider />

            {/* ── Section 3: Pickup ── */}
            <div className="px-5 pt-4 pb-5">
              <SectionLabel text="Pickup Details" />

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Pickup Address <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={f.address}
                  onChange={(e) => set("address", e.target.value)}
                  placeholder="Full address with landmark"
                  rows={2}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 bg-slate-50/50 resize-none transition"
                />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
              </div>

              <div className="mt-3">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Notes <span className="text-slate-300">(optional)</span>
                </label>
                <textarea
                  value={f.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Preferred time, floor, etc."
                  rows={2}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 bg-slate-50/50 resize-none transition"
                />
              </div>
            </div>
          </div>

          {serverErr && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 mt-4 text-sm text-center">
              {serverErr}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full mt-5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] disabled:bg-emerald-400 text-white font-bold py-3.5 rounded-2xl transition-all cursor-pointer shadow-lg shadow-emerald-600/20 text-base"
          >
            {busy ? "Submitting..." : "Get My Quote →"}
          </button>

          <p className="text-center text-[11px] text-slate-400 mt-3">
            By submitting, you agree to be contacted by our team.
          </p>
        </form>
      </div>
    </main>
  );
}

/* ════════════════════════════════════════════ */
/*  Components                                  */
/* ════════════════════════════════════════════ */

function SectionLabel({ text }: { text: string }) {
  return (
    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{text}</h3>
  );
}

function Divider() {
  return <div className="border-t border-dashed border-slate-100" />;
}

function Input({
  label, value, error, onChange, placeholder, inputMode, maxLength,
}: {
  label: string; value: string; error?: string; onChange: (v: string) => void;
  placeholder?: string; inputMode?: "numeric"; maxLength?: number;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
        {label} <span className="text-red-400">*</span>
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={maxLength}
        className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 bg-slate-50/50 transition"
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

function ChipGroup({
  label, options, value, onChange, error, scrollable, colors,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  error?: string;
  scrollable?: boolean;
  colors?: Record<string, string>;
}) {
  const chipColor = (opt: string, selected: boolean) => {
    if (!selected) return "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100";
    const c = colors?.[opt];
    if (c === "emerald") return "bg-emerald-50 border-emerald-400 text-emerald-700 ring-1 ring-emerald-400/30";
    if (c === "amber") return "bg-amber-50 border-amber-400 text-amber-700 ring-1 ring-amber-400/30";
    if (c === "red") return "bg-red-50 border-red-400 text-red-700 ring-1 ring-red-400/30";
    return "bg-emerald-50 border-emerald-400 text-emerald-700 ring-1 ring-emerald-400/30";
  };

  return (
    <div className="mt-3">
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      <div className={`flex gap-2 ${scrollable ? "overflow-x-auto no-scrollbar pb-1" : "flex-wrap"}`}>
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(value === opt ? "" : opt)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full border text-xs font-medium cursor-pointer transition-all ${chipColor(opt, value === opt)}`}
          >
            {opt}
          </button>
        ))}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
