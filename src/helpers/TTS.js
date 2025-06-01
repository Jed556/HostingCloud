import { generateGeminiSpeech as TTS } from "./ChatAPI";

/**
 * Speak a message using Gemini TTS if available, otherwise fallback to built-in TTS.
 * Strips markdown for built-in TTS.
 * @param {object} msg - message object with .role and .content
 */
export async function speakMessage(msg) {
    let prefix = "";
    if (msg.role === "assistant") prefix = "Cloudy replied: ";
    else if (msg.role === "user") prefix = "You said: ";
    else prefix = "";

    // Remove markdown formatting for built-in TTS
    let plainText = (msg.content || "")
        .replace(/[*_`>#-]/g, "")
        .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
        .replace(/!\[(.*?)\]\((.*?)\)/g, "")
        .replace(/^\s*\d+\.\s+/gm, "")
        .replace(/^\s*[-+*]\s+/gm, "")
        .replace(/#+\s?/g, "")
        .replace(/<\/?[^>]+(>|$)/g, "")
        .replace(/\n+/g, " ")
        .replace(/₱/g, "PHP ") // replace peso sign with words
        .trim();

    // Uncomment below to use Gemini TTS (if desired)
    // try {
    //     const audioBase64 = await TTS(`${prefix}${plainText}`);
    //     if (audioBase64) {
    //         const audio = new window.Audio(`data:audio/wav;base64,${audioBase64}`);
    //         audio.currentTime = 0;
    //         audio.play().catch(() => {
    //             audio.load();
    //             audio.play();
    //         });
    //         return;
    //     }
    // } catch (err) {
    //     // fallback to built-in TTS if Gemini fails
    // }

    // Built-in browser TTS fallback
    const utter = new window.SpeechSynthesisUtterance(prefix + plainText);
    utter.lang = "en-US";
    window.speechSynthesis.speak(utter);
}
