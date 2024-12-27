import type { GenerativeModel } from "@google/generative-ai";
import { GoogleGenerativeAI } from "@google/generative-ai";

// AI Summary Service Interface
export interface AISummaryService {
  summarize(text: string): Promise<string>;
}

// Google Gemini Implementation
export class GeminiService implements AISummaryService {
  private model: GenerativeModel;

  constructor(apiKey: string) {
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async summarize(text: string): Promise<string> {
    try {
      const result = await this.model.generateContent(`
        请总结以下评论的主要观点：
        ${text}
      `);

      const summary = result.response.text();

      if (!summary || summary.trim().length === 0) {
        throw new Error("AI 生成的摘要为空");
      }

      return summary;
    } catch (error) {
      throw new Error(
        `生成摘要失败: ${error instanceof Error ? error.message : "未知错误"}`
      );
    }
  }
}
