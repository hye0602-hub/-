import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export async function generateSleepFeedback(durationHours: number, score: number): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `사용자가 ${durationHours.toFixed(1)}시간 동안 수면을 취했으며, 수면 점수는 ${score}점입니다. 
      이에 대해 따뜻하고 전문적인 말투로 짧은 수면 피드백을 제공해주세요. 
      팁을 하나 포함시켜주세요. 한국어로 작성해주세요.`,
    });
    return response.text || "수면 정보를 분석할 수 없습니다.";
  } catch (error) {
    console.error("AI Feedback error:", error);
    return "수면 정보를 분석하는 중 오류가 발생했습니다.";
  }
}
