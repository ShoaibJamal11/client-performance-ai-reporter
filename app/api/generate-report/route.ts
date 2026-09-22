import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-3.6-flash",
  generationConfig: {
    responseMimeType: "application/json",
  },
  systemInstruction: `You are an elite Senior Chief Marketing Officer (CMO) and Growth Strategist for high-growth DTC brands and B2B enterprises.
Your goal is to analyze multi-channel advertising performance data (Meta Ads, Google Ads, TikTok Ads) and produce an authoritative, data-backed monthly performance audit.

You MUST return strictly valid JSON matching this schema:
{
  "executiveSummary": "A concise 3-4 sentence high-level executive breakdown of overall marketing efficiency, blended ROAS, and revenue impact.",
  "channelBreakdown": [
    {
      "channel": "Meta Ads / Google Ads / TikTok Ads",
      "verdict": "SCALING | OPTIMIZING | BLEEDING",
      "commentary": "2-sentence strategic rationale based on CPA, CTR, and ROAS."
    }
  ],
  "winningCampaigns": [
    {
      "name": "Campaign Name",
      "insight": "Why this creative/audience combination outperformed and how to capitalize."
    }
  ],
  "bleedingCampaigns": [
    {
      "name": "Campaign Name",
      "criticalIssue": "Exact bottleneck (creative fatigue, high CPM, poor conversion rate) and immediate mitigation."
    }
  ],
  "actionPlanNextMonth": [
    {
      "priority": "HIGH | MEDIUM | LOW",
      "initiative": "Title of growth initiative",
      "budgetAdjustment": "e.g. +25% Budget Reallocation from X to Y",
      "expectedImpact": "Projected outcome e.g. 15% reduction in blended CAC"
    }
  ]
}`
});

export async function POST(req: Request) {
  try {
    const { clientName, auditMonth, totalSpend, totalRevenue, blendedRoas, campaigns } = await req.json();

    const prompt = `Client: ${clientName}
Audit Period: ${auditMonth}
Total Ad Spend: $${totalSpend}
Attributed Revenue: $${totalRevenue}
Blended ROAS: ${blendedRoas}x

Campaign Level Breakdown:
${JSON.stringify(campaigns, null, 2)}

Provide a rigorous CMO-level marketing performance audit and actionable next-month roadmap.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsedData = JSON.parse(responseText);

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error("Report generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate marketing intelligence report" },
      { status: 500 }
    );
  }
}