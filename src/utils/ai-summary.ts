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
      const prompt = `请对以下评论内容进行摘要总结。要求：
1. 使用中文回复
2. 总结要简洁精炼，不超过300字
3. 结构要清晰，重点突出
4. 保持客观中立的语气
5. 如果评论中有多个不同观点，请分点列出主要观点，并确保观点的标题和描述之间有空格分隔
6. 确保输出是合法的 markdown 格式，在标记语法和文本之间有空格分隔
以下是需要总结的评论内容：
${text}`;

      const result = await this.model.generateContent(prompt);

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
