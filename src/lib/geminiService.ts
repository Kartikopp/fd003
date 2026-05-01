import { GoogleGenAI } from "@google/genai";
import { Stock } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function getInvestmentAdvice(watchlist: Stock[], recentNews: string[]) {
  if (!process.env.GEMINI_API_KEY) {
    return "AI advice is currently unavailable. Please check your API key.";
  }

  const model = "gemini-3-flash-preview";
  const prompt = `
    You are an expert financial advisor for "Finance Dastak". 
    Based on the following watchlist of stocks and recent news, provide a concise (max 150 words) 
    personalized investment analysis and advice.
    
    Watchlist:
    ${watchlist.map(s => `${s.symbol} ($${s.price}, ${s.changePercent}%)`).join('\n')}
    
    Recent News:
    ${recentNews.join('\n')}
    
    Focus on actionable insights and potential risks.
  `;

  try {
    const result = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return result.text || "I'm sorry, I couldn't generate advice at this time.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating AI advice. Market volatility might be affecting my circuits!";
  }
}
