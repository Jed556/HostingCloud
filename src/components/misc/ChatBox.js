import React, { useEffect, useRef, useState } from "react";
import tw from "twin.macro";
import {
    PRIMARY_HEX,
    DEFAULT_WIDTH,
    DEFAULT_HEIGHT,
    MIN_WIDTH,
    MIN_HEIGHT,
    getInitialBoxSize,
    isResizingHandle
} from "../../helpers/chatboxHelpers";
import { askAIWithImage as askAI, generateGeminiSpeech as TTS } from "../../helpers/ChatAPI";
// import { askAI as askAI } from "../../helpers/ChatAPI";
import { marked } from "marked";
import { v4 as uuidv4 } from "uuid";
import { /** @type {message} */ } from "../../interfaces/interfaces";
import { FaVolumeUp } from "react-icons/fa";

const ChatBoxContainer = tw.div`
  absolute z-50 flex flex-col border
  p-0 overflow-hidden
  rounded-2xl shadow-2xl
  bg-white
`;

const ChatHeader = tw.div`
  flex items-center justify-between px-6 py-4 border-b
  rounded-t-2xl
`;

const ChatTitle = tw.span`
  font-bold text-lg tracking-wide
`;

const ChatClose = tw.button`
  ml-2 px-2 py-1 rounded text-xl font-bold transition
`;

const ChatBody = tw.div`
  flex-1 overflow-y-auto text-sm px-6 py-4
`;

const ChatInputContainer = tw.div`
  px-4 py-3 border-t bg-white rounded-b-2xl
`;

const ChatInput = tw.textarea`
  w-full px-4 py-2 border focus:outline-none transition
  resize-none
  leading-snug
  min-h-[40px]
  overflow-hidden
  break-words
  bg-[#f3f0fa]
`;

const CHAT_HISTORY_KEY = "cloudy_chat_history";

const ChatBox = ({
    onClose,
    style,
    children,
    width = DEFAULT_WIDTH,
    height = DEFAULT_HEIGHT,
    minWidth = MIN_WIDTH,
    minHeight = MIN_HEIGHT,
    setSize, // optional callback for parent to track size
    ...props
}) => {
    const ref = useRef();
    const chatBodyRef = useRef();
    /** @type {React.MutableRefObject<message[]>} */
    const [messages, setMessages] = useState([
        {
            id: uuidv4(),
            content: "Hello! How can I help you?",
            role: "assistant",
            createdAt: new Date().toISOString()
        }
    ]);
    const [input, setInput] = useState("");
    const [boxSize, setBoxSize] = useState(
        getInitialBoxSize({ width, height, minWidth, minHeight })
    );
    const [inputAnimated, setInputAnimated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Animate in on mount
    useEffect(() => {
        if (ref.current) {
            ref.current.style.transition = "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1)";
            ref.current.style.transform = "translateY(30px)";
            ref.current.style.opacity = "0";
            setTimeout(() => {
                if (ref.current) {
                    ref.current.style.transform = "translateY(0)";
                    ref.current.style.opacity = "1";
                }
            }, 10);
        }
    }, []);

    // No close animation, just call onClose immediately
    const handleClose = () => {
        if (onClose) onClose();
    };

    // Load chat history from localStorage on mount (after clearing)
    useEffect(() => {
        const saved = localStorage.getItem(CHAT_HISTORY_KEY);
        if (saved) {
            try {
                /** @type {message[]} */
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setMessages(parsed);
                }
            } catch { }
        }
    }, []);

    // Save chat history to localStorage on every message change
    useEffect(() => {
        localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
    }, [messages]);

    // Handle sending a message
    const handleSend = async () => {
        if (input.trim() === "" || isLoading) return;
        const userMsg = {
            id: uuidv4(),
            content: input,
            role: "user",
            createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            let aiResult = await askAI(userMsg.content);
            const botMsg = {
                id: uuidv4(),
                content: aiResult.description,
                role: "assistant",
                createdAt: new Date().toISOString(),
                ...(aiResult.image ? { image: aiResult.image } : {})
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (err) {
            const errorMsg = {
                id: uuidv4(),
                content: "Sorry, AI is unavailable.",
                role: "error",
                createdAt: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Enter key
    const handleInputKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSend();
        }
        if (input.length >= 400 && !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key) && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
        }
    };

    // Handle resizing
    const handleResize = (e, { size }) => {
        setBoxSize(size);
        if (setSize) setSize(size);
    };

    // Animate input area when typing starts or stops
    useEffect(() => {
        if (input.length > 0) {
            setInputAnimated(true);
        } else {
            setInputAnimated(false);
        }
    }, [input]);

    // Auto-grow textarea height as user types, allow continuous growth (no max)
    const inputRef = useRef();

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = "40px";
            inputRef.current.style.height = inputRef.current.scrollHeight + "px";
        }
    }, [input]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages]);

    // Clear chat history on first site load
    useEffect(() => {
        localStorage.removeItem(CHAT_HISTORY_KEY);
    }, []);

    // TTS function
    async function speakMessage(msg) {
        let prefix = "";
        if (msg.role === "assistant") prefix = "Cloudy replied: ";
        else if (msg.role === "user") prefix = "You said: ";
        else prefix = "";
        const utter = new window.SpeechSynthesisUtterance(prefix + (msg.content || ""));
        utter.lang = "en-US";
        window.speechSynthesis.speak(utter);
        // try {
        //     const audioBase64 = await TTS(`${prefix}${msg.content}`);
        //     if (audioBase64) {
        //         const audio = new window.Audio(`data:audio/wav;base64,${audioBase64}`);
        //         // Pause any currently playing speech
        //         if (!audio.paused) audio.pause();
        //         audio.currentTime = 0;
        //         audio.play().catch(() => {
        //             // fallback: try to reload and play again
        //             audio.load();
        //             audio.play();
        //         });
        //     }
        // } catch (err) {
        //     // fallback to built-in TTS if Gemini fails
        //     const utter = new window.SpeechSynthesisUtterance(prefix + (msg.content || ""));
        //     utter.lang = "en-US";
        //     window.speechSynthesis.speak(utter);
        // }
    }

    return (
        <ChatBoxContainer
            ref={ref}
            style={{
                borderColor: PRIMARY_HEX,
                width: boxSize.width,
                height: boxSize.height,
                minWidth: minWidth,
                minHeight: minHeight,
                resize: "both",
                overflow: "auto",
                ...style
            }}
            {...props}
            // Allow user to resize the chatbox
            contentEditable={false}
            onMouseDown={e => {
                // Prevent drag from parent if resizing
                if (isResizingHandle(e, boxSize)) {
                    e.stopPropagation();
                }
            }}
        >
            <ChatHeader
                style={{
                    background: `linear-gradient(90deg, ${PRIMARY_HEX} 0%, #5f2eea 100%)`,
                    borderColor: PRIMARY_HEX
                }}
            >
                <ChatTitle style={{ color: "#fff" }}>💬 Cloudy</ChatTitle>
                <ChatClose
                    onClick={handleClose}
                    aria-label="Close"
                    style={{
                        color: "#fff",
                        background: "rgba(60,13,153,0.08)"
                    }}
                    onMouseOver={e => e.currentTarget.style.background = "rgba(60,13,153,0.15)"}
                    onMouseOut={e => e.currentTarget.style.background = "rgba(60,13,153,0.08)"}
                >×</ChatClose>
            </ChatHeader>
            <ChatBody
                ref={chatBodyRef}
                style={{ color: PRIMARY_HEX, background: "#f3f0fa" }}
            >
                {messages.map((msg, idx) => (
                    <div
                        key={msg.id || idx}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                            marginBottom: "0.5rem",
                            width: "100%"
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                width: "auto",
                                maxWidth: "100%",
                                // Remove justifyContent to avoid extra left padding
                            }}
                        >
                            {msg.role === "user" && (
                                <>
                                    <button
                                        aria-label="Play message"
                                        onClick={() => speakMessage(msg)}
                                        style={{
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            marginRight: 8,
                                            color: "#888",
                                            display: "flex",
                                            alignItems: "center",
                                            fontSize: "1.1rem"
                                        }}
                                        tabIndex={0}
                                    >
                                        <FaVolumeUp />
                                    </button>
                                    <span
                                        style={{
                                            background: PRIMARY_HEX,
                                            color: "#fff",
                                            padding: "0.5rem 0.75rem",
                                            borderRadius: "1rem",
                                            display: "inline-block",
                                            marginBottom: "0.1rem",
                                            maxWidth: "75%",
                                            wordBreak: "break-word",
                                            marginLeft: "auto"
                                        }}
                                    >
                                        {msg.content}
                                    </span>
                                </>
                            )}
                            {(msg.role === "assistant" || msg.role === "error") && (
                                <>
                                    <span
                                        style={{
                                            background: "#ede7f6",
                                            color: PRIMARY_HEX,
                                            padding: "0.5rem 0.75rem",
                                            borderRadius: "1rem",
                                            display: "inline-block",
                                            marginBottom: "0.1rem",
                                            maxWidth: "75%",
                                            wordBreak: "break-word"
                                            // Removed any marginLeft here
                                        }}
                                    >
                                        {msg.image && msg.image.type === "url" && (
                                            <img
                                                src={msg.image.data}
                                                alt="AI generated"
                                                style={{ maxWidth: "100%", borderRadius: "0.75rem", marginBottom: 8 }}
                                            />
                                        )}
                                        {msg.image && msg.image.type === "base64" && (
                                            <img
                                                src={`data:image/png;base64,${msg.image.data}`}
                                                alt="AI generated"
                                                style={{ maxWidth: "100%", borderRadius: "0.75rem", marginBottom: 8 }}
                                            />
                                        )}
                                        <span dangerouslySetInnerHTML={{ __html: marked.parse(msg.content) }} />
                                    </span>
                                    <button
                                        aria-label="Play message"
                                        onClick={() => speakMessage(msg)}
                                        style={{
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            marginLeft: 8,
                                            color: "#888",
                                            display: "flex",
                                            alignItems: "center",
                                            fontSize: "1.1rem"
                                        }}
                                        tabIndex={0}
                                    >
                                        <FaVolumeUp />
                                    </button>
                                </>
                            )}
                        </div>
                        <span
                            style={{
                                fontSize: "0.75rem",
                                color: "#888",
                                marginTop: "0.15rem",
                                marginLeft: msg.role === "user" ? "auto" : 0,
                                marginRight: msg.role === "user" ? 0 : "auto",
                                paddingLeft: "0.25rem",
                                paddingRight: "0.25rem"
                            }}
                        >
                            {msg.createdAt && new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                ))}
                {children}
            </ChatBody>
            <ChatInputContainer
                style={{
                    borderColor: PRIMARY_HEX,
                    background: "#fff",
                }}
            >
                <div
                    style={{
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                        minHeight: "40px",
                        height: "auto"
                    }}
                >
                    <ChatInput
                        ref={inputRef}
                        rows={1}
                        placeholder="Type your message…"
                        value={input}
                        maxLength={400}
                        onChange={e => setInput(e.target.value.slice(0, 400))}
                        onKeyDown={handleInputKeyDown}
                        style={{
                            borderColor: PRIMARY_HEX,
                            background: "#f3f0fa",
                            color: PRIMARY_HEX,
                            paddingRight: "44px",
                            width: "100%",
                            boxSizing: "border-box",
                            transition: "border-color 0.2s, background 0.2s, color 0.2s",
                            resize: "none",
                            lineHeight: "1.4",
                            display: "block",
                            minHeight: "40px",
                            overflow: "hidden",
                            wordBreak: "break-word",
                            borderRadius: inputRef.current && inputRef.current.scrollHeight > 56
                                ? "1.5rem"
                                : "9999px"
                        }}
                    />
                    <button
                        onClick={handleSend}
                        aria-label="Send"
                        style={{
                            position: "absolute",
                            right: "8px",
                            top: "50%",
                            transform: `translateY(-50%) scale(${inputAnimated ? 1 : 0})`,
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            background: PRIMARY_HEX,
                            color: "#fff",
                            border: "none",
                            outline: "none",
                            cursor: inputAnimated ? "pointer" : "default",
                            boxShadow: "0 2px 8px rgba(60,13,153,0.10)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "background 0.2s, box-shadow 0.2s, transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)"
                        }}
                        onMouseOver={e => {
                            if (inputAnimated) {
                                e.currentTarget.style.background = "#5f2eea";
                                e.currentTarget.style.boxShadow = "0 4px 16px rgba(95,46,234,0.18)";
                            }
                        }}
                        onMouseOut={e => {
                            e.currentTarget.style.background = PRIMARY_HEX;
                            e.currentTarget.style.boxShadow = "0 2px 8px rgba(60,13,153,0.10)";
                        }}
                        tabIndex={inputAnimated ? 0 : -1}
                        disabled={!inputAnimated}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24">
                            <path d="M3 20v-6l13-2-13-2V4l19 8-19 8z" fill="currentColor" />
                        </svg>
                    </button>
                </div>
            </ChatInputContainer>
        </ChatBoxContainer>
    );
};

export default ChatBox;
