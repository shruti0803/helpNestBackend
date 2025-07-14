// controllers/chatbot.js
import axios from 'axios';

const GEMINI_API_KEY = 'AIzaSyCRymUERA_7lw-bUvsQTu0x4Gg4IP2NLR8';

export const medicalChatbot = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { question } = req.body;

  if (!question || question.trim() === '') {
    return res.status(400).json({ error: 'Question is required' });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            role: 'user',
            parts: [
              {
               text: `
You are a helpful and safe medical assistant.
You ONLY answer general health-related questions (like symptoms, precautions, medicines, nutrition, etc.).
If the user asks anything outside of general medical help — such as personal, financial, tech, or unrelated topics — respond strictly with:

"I'm here to assist only with general medical questions. Please ask something health-related."

Do NOT attempt to answer unrelated queries.

User: ${question}`

              }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
         signal: controller.signal
      }
    );
    clearTimeout(timeout);
    const answer = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!answer) {
      return res.status(500).json({ error: 'Empty response from Gemini' });
    }

    return res.status(200).json({ answer });
  } catch (err) {
    console.error('Gemini API Error:', JSON.stringify(err.response?.data || err.message, null, 2));
    return res.status(500).json({ error: 'Gemini API failed' });
  }
};
