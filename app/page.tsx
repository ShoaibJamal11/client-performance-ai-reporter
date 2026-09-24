"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  Wallet, 
  ArrowRightLeft, 
  CheckCircle2, 
  RefreshCw, 
  Copy, 
  Check, 
  FileText 
} from "lucide-react";

interface Campaign {
  channel: string;
  campaign: string;
  spend: number;
  revenue: number;
  roas: number;
  cpa: number;
  status: "Active" | "Paused" | "Optimizing";
}

interface ReallocationItem {
  fromCampaign: string;
  toCampaign: string;
  shiftAmount: string;
  rationale: string;
}

interface AuditReport {
  executiveVerdict: string;
  cmoSummary: string;
  budgetReallocations: ReallocationItem[];
  strategicWins: string[];
  immediateActionPlan: string[];
}

const PRESET_SKINCARE: { name: string; campaigns: Campaign[] } = {
  name: "DTC Skincare ($16.5k Spend)",
  campaigns: [
    { channel: "Meta Ads", campaign: "TOF - Broad Video Hooks (Collagen Serum)", spend: 6400, revenue: 26880, roas: 4.2, cpa: 19.5, status: "Active" },
    { channel: "Meta Ads", campaign: "MOF - Social Proof & UGC Testimonials", spend: 3200, revenue: 11520, roas: 3.6, cpa: 22.0, status: "Active" },
    { channel: "Google Ads", campaign: "High-Intent Search - Brand Core", spend: 1800, revenue: 11700, roas: 6.5, cpa: 11.2, status: "Active" },
    { channel: "Google Ads", campaign: "Performance Max - Generic Beauty", spend: 2900, revenue: 5220, roas: 1.8, cpa: 48.0, status: "Active" },
    { channel: "TikTok Ads", campaign: "Spark Ads UGC Influencer Whitelisting", spend: 2200, revenue: 2640, roas: 1.2, cpa: 52.0, status: "Paused" }
  ]
};

const PRESET_SAAS: { name: string; campaigns: Campaign[] } = {
  name: "B2B SaaS Enterprise ($13.6k Spend)",
  campaigns: [
    { channel: "Google Ads", campaign: "Search - Competitor Alternatives", spend: 4500, revenue: 18000, roas: 4.0, cpa: 85.0, status: "Active" },
    { channel: "Google Ads", campaign: "Search - Enterprise ERP Software", spend: 5200, revenue: 13000, roas: 2.5, cpa: 140.0, status: "Active" },
    { channel: "Meta Ads", campaign: "Founder Retargeting - Whitepaper Lead Gen", spend: 2100, revenue: 7350, roas: 3.5, cpa: 45.0, status: "Active" },
    { channel: "Meta Ads", campaign: "Broad Lookalike - Case Study Carousel", spend: 1800, revenue: 2160, roas: 1.2, cpa: 195.0, status: "Paused" }
  ]
};

export default function ClientPerformancePage() {
  const [selectedPreset, setSelectedPreset] = useState<"skincare" | "saas">("skincare");
  const [loading, setLoading] = useState(false);
  const [audit, setAudit] = useState<AuditReport | null>(null);
  const [copied, setCopied] = useState(false);

  const activeData = selectedPreset === "skincare" ? PRESET_SKINCARE : PRESET_SAAS;

  const totalSpend = activeData.campaigns.reduce((acc, c) => acc + c.spend, 0);
  const totalRevenue = activeData.campaigns.reduce((acc, c) => acc + c.revenue, 0);
  const blendedRoas = (totalRevenue / (totalSpend || 1)).toFixed(2);
  const netProfit = totalRevenue - totalSpend;

  const handleGenerateAudit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: activeData.name,
          campaigns: activeData.campaigns,
          totalSpend,
          totalRevenue,
          blendedRoas,
          netProfit,
        }),
      });

      const json = await res.json();
      if (res.ok && json.executiveVerdict) {
        setAudit(json);
      } else {
        alert("Failed to generate audit: " + (json.error || "Unknown server response"));
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyFullReport = () => {
    if (!audit) return;
    const text = `EXECUTIVE PERFORMANCE AUDIT
Verdict: ${audit.executiveVerdict}

CMO SUMMARY:
${audit.cmoSummary}

BUDGET REALLOCATIONS:
${audit.budgetReallocations?.map((b) => `- Shift ${b.shiftAmount} from "${b.fromCampaign}" to "${b.toCampaign}" (${b.rationale})`).join("\n") || "None"}

KEY WINS:
${audit.strategicWins?.map((w) => `- ${w}`).join("\n") || "None"}

NEXT 7-DAY ACTION PLAN:
${audit.immediateActionPlan?.map((a) => `- ${a}`).join("\n") || "None"}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 border-b border-slate-800 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium mb-2">
            <Sparkles className="w-3.5 h-3.5" /> High-Ticket Marketing Automation #2
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Omnichannel Client Performance Reporter & Insights Engine
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Automates multi-channel ad audits, Groq LPU CMO diagnosis, and client-branded executive reports.
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-slate-500 font-mono">RETAINER TOOL VALUE</p>
          <p className="text-lg font-bold text-emerald-400">$800 - $1,200 / Mo</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Client Presets:</span>
            <button
              onClick={() => { setSelectedPreset("skincare"); setAudit(null); }}
              className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                selectedPreset === "skincare"
                  ? "bg-slate-800 text-cyan-400 border-cyan-500/50 shadow"
                  : "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800"
              }`}
            >
              DTC Skincare ($16.5k Spend)
            </button>
            <button
              onClick={() => { setSelectedPreset("saas"); setAudit(null); }}
              className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                selectedPreset === "saas"
                  ? "bg-slate-800 text-cyan-400 border-cyan-500/50 shadow"
                  : "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800"
              }`}
            >
              B2B SaaS ($13.6k Spend)
            </button>
          </div>

          <button
            onClick={handleGenerateAudit}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-950/40"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Auditing Omnichannel Attribution via Groq...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Strategic Audit
              </>
            )}
          </button>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center justify-between text-rose-400 mb-2">
              <span className="text-[11px] font-mono text-slate-400">Total Ad Spend</span>
              <DollarSign className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold font-mono text-slate-100">${totalSpend.toLocaleString()}</p>
            <p className="text-[10px] text-slate-500 mt-1">Cross-channel aggregate</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center justify-between text-emerald-400 mb-2">
              <span className="text-[11px] font-mono text-slate-400">Attributed Revenue</span>
              <TrendingUp className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold font-mono text-emerald-400">${totalRevenue.toLocaleString()}</p>
            <p className="text-[10px] text-slate-500 mt-1">Direct pixel attribution</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center justify-between text-cyan-400 mb-2">
              <span className="text-[11px] font-mono text-slate-400">Blended ROAS</span>
              <BarChart3 className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold font-mono text-cyan-400">{blendedRoas}x</p>
            <p className="text-[10px] text-slate-500 mt-1">Revenue / Spend multiplier</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center justify-between text-violet-400 mb-2">
              <span className="text-[11px] font-mono text-slate-400">Net Ad Profit</span>
              <Wallet className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold font-mono text-slate-100">+${netProfit.toLocaleString()}</p>
            <p className="text-[10px] text-slate-500 mt-1">Gross margin before COGS</p>
          </div>
        </div>

        {/* Campaign Ingestion Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200">Multi-Channel Campaigns Ingestion</h3>
            <span className="text-xs text-slate-400 font-mono">{activeData.campaigns.length} Active Feeds</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950/70 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3">Channel</th>
                  <th className="px-5 py-3">Campaign</th>
                  <th className="px-5 py-3">Spend</th>
                  <th className="px-5 py-3">Revenue</th>
                  <th className="px-5 py-3">ROAS</th>
                  <th className="px-5 py-3">CPA</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {activeData.campaigns.map((c, i) => (
                  <tr key={i} className="hover:bg-slate-800/30 transition">
                    <td className="px-5 py-3 text-slate-300 font-sans">{c.channel}</td>
                    <td className="px-5 py-3 text-slate-200 font-sans font-medium">{c.campaign}</td>
                    <td className="px-5 py-3 text-slate-300">${c.spend.toLocaleString()}</td>
                    <td className="px-5 py-3 text-emerald-400">${c.revenue.toLocaleString()}</td>
                    <td className="px-5 py-3 text-cyan-300 font-bold">{c.roas}x</td>
                    <td className="px-5 py-3 text-slate-300">${c.cpa.toFixed(2)}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        c.status === "Active"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Strategic Audit Section */}
        {audit && (
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] uppercase font-mono px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                  {audit.executiveVerdict}
                </span>
                <h2 className="text-lg font-bold text-slate-100 mt-2">Executive CMO Strategy & Reallocation Audit</h2>
              </div>
              <button
                onClick={copyFullReport}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition border border-slate-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Report Copied" : "Copy Report"}
              </button>
            </div>

            {/* CMO Summary */}
            <div className="bg-slate-950/80 border border-slate-800/80 p-4 rounded-xl">
              <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1">Executive Commentary</span>
              <p className="text-xs text-slate-200 leading-relaxed">{audit.cmoSummary}</p>
            </div>

            {/* Budget Reallocations */}
            {audit.budgetReallocations && audit.budgetReallocations.length > 0 && (
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <ArrowRightLeft className="w-4 h-4" /> Capital Reallocation Recommendations
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {audit.budgetReallocations.map((b, idx) => (
                    <div key={idx} className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl text-xs space-y-2">
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-rose-400 line-through truncate max-w-[45%]">{b.fromCampaign}</span>
                        <span className="text-slate-500">→</span>
                        <span className="text-emerald-400 font-bold truncate max-w-[45%]">{b.toCampaign}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/60">
                        <span className="text-cyan-300 font-mono font-semibold">Shift: {b.shiftAmount}</span>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed">{b.rationale}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Wins & Action Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-2 text-xs">
                <span className="text-emerald-400 font-bold uppercase font-mono text-[10px] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Breakthrough Wins
                </span>
                <ul className="list-disc list-inside text-slate-300 space-y-1 text-[11px]">
                  {audit.strategicWins?.map((win, i) => (
                    <li key={i}>{win}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-2 text-xs">
                <span className="text-amber-400 font-bold uppercase font-mono text-[10px] flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" /> 7-Day Sprint Action Plan
                </span>
                <ul className="list-disc list-inside text-slate-300 space-y-1 text-[11px]">
                  {audit.immediateActionPlan?.map((plan, i) => (
                    <li key={i}>{plan}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}