/**
 * @typedef {Object} message
 * @property {string} id
 * @property {string} content
 * @property {{ type: "base64" | "url", data: string }} [image]
 * @property {"user" | "assistant" | "error"} role
 * @property {string} createdAt
 */

// Example usage:
// /** @type {message} */
// const msg = { ... };
