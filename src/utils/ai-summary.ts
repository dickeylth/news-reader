import type { GenerativeModel } from '@google/generative-ai';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

  async summarize(content: string): Promise<string> {
    const prompt = `请对以下评论内容进行摘要总结。要求：
1. 使用中文回复
2. 总结要简洁精炼，不超过100字
3. 结构要清晰，重点突出
4. 保持客观中立的语气
5. 如果评论中有多个不同观点，请分点列出主要观点

以下是需要总结的评论内容：

${content}`;

    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Error generating summary with Google Gemini:', error);
      return "Failed to generate summary";
    }
  }
}