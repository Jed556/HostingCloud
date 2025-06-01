import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";

const openai = new OpenAI({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
});

const gemini = new GoogleGenAI({ apiKey: process.env.REACT_APP_GEMINI_API_KEY });

export async function askOpenAI(messageText) {
    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: messageText },
        ],
    });
    return response.choices[0].message.content ?? "No response provided.";
}

export async function askGemini(messageText) {
    const response = await gemini.models.generateContent({
        model: "gemini-2.0-flash",
        contents: messageText,
    });
    return response.text || "No response provided by Gemini.";
}

// Helper: Try OpenAI, fall back to Gemini if OpenAI fails
export async function askAI(messageText) {
    try {
        return await askOpenAI(messageText);
    } catch (err) {
        try {
            return await askGemini(messageText);
        } catch {
            return "Sorry, AI is unavailable.";
        }
    }
}
