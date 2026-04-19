"use client";

declare global {
  interface Window { gtag?: (...args: unknown[]) => void; }
}

import { useState } from "react";

/* ── translations ── */
type Lang = "en" | "hi";

const t = {
  en: {
    subtitle: "Mumbai",
    tagline: "Sell your old AC in minutes",
    aboutYou: "About You",
    fullName: "Full Name",
    namePlaceholder: "Your name",
    phone: "Phone",
    phonePlaceholder: "10-digit number",
    acDetails: "AC Details",
    type: "Type",
    condition: "Condition",
    brand: "Brand",
    tonnage: "Tonnage",
    age: "Age",
    pickupDetails: "Pickup Details",
    pickupAddress: "Pickup Address",
    addressPlaceholder: "Full address with landmark",
    notes: "Notes",
    optional: "(optional)",
    notesPlaceholder: "Preferred time, floor, etc.",
    photo: "AC Photo",
    photoHint: "Tap to upload a photo of your AC",
    photoUploading: "Uploading...",
    submit: "Get My Quote",
    submitting: "Submitting...",
    consent: "By submitting, you agree to be contacted by our team.",
    whatsappLabel: "Or chat with us on WhatsApp",
    successTitle: "Query Submitted!",
    successMsg: "Our team will call you within a few hours with the best offer for your AC.",
    submitAnother: "Submit another query",
    waSuccessMsg: "Hi, I just submitted a query on ACtoCash for selling my AC.",
    waFormMsg: "Hi, I want to sell my old AC.",
    required: "Required",
    invalidPhone: "Enter valid 10-digit number",
    selectOne: "Select one",
    serverError: "Something went wrong. Please try again.",
    conditions: { "Working": "Working", "Needs Repair": "Needs Repair", "Not Working": "Not Working" } as Record<string, string>,
  },
  hi: {
    subtitle: "Mumbai",
    tagline: "Apna purana AC minute mein bechein",
    aboutYou: "Aapki Jaankari",
    fullName: "Pura Naam",
    namePlaceholder: "Aapka naam",
    phone: "Phone",
    phonePlaceholder: "10 digit number",
    acDetails: "AC Ki Jaankari",
    type: "Type",
    condition: "Condition",
    brand: "Brand",
    tonnage: "Tonnage",
    age: "Kitna Purana",
    pickupDetails: "Pickup Ki Jaankari",
    pickupAddress: "Pickup Address",
    addressPlaceholder: "Pura address landmark ke saath",
    notes: "Notes",
    optional: "(optional)",
    notesPlaceholder: "Time, floor, etc.",
    photo: "AC Ki Photo",
    photoHint: "Apne AC ki photo upload karein",
    photoUploading: "Upload ho raha hai...",
    submit: "Quote Mangein",
    submitting: "Bhej rahe hain...",
    consent: "Submit karne par aap hamare team se contact hone ke liye agree karte hain.",
    whatsappLabel: "Ya WhatsApp par baat karein",
    successTitle: "Query Submit Ho Gayi!",
    successMsg: "Hamari team kuch ghanton mein aapko call karegi aapke AC ka best offer dene ke liye.",
    submitAnother: "Ek aur query submit karein",
    waSuccessMsg: "Hi, maine ACtoCash par apna AC bechne ke liye query submit ki hai.",
    waFormMsg: "Hi, mujhe apna purana AC bechna hai.",
    required: "Zaruri hai",
    invalidPhone: "Sahi 10 digit number daalein",
    selectOne: "Ek chunein",
    serverError: "Kuch gadbad ho gayi. Dobara try karein.",
    conditions: { "Working": "Chalu", "Needs Repair": "Repair Chahiye", "Not Working": "Band Hai" } as Record<string, string>,
  },
} as const;

/* ── option data ── */
const WHATSAPP_NUMBERS = [
  { display: "80977 21250", raw: "918097721250" },
  { display: "83693 12226", raw: "918369312226" },
];

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

const GOOGLE_ADS_SEND_TO = "AW-953195901/gkA1CKq82pYcEP26wsYD";

function reportLeadFormConversion() {
  if (typeof window === "undefined") return;

  // Keep a queue available even if the Google script finishes loading a moment later.
  if (typeof window.gtag !== "function") {
    (window as Window & { dataLayer?: unknown[] }).dataLayer = (window as Window & { dataLayer?: unknown[] }).dataLayer || [];
    window.gtag = (...args: unknown[]) => {
      (window as Window & { dataLayer?: unknown[] }).dataLayer?.push(args);
    };
  }

  window.gtag("event", "conversion", {
    send_to: GOOGLE_ADS_SEND_TO,
    event_callback: () => undefined,
  });
}

export default function Home() {
  const [lang, setLang] = useState<Lang>("en");
  const l = t[lang];
  const [f, setF] = useState<Form>(blank);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [serverErr, setServerErr] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  const set = (key: keyof Form, val: string) => {
    setF((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: "" }));
  };

  const validate = () => {
    const e: Partial<Record<keyof Form, string>> = {};
    if (!f.name.trim()) e.name = l.required;
    if (!f.phone.trim()) e.phone = l.required;
    else if (!/^[6-9]\d{9}$/.test(f.phone.trim())) e.phone = l.invalidPhone;
    if (!f.acType) e.acType = l.selectOne;
    if (!f.condition) e.condition = l.selectOne;
    if (!f.address.trim()) e.address = l.required;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    setServerErr("");
    try {
      let photoUrl: string | null = null;
      if (photoFile) {
        setPhotoUploading(true);
        const fd = new FormData();
        fd.append("file", photoFile);
        const upRes = await fetch("/api/upload", { method: "POST", body: fd });
        setPhotoUploading(false);
        if (upRes.ok) {
          const upData = await upRes.json();
          photoUrl = upData.url;
        }
      }
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, photoUrl }),
      });
      if (!res.ok) throw new Error();
      reportLeadFormConversion();
      setDone(true);
      setF(blank);
      setPhotoFile(null);
      setPhotoPreview(null);
    } catch {
      setServerErr(l.serverError);
    } finally {
      setBusy(false);
      setPhotoUploading(false);
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
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{l.successTitle}</h2>
          <p className="text-slate-500 mb-6">{l.successMsg}</p>
          <WhatsAppStrip message={l.waSuccessMsg} label={l.whatsappLabel} />
          <button
            onClick={() => setDone(false)}
            className="text-emerald-600 font-semibold hover:underline cursor-pointer mt-4"
          >
            {l.submitAnother}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-start justify-center px-4 py-6 pb-12">
      <div className="w-full max-w-lg">
        {/* ── Lang toggle ── */}
        <div className="flex justify-end mb-2">
          <button
            type="button"
            onClick={() => setLang(lang === "en" ? "hi" : "en")}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          >
            {lang === "en" ? "हिंदी" : "English"}
          </button>
        </div>

        {/* ── Brand ── */}
        <div className="text-center mb-5">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            AC<span className="text-emerald-600">to</span>Cash
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-0.5">{l.subtitle}</p>
          <p className="text-slate-400 text-xs mt-0.5">{l.tagline}</p>
          <div className="flex items-center justify-center gap-3 mt-1.5">
            {WHATSAPP_NUMBERS.map((n) => (
              <a
                key={n.raw}
                href={`tel:${n.raw.slice(2)}`}
                className="text-emerald-600 text-xs font-medium hover:underline"
              >
                {n.display}
              </a>
            ))}
          </div>
        </div>

        <form onSubmit={submit}>
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
            {/* ── Section 1: About You ── */}
            <div className="px-5 pt-5 pb-4">
              <SectionLabel text={l.aboutYou} />
              <div className="space-y-3 mt-3">
                <Input label={l.fullName} value={f.name} error={errors.name}
                  onChange={(v) => set("name", v)} placeholder={l.namePlaceholder} />
                <Input label={l.phone} value={f.phone} error={errors.phone}
                  onChange={(v) => set("phone", v)} placeholder={l.phonePlaceholder}
                  inputMode="numeric" maxLength={10} />
              </div>
            </div>

            <Divider />

            {/* ── Section 2: AC Details ── */}
            <div className="px-5 pt-4 pb-4">
              <SectionLabel text={l.acDetails} />

              <ChipGroup label={l.type} options={AC_TYPES} value={f.acType}
                onChange={(v) => set("acType", v)} error={errors.acType} />

              <ChipGroup label={l.condition} options={CONDITIONS} value={f.condition}
                onChange={(v) => set("condition", v)} error={errors.condition}
                colors={{ "Working": "emerald", "Needs Repair": "amber", "Not Working": "red" }}
                displayMap={l.conditions} />

              <ChipGroup label={l.brand} options={BRANDS} value={f.brand}
                onChange={(v) => set("brand", v)} scrollable />

              <ChipGroup label={l.tonnage} options={TONNAGES} value={f.tonnage}
                onChange={(v) => set("tonnage", v)} />

              <ChipGroup label={l.age} options={AGES} value={f.age}
                onChange={(v) => set("age", v)} />
            </div>

            <Divider />

            {/* ── Section 3: Pickup ── */}
            <div className="px-5 pt-4 pb-5">
              <SectionLabel text={l.pickupDetails} />

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  {l.pickupAddress} <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={f.address}
                  onChange={(e) => set("address", e.target.value)}
                  placeholder={l.addressPlaceholder}
                  rows={2}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 bg-slate-50/50 resize-none transition"
                />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
              </div>

              <div className="mt-3">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  {l.notes} <span className="text-slate-300">{l.optional}</span>
                </label>
                <textarea
                  value={f.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder={l.notesPlaceholder}
                  rows={2}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 bg-slate-50/50 resize-none transition"
                />
              </div>

              <div className="mt-3">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  {l.photo} <span className="text-slate-300">{l.optional}</span>
                </label>
                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl p-4 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition bg-slate-50/50">
                  {photoPreview ? (
                    <img src={photoPreview} alt="AC preview" className="w-full max-h-40 object-contain rounded-lg" />
                  ) : (
                    <>
                      <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-xs text-slate-400">{l.photoHint}</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      setPhotoFile(file);
                      if (file) setPhotoPreview(URL.createObjectURL(file));
                      else setPhotoPreview(null);
                    }}
                  />
                </label>
                {photoPreview && (
                  <button type="button" onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                    className="text-xs text-red-400 hover:underline mt-1">Remove photo</button>
                )}
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
            {photoUploading ? l.photoUploading : busy ? l.submitting : `${l.submit} →`}
          </button>

          <p className="text-center text-[11px] text-slate-400 mt-3">
            {l.consent}
          </p>
        </form>

        <WhatsAppStrip message={l.waFormMsg} label={l.whatsappLabel} />
      </div>
    </main>
  );
}

/* ════════════════════════════════════════════ */
/*  Components                                  */
/* ════════════════════════════════════════════ */

function WhatsAppStrip({ message, label }: { message: string; label: string }) {
  return (
    <div className="mt-6">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide text-center mb-2">
        {label}
      </p>
      <div className="flex flex-col gap-2">
        {WHATSAPP_NUMBERS.map((n) => (
          <a
            key={n.raw}
            href={`https://wa.me/${n.raw}?text=${encodeURIComponent(message)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#1ebe57] text-white font-semibold py-2.5 rounded-xl transition-all text-sm"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            {n.display}
          </a>
        ))}
      </div>
    </div>
  );
}

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
  label, options, value, onChange, error, scrollable, colors, displayMap,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  error?: string;
  scrollable?: boolean;
  colors?: Record<string, string>;
  displayMap?: Record<string, string>;
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
            {displayMap?.[opt] ?? opt}
          </button>
        ))}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
