"use client";

import { useEffect, useState, useCallback } from "react";

type Lead = {
  id: number;
  createdAt: string;
  name: string;
  phone: string;
  city: string;
  acType: string;
  condition: string;
  address: string;
  brand: string | null;
  tonnage: string | null;
  age: string | null;
  expectedPrice: string | null;
  notes: string | null;
  status: string;
};

const STATUSES = ["all", "new", "called", "quoted", "picked_up", "rejected"];
const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  called: "bg-yellow-100 text-yellow-800",
  quoted: "bg-purple-100 text-purple-800",
  picked_up: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ key });
    if (filter !== "all") params.set("status", filter);
    if (search.trim()) params.set("search", search.trim());

    try {
      const res = await fetch(`/api/admin/leads?${params}`);
      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      const data = await res.json();
      setLeads(data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [key, filter, search]);

  useEffect(() => {
    if (authed) fetchLeads();
  }, [authed, filter, fetchLeads]);

  const updateStatus = async (id: number, status: string) => {
    await fetch(`/api/admin/leads?key=${key}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    fetchLeads();
  };

  if (!authed) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 w-full max-w-sm">
          <h1 className="text-xl font-bold text-slate-800 mb-4">
            Admin Access
          </h1>
          <input
            type="password"
            placeholder="Enter admin key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setAuthed(true)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            onClick={() => setAuthed(true)}
            className="w-full bg-emerald-600 text-white font-semibold py-2.5 rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer"
          >
            Enter
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-800">
            AC<span className="text-emerald-600">to</span>Cash{" "}
            <span className="text-slate-400 font-normal text-lg">Admin</span>
          </h1>
          <span className="text-sm text-slate-500">
            {leads.length} lead{leads.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <input
            placeholder="Search name, phone, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchLeads()}
            className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <div className="flex gap-1.5 flex-wrap">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize cursor-pointer transition-colors ${
                  filter === s
                    ? "bg-emerald-600 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {s.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="text-slate-400 text-sm text-center py-12">
            Loading...
          </p>
        ) : leads.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-12">
            No leads found.
          </p>
        ) : (
          <div className="space-y-3">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm"
              >
                {/* Summary row */}
                <div
                  className="flex items-center justify-between px-4 py-3 cursor-pointer"
                  onClick={() =>
                    setExpanded(expanded === lead.id ? null : lead.id)
                  }
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-800 text-sm">
                        {lead.name}
                      </span>
                      <a
                        href={`tel:${lead.phone}`}
                        className="text-emerald-600 text-sm hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {lead.phone}
                      </a>
                      <span className="text-slate-400 text-xs">
                        {lead.city}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {lead.acType} · {lead.condition} ·{" "}
                      {new Date(lead.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <select
                    value={lead.status}
                    onChange={(e) => {
                      e.stopPropagation();
                      updateStatus(lead.id, e.target.value);
                    }}
                    className={`text-xs font-medium px-2.5 py-1 rounded-lg border-0 cursor-pointer ${
                      STATUS_COLORS[lead.status] || "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {STATUSES.filter((s) => s !== "all").map((s) => (
                      <option key={s} value={s}>
                        {s.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Expanded detail */}
                {expanded === lead.id && (
                  <div className="border-t border-slate-100 px-4 py-3 text-sm text-slate-600 grid grid-cols-2 gap-x-4 gap-y-2">
                    {lead.brand && <Detail label="Brand" value={lead.brand} />}
                    {lead.tonnage && (
                      <Detail label="Tonnage" value={lead.tonnage} />
                    )}
                    {lead.age && <Detail label="Age" value={lead.age + " yrs"} />}
                    {lead.expectedPrice && (
                      <Detail label="Price" value={"₹" + lead.expectedPrice} />
                    )}
                    <div className="col-span-2">
                      <Detail label="Address" value={lead.address} />
                    </div>
                    {lead.notes && (
                      <div className="col-span-2">
                        <Detail label="Notes" value={lead.notes} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-slate-400 text-xs">{label}</span>
      <p className="text-slate-700">{value}</p>
    </div>
  );
}
