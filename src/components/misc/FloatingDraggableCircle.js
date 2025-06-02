import React, { useEffect, useRef, useState } from "react";
import { Rnd } from "react-rnd";
import tw from "twin.macro";
import ChatBox from "./ChatBox";

const CIRCLE_SIZE = 64;
const PADDING = 50; // 50px from all sides

const Circle = tw.div`
  w-16 h-16 bg-gradient-to-br from-primary-500 to-blue-500 rounded-full flex items-center justify-center shadow-2xl text-white text-3xl font-extrabold z-50
  transition-all duration-500 border-4 border-white hover:shadow-primary-500/25
`;

const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

const FloatingDraggableCircle = ({
    initial = null,
    children = (
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
    ),
    style = {},
}) => {
    // Default to 50px from lower right
    const getDefaultPosition = () => ({
        x: window.innerWidth - CIRCLE_SIZE - PADDING,
        y: window.innerHeight - CIRCLE_SIZE - PADDING,
    });

    const [position, setPosition] = useState(getDefaultPosition());
    const [visible, setVisible] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);
    const rndRef = useRef();

    // Update position on resize to keep it on screen
    useEffect(() => {
        const handleResize = () => {
            setPosition(pos => ({
                x: clamp(pos.x, PADDING, window.innerWidth - CIRCLE_SIZE - PADDING),
                y: clamp(pos.y, PADDING, window.innerHeight - CIRCLE_SIZE - PADDING),
            }));
        };
        window.addEventListener("resize", handleResize);
        setTimeout(() => setVisible(true), 100);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // If initial is provided, use it instead of default
    useEffect(() => {
        if (initial && typeof initial.x === "number" && typeof initial.y === "number") {
            setPosition({ x: initial.x, y: initial.y });
        }
    }, [initial]);

    // Prevent page scroll while dragging using Rnd's onDrag/onDragStart/onDragStop
    const [dragging, setDragging] = useState(false);

    useEffect(() => {
        if (!dragging) return;
        const preventScroll = (e) => {
            e.preventDefault();
        };
        window.addEventListener("wheel", preventScroll, { passive: false });
        window.addEventListener("touchmove", preventScroll, { passive: false });
        return () => {
            window.removeEventListener("wheel", preventScroll, { passive: false });
            window.removeEventListener("touchmove", preventScroll, { passive: false });
        };
    }, [dragging]);

    // Calculate anchor for chatbox based on circle position
    const getChatBoxAnchor = () => {
        const centerX = position.x + CIRCLE_SIZE / 2;
        const centerY = position.y + CIRCLE_SIZE / 2;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        // Default: bottom center
        let anchor = {
            left: "50%",
            transform: "translateX(-50%)",
            bottom: CIRCLE_SIZE + 20,
            top: undefined,
        };
        // If circle is in top half, show chatbox below
        if (centerY < vh / 2) {
            anchor = {
                left: "50%",
                transform: "translateX(-50%)",
                top: CIRCLE_SIZE + 20,
                bottom: undefined,
            };
        }
        // If circle is on left third, align left
        if (centerX < vw / 3) {
            anchor.left = 0;
            anchor.transform = "none";
        }
        // If circle is on right third, align right
        else if (centerX > (vw * 2) / 3) {
            anchor.left = undefined;
            anchor.right = 0;
            anchor.transform = "none";
        } else {
            anchor.right = undefined;
        }
        return anchor;
    };

    // Always keep the circle fixed to the viewport (not scrolling with the page)
    // and prevent going out of bounds visually
    return (
        <div
            style={{
                position: "fixed",
                left: 0,
                top: 0,
                width: "100vw",
                height: "100vh",
                pointerEvents: "none",
                zIndex: 9999,
            }}
        >
            <Rnd
                ref={rndRef}
                className="floating-draggable-circle-rnd"
                size={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE }}
                position={position}
                onDragStart={() => setDragging(true)}
                onDragStop={(_, d) => {
                    setDragging(false);
                    setPosition({
                        x: clamp(d.x, PADDING, window.innerWidth - CIRCLE_SIZE - PADDING),
                        y: clamp(d.y, PADDING, window.innerHeight - CIRCLE_SIZE - PADDING),
                    });
                }}
                bounds="parent"
                enableResizing={false}
                dragTransition={{ type: "spring", stiffness: 120, damping: 18 }}
                style={{
                    pointerEvents: "auto",
                    transition: "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
                    transform: visible ? "scale(1)" : "scale(0.2)",
                    opacity: visible ? 1 : 0,
                    cursor: dragging ? "grabbing" : "grab",
                    ...style
                }}
            >
                <Circle
                    onClick={() => setChatOpen((v) => !v)}
                    onTouchEnd={e => {
                        e.preventDefault();
                        setChatOpen((v) => !v);
                    }}
                    style={{ pointerEvents: "auto" }}
                    title="Open Chat"
                >
                    {children}
                </Circle>
                {chatOpen && (
                    <ChatBox
                        onClose={() => setChatOpen(false)}
                        style={{
                            position: "absolute",
                            ...getChatBoxAnchor(),
                            boxShadow: "0 8px 32px 0 rgba(80,120,255,0.18), 0 1.5px 8px 0 rgba(0,0,0,0.08)"
                        }}
                    />
                )}
            </Rnd>
        </div>
    );
};

export default FloatingDraggableCircle;
