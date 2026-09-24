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
      return JSON.parse(text.substring(firstBrace, lastBrace + 1));
    }
    throw new Error("Could not parse valid JSON from AI response.");
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { clientName, campaigns, totalSpend, totalRevenue, blendedRoas, netProfit } = body;

    const systemPrompt = `You are an elite Performance Marketing CMO and Media Buying Director analyzing omnichannel ad spend.
Analyze the client's campaign data and return ONLY a raw JSON object strictly adhering to this schema:
{
  "executiveVerdict": "Profitable Scale / Budget Reallocation Required",
  "cmoSummary": "2-3 sharp direct-response sentences explaining why this performance occurred and where efficiency is leaking.",
  "budgetReallocations": [
    {
      "fromCampaign": "Specific low-performing campaign name",
      "toCampaign": "High ROAS winning campaign name",
      "shiftAmount": "$1,000 - $2,500/mo",
      "rationale": "Clear ROAS and CPA justification for moving this budget."
    }
  ],
  "strategicWins": [
    "Key performance win or winning creative angle"
  ],
  "immediateActionPlan": [
    "High-impact execution step for the upcoming 7-day sprint"
  ]
}`;

    const userPrompt = `Client: ${clientName || "E-Commerce Client"}
Total Ad Spend: $${totalSpend}
Attributed Revenue: $${totalRevenue}
Blended ROAS: ${blendedRoas}x
Net Ad Profit: $${netProfit}

Active Campaigns:
${JSON.stringify(campaigns, null, 2)}

Provide the executive CMO audit and budget reallocation matrix. Return strictly raw JSON.`;

    // Fetch active production models
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
        console.warn(`Groq model ${model} failed, trying next...`);
      }
    }

    const responseContent = completion?.choices[0]?.message?.content || "";
    if (!responseContent) {
      throw lastError || new Error("No response from Groq models");
    }

    const parsedData = cleanAndParseJSON(responseContent);
    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error("Audit Generation Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate strategic audit" },
      { status: 500 }
    );
  }
}