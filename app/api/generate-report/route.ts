import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

function cleanAndParseJSON(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error("Could not parse valid JSON from AI response.");
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { clientName, niche, period, adSpend, revenue, leads, cpa, roas, notes } = body;

    const systemPrompt = `You are an elite Performance Marketing Agency Account Director writing a C-level executive client report.
Analyze the client's marketing campaign data and return ONLY a raw, strictly valid JSON object (no markdown quotes, no backticks, no preamble) matching this schema:
{
  "executiveSummary": "2-3 high-impact sentences summarizing the month's performance and bottom-line commercial impact.",
  "performanceVerdict": "Exceeded Targets" | "Profitable Scale" | "Requires Pivot",
  "kpiAnalysis": [
    {
      "metric": "ROAS / Revenue",
      "status": "Healthy / Needs Optimization",
      "commentary": "Actionable analytical insight on return on ad spend."
    },
    {
      "metric": "CPA & Acquisition Efficiency",
      "status": "Healthy / Needs Optimization",
      "commentary": "Insight into customer acquisition cost vs targets."
    }
  ],
  "strategicWins": [
    "Key campaign win or creative breakout from this period"
  ],
  "nextMonthActionPlan": [
    "Specific tactical action planned for next sprint to improve profitability"
  ]
}`;

    const userPrompt = `Client: ${clientName || "Brand Client"}
Niche: ${niche || "Direct-to-Consumer"}
Period: ${period || "Monthly"}
Total Ad Spend: $${adSpend || "0"}
Generated Revenue: $${revenue || "0"}
Total Leads / Purchases: ${leads || "0"}
Cost Per Acquisition (CPA): $${cpa || "0"}
Blended ROAS: ${roas || "0"}x
Agency Notes: ${notes || "Scale winning ad sets and refine landing page conversion."}

Synthesize this data into an executive board-level report. Return strictly raw JSON.`;

    // Fetch dynamic models
    const modelListRes = await groq.models.list();
    const candidateIds = modelListRes.data
      .map((m: any) => m.id)
      .filter((id: string) => {
        const lower = id.toLowerCase();
        return (
          !lower.includes("whisper") &&
          !lower.includes("guard") &&
          !lower.includes("vision") &&
          !lower.includes("safeguard") &&
          !lower.includes("canopy") &&
          !lower.includes("orpheus") &&
          !lower.includes("tts") &&
          !lower.includes("audio")
        );
      });

    const priorityList = [
      "llama-3.1-8b-instant",
      "llama-3.3-70b-versatile",
      "llama-3.2-3b-preview",
      ...candidateIds,
    ];

    const availableToTry = Array.from(
      new Set(priorityList.filter((p) => candidateIds.includes(p)))
    );

    let completion = null;
    let lastError: any = null;

    for (const model of availableToTry) {
      try {
        completion = await groq.chat.completions.create({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          model: model,
          temperature: 0.4,
        });

        if (completion?.choices[0]?.message?.content) {
          break;
        }
      } catch (err: any) {
        lastError = err;
      }
    }

    const responseContent = completion?.choices[0]?.message?.content || "";
    if (!responseContent) {
      throw lastError || new Error("No response from Groq models");
    }

    const parsedData = cleanAndParseJSON(responseContent);
    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error("Report Generation Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate executive report" },
      { status: 500 }
    );
  }
}