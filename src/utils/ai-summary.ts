import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiService {
  private model;

  constructor(apiKey: string) {
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async summarize(text: string): Promise<string> {
    try {
      const prompt = `请对以下内容进行摘要总结。要求：
1. 使用中文回复
2. 总结要简洁精炼，不超过300字
3. 结构要清晰，重点突出
4. 保持客观中立的语气
5. 如果内容中有多个不同观点，请分点列出主要观点，并按照「**{观点}**：{详细描述}」的格式输出
6. 确保输出是合法的 markdown 格式，在标记语法如 \`**\`、\`*\` 与前后文本之间加上空格分隔，比如「**title** description」
以下是需要总结的内容：
${text}`;

      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('生成摘要失败:', error);
      throw error;
    }
  }
}
