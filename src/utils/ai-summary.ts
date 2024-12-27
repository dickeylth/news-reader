// AI Summary Service Interface
export interface AISummaryService {
  summarize(text: string): Promise<string>;
}

// Google Gemini Implementation
export class GeminiService implements AISummaryService {
  private apiKey: string;

  constructor(apiKey?: string) {
    if (!apiKey) {
      throw new Error('API key is required for Google Gemini.');
    }
    this.apiKey = apiKey;
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
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        }),
      });

      // 读取响应文本
      const text = await response.text();
      const result = JSON.parse(text);
      return result.candidates?.[0]?.content?.parts?.[0]?.text || "Failed to generate summary";
    } catch (error) {
      console.error('Error generating summary with Google Gemini:', error);
      return "Failed to generate summary";
    }
  }
}