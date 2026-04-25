import { GoogleGenAI, Type as SchemaType } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export const PROFILES = {
  hiv: {
    label: "HIV+/AIDS",
    extra_rules: [
      "Flag any raw or undercooked protein — listeria and salmonella are life-threatening",
      "Flag grapefruit and pomelo — interacts with ARV medications (Ritonavir, Lopinavir)",
      "Flag raw sprouts, raw shellfish, runny eggs",
      "In Filipino context: kinilaw, balut, burong isda are AVOID"
    ]
  },
  chemo: {
    label: "Chemotherapy",
    extra_rules: [
      "Flag mold-ripened and soft cheeses",
      "Flag deli meats unless labeled reheated",
      "Flag raw or undercooked proteins",
      "In Filipino context: kinilaw, balut, raw oysters are AVOID"
    ]
  },
  transplant: {
    label: "Organ Transplant",
    extra_rules: [
      "Flag grapefruit — interacts with cyclosporine and tacrolimus",
      "Flag all raw proteins and unpasteurized products",
      "Flag high-potassium foods if on cyclosporine: banana, kamote, avocado"
    ]
  },
  general: {
    label: "Gen. Immunocompromised",
    extra_rules: [
      "Apply standard immunocompromised food safety rules",
      "Flag raw proteins, unpasteurized products, raw sprouts, runny eggs"
    ]
  }
};

export interface AnalysisResult {
  risk_level: "ALLOWED" | "CAUTION" | "AVOID";
  summary: string;
  flagged_items: {
    ingredient: string;
    reason: string;
    severity: "HIGH" | "MEDIUM";
  }[];
  safe_alternatives: string[];
  disclaimer: string;
}

export async function analyzeFood(profileKey: keyof typeof PROFILES, contents: any[]): Promise<AnalysisResult> {
  const profile = PROFILES[profileKey];
  const systemInstruction = `You are ImmunoGuard PH — a food safety assistant for immunocompromised individuals in the Philippines.
The user has: ${profile.label}

SPECIAL RULES FOR THIS USER:
${profile.extra_rules.map(r => '- ' + r).join('\n')}

UNIVERSAL RULES:
- AVOID: raw or undercooked meat, poultry, seafood
- AVOID: unpasteurized dairy, soft cheeses (brie, camembert, blue cheese)
- AVOID: raw sprouts, raw shellfish, runny eggs, unpasteurized juices
- CAUTION: street food with unknown preparation method
- ALLOWED: fully cooked proteins, pasteurized dairy, well-cooked vegetables
- Be mindful of cross-contamination risks realistically for street foods.

Analyze the user's input (image of food, ingredients, or dish name). Determine the risk level based on the rules.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.1,
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            risk_level: { type: SchemaType.STRING, enum: ["ALLOWED", "CAUTION", "AVOID"] },
            summary: { type: SchemaType.STRING, description: "One sentence verdict explanation" },
            flagged_items: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  ingredient: { type: SchemaType.STRING },
                  reason: { type: SchemaType.STRING },
                  severity: { type: SchemaType.STRING, enum: ["HIGH", "MEDIUM"] }
                }
              }
            },
            safe_alternatives: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING }
            },
            disclaimer: { type: SchemaType.STRING }
          },
          required: ["risk_level", "summary", "flagged_items", "safe_alternatives", "disclaimer"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from AI model.");
    }

    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Error analyzing food:", error);
    throw error;
  }
}
