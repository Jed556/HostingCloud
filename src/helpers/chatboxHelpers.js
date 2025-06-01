export const PRIMARY_HEX = "#3c0d99";
export const DEFAULT_WIDTH = 400;
export const DEFAULT_HEIGHT = 520;
export const MIN_WIDTH = 320;
export const MIN_HEIGHT = 320;

// Utility: Clamp a value between min and max
export function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

// Utility: Get initial box size
export function getInitialBoxSize({ width, height, minWidth, minHeight }) {
    return {
        width: clamp(width || DEFAULT_WIDTH, minWidth || MIN_WIDTH, 900),
        height: clamp(height || DEFAULT_HEIGHT, minHeight || MIN_HEIGHT, 900)
    };
}

// Utility: Check if resizing handle is being used (bottom-right corner)
export function isResizingHandle(e, boxSize) {
    return (
        e.target === e.currentTarget &&
        (e.nativeEvent.offsetX > boxSize.width - 16 ||
            e.nativeEvent.offsetY > boxSize.height - 16)
    );
}
