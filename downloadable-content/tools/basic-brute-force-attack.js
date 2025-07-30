(function() {
    // --- IMPORTANT: Environment Check ---
    if (typeof document === 'undefined') {
        console.error('Error: This script must be run in a web browser environment with access to the Document Object Model (DOM).');
        console.error('Please open your browser\'s developer tools (F12), go to the "Console" tab, and paste the script there.');
        return; // Exit the script if document is not defined
    }

    // Check if the inspector already exists to prevent multiple instances
    if (document.getElementById('draggable-inspector-window')) {
        console.log('Basic Login Brute Force window already exists. Removing existing instance.');
        document.getElementById('draggable-inspector-window').remove();
        // Also remove other associated windows and the toggle dot if they exist
        const existingLogWindow = document.getElementById('inspector-log-window');
        if (existingLogWindow) existingLogWindow.remove();
        const existingSettingsWindow = document.getElementById('inspector-settings-window');
        if (existingSettingsWindow) existingSettingsWindow.remove();
        const existingToggleDot = document.getElementById('inspector-toggle-dot');
        if (existingToggleDot) existingToggleDot.remove();
    }

    let isSelectingElement = false; // Flag to indicate if we are in selection mode
    let currentFieldToPopulate = null; // To store 'username', 'password', or 'loginButton'
    let selectedUsernameElement = null; // Stores the actual DOM element for the username input
    let selectedPasswordElement = null; // Stores the actual DOM element for the password input
    let selectedLoginButtonElement = null; // Stores the actual DOM element for the login button

    let isGuessingPasswords = false; // Flag to control the password guessing loop
    let currentPasswordAttempt = ''; // Stores the current password being tried
    let currentPasswordLength = 1; // Current length of passwords to try (will be set by user)

    // Default and current configurable values
    let baseAutofillRate = 50; // Base milliseconds between each password attempt
    let autofillRateVariance = 50; // Max random milliseconds to add to baseAutofillRate
    let minPasswordLength = 1; // Default minimum password length
    let maxPasswordLength = 8; // Default maximum password length
    let includeCapitalized = false; // Default for capitalized letters
    let autofillUsernameOnEachAttempt = true; // Default for autofilling username
    let customCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_+='; // Default characters
    let currentCharacters = customCharacters; // Dynamic character set
    let speedMultiplier = 1; // Default speed multiplier (1x)

    // Safe Mode variables
    let safeModeEnabled = false; // Default for safe mode
    let maxRangeMs = 100; // Default max range for safe mode (when enabled)

    // New: Username optional variable
    let requireUsername = true; // Default: username is required

    const baseCharacterSet = 'abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_+=';
    const uppercaseCharacterSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    // Temporary storage for log messages before the log window is fully initialized
    let tempLogMessages = [];
    let inspectorLog = null; // Declare inspectorLog here, but assign later

    // --- Helper function to save and load settings ---
    function saveSettings() {
        const settings = {
            baseAutofillRate: baseAutofillRate,
            autofillRateVariance: autofillRateVariance,
            minPasswordLength: minPasswordLength,
            maxPasswordLength: maxPasswordLength,
            includeCapitalized: includeCapitalized,
            autofillUsernameOnEachAttempt: autofillUsernameOnEachAttempt,
            customCharacters: customCharacters,
            speedMultiplier: speedMultiplier,
            safeModeEnabled: safeModeEnabled,
            maxRangeMs: maxRangeMs,
            requireUsername: requireUsername // Save new setting
        };
        try {
            localStorage.setItem('blbf_settings', JSON.stringify(settings));
            logAction('Settings saved to local storage.');
        } catch (e) {
            logAction('Error saving settings to local storage: ' + e.message);
        }
    }

    function loadSettings() {
        try {
            const savedSettings = localStorage.getItem('blbf_settings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                baseAutofillRate = settings.baseAutofillRate !== undefined ? settings.baseAutofillRate : baseAutofillRate;
                autofillRateVariance = settings.autofillRateVariance !== undefined ? settings.autofillRateVariance : autofillRateVariance;
                minPasswordLength = settings.minPasswordLength !== undefined ? settings.minPasswordLength : minPasswordLength;
                maxPasswordLength = settings.maxPasswordLength !== undefined ? settings.maxPasswordLength : maxPasswordLength;
                includeCapitalized = settings.includeCapitalized !== undefined ? settings.includeCapitalized : includeCapitalized;
                autofillUsernameOnEachAttempt = settings.autofillUsernameOnEachAttempt !== undefined ? settings.autofillUsernameOnEachAttempt : autofillUsernameOnEachAttempt;
                customCharacters = settings.customCharacters !== undefined ? settings.customCharacters : customCharacters;
                speedMultiplier = settings.speedMultiplier !== undefined ? settings.speedMultiplier : speedMultiplier;
                safeModeEnabled = settings.safeModeEnabled !== undefined ? settings.safeModeEnabled : safeModeEnabled;
                maxRangeMs = settings.maxRangeMs !== undefined ? settings.maxRangeMs : maxRangeMs;
                requireUsername = settings.requireUsername !== undefined ? settings.requireUsername : requireUsername; // Load new setting

                // Update currentCharacters based on loaded settings
                currentCharacters = includeCapitalized ? customCharacters + uppercaseCharacterSet : customCharacters;
                logAction('Settings loaded from local storage.');
            } else {
                logAction('No saved settings found. Using default settings.');
            }
        } catch (e) {
            logAction('Error loading settings from local storage: ' + e.message);
        }
    }

    // --- Helper function to create draggable windows ---
    function createDraggableWindow(id, title, htmlContent, initialWidth, initialHeight) {
        const windowDiv = document.createElement('div');
        windowDiv.id = id;
        windowDiv.style.cssText = `
            position: fixed;
            background-color: var(--background-dark);
            border: 1px solid var(--primary-color);
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
            z-index: 99999;
            font-family: 'Inter', sans-serif;
            color: var(--text-light);
            resize: both;
            overflow: auto;
            min-width: 250px;
            min-height: 150px;
            display: none; /* Initially hidden, will be centered and displayed when opened */
            width: ${initialWidth}px;
            height: ${initialHeight}px;
        `;
        windowDiv.innerHTML = `
            <div class="window-header" style="cursor: grab; background-color: var(--header-bg); padding: 10px; border-top-left-radius: 8px; border-top-right-radius: 8px; font-weight: bold; color: var(--primary-color); text-align: center;">
                ${title}
                <span class="window-close-button" style="float: right; cursor: pointer; color: var(--text-muted); font-size: 1.2em; line-height: 1;">&times;</span>
            </div>
            <div class="window-content" style="padding: 20px;">
                ${htmlContent}
            </div>
        `;
        document.body.appendChild(windowDiv);

        const header = windowDiv.querySelector('.window-header');
        const closeButton = windowDiv.querySelector('.window-close-button');

        let isDragging = false;
        let offsetX, offsetY;

        header.addEventListener('mousedown', (e) => {
            isDragging = true;
            offsetX = e.clientX - windowDiv.getBoundingClientRect().left;
            offsetY = e.clientY - windowDiv.getBoundingClientRect().top;
            windowDiv.style.cursor = 'grabbing';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            windowDiv.style.left = (e.clientX - offsetX) + 'px';
            windowDiv.style.top = (e.clientY - offsetY) + 'px';
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            windowDiv.style.cursor = 'grab';
        });

        // Individual close button logic
        closeButton.addEventListener('click', () => {
            windowDiv.style.display = 'none';
            // If it's the main inspector, reset dot color
            if (id === 'draggable-inspector-window') {
                toggleDot.style.backgroundColor = 'var(--primary-color)';
            }
            logAction(`${title} window closed.`);
        });

        return windowDiv;
    }

    // --- Define CSS Variables (Root Styling) ---
    const styleSheet = document.createElement('style');
    styleSheet.innerHTML = `
        :root {
            --primary-color: #fb9d4c; /* Orange accent */
            --secondary-color: #5cb85c; /* Green for save */
            --danger-color: #cc0000; /* Red for stop */
            --background-dark: #2a2a2a; /* Main window background */
            --header-bg: #333; /* Header background */
            --input-bg: #333; /* Input field background */
            --input-border: #444; /* Input border */
            --text-light: #e0e0e0; /* General light text */
            --text-muted: #ccc; /* Muted text for labels/placeholders */
            --log-bg: #333; /* Log background */
            --log-border: #444; /* Log border */
            --success-text: #4CAF50; /* Green for success/locked in */
        }
        .inspector-button {
            transition: background-color 0.2s ease, filter 0.2s ease, border-color 0.2s ease;
        }
        .inspector-button:hover {
            filter: brightness(1.1);
        }
        /* Remove default outline and pink shadow */
        input[type="text"],
        input[type="number"],
        textarea {
            outline: none;
            box-shadow: none; /* Explicitly remove any default or inherited box-shadow */
        }
        /* Add a subtle orange glow on focus */
        input[type="text"]:focus,
        input[type="number"]:focus,
        textarea:focus {
            box-shadow: 0 0 0 2px rgba(251, 157, 76, 0.5);
            border-color: var(--primary-color);
        }
    `;
    document.head.appendChild(styleSheet);


    // --- 1. Create the HTML content for each window ---

    // Main Inspector Window HTML
    const mainInspectorHtml = `
        <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; color: var(--text-muted);">Click to Inspect:</label>
            <button id="consoleUsernameButton" class="inspector-button" style="width: 100%; padding: 10px; border: 1px solid var(--input-border); border-radius: 4px; background-color: #555; color: var(--text-light); outline: none; cursor: pointer;">
                Select Username Field
            </button>
        </div>
        <div style="margin-bottom: 15px;">
            <button id="consolePasswordButton" class="inspector-button" style="width: 100%; padding: 10px; border: 1px solid var(--input-border); border-radius: 4px; background-color: #555; color: var(--text-light); outline: none; cursor: pointer;">
                Select Password Field
            </button>
        </div>
        <div style="margin-bottom: 15px;">
            <button id="consoleLoginButton" class="inspector-button" style="width: 100%; padding: 10px; border: 1px solid var(--input-border); border-radius: 4px; background-color: #555; color: var(--text-light); outline: none; cursor: pointer;">
                Select Login Button
            </button>
        </div>
        <div style="margin-top: 15px;">
            <label for="yourUsernameInput" style="display: block; margin-bottom: 5px; color: var(--text-muted);">Your Username (for Autofill):</label>
            <input type="text" id="yourUsernameInput" placeholder="Enter username to autofill" style="width: 100%; padding: 10px; border: 1px solid var(--input-border); border-radius: 4px; background-color: var(--input-bg); color: var(--text-light); font-size: 0.9em; outline: none;">
        </div>
        <div style="margin-top: 15px; display: flex; gap: 10px;">
            <button id="startButton" class="inspector-button" style="flex: 1; padding: 10px; border: 1px solid var(--input-border); border-radius: 4px; background-color: var(--primary-color); color: #fff; outline: none; cursor: pointer;">
                Start Password Guessing
            </button>
            <button id="stopButton" class="inspector-button" style="flex: 1; padding: 10px; border: 1px solid var(--input-border); border-radius: 4px; background-color: var(--danger-color); color: #fff; outline: none; cursor: pointer;">
                Stop
            </button>
        </div>
        <div style="margin-top: 15px; display: flex; gap: 10px;">
            <button id="openSettingsButton" class="inspector-button" style="flex: 1; padding: 10px; border: 1px solid var(--input-border); border-radius: 4px; background-color: #4a4a4a; color: var(--text-light); outline: none; cursor: pointer;">
                Open Settings
            </button>
            <button id="openLogButton" class="inspector-button" style="flex: 1; padding: 10px; border: 1px solid var(--input-border); border-radius: 4px; background-color: #4a4a4a; color: var(--text-light); outline: none; cursor: pointer;">
                Open Log
            </button>
        </div>
        <div style="margin-top: 15px;">
            <label for="consoleResultInput" style="display: block; margin-bottom: 5px; color: var(--text-muted);">Collected Info:</label>
            <input type="text" id="consoleResultInput" readonly value="Click a button to start selection." style="width: 100%; padding: 10px; border: 1px solid var(--input-border); border-radius: 4px; background-color: var(--input-bg); color: var(--text-muted); font-size: 0.9em; outline: none;">
        </div>
        <div id="statusDisplay" style="margin-top: 10px; text-align: center; color: var(--text-light); font-size: 0.85em;">Status: Stopped</div>
    `;

    // Settings Window HTML
    const settingsHtml = `
        <div style="margin-bottom: 15px;">
            <label for="baseRateInput" style="display: block; margin-bottom: 5px; color: var(--text-muted);">Base Autofill Rate (ms):</label>
            <input type="number" id="baseRateInput" value="${baseAutofillRate}" min="0" style="width: 100%; padding: 8px; border: 1px solid var(--input-border); border-radius: 4px; background-color: var(--input-bg); color: var(--text-light); outline: none;">
        </div>
        <div style="margin-bottom: 15px; display: flex; align-items: center;">
            <input type="checkbox" id="safeModeCheckbox" ${safeModeEnabled ? 'checked' : ''} style="margin-right: 10px;">
            <label for="safeModeCheckbox" style="color: var(--text-muted);">Enable Safe Mode</label>
        </div>
        <div style="margin-bottom: 15px;">
            <label for="maxRangeMsInput" style="display: block; margin-bottom: 5px; color: var(--text-muted);">Max Range (ms) (Safe Mode):</label>
            <input type="number" id="maxRangeMsInput" value="${maxRangeMs}" min="0" ${!safeModeEnabled ? 'disabled' : ''} style="width: 100%; padding: 8px; border: 1px solid var(--input-border); border-radius: 4px; background-color: var(--input-bg); color: var(--text-light); outline: none;">
        </div>
        <div style="margin-bottom: 15px;">
            <label for="varianceInput" style="display: block; margin-bottom: 5px; color: var(--text-muted);">Rate Variance (ms) (Normal Mode):</label>
            <input type="number" id="varianceInput" value="${autofillRateVariance}" min="0" style="width: 100%; padding: 8px; border: 1px solid var(--input-border); border-radius: 44px; background-color: var(--input-bg); color: var(--text-light); outline: none;">
        </div>
        <div style="margin-bottom: 15px;">
            <label for="speedSlider" style="display: block; margin-bottom: 5px; color: var(--text-muted);">Speed Multiplier: <span id="speedValue">${speedMultiplier}x</span></label>
            <input type="range" id="speedSlider" min="1" max="100" value="${speedMultiplier}" step="1" style="width: 100%; -webkit-appearance: none; appearance: none; height: 8px; background: #555; border-radius: 5px; outline: none;">
            <style>
                #speedSlider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: var(--primary-color);
                    cursor: pointer;
                    border: 1px solid var(--input-border);
                }
                #speedSlider::-moz-range-thumb {
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: var(--primary-color);
                    cursor: pointer;
                    border: 1px solid var(--input-border);
                }
            </style>
        </div>
        <div style="margin-bottom: 15px;">
            <label for="minLengthInput" style="display: block; margin-bottom: 5px; color: var(--text-muted);">Min Password Length:</label>
            <input type="number" id="minLengthInput" value="${minPasswordLength}" min="1" style="width: 100%; padding: 8px; border: 1px solid var(--input-border); border-radius: 4px; background-color: var(--input-bg); color: var(--text-light); outline: none;">
        </div>
        <div style="margin-bottom: 15px;">
            <label for="maxLengthInput" style="display: block; margin-bottom: 5px; color: var(--text-muted);">Max Password Length:</label>
            <input type="number" id="maxLengthInput" value="${maxPasswordLength}" min="1" style="width: 100%; padding: 8px; border: 1px solid var(--input-border); border-radius: 4px; background-color: var(--input-bg); color: var(--text-light); outline: none;">
        </div>
        <div style="margin-bottom: 15px; display: flex; align-items: center;">
            <input type="checkbox" id="includeCapitalizedCheckbox" ${includeCapitalized ? 'checked' : ''} style="margin-right: 10px;">
            <label for="includeCapitalizedCheckbox" style="color: var(--text-muted);">Include Capitalized Letters</label>
        </div>
        <div style="margin-bottom: 15px; display: flex; align-items: center;">
            <input type="checkbox" id="autofillUsernameCheckbox" ${autofillUsernameOnEachAttempt ? 'checked' : ''} style="margin-right: 10px;">
            <label for="autofillUsernameCheckbox" style="color: var(--text-muted);">Autofill Username on Each Attempt</label>
        </div>
        <div style="margin-bottom: 15px;">
            <label for="customCharactersInput" style="display: block; margin-bottom: 5px; color: var(--text-muted);">Custom Characters:</label>
            <textarea id="customCharactersInput" style="width: 100%; height: 60px; padding: 8px; border: 1px solid var(--input-border); border-radius: 4px; background-color: var(--input-bg); color: var(--text-light); font-size: 0.9em; outline: none; resize: vertical;">${customCharacters}</textarea>
        </div>
        <div style="margin-bottom: 15px; display: flex; align-items: center;">
            <input type="checkbox" id="requireUsernameCheckbox" ${requireUsername ? 'checked' : ''} style="margin-right: 10px;">
            <label for="requireUsernameCheckbox" style="color: var(--text-muted);">Require Username</label>
        </div>
        <button id="saveSettingsButton" class="inspector-button" style="width: 100%; padding: 10px; border: 1px solid var(--input-border); border-radius: 4px; background-color: var(--secondary-color); color: #fff; outline: none; cursor: pointer;">
            Save Settings
        </button>
    `;

    // Log Window HTML
    const logHtml = `
        <div id="inspectorLog" style="width: 100%; height: 200px; padding: 10px; border: 1px solid var(--log-border); border-radius: 4px; background-color: var(--log-bg); color: var(--text-muted); font-size: 0.8em; overflow-y: scroll; text-align: left;">
            <!-- Log entries will appear here -->
        </div>
        <button id="clearLogButton" class="inspector-button" style="width: 100%; padding: 8px; margin-top: 10px; border: 1px solid var(--input-border); border-radius: 4px; background-color: #4a4a4a; color: var(--text-light); outline: none; cursor: pointer;">
            Clear Log
        </button>
    `;

    /**
     * Appends a message to the inspector log.
     * If inspectorLog element is not yet available, messages are stored temporarily.
     * @param {string} message - The message to log.
     */
    function logAction(message) {
        const timestamp = new Date().toLocaleTimeString();
        const formattedMessage = `<div>[${timestamp}] ${message}</div>`;

        if (inspectorLog) {
            inspectorLog.innerHTML += formattedMessage;
            inspectorLog.scrollTop = inspectorLog.scrollHeight; // Auto-scroll to bottom
        } else {
            tempLogMessages.push(formattedMessage);
        }
    }

    /**
     * Flushes temporary log messages into the actual inspectorLog element.
     * This is called once inspectorLog is guaranteed to be in the DOM.
     */
    function flushTempLog() {
        if (inspectorLog && tempLogMessages.length > 0) {
            tempLogMessages.forEach(msg => {
                inspectorLog.innerHTML += msg;
            });
            inspectorLog.scrollTop = inspectorLog.scrollHeight;
            tempLogMessages = []; // Clear temporary messages
        }
    }

    // --- Load settings before creating windows to apply defaults ---
    loadSettings();

    // --- 2. Create the main draggable window elements ---
    // Note: initialTop and initialLeft are no longer needed here as centering is handled by centerWindow
    const inspectorWindow = createDraggableWindow('draggable-inspector-window', 'Basic Login Brute Force', mainInspectorHtml, 400, 560);
    const settingsWindow = createDraggableWindow('inspector-settings-window', 'Settings', settingsHtml, 350, 500);
    const logWindow = createDraggableWindow('inspector-log-window', 'Activity Log', logHtml, 400, 280);

    // Get reference to inspectorLog after it's created
    inspectorLog = document.getElementById('inspectorLog'); // Assign the global inspectorLog variable
    flushTempLog(); // Flush any messages logged during loadSettings

    // Initially hide settings and log windows
    settingsWindow.style.display = 'none';
    logWindow.style.display = 'none';

    // --- 3. Create the orange toggle dot ---
    const toggleDot = document.createElement('div');
    toggleDot.id = 'inspector-toggle-dot';
    toggleDot.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        width: 15px;
        height: 15px;
        background-color: var(--primary-color); /* Orange color when closed */
        border-radius: 50%;
        cursor: pointer;
        z-index: 99998;
        transition: background-color 0.2s ease, transform 0.2s ease;
    `;
    document.body.appendChild(toggleDot);

    // Add hover effect for the dot
    toggleDot.addEventListener('mouseenter', () => {
        toggleDot.style.transform = 'scale(1.1)';
    });
    toggleDot.addEventListener('mouseleave', () => {
        toggleDot.style.transform = 'scale(1)';
    });


    // --- 4. Get references to elements within the new windows ---
    const consoleUsernameButton = document.getElementById('consoleUsernameButton');
    const consolePasswordButton = document.getElementById('consolePasswordButton');
    const consoleLoginButton = document.getElementById('consoleLoginButton');
    const yourUsernameInput = document.getElementById('yourUsernameInput');
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    const consoleResultInput = document.getElementById('consoleResultInput');
    const statusDisplay = document.getElementById('statusDisplay'); // New status display

    const clearLogButton = document.getElementById('clearLogButton'); // New clear log button

    // Settings inputs and button (now in settingsWindow)
    const baseRateInput = document.getElementById('baseRateInput');
    const varianceInput = document.getElementById('varianceInput');
    const minLengthInput = document.getElementById('minLengthInput'); // Changed from startingLengthInput
    const maxLengthInput = document.getElementById('maxLengthInput'); // New max length input
    const includeCapitalizedCheckbox = document.getElementById('includeCapitalizedCheckbox');
    const autofillUsernameCheckbox = document.getElementById('autofillUsernameCheckbox'); // New autofill username checkbox
    const customCharactersInput = document.getElementById('customCharactersInput'); // New custom characters input
    const saveSettingsButton = document.getElementById('saveSettingsButton');
    const speedSlider = document.getElementById('speedSlider'); // New speed slider
    const speedValueDisplay = document.getElementById('speedValue'); // New speed value display

    // Safe Mode elements
    const safeModeCheckbox = document.getElementById('safeModeCheckbox');
    const maxRangeMsInput = document.getElementById('maxRangeMsInput');

    // Username optional elements
    const requireUsernameCheckbox = document.getElementById('requireUsernameCheckbox');


    // New buttons to open/close settings and log windows
    const openSettingsButton = document.getElementById('openSettingsButton');
    const openLogButton = document.getElementById('openLogButton');

    // Update speed display when slider is moved
    speedSlider.addEventListener('input', () => {
        speedMultiplier = parseInt(speedSlider.value, 10);
        speedValueDisplay.textContent = `${speedMultiplier}x`;
    });

    // Event listener for Safe Mode checkbox
    safeModeCheckbox.addEventListener('change', () => {
        safeModeEnabled = safeModeCheckbox.checked;
        maxRangeMsInput.disabled = !safeModeEnabled; // Enable/disable max range input
        logAction(`Safe Mode ${safeModeEnabled ? 'enabled' : 'disabled'}.`);
    });

    // Event listener for Require Username checkbox
    requireUsernameCheckbox.addEventListener('change', () => {
        requireUsername = requireUsernameCheckbox.checked;
        consoleUsernameButton.disabled = !requireUsername; // Disable/enable username selection button
        yourUsernameInput.disabled = !requireUsername; // Disable/enable username autofill input

        if (!requireUsername) {
            logAction('Username requirement disabled. Username field will be ignored.');
            selectedUsernameElement = null; // Clear selected username element if no longer required
            // Optionally clear the username input value as well
            yourUsernameInput.value = '';
        } else {
            logAction('Username requirement enabled. Please select a username field.');
        }
    });


    /**
     * Centers a given window on the screen.
     * @param {HTMLElement} windowElement - The window element to center.
     */
    function centerWindow(windowElement) {
        // Ensure the window is displayed before calculating its dimensions
        const originalDisplay = windowElement.style.display;
        windowElement.style.display = 'block'; // Temporarily show to get dimensions

        const windowWidth = windowElement.offsetWidth;
        const windowHeight = windowElement.offsetHeight;
        const centerX = (window.innerWidth / 2) - (windowWidth / 2);
        const centerY = (window.innerHeight / 2) - (windowHeight / 2);

        windowElement.style.left = `${Math.max(0, centerX)}px`; // Ensure it doesn't go off-screen left
        windowElement.style.top = `${Math.max(0, centerY)}px`;  // Ensure it doesn't go off-screen top

        windowElement.style.display = originalDisplay; // Revert display to original state
    }

    /**
     * Activates the element selection mode.
     * @param {string} fieldType - 'username', 'password', or 'loginButton'
     */
    function activateSelectionMode(fieldType) {
        // Prevent activation if username is not required and trying to select username
        if (fieldType === 'username' && !requireUsername) {
            logAction('Cannot select username field: Username is not required in settings.');
            return;
        }

        isSelectingElement = true;
        currentFieldToPopulate = fieldType;
        consoleResultInput.value = `Click on an element on the page to inspect.`;
        consoleResultInput.style.color = 'var(--primary-color)';
        document.body.style.cursor = 'crosshair';
        logAction(`Selection mode activated for: ${fieldType}`);
    }

    // Event listeners to activate selection mode when buttons are clicked
    consoleUsernameButton.addEventListener('click', () => activateSelectionMode('username'));
    consolePasswordButton.addEventListener('click', () => activateSelectionMode('password'));
    consoleLoginButton.addEventListener('click', () => activateSelectionMode('loginButton'));

    // Global click listener for selecting elements on the page
    document.addEventListener('click', (event) => {
        if (!isSelectingElement) {
            return;
        }

        // Check if the clicked element is inside any of the inspector windows or the toggle dot itself
        if (inspectorWindow.contains(event.target) || settingsWindow.contains(event.target) || logWindow.contains(event.target) || toggleDot.contains(event.target)) {
            return;
        }

        const clickedElement = event.target;
        const elementId = clickedElement.id || 'No ID';
        const elementClass = clickedElement.className || 'No Class';
        const tagName = clickedElement.tagName.toLowerCase(); // Get the tag name

        // Store the selected element reference
        if (currentFieldToPopulate === 'username') {
            selectedUsernameElement = clickedElement;
        } else if (currentFieldToPopulate === 'password') {
            selectedPasswordElement = clickedElement;
        } else if (currentFieldToPopulate === 'loginButton') {
            selectedLoginButtonElement = clickedElement;
        }


        // Update the result input field in the inspector
        const collectedInfoMessage = `Selected ${currentFieldToPopulate} field: <${tagName}> (ID: "${elementId}", Class: "${elementClass}")`;
        consoleResultInput.value = collectedInfoMessage;
        consoleResultInput.style.color = 'var(--success-text)';
        logAction(`Successfully selected ${currentFieldToPopulate} element: <${tagName}> (ID: "${elementId}", Class: "${elementClass}")`);


        // Deactivate selection mode after an element is selected
        isSelectingElement = false;
        currentFieldToPopulate = null;
        document.body.style.cursor = 'default';

        event.preventDefault();
        event.stopImmediatePropagation();
    }, true);

    // --- 5. Password Guessing Logic ---

    /**
     * Generates the next password in sequence.
     * This is a simplified, sequential generation for game simulation.
     */
    function generateNextPassword() {
        const chars = currentCharacters;
        const n = chars.length;

        if (currentPasswordAttempt === '') {
            // Start with the first character repeated 'minPasswordLength' times
            currentPasswordAttempt = chars[0].repeat(minPasswordLength);
            currentPasswordLength = minPasswordLength;
            return;
        }

        let tempPasswordChars = currentPasswordAttempt.split('');
        let i = tempPasswordChars.length - 1; // Start from the rightmost character

        while (i >= 0) {
            let charIndexInSet = chars.indexOf(tempPasswordChars[i]);

            if (charIndexInSet < n - 1) {
                // Increment the current character
                tempPasswordChars[i] = chars[charIndexInSet + 1];
                currentPasswordAttempt = tempPasswordChars.join('');
                return; // Found the next password
            } else {
                // Current character is the last in the set, reset to first and carry over
                tempPasswordChars[i] = chars[0];
                i--; // Move to the left
            }
        }

        // If loop completes, all combinations for currentPasswordLength are exhausted
        // Increment length and start with a new password of that length
        currentPasswordLength++;
        if (currentPasswordLength > maxPasswordLength) {
            logAction('Maximum password length reached. Stopping guessing.');
            isGuessingPasswords = false;
            statusDisplay.textContent = 'Status: Max Length Reached';
            return;
        }
        currentPasswordAttempt = chars[0].repeat(currentPasswordLength);
    }


    /**
     * Attempts to autofill the password and click the login button.
     */
    async function attemptPassword() {
        if (!isGuessingPasswords) {
            logAction('Password guessing stopped.');
            return;
        }

        // Check if elements still exist in the DOM
        if (requireUsername && !document.body.contains(selectedUsernameElement)) {
            logAction('Error: Selected Username field no longer exists in the DOM. Stopping guessing.');
            isGuessingPasswords = false;
            statusDisplay.textContent = 'Status: Stopped (Username field missing)';
            return;
        }
        if (!document.body.contains(selectedPasswordElement)) {
            logAction('Error: Selected Password field no longer exists in the DOM. Stopping guessing.');
            isGuessingPasswords = false;
            statusDisplay.textContent = 'Status: Stopped (Password field missing)';
            return;
        }
        if (!document.body.contains(selectedLoginButtonElement)) {
            logAction('Error: Selected Login button no longer exists in the DOM. Stopping guessing.');
            isGuessingPasswords = false;
            statusDisplay.textContent = 'Status: Stopped (Login button missing)';
            return;
        }

        // Autofill username every time a password is tried, if enabled AND required
        if (requireUsername && autofillUsernameOnEachAttempt) {
            const usernameToAutofill = yourUsernameInput.value;
            if (selectedUsernameElement.tagName === 'INPUT' && selectedUsernameElement.type === 'text') {
                selectedUsernameElement.value = usernameToAutofill;
                // logAction(`Autofilled username field (ID: "${selectedUsernameElement.id || 'No ID'}") with "${usernameToAutofill}"`); // Too verbose for every attempt
            } else {
                logAction('Error: Selected Username Field is not a text input element. Cannot autofill username. Stopping guessing.');
                isGuessingPasswords = false;
                statusDisplay.textContent = 'Status: Stopped (Username field invalid)';
                return;
            }
        }


        generateNextPassword(); // Generate the next password
        if (!isGuessingPasswords) return; // Check if generateNextPassword stopped it (e.g., max length reached)

        const passwordToTry = currentPasswordAttempt;

        // Ensure the password field is visible
        if (selectedPasswordElement.tagName === 'INPUT' && selectedPasswordElement.type === 'password') {
            selectedPasswordElement.type = 'text';
            // logAction('Password field type changed to "text" for visibility.'); // Only log once if needed
        }

        selectedPasswordElement.value = passwordToTry;
        logAction(`Trying password: "${passwordToTry}" (Length: ${currentPasswordLength})`);

        // Simulate pressing Enter or clicking the login button
        if (selectedLoginButtonElement) {
            selectedLoginButtonElement.click();
            // logAction('Login button clicked.'); // Too verbose for every attempt
        } else {
            logAction('Warning: Login button not selected, cannot simulate submission.');
        }

        // Calculate delay based on safe mode or normal mode, adjusted by speed multiplier
        let delay;
        if (safeModeEnabled) {
            // Delay is a random number between baseAutofillRate (min) and maxRangeMs (max)
            delay = Math.random() * (maxRangeMs - baseAutofillRate) + baseAutofillRate;
        } else {
            // Normal mode: base + random variance
            delay = baseAutofillRate + Math.random() * autofillRateVariance;
        }
        // Apply speed multiplier
        delay = delay / speedMultiplier;

        setTimeout(attemptPassword, delay);
    }

    // --- 6. Add "Start Password Guessing" button functionality ---
    startButton.addEventListener('click', () => {
        if (isGuessingPasswords) {
            logAction('Password guessing is already running.');
            return;
        }

        // Check if login button and password field are selected (always required)
        if (!selectedPasswordElement || !selectedLoginButtonElement) {
            logAction('Please select Password Field and Login Button first.');
            return;
        }

        // Conditional check for username field
        if (requireUsername) {
            if (!selectedUsernameElement) {
                logAction('Username is required. Please select Username Field first.');
                return;
            }
            // Initial check for username element existence and type before starting the loop
            if (!document.body.contains(selectedUsernameElement) || !(selectedUsernameElement.tagName === 'INPUT' && selectedUsernameElement.type === 'text')) {
                logAction('Error: Selected Username field is invalid or no longer exists. Cannot start guessing.');
                return;
            }
        }


        // Validate safe mode range if enabled
        if (safeModeEnabled) {
            if (baseAutofillRate >= maxRangeMs) {
                logAction('Error: In Safe Mode, "Base Autofill Rate (ms)" must be less than "Max Range (ms)". Please adjust settings.');
                return;
            }
        }

        // Reset password guessing state and set initial length
        isGuessingPasswords = true;
        currentPasswordLength = minPasswordLength; // Start with min length from user input
        currentPasswordAttempt = ''; // Will be initialized by generateNextPassword

        statusDisplay.textContent = 'Status: Running...';
        logAction(`Starting password guessing with min length ${minPasswordLength} and max length ${maxPasswordLength}. Character set size: ${currentCharacters.length}. Speed: ${speedMultiplier}x. Safe Mode: ${safeModeEnabled ? 'Enabled' : 'Disabled'}. Require Username: ${requireUsername ? 'Yes' : 'No'}`);
        attemptPassword(); // Start the guessing loop
    });

    // --- 7. Add "Stop" button functionality ---
    stopButton.addEventListener('click', () => {
        if (isGuessingPasswords) {
            isGuessingPasswords = false;
            logAction('Password guessing manually stopped.');
            statusDisplay.textContent = 'Status: Stopped';
            // Optionally revert password field type if it was changed
            if (selectedPasswordElement && selectedPasswordElement.type === 'text') {
                selectedPasswordElement.type = 'password';
                logAction('Password field type reverted to "password".');
            }
        } else {
            logAction('Password guessing is not currently running.');
        }
    });

    // --- 8. Add Settings Save functionality ---
    saveSettingsButton.addEventListener('click', () => {
        const newBaseRate = parseInt(baseRateInput.value, 10);
        const newVariance = parseInt(varianceInput.value, 10);
        const newMinLength = parseInt(minLengthInput.value, 10);
        const newMaxLength = parseInt(maxLengthInput.value, 10);
        const newIncludeCapitalized = includeCapitalizedCheckbox.checked;
        const newAutofillUsername = autofillUsernameCheckbox.checked;
        const newCustomCharacters = customCharactersInput.value;
        const newSpeedMultiplier = parseInt(speedSlider.value, 10);
        const newSafeModeEnabled = safeModeCheckbox.checked; // Get safe mode status
        const newMaxRangeMs = parseInt(maxRangeMsInput.value, 10); // Get max range for safe mode
        const newRequireUsername = requireUsernameCheckbox.checked; // Get require username status

        let settingsChanged = false;

        if (!isNaN(newBaseRate) && newBaseRate >= 0) {
            if (baseAutofillRate !== newBaseRate) { baseAutofillRate = newBaseRate; settingsChanged = true; }
            logAction(`Base Autofill Rate set to: ${baseAutofillRate}ms`);
        } else {
            logAction('Invalid Base Autofill Rate. Please enter a non-negative number.');
            baseRateInput.value = baseAutofillRate;
        }

        if (!isNaN(newVariance) && newVariance >= 0) {
            if (autofillRateVariance !== newVariance) { autofillRateVariance = newVariance; settingsChanged = true; }
            logAction(`Autofill Rate Variance set to: ${autofillRateVariance}ms`);
        } else {
            logAction('Invalid Rate Variance. Please enter a non-negative number.');
            varianceInput.value = autofillRateVariance;
        }

        if (!isNaN(newMinLength) && newMinLength >= 1) {
            if (minPasswordLength !== newMinLength) { minPasswordLength = newMinLength; settingsChanged = true; }
            logAction(`Min Password Length set to: ${minPasswordLength}`);
        } else {
            logAction('Invalid Min Password Length. Please enter a number greater than or equal to 1.');
            minLengthInput.value = minPasswordLength;
        }

        if (!isNaN(newMaxLength) && newMaxLength >= newMinLength) { // Max must be >= Min
            if (maxPasswordLength !== newMaxLength) { maxPasswordLength = newMaxLength; settingsChanged = true; }
            logAction(`Max Password Length set to: ${maxPasswordLength}`);
        } else {
            logAction(`Invalid Max Password Length. Must be >= Min Length (${minPasswordLength}).`);
            maxLengthInput.value = maxPasswordLength;
        }

        if (includeCapitalized !== newIncludeCapitalized) {
            includeCapitalized = newIncludeCapitalized;
            settingsChanged = true;
            logAction(`Include Capitalized Letters set to: ${includeCapitalized}.`);
        }

        if (autofillUsernameOnEachAttempt !== newAutofillUsername) {
            autofillUsernameOnEachAttempt = newAutofillUsername;
            settingsChanged = true;
            logAction(`Autofill Username on Each Attempt set to: ${autofillUsernameOnEachAttempt}.`);
        }

        if (customCharacters !== newCustomCharacters) {
            customCharacters = newCustomCharacters;
            settingsChanged = true;
            logAction(`Custom Characters updated.`);
        }

        if (speedMultiplier !== newSpeedMultiplier) {
            speedMultiplier = newSpeedMultiplier;
            settingsChanged = true;
            logAction(`Speed Multiplier set to: ${speedMultiplier}x.`);
        }

        if (safeModeEnabled !== newSafeModeEnabled) {
            safeModeEnabled = newSafeModeEnabled;
            settingsChanged = true;
            logAction(`Safe Mode set to: ${safeModeEnabled ? 'Enabled' : 'Disabled'}.`);
        }

        if (!isNaN(newMaxRangeMs) && newMaxRangeMs >= 0) {
            if (maxRangeMs !== newMaxRangeMs) { maxRangeMs = newMaxRangeMs; settingsChanged = true; }
            logAction(`Max Range (ms) set to: ${maxRangeMs}ms.`);
        } else {
            logAction('Invalid Max Range (ms). Please enter a non-negative number.');
            maxRangeMsInput.value = maxRangeMs;
        }

        if (requireUsername !== newRequireUsername) {
            requireUsername = newRequireUsername;
            settingsChanged = true;
            logAction(`Require Username set to: ${requireUsername ? 'Yes' : 'No'}.`);
        }

        // Rebuild currentCharacters based on latest settings
        currentCharacters = includeCapitalized ? customCharacters + uppercaseCharacterSet : customCharacters;
        if (settingsChanged) {
            saveSettings(); // Save only if something actually changed
        }
    });

    // --- 9. Add Open/Close Settings and Log Buttons functionality ---
    openSettingsButton.addEventListener('click', () => {
        if (settingsWindow.style.display === 'none') {
            // Update settings inputs with current values before opening
            baseRateInput.value = baseAutofillRate;
            varianceInput.value = autofillRateVariance;
            minLengthInput.value = minPasswordLength;
            maxLengthInput.value = maxPasswordLength;
            includeCapitalizedCheckbox.checked = includeCapitalized;
            autofillUsernameCheckbox.checked = autofillUsernameOnEachAttempt;
            customCharactersInput.value = customCharacters;
            speedSlider.value = speedMultiplier; // Set slider value
            speedValueDisplay.textContent = `${speedMultiplier}x`; // Update slider display
            safeModeCheckbox.checked = safeModeEnabled; // Set safe mode checkbox
            maxRangeMsInput.value = maxRangeMs; // Set max range input
            maxRangeMsInput.disabled = !safeModeEnabled; // Disable/enable based on safe mode
            requireUsernameCheckbox.checked = requireUsername; // Set require username checkbox
            consoleUsernameButton.disabled = !requireUsername; // Update username select button state
            yourUsernameInput.disabled = !requireUsername; // Update username input state

            settingsWindow.style.display = 'block';
            centerWindow(settingsWindow);
            logAction('Settings window opened.');
        } else {
            settingsWindow.style.display = 'none';
            logAction('Settings window hidden.');
        }
    });

    clearLogButton.addEventListener('click', () => {
        inspectorLog.innerHTML = '';
        logAction('Activity log cleared.');
    });

    openLogButton.addEventListener('click', () => {
        if (logWindow.style.display === 'none') {
            logWindow.style.display = 'block';
            centerWindow(logWindow);
            logAction('Activity Log window opened.');
        } else {
            logWindow.style.display = 'none';
            logAction('Activity Log window hidden.');
        }
    });


    // --- 10. Add toggle dot functionality (for main inspector window) ---
    toggleDot.addEventListener('click', () => {
        if (inspectorWindow.style.display === 'none') {
            inspectorWindow.style.display = 'block';
            centerWindow(inspectorWindow);
            toggleDot.style.backgroundColor = 'red';
            logAction('Basic Login Brute Force window opened.');
        } else {
            inspectorWindow.style.display = 'none';
            toggleDot.style.backgroundColor = 'var(--primary-color)';
            logAction('Basic Login Brute Force window hidden.');
        }
    });

    // --- 11. Main Inspector's close button now closes all windows ---
    const mainInspectorCloseButton = inspectorWindow.querySelector('.window-close-button');
    mainInspectorCloseButton.removeEventListener('click', mainInspectorCloseButton.onclick); // Remove old listener
    mainInspectorCloseButton.addEventListener('click', () => {
        inspectorWindow.style.display = 'none';
        settingsWindow.style.display = 'none';
        logWindow.style.display = 'none';
        toggleDot.style.backgroundColor = 'var(--primary-color)';
        logAction('All Basic Login Brute Force windows closed.');
        isSelectingElement = false;
        isGuessingPasswords = false;
        currentFieldToPopulate = null;
        document.body.style.cursor = 'default';
        if (selectedPasswordElement && selectedPasswordElement.type === 'text') {
            selectedPasswordElement.type = 'password';
            logAction('Password field type reverted to "password" on close.');
        }
        statusDisplay.textContent = 'Status: Stopped';
    });


    // --- 12. Optional: Add a simple hover effect for the buttons within the inspector ---
    const allButtons = [
        consoleUsernameButton, consolePasswordButton, consoleLoginButton,
        startButton, stopButton, saveSettingsButton,
        openSettingsButton, openLogButton, clearLogButton
    ];
    allButtons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            button.style.filter = 'brightness(1.1)';
        });
        button.addEventListener('mouseleave', () => {
            button.style.filter = 'brightness(1)';
        });
    });

    logAction('Basic Login Brute Force script loaded and windows created.');

})();