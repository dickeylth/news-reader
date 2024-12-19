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
    const prompt = `
    请对以下内容进行摘要：

    ${content}

    要求：
    - 摘要应清晰简洁。
    - 使用准确的语言。
    - 以结构良好的段落呈现信息。
    - 突出主要观点，避免不必要的细节。
    `;
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

      const result = await response.json();
      return result.summary || "Failed to generate summary";
    } catch (error) {
      console.error('Error generating summary with Google Gemini:', error);
      return "Failed to generate summary";
    }
  }
}