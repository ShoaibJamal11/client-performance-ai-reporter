import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

function cleanAndParseJSON(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      const jsonCandidate = text.substring(firstBrace, lastBrace + 1);
      return JSON.parse(jsonCandidate);
    }
    throw new Error("Could not parse valid JSON from AI response.");
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { clientName, niche, period, adSpend, revenue, leads, cpa, roas, notes } = body;

    const systemPrompt = `You are a Principal Performance Marketing Director writing an executive C-level monthly report.
You must respond ONLY with a strictly valid JSON object matching this schema:
{
  "executiveSummary": "2-3 high-impact sentences summarizing the month's performance and commercial profit impact.",
  "performanceVerdict": "Exceeded Targets",
  "kpiAnalysis": [
    {
      "metric": "ROAS & Attribution",
      "status": "Healthy",
      "commentary": "Short clear performance breakdown."
    },
    {
      "metric": "CPA & Acquisition Cost",
      "status": "Optimizing",
      "commentary": "Cost efficiency feedback."
    }
  ],
  "strategicWins": [
    "Winning creative or funnel scaling breakthrough"
  ],
  "nextMonthActionPlan": [
    "High-impact operational next step"
  ]
}`;

    const userPrompt = `Client: ${clientName || "DTC Beauty Brand"}
Niche: ${niche || "Skincare"}
Period: ${period || "Monthly"}
Total Ad Spend: $${adSpend || "16500"}
Generated Revenue: $${revenue || "57960"}
Total Purchases: ${leads || "1200"}
CPA: $${cpa || "13.75"}
Blended ROAS: ${roas || "3.51"}x
Notes: ${notes || "Scale high-performing Meta UGC sets and expand to Google Search."}`;

    // Available models ko fetch karein
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
          temperature: 0.3,
          max_tokens: 2048,
          response_format: { type: "json_object" },
        });

        if (completion?.choices[0]?.message?.content) {
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Groq model ${model} failed, trying next candidate...`);
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