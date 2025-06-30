// // backend/routes/llm.js
// import express from 'express';
// const router = express.Router();
// import fetch from 'node-fetch';

// router.post('/generate-question', async (req, res) => {
//   const { category } = req.body;

//   const prompt = `
// Generate ONE multiple-choice question from the "${category}" category.

// Respond ONLY with JSON in this format:
// {
//   "question": "....",
//   "options": ["A) ....", "B) ....", "C) ....", "D) ...."],
//   "correctAnswer": 0,
//   "explanation": "...."
// }
// `;

//   try {
//     const response = await fetch('http://localhost:11434/api/generate', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         model: 'mistral',
//         prompt: prompt,
//         stream: false
//       })
//     });

//     const data = await response.json();

//     // Safely extract first valid JSON object using regex
//     const jsonMatch = data.response.match(/\{[\s\S]*?\}/);
//     if (!jsonMatch) {
//       return res.status(500).json({ error: 'No valid JSON found in LLM response' });
//     }

//     let parsed;
//     try {
//       parsed = JSON.parse(jsonMatch[0]);
//     } catch (err) {
//       console.error("❌ JSON parse failed:", err);
//       return res.status(500).json({ error: 'Invalid JSON structure from LLM' });
//     }

//     // Optional validation
//     if (
//       typeof parsed.question !== 'string' ||
//       !Array.isArray(parsed.options) ||
//       typeof parsed.correctAnswer !== 'number'
//     ) {
//       return res.status(500).json({ error: 'Incomplete question format' });
//     }

//     res.json(parsed);
//   } catch (err) {
//     console.error("🔥 LLM error:", err);
//     res.status(500).json({ error: 'Failed to generate question' });
//   }
// });

// export default router;







// routes/llmRoute.js
import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

router.post('/generate-question', async (req, res) => {
  const { category } = req.body;

  const API_KEY = process.env.GEMINI_API_KEY;
  const URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${API_KEY}`;

  try {
    const randomNoise = Math.random().toString(36).substring(2, 7);
    const prompt = `
      Generate one unique multiple-choice question in the category "${category}".
      Avoid repeating common examples. Add randomness. ID: ${randomNoise}
      Format:
      {
        "question": "string",
        "options": ["option1", "option2", "option3", "option4"],
        "correctAnswer": 2
      }
    `;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.9,
        topP: 0.95,
        topK: 40,
        candidateCount: 1
      }
    };

    const response = await axios.post(URL, payload);
    const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    console.log("🔎 Raw Gemini response:\n", text);

    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    const jsonString = text.slice(jsonStart, jsonEnd);

    const parsed = JSON.parse(jsonString);
    res.json(parsed);
  } catch (err) {
    console.error("🔥 Gemini REST error:", err?.response?.data || err.message);
    res.status(500).json({ error: "Gemini REST API failed" });
  }
});


export default router;
