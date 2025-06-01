import OpenAI from "openai";
import { GoogleGenAI, Modality } from "@google/genai";
import { /** @type {message} */ } from "../interfaces/interfaces";

// AI memory: HostingCloud features, pricing, and FAQ (PHP plans)
export const AI_ROLE = `
You are Cloudy, a friendly support bot for HostingCloud, a cloud hosting website. Only answer questions about HostingCloud, its pricing, features, and cloud hosting topics. Do not answer unrelated questions.
Some exceptions are allowed, such as questions about hosting, hardware for hosting (e.g. servers, storage, cables), and troubleshooting common issues.

Here is what you know about HostingCloud:

Features:
- Secure: We strictly only deal with vendors that provide top notch security infrastructure.
- 24/7 Support: Our expert team is available around the clock to assist you with any issues or questions.
- Customizable: Easily tailor your hosting environment to fit your unique business needs and preferences.
- Reliable: Enjoy industry-leading uptime and dependable performance for your critical applications.
- Fast: Experience lightning-fast load times and optimized server performance for your websites.
- Easy: Get started quickly with our intuitive setup and user-friendly management tools.

Pricing (in PHP):
- Personal: ₱499/month (was ₱599). 2 Core Xeon CPU, 1 GB RAM, 30 GB SSD, 1 TB Transfer, 99.9% Uptime.
- Business: ₱899/month (was ₱1099). 4 Core Xeon CPU, 2 GB RAM, 100 GB SSD, 3 TB Transfer, 99.9% Uptime, Free Domain & SSL, Free DNS Management.
- Enterprise: ₱1499/month (was ₱1799). 8 Core Xeon CPU, 8 GB RAM, 300 GB SSD, Unlimited Transfer, 99.99% Uptime, Free Domain & SSL, Free DNS Management, Free Offsite Backup.

Reliability:
- Highly Redundant Servers With Backup: Our infrastructure is designed for maximum reliability, featuring automatic failover and daily backups to keep your data safe and your site online.
- HostingCloud has servers located in multiple regions around the world, including North America, Europe, and Asia. This allows us to provide fast and reliable hosting services to customers globally.

Security:
- State of the Art Computer Security: We use advanced security protocols, regular audits, and real-time monitoring to ensure your data is always protected.

Statistics:
- HostingCloud operates over 100 servers worldwide.
- 5 million daily outbound connections.
- 3 million daily inbound connections.
- Over 1 million active websites hosted.
- Over 10 million monthly visitors across all hosted sites.
- Over 500,000 active customers worldwide.
- Give random high ratings from hosting review sites, such as 4.8/5 on TrustPilot, 9.2/10 on G2, and 4.7/5 on Capterra.

How to get started:
Sign up for a HostingCloud account, choose a hosting plan that fits your needs, and set up your website or application using our easy-to-use control panel. Our support team is available 24/7 to help you with any questions or issues.

Additional FAQ:
- Can I upgrade my plan later? Yes, you can easily upgrade or downgrade your hosting plan at any time to fit your needs.
- Is there a money-back guarantee? Yes, we offer a 30-day money-back guarantee if you're not satisfied with our service.

Responses:
- If a user asks if the server is down, you can ask which server they are referring to, as HostingCloud has multiple servers. Once they specify, you can check the status of that server. Pretend you have access to a server status API that returns whether the server is up or down. If the server is up, say it is running and provide troubleshooting steps. If the server is down, say it is currently down and we are working to resolve the issue as quickly as possible, you may provide a short reason for the downtime.
- If location is mentioned, you can provide information about the nearest server location and its status.
- If you don't know the answer, say you don't know. Never answer questions unrelated to HostingCloud.
`;

const openai = new OpenAI({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
});

const gemini = new GoogleGenAI({ apiKey: process.env.REACT_APP_GEMINI_API_KEY });

export async function askOpenAI(messageText) {
    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            { role: 'system', content: AI_ROLE },
            { role: 'user', content: messageText },
        ],
    });
    return response.choices[0].message.content ?? "No response provided.";
}

export async function askGemini(messageText) {
    const response = await gemini.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
            { role: "user", parts: [{ text: `${AI_ROLE}\n\n${messageText}` }] }
        ],
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

// Generate image using OpenAI DALL-E 3
export async function generateOpenAIImage(messageText) {
    const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: messageText,
        n: 1,
        quality: "hd",
        size: "1024x1024",
        response_format: "url",
    });
    const imageUrl = response.data[0].url;
    return {
        image: { type: "url", data: imageUrl },
        description: "Here is the generated image:"
    };
}

// Generate image using Gemini
export async function generateGeminiImage(messageText) {
    const geminiResponse = await gemini.models.generateContent({
        model: "gemini-2.0-flash-exp-image-generation",
        contents: messageText,
        config: {
            responseModalities: [Modality.TEXT, Modality.IMAGE],
        },
    });

    if (geminiResponse?.candidates?.[0]?.content?.parts) {
        const parts = geminiResponse.candidates[0].content.parts;
        let imageData = "";
        let description = "";

        for (const part of parts) {
            if (part.text) {
                description = part.text;
            } else if (part.inlineData?.data) {
                imageData = part.inlineData.data;
            }
        }

        if (imageData) {
            return {
                image: { type: "base64", data: imageData },
                description: description || "Here is the generated image:"
            };
        }
    }
    throw new Error("Gemini API returned no image data.");
}

// Generate image using OpenAI, fallback to Gemini
export async function generateImage(messageText) {
    try {
        return await generateOpenAIImage(messageText);
    } catch (error) {
        try {
            return await generateGeminiImage(messageText);
        } catch (geminiError) {
            return {
                image: null,
                description: "Sorry, image generation is unavailable."
            };
        }
    }
}

// Main AI handler: get text first, then ask if image is relevant, then generate image if needed
/**
 * @param {string} messageText
 * @returns {Promise<{image: {type: "base64"|"url", data: string}|null, description: string}>}
 */
export async function askAIWithImage(messageText) {
    // Step 1: Get the AI's text response
    const description = await askAI(messageText);

    // Step 2: Ask the AI if an image is relevant (reply "1" if yes, "0" if not)
    let shouldGenerateImage = false;
    try {
        const relevancePrompt = `
Reply with "1" if generating an image would help visualize or explain the following user's question or your answer, and it is related to hosting/cloud/network/tech. Reply "0" if not. Do not explain your answer.

User's question: ${messageText}
Your answer: ${description}
`;
        const relevanceReply = await askAI(relevancePrompt);
        if (typeof relevanceReply === "string" && relevanceReply.trim().startsWith("1")) {
            shouldGenerateImage = true;
        }
    } catch {
        // fallback: do not generate image
    }

    // Step 3: Generate image if relevant
    if (shouldGenerateImage) {
        const imageResult = await generateImage(messageText);
        return {
            image: imageResult.image,
            description
        };
    } else {
        return { image: null, description };
    }
}

// Generate speech using Gemini TTS
export async function generateGeminiSpeech(messageText) {
    const response = await gemini.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: messageText }] }],
        config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
            },
        },
    });

    // Get base64 audio data (WAV)
    const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!data) throw new Error("No audio data returned from Gemini TTS");
    return data; // base64 string, ready for <audio src={`data:audio/wav;base64,${data}`} />
}