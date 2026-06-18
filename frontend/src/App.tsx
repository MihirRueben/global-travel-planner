import React, { useState } from "react";
import {
  Compass,
  Calendar,
  Sparkles,
  MapPin,
  Loader2,
  DollarSign,
  Clock,
} from "lucide-react";

interface Activity {
  time_of_day: string;
  location: string;
  description: string;
  estimated_cost_local: string;
}

interface ItineraryDay {
  day_number: number;
  theme: string;
  activities: Activity[];
}

interface ItineraryData {
  title: string;
  total_days: number;
  days: ItineraryDay[];
}

export default function App() {
  const [countryCode, setCountryCode] = useState("JPN");
  const [days, setDays] = useState(3);
  const [preferences, setPreferences] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ItineraryData | null>(null);
  const [error, setError] = useState("");

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      // Direct network dispatch pointing to our local FastAPI server port 8000
      const url = `http://127.0.0.1:8000/itinerary/generate?country_code=${countryCode}&days=${days}&preferences=${encodeURIComponent(preferences)}`;

      const response = await fetch(url, { method: "POST" });

      if (!response.ok) {
        const errDetail = await response
          .json()
          .catch(() => ({ detail: "Server transaction dropped." }));
        throw new Error(
          errDetail.detail || "Failed to generate your itinerary.",
        );
      }

      const resData = await response.json();
      setResult(resData.data);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans">
      {/* Header Layout */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 text-white p-2 rounded-xl">
              <Compass className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Vagabond<span className="text-indigo-600">AI</span>
            </h1>
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
            System Online (Free Tier)
          </span>
        </div>
      </header>

      {/* Main Grid Interface */}
      <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Control Panel Form */}
        <section className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" /> Plan Design Core
          </h2>
          <form onSubmit={handleGenerate} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Target ISO Country Code
              </label>
              <input
                type="text"
                maxLength={3}
                placeholder="e.g., JPN, MYS, FRA, USA"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-sm uppercase focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Trip Length (Days)
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="1"
                  max="14"
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
                <span className="text-sm font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md min-w-10 text-center">
                  {days}d
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Personal Aesthetic Preferences
              </label>
              <textarea
                rows={4}
                placeholder="e.g., Local specialty coffee roasters, quiet architectural photography hot spots, budget bakeries..."
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm resize-none focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                required
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-950 hover:bg-slate-900 disabled:bg-slate-400 text-white font-medium py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Mapping Context Vectors...
                </>
              ) : (
                "Generate Custom Itinerary"
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}
        </section>

        {/* Right Side: Render Stream Output */}
        <section className="lg:col-span-8 space-y-6">
          {!result && !loading && (
            <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white p-6">
              <Calendar className="w-12 h-12 text-slate-300 mb-3" />
              <h3 className="text-base font-semibold text-slate-700">
                No active itinerary generated yet
              </h3>
              <p className="text-sm text-slate-400 max-w-sm mt-1">
                Configure your destination parameters and execute the vector
                sequence engine.
              </p>
            </div>
          )}

          {loading && (
            <div className="space-y-4 animate-pulse">
              <div className="h-8 bg-slate-200 rounded-md w-2/3"></div>
              <div className="h-4 bg-slate-200 rounded-md w-1/3"></div>
              <div className="h-48 bg-white border border-slate-200 rounded-2xl mt-6"></div>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 block mb-1">
                  Tailored Journey Map
                </span>
                <h2 className="text-2xl font-black text-slate-900">
                  {result.title}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Relational parameters verified and parsed natively inside your
                  Neon Instance.
                </p>
              </div>

              {result.days.map((day) => (
                <div
                  key={day.day_number}
                  className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden"
                >
                  <div className="bg-slate-950 text-white px-6 py-4 flex items-center justify-between">
                    <span className="text-sm font-bold tracking-wider uppercase text-indigo-400">
                      Day 0{day.day_number}
                    </span>
                    <h4 className="text-sm font-medium text-slate-100 italic text-right">
                      {day.theme}
                    </h4>
                  </div>

                  <div className="p-6 divide-y divide-slate-100">
                    {day.activities.map((act, index) => (
                      <div
                        key={index}
                        className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-start md:gap-6"
                      >
                        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 uppercase bg-indigo-50 px-2.5 py-1 rounded-md mb-2 md:mb-0 w-fit shrink-0">
                          <Clock className="w-3.5 h-3.5" /> {act.time_of_day}
                        </div>
                        <div className="grow">
                          <h5 className="font-bold text-slate-900 text-sm flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-emerald-500 inline" />{" "}
                            {act.location}
                          </h5>
                          <p className="text-slate-600 text-sm mt-1 leading-relaxed">
                            {act.description}
                          </p>
                        </div>
                        <div className="mt-2 md:mt-0 flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md w-fit shrink-0">
                          <DollarSign className="w-3.5 h-3.5" /> Est:{" "}
                          {act.estimated_cost_local}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
