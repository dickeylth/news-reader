import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export async function summarizeComment(text: string): Promise<string> {
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that summarizes comments concisely."
        },
        {
          role: "user",
          content: `Please summarize this comment in one short sentence: ${text}`
        }
      ],
      max_tokens: 60,
      temperature: 0.7,
    });

    return response.data.choices[0]?.message?.content || "No summary available";
  } catch (error) {
    console.error('Error generating summary:', error);
    return "Failed to generate summary";
  }
}
