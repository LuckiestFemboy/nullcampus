// background.js - Skord Menu Service Worker

let networkBlockingEnabled = false;
let networkLoggingEnabled = false;

// Function to send a log message to all active content scripts
function sendLogToContentScript(message, category) {
    // Query for all tabs to send messages to their content scripts
    chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
            if (tab.id) {
                // Send message to the content script in the specific tab
                chrome.tabs.sendMessage(tab.id, {
                    action: "addLog",
                    message: message,
                    category: category
                }).catch(error => {
                    // Catch and ignore errors if the content script is not listening
                    // or if the tab has been closed/is no longer accessible.
                    if (!error.message.includes("Could not establish connection")) {
                        console.warn(`Error sending log to tab ${tab.id}:`, error);
                    }
                });
            }
        });
    });
}

// Network Request Listener for Logging
chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
        if (networkLoggingEnabled) {
            sendLogToContentScript(`NETWORK: Requesting ${details.url}`, 'NETWORK');
        }
        // As per Manifest V3, direct blocking with 'return { cancel: true }'
        // is not supported with the webRequest API without 'declarativeNetRequest'.
        // For now, if blocking is enabled, we'll just log that it *would* be blocked.
        if (networkBlockingEnabled) {
            sendLogToContentScript(`NETWORK (WOULD BE BLOCKED): ${details.url}`, 'NETWORK');
        }
    },
    { urls: ["<all_urls>"] },
    ["requestBody"] // 'blocking' is removed for MV3 compatibility.
);

// Listener for when a network request has completed successfully.
chrome.webRequest.onCompleted.addListener(
    (details) => {
        if (networkLoggingEnabled) {
            sendLogToContentScript(`NETWORK: Completed ${details.url} (Status: ${details.statusCode})`, 'NETWORK');
        }
    },
    { urls: ["<all_urls>"] }
);

// Listener for when a network request has failed.
chrome.webRequest.onErrorOccurred.addListener(
    (details) => {
        if (networkLoggingEnabled) {
            sendLogToContentScript(`NETWORK ERROR: ${details.url} (${details.error})`, 'NETWORK');
        }
    },
    { urls: ["<all_urls>"] }
);


// Helper function to check if a URL matches the target sites criteria
function matchesTargetSites(url, targetSites) {
    if (!targetSites || targetSites.length === 0 || targetSites.includes("all_sites")) {
        return true; // Apply to all sites if not specified or explicitly set
    }

    const currentUrl = new URL(url);
    for (const target of targetSites) {
        if (target === "current_url" && currentUrl.href === url) {
            return true;
        }
        if (target === "current_domain" && currentUrl.hostname === new URL(url).hostname) {
            return true;
        }
        // Custom URL/Domain matching: check if the URL includes the custom target string
        if (url.includes(target)) {
            return true;
        }
    }
    return false;
}

// Function to inject enabled scripts and styles into a specific tab
async function injectContentIntoTab(tabId, url) {
    if (!tabId || !url) return;

    try {
        const result = await chrome.storage.local.get(['skordCustomScripts', 'skordCustomStyles']);
        const savedScripts = result.skordCustomScripts || [];
        const savedStyles = result.skordCustomStyles || [];

        // Inject enabled and site-matching styles
        for (const style of savedStyles) {
            if (style.enabled && matchesTargetSites(url, style.targetSites)) {
                const styleId = `skord-custom-css-${style.name.replace(/\s+/g, '-')}`;
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    function: (cssCode, id) => {
                        let styleEl = document.getElementById(id);
                        if (!styleEl) {
                            styleEl = document.createElement('style');
                            styleEl.id = id;
                            document.head.appendChild(styleEl);
                        }
                        styleEl.textContent = cssCode;
                    },
                    args: [style.cssCode, styleId],
                    world: "MAIN" // Inject into the main world of the page
                }).catch(error => console.error(`Skord: Failed to inject style "${style.name}" into tab ${tabId}:`, error));
            }
        }

        // Inject enabled and site-matching scripts
        for (const script of savedScripts) {
            if (script.enabled && matchesTargetSites(url, script.targetSites)) {
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    function: (code, name) => {
                        const script = document.createElement('script');
                        script.textContent = code;
                        script.setAttribute('data-skord-script', name);
                        document.body.appendChild(script);
                        // Remove the script element after execution to keep the DOM clean
                        script.remove();
                    },
                    args: [script.code, script.name],
                    world: "MAIN" // Inject into the main world of the page
                }).catch(error => console.error(`Skord: Failed to inject script "${script.name}" into tab ${tabId}:`, error));
            }
        }
    } catch (error) {
        console.error("Skord: Error retrieving saved content for injection:", error);
    }
}

// Message listener from content scripts (content.js) for UI actions
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Handle toggling network blocking state
    if (request.action === "toggleNetworkBlocking") {
        networkBlockingEnabled = request.enabled;
        sendLogToContentScript(`Network blocking state updated (blocking not active without declarativeNetRequest): ${networkBlockingEnabled ? 'enabled' : 'disabled'}.`, 'NETWORK');
        sendResponse({ status: "success" });
    }
    // Handle toggling network logging state
    else if (request.action === "toggleNetworkLogging") {
        networkLoggingEnabled = request.enabled;
        sendLogToContentScript(`Network logging ${networkLoggingEnabled ? 'enabled' : 'disabled'}.`, 'NETWORK');
        sendResponse({ status: "success" });
    }
    // Handle request to execute a script in the page's main world
    else if (request.action === "executeScriptInMainWorld") {
        if (sender.tab && sender.tab.id) {
            chrome.scripting.executeScript({
                target: { tabId: sender.tab.id }, // Target the tab where the message originated
                function: (code, name) => {
                    const script = document.createElement('script');
                    script.textContent = code;
                    script.setAttribute('data-skord-script', name);
                    document.body.appendChild(script);
                    script.remove(); // Remove after execution
                },
                args: [request.code, request.name], // Pass the script code and name
                world: "MAIN" // This is the crucial part: injects the script into the page's main JavaScript context
            }).then(() => {
                sendLogToContentScript(`Script "${request.name}" executed in main world.`, 'SCRIPT_INJECTOR');
                sendResponse({ status: "success" });
            }).catch(error => {
                sendLogToContentScript(`Failed to execute script "${request.name}" in main world: ${error.message}`, 'SCRIPT_INJECTOR');
                console.error("Script injection failed:", error);
                sendResponse({ status: "error", message: error.message });
            });
        } else {
            sendResponse({ status: "error", message: "No active tab ID found for script injection." });
        }
        return true; // Indicate that sendResponse will be called asynchronously
    }
    // Handle request to inject CSS into the page's main world
    else if (request.action === "injectCSSInMainWorld") {
        if (sender.tab && sender.tab.id) {
            chrome.scripting.executeScript({
                target: { tabId: sender.tab.id },
                function: (cssCode, styleId) => {
                    let styleEl = document.getElementById(styleId);
                    if (!styleEl) {
                        styleEl = document.createElement('style');
                        styleEl.id = styleId;
                        document.head.appendChild(styleEl);
                    }
                    styleEl.textContent = cssCode;
                },
                args: [request.cssCode, request.styleId],
                world: "MAIN"
            }).then(() => {
                sendLogToContentScript(`Style "${request.styleId}" injected in main world.`, 'CSS_EDITOR');
                sendResponse({ status: "success" });
            }).catch(error => {
                sendLogToContentScript(`Failed to inject style "${request.styleId}" in main world: ${error.message}`, 'CSS_EDITOR');
                console.error("CSS injection failed:", error);
                sendResponse({ status: "error", message: error.message });
            });
        } else {
            sendResponse({ status: "error", message: "No active tab ID found for CSS injection." });
        }
        return true;
    }
    // Handle request to remove CSS from the page's main world
    else if (request.action === "removeCSSFromMainWorld") {
        if (sender.tab && sender.tab.id) {
            chrome.scripting.executeScript({
                target: { tabId: sender.tab.id },
                function: (styleId) => {
                    const el = document.getElementById(styleId);
                    if (el) el.remove();
                },
                args: [request.styleId],
                world: "MAIN"
            }).then(() => {
                sendLogToContentScript(`Style "${request.styleId}" removed from main world.`, 'CSS_EDITOR');
                sendResponse({ status: "success" });
            }).catch(error => {
                sendLogToContentScript(`Failed to remove style "${request.styleId}" from main world: ${error.message}`, 'CSS_EDITOR');
                console.error("CSS removal failed:", error);
                sendResponse({ status: "error", message: error.message });
            });
        } else {
            sendResponse({ status: "error", message: "No active tab ID found for CSS removal." });
        }
        return true;
    }
    // Handle request to remove script from the page's main world
    else if (request.action === "removeScriptFromMainWorld") {
        if (sender.tab && sender.tab.id) {
            chrome.scripting.executeScript({
                target: { tabId: sender.tab.id },
                function: (scriptName) => {
                    const scripts = document.querySelectorAll(`script[data-skord-script="${scriptName}"]`);
                    scripts.forEach(script => script.remove());
                },
                args: [request.scriptName],
                world: "MAIN"
            }).then(() => {
                sendLogToContentScript(`Script "${request.scriptName}" removed from main world.`, 'SCRIPT_INJECTOR');
                sendResponse({ status: "success" });
            }).catch(error => {
                sendLogToContentScript(`Failed to remove script "${request.scriptName}" from main world: ${error.message}`, 'SCRIPT_INJECTOR');
                console.error("Script removal failed:", error);
                sendResponse({ status: "error", message: error.message });
            });
        } else {
            sendResponse({ status: "error", message: "No active tab ID found for script removal." });
        }
        return true;
    }
});

// Listen for when the active tab changes
chrome.tabs.onActivated.addListener(activeInfo => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (tab.url) {
            injectContentIntoTab(tab.id, tab.url);
        }
    });
});

// Listen for when a tab is updated (e.g., page navigation, reload)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // Only inject if the tab has completed loading and has a URL
    if (changeInfo.status === 'complete' && tab.url) {
        injectContentIntoTab(tabId, tab.url);
    }
});

// Initial setup: load saved settings for network features when the service worker starts.
chrome.storage.local.get(['skordSettings'], (result) => {
    if (result.skordSettings && result.skordSettings.devTools) {
        networkBlockingEnabled = result.skordSettings.devTools.networkBlocking || false;
        networkLoggingEnabled = result.skordSettings.devTools.networkLogging || false;
    }
});

// Listener for when the service worker is installed or updated.
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get(['skordSettings'], (result) => {
        if (result.skordSettings && result.skordSettings.devTools) {
            networkBlockingEnabled = result.skordSettings.devTools.networkBlocking || false;
            networkLoggingEnabled = result.skordSettings.devTools.networkLogging || false;
        }
    });
});
