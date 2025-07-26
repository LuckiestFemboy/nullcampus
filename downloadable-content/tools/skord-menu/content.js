(function() {
    // --- Global CSS Styles and Variables ---
    if (!document.getElementById('skord-menu-styles')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'skord-menu-styles';
      document.head.appendChild(styleEl);
  
      styleEl.textContent = `
          :root {
            --skord-bg-dark: #1c1f26;
            --skord-sidebar-bg: #22252c;
            --skord-button-bg: #3b404d;
            --skord-button-hover-bg: #4a505f;
            --skord-primary-btn-bg: #007bff;
            --skord-primary-btn-hover-bg: #0056b3;
            --skord-danger-btn-bg: #dc3545;
            --skord-danger-btn-hover: #bd2130;
            --skord-warning-btn-bg: #ffc107;
            --skord-warning-btn-text: #333;
            --skord-text-color: white;
            --skord-border-color: #3b404d;
            --skord-chat-bg: #2f3e4c;
            --skord-chat-input-bg: #4a5a6b;
            --skord-user-message-bg: #007bff;
            --skord-bot-message-bg: #556c80;
            --skord-accent-color: var(--skord-primary-btn-bg);
            --skord-menu-border-radius: 8px;
            --skord-font-size: 16px;

            /* VSCode-like editor specific colors */
            --vscode-editor-bg: #1e1e1e;
            --vscode-editor-text: #d4d4d4;
            --vscode-editor-border: #3c3c3c;
            --vscode-input-bg: #333333;
            --vscode-input-text: #cccccc;
            --vscode-input-border: #555555;
            --vscode-item-bg: #2d2d2d;
            --vscode-item-border: #3c3c3c;
            --vscode-button-bg: #444444;
            --vscode-button-hover-bg: #555555;
            --vscode-toggle-button-bg: #0e639c;
            --vscode-toggle-button-hover-bg: #1a7bb9;
            --vscode-delete-button-bg: #a1260d;
            --vscode-delete-button-hover-bg: #cc3316;
          }
  
          #skord-div-menu {
            border-radius: var(--skord-menu-border-radius);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            font-size: var(--skord-font-size);
            /* Base transitions for non-dragging animations (opacity, transform, border-radius) */
            transition: opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease, border-radius 0.3s ease;
            transform-origin: center; /* Changed for more central minimize animation */
            /* Removed min-width and min-height as resizing is disabled */
            cursor: default; /* Base cursor for the entire menu */
          }
          /* Class for fullscreen transitions to be applied dynamically */
          #skord-div-menu.fullscreen-transition {
            transition: opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease, width 0.3s ease, height 0.3s ease, left 0.3s ease, top 0.3s ease, border-radius 0.3s ease;
          }

          /* Class to prevent scrolling when in fullscreen */
          html.skord-overflow-hidden, body.skord-overflow-hidden {
            overflow: hidden !important;
          }

          #skord-div-menu .titlebar {
            background: var(--skord-button-hover-bg);
            height: 32px;
            display: flex;
            align-items: center;
            padding: 0 10px; /* Adjusted padding for centering */
            cursor: default; /* Default cursor for the titlebar itself */
            user-select: none;
            flex-shrink: 0;
            justify-content: space-between; /* Distribute space between title and buttons */
          }
          #skord-div-menu .titlebar.dragging {
            /* No specific cursor for dragging, it will inherit default */
          }
          #skord-div-menu .titlebar h2 {
            margin: 0;
            font-size: 14px !important; /* Locked font size */
            font-weight: 600;
            flex-grow: 1; /* Allows it to take space */
            text-align: center; /* Center the text */
          }
          #skord-div-menu .sidebar {
            width: 150px;
            background: var(--skord-sidebar-bg);
            padding: 10px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            flex-shrink: 0;
            overflow-y: auto; /* Added scrollbar to sidebar */
            scrollbar-width: thin;
            scrollbar-color: var(--skord-button-hover-bg) var(--skord-sidebar-bg);
          }
          #skord-div-menu .sidebar::-webkit-scrollbar {
            width: 8px;
          }
          #skord-div-menu .sidebar::-webkit-scrollbar-track {
            background: var(--skord-sidebar-bg);
          }
          #skord-div-menu .sidebar::-webkit-scrollbar-thumb {
            background: var(--skord-button-hover-bg);
            border-radius: 4px;
          }
          #skord-div-menu .sidebar-button {
            background-color: var(--skord-button-bg);
            color: var(--skord-text-color);
            border: none;
            padding: 10px 15px;
            border-radius: var(--skord-menu-border-radius);
            cursor: pointer;
            font-size: calc(var(--skord-font-size) * 0.9);
            font-weight: 500;
            text-align: left;
            transition: background-color 0.2s ease;
            user-select: none;
          }
          #skord-div-menu .sidebar-button:hover {
            background-color: var(--skord-button-hover-bg);
          }
          /* Removed #skord-div-menu #skordAiBtn specific styling */
          #skord-div-menu .sidebar-button.logging-button {
            background-color: var(--skord-accent-color);
          }
          #skord-div-menu .sidebar-button.logging-button:hover {
            background-color: var(--skord-primary-btn-hover-bg);
          }
          .tool-button {
            background-color: var(--skord-button-bg);
            color: var(--skord-text-color);
            border: none;
            padding: 8px 12px;
            border-radius: var(--skord-menu-border-radius);
            cursor: pointer;
            font-size: calc(var(--skord-font-size) * 0.85);
            transition: background-color 0.2s ease;
          }
          .tool-button:hover {
            background-color: var(--skord-button-hover-bg);
          }
          #skord-div-menu #closeMenuBtn {
            background-color: var(--skord-danger-btn-bg);
            margin-top: auto;
          }
  
          #skordai-messages, #logs-output, #skord-main-content, #console-output, #script-library-content, #theme-library-content {
            overflow-y: auto;
            scrollbar-width: thin;
            scrollbar-color: var(--skord-button-hover-bg) var(--skord-chat-bg);
            max-height: 100%;
          }
          #skordai-messages::-webkit-scrollbar,
          #logs-output::-webkit-scrollbar,
          #skord-main-content::-webkit-scrollbar,
          #console-output::-webkit-scrollbar,
          #script-library-content::-webkit-scrollbar,
          #theme-library-content::-webkit-scrollbar {
            width: 8px;
          }
          #skordai-messages::-webkit-scrollbar-track,
          #logs-output::-webkit-scrollbar-track,
          #skord-main-content::-webkit-scrollbar-track,
          #console-output::-webkit-scrollbar-track,
          #script-library-content::-webkit-scrollbar-track,
          #theme-library-content::-webkit-scrollbar-track {
            background: var(--skord-chat-bg);
          }
          #skordai-messages::-webkit-scrollbar-thumb,
          #logs-output::-webkit-scrollbar-thumb,
          #skord-main-content::-webkit-scrollbar-thumb,
          #console-output::-webkit-scrollbar-thumb,
          #script-library-content::-webkit-scrollbar-thumb,
          #theme-library-content::-webkit-scrollbar-thumb {
            background: var(--skord-button-hover-bg);
            border-radius: 4px;
          }
  
          .message {
            padding: 8px 12px;
            border-radius: calc(var(--skord-menu-border-radius) * 2);
            max-width: 80%;
            word-wrap: break-word;
          }
          .user-message {
            background-color: var(--skord-user-message-bg);
            align-self: flex-end;
            border-bottom-right-radius: calc(var(--skord-menu-border-radius) / 2);
          }
          .bot-message {
            background-color: var(--skord-bot-message-bg);
            align-self: flex-start;
            border-bottom-left-radius: calc(var(--skord-menu-border-radius) / 2);
          }
          .typing-indicator {
            font-style: italic;
            color: #bbbbbb;
            background-color: var(--skord-button-bg);
            animation: blink 1s infinite;
          }
          .error-message {
            background-color: var(--skord-danger-btn-bg);
          }
          @keyframes blink {
            50% { opacity: 0.5; }
          }
  
          input[type="range"] {
            -webkit-appearance: none;
            width: 100%;
            height: 8px;
            background: var(--skord-button-bg);
            border-radius: 5px;
            outline: none;
            opacity: 0.9;
            transition: opacity .2s;
          }
          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: var(--skord-accent-color);
            cursor: pointer;
            transition: background 0.2s ease;
          }
          input[type="range"]::-moz-range-thumb {
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: var(--skord-accent-color);
            cursor: pointer;
            transition: background 0.2s ease;
          }
          input[type="color"] {
            border: 1px solid var(--skord-border-color);
            border-radius: 5px;
            padding: 2px;
            cursor: pointer;
            background: transparent;
          }
          input[type="color"]::-webkit-color-swatch-wrapper {
            padding: 0;
          }
          input[type="color"]::-webkit-color-swatch {
            border: none;
            border-radius: 4px;
          }
  
          #skord-menu-button, #skordai-container, #skordai-input {
            border-radius: var(--skord-menu-border-radius);
          }
  
          .skord-highlight {
            outline: 2px solid var(--skord-accent-color);
            outline-offset: 2px;
          }
  
          /* Removed .dark-mode CSS class */

          /* Script/Style Library specific styles */
          .script-item, .theme-item, .style-item {
            background-color: var(--skord-button-bg);
            padding: 10px;
            margin-bottom: 10px;
            border-radius: var(--skord-menu-border-radius);
            display: flex;
            justify-content: space-between;
            align-items: center;
            border: 1px solid var(--skord-border-color); /* Added border for visual separation */
            box-shadow: 0 2px 5px rgba(0,0,0,0.2); /* Added shadow for depth */
          }
          .script-item-name, .theme-item-name, .style-item-name {
            font-weight: 600;
          }
          .script-download-button, .theme-download-button { /* Changed to theme-download-button */
            background-color: var(--skord-primary-btn-bg); /* Blue color */
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: var(--skord-menu-border-radius);
            cursor: pointer;
            text-decoration: none; /* Remove underline from <a> */
            font-size: calc(var(--skord-font-size) * 0.85);
            transition: background-color 0.2s ease, box-shadow 0.2s ease; /* Added box-shadow to transition */
          }
          .script-download-button:hover, .theme-download-button:hover { /* Changed to theme-download-button */
            background-color: var(--skord-primary-btn-hover-bg);
            box-shadow: 0 0 8px rgba(0, 123, 255, 0.6); /* Added subtle glow on hover */
          }

          /* Improved readability for main content sections */
          #skord-main-content h1 {
            margin-bottom: 1.2em; /* More space below main headings */
            line-height: 1.3;
          }
          #skord-main-content h2 {
            margin-top: 1.5em; /* Space before sub-headings */
            margin-bottom: 1em; /* Space below sub-headings */
            line-height: 1.3;
          }
          #skord-main-content p {
            margin-bottom: 1em; /* Space between paragraphs */
            line-height: 1.6; /* Increased line height for better readability */
          }
          #skord-main-content ul,
          #skord-main-content ol {
            margin-bottom: 1em; /* Space below lists */
            padding-left: 25px; /* Indent lists */
          }
          #skord-main-content li {
            margin-bottom: 0.5em; /* Space between list items */
            line-height: 1.5; /* Increased line height for list items */
          }
          #skord-main-content pre {
            margin-bottom: 1em; /* Space below code blocks */
            line-height: 1.4;
          }

          /* Titlebar buttons */
          .titlebar-buttons {
            display: flex;
            gap: 8px; /* Space between buttons */
            /* margin-left: auto; Removed as justify-content handles it now */
          }

          .titlebar-button {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            cursor: pointer; /* Pointer cursor for buttons */
            transition: transform 0.2s ease;
          }

          .titlebar-button:hover {
            transform: scale(1.1);
          }

          .yellow-button {
            background-color: #ffc107; /* Yellow */
          }

          .green-button {
            background-color: #28a745; /* Green */
          }

          .red-button {
            background-color: #dc3545; /* Red */
          }

          /* Fixed height for performance graphs */
          #fps-graph-canvas,
          #memory-graph-canvas,
          #cpu-graph-canvas {
            height: 80px !important; /* Fixed height for graphs */
            max-height: 80px !important; /* Ensure max-height also fixed */
          }

          /* New styles for VSCode-like editor */
          .vscode-editor-tabs {
            display: flex;
            border-bottom: 1px solid var(--vscode-editor-border);
            background-color: var(--skord-sidebar-bg); /* Match sidebar for tabs */
            /* Removed border-top-left-radius and border-top-right-radius */
            overflow: hidden; /* Ensure rounded corners apply */
          }

          .vscode-tab-button {
            padding: 10px 15px;
            border: none;
            background-color: transparent;
            color: var(--skord-text-color);
            cursor: pointer;
            font-size: calc(var(--skord-font-size) * 0.9);
            transition: background-color 0.2s ease;
            outline: none;
            border-radius: 0; /* No border radius on tabs */
          }

          .vscode-tab-button:hover {
            background-color: var(--skord-button-hover-bg);
          }

          .vscode-tab-button.active {
            background-color: var(--skord-bg-dark); /* Active tab background */
            color: white;
            border-bottom: 2px solid var(--skord-accent-color); /* Active tab indicator */
          }

          .vscode-tab-content {
            display: none; /* Hidden by default */
            flex-grow: 1;
            padding: 12px;
            overflow-y: auto; /* Allow content to scroll */
            background-color: var(--skord-bg-dark);
            border-bottom-left-radius: var(--skord-menu-border-radius);
            border-bottom-right-radius: var(--skord-menu-border-radius);
          }

          .vscode-tab-content.active {
            display: flex; /* Show when active */
            flex-direction: column; /* Default to column for overall layout */
          }

          .vscode-editor-container-inner { /* New container for editor + sidebar */
            display: flex;
            gap: 15px; /* Space between editor and saved list */
            flex-grow: 1; /* Allow to fill vertical space */
            overflow: hidden; /* Prevent inner scrollbars from messing up layout */
          }

          .vscode-editor-main {
            flex: 2; /* Editor takes more space */
            display: flex;
            flex-direction: column;
            gap: 10px;
            background: var(--vscode-editor-bg); /* Dark background for the main editor area */
            border-radius: var(--skord-menu-border-radius);
            padding: 10px;
            border: 1px solid var(--vscode-editor-border);
          }

          .vscode-editor-sidebar-list {
            flex: 1; /* Saved list takes less space */
            display: flex;
            flex-direction: column;
            gap: 10px;
            background: var(--vscode-editor-bg); /* Dark background for sidebar */
            border-radius: var(--skord-menu-border-radius);
            padding: 10px;
            border: 1px solid var(--vscode-editor-border);
            overflow-y: auto; /* Enable scrolling for the sidebar */
            scrollbar-width: thin;
            scrollbar-color: var(--skord-button-hover-bg) var(--vscode-editor-bg);
          }
          .vscode-editor-sidebar-list::-webkit-scrollbar {
            width: 8px;
          }
          .vscode-editor-sidebar-list::-webkit-scrollbar-track {
            background: var(--vscode-editor-bg);
          }
          .vscode-editor-sidebar-list::-webkit-scrollbar-thumb {
            background: var(--skord-button-hover-bg);
            border-radius: 4px;
          }
          .vscode-editor-sidebar-list .file-item {
            padding: 8px 10px;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.2s ease;
            white-space: nowrap; /* Prevent text wrapping */
            overflow: hidden; /* Hide overflow */
            text-overflow: ellipsis; /* Add ellipsis for overflow */
            color: var(--vscode-editor-text); /* Ensure file names are visible */
          }
          .vscode-editor-sidebar-list .file-item:hover {
            background-color: var(--vscode-button-hover-bg);
          }
          .vscode-editor-sidebar-list .file-item.active {
            background-color: var(--vscode-item-bg); /* Highlight active file */
            border: 1px solid var(--skord-accent-color);
          }


          .vscode-editor-textarea {
            width: 100%;
            height: 100%; /* Fill available height */
            flex-grow: 1; /* Allow textarea to grow */
            background: var(--vscode-editor-bg); /* Darker background for code editor */
            color: var(--vscode-editor-text); /* Light text color */
            border: 1px solid var(--vscode-editor-border); /* Darker border */
            border-radius: var(--skord-menu-border-radius);
            padding: 10px;
            font-family: 'Fira Code', 'Cascadia Code', 'Consolas', 'monospace'; /* VSCode-like font stack */
            font-size: 14px; /* Consistent code font size */
            resize: vertical; /* Allow vertical resizing */
            line-height: 1.5; /* Better readability for code */
            white-space: pre; /* Preserve whitespace */
            overflow: auto; /* Ensure scrollbars appear if content overflows */
          }

          .vscode-input {
            width: 100%;
            padding: 8px;
            background: var(--vscode-input-bg); /* Dark input background */
            color: var(--vscode-input-text); /* Light input text */
            border: 1px solid var(--vscode-input-border); /* Darker input border */
            border-radius: 4px; /* Slightly smaller border radius for inputs */
            font-size: 14px;
          }

          .vscode-button-group {
            display: flex;
            gap: 8px;
            margin-top: 10px;
          }

          .vscode-button-group .tool-button {
            flex-grow: 1; /* Distribute buttons evenly */
          }

          .style-item-row, .script-item-row {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            padding: 8px;
            margin-bottom: 5px;
            background: var(--vscode-item-bg); /* Item background */
            border-radius: 6px; /* Slightly smaller border radius for items */
            border: 1px solid var(--vscode-item-border); /* Item border */
            box-shadow: none; /* Remove extra shadow */
          }

          .style-item-row strong, .script-item-row strong {
            color: var(--vscode-editor-text); /* Item name color */
          }

          .style-item-row .tool-button, .script-item-row .tool-button {
            background: var(--vscode-button-bg); /* Button background in sidebar */
            color: var(--vscode-input-text);
            padding: 4px 8px;
            font-size: 12px;
            border-radius: 4px;
            transition: background-color 0.2s ease;
          }
          .style-item-row .tool-button:hover, .script-item-row .tool-button:hover {
            background: var(--vscode-button-hover-bg); /* Button hover background */
          }
          .style-item-row .tool-button[data-action="toggle"], .script-item-row .tool-button[data-action="toggle"] {
            background: var(--vscode-toggle-button-bg); /* Blue for toggle button */
          }
          .style-item-row .tool-button[data-action="toggle"]:hover, .script-item-row .tool-button[data-action="toggle"]:hover {
            background: var(--vscode-toggle-button-hover-bg);
          }
          .style-item-row .tool-button[data-action="delete"], .script-item-row .tool-item-button[data-action="delete"] {
            background: var(--vscode-delete-button-bg); /* Red for delete button */
          }
          .style-item-row .tool-button[data-action="delete"]:hover, .script-item-row .tool-item-button[data-action="delete"]:hover {
            background: var(--vscode-delete-button-hover-bg);
          }
      `;
    }
  
    // --- Initial Skord Button Setup ---
    (function addSkordButton() {
      try {
        const navMain = document.getElementById('nav-main');
        const ul = navMain ? navMain.querySelector('ul') : null; // Check if navMain exists before querying for ul
    
        if (!navMain || !ul) {
          console.log("Could not find #nav-main or its ul. Skipping Skord Menu button creation.");
          return; // Exit if no suitable place is found
        }
    
        if (document.getElementById('skord-menu-button')) {
          console.log("Skord Menu button already exists. Skipping creation.");
          return;
        }
    
        const newLi = document.createElement('li');
        newLi.id = 'skord-menu-button';
        newLi.textContent = 'Skord Menu';
    
        Object.assign(newLi.style, {
          width: '100%',
          border: 'none',
          borderRadius: 'var(--skord-menu-border-radius)',
          fontSize: '1.1rem',
          fontWeight: '600',
          cursor: 'pointer',
          textAlign: 'center',
          textDecoration: 'none',
          display: 'inline-block',
          margin: '10px 0',
          backgroundColor: 'var(--skord-danger-btn-bg)',
          color: 'white',
          boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
          transition: 'all 0.2s ease',
          textShadow: 'none',
          height: '60px',
          lineHeight: '60px',
          listStyle: 'none',
          userSelect: 'none'
        });
    
        ul.insertBefore(newLi, ul.firstChild);
        newLi.addEventListener('click', createDraggableSkordDiv);
      } catch (error) {
        console.error("Error creating Skord Menu button:", error);
        addLog(`Error creating Skord Menu button: ${error.message}`, 'ERROR');
      }
    })();
  
    // --- Tilde Key Listener ---
    document.addEventListener('keydown', (e) => {
      const skordMenu = document.getElementById('skord-div-menu');
  
      if (e.key === '~' || e.keyCode === 192) {
        if (skordMenu) {
          // Toggle visibility if menu exists
          if (skordMenu.style.visibility === 'hidden') {
            skordMenu.style.opacity = '1';
            skordMenu.style.pointerEvents = 'auto';
            skordMenu.style.visibility = 'visible';
            skordMenu.style.transform = 'scale(1) translateY(0)'; // Reset transform for smooth re-appearance
            addLog('Skord Menu opened via ~ key.', 'KEYBOARD');
          } else {
            hideMenu(); // Use the hideMenu function for consistent animation
            addLog('Skord Menu closed via ~ key.', 'KEYBOARD');
          }
        } else {
          // If menu doesn't exist, create it
          createDraggableSkordDiv();
          addLog('Skord Menu opened via ~ key.', 'KEYBOARD');
        }
        e.preventDefault(); // Prevent default browser behavior for '~'
      } else if (e.key === 'Escape' || e.keyCode === 27) {
        if (skordMenu && skordMenu.style.visibility === 'visible') { // Only hide if visible
          hideMenu(); // Use the hideMenu function for consistent animation
          addLog('Skord Menu closed via Escape key.', 'KEYBOARD');
        }
        e.preventDefault(); // Prevent default browser behavior for 'Escape'
      }
    });

    // Global variable to keep track of the currently active editor (CSS or Script)
    let activeEditorType = null; // 'css' or 'script'
  
    // --- Global Variables ---
    let isDevToolsEnabled = false;
    let isNetworkBlockingEnabled = false;
    let isNetworkLoggingEnabled = false;
    const loggedEvents = [];
    const logSettings = { keyboard: false, mouse: false, pageSwaps: false, errors: false, network: false };
    let animationFrameId = null;
    let lastFpsUpdateTime = 0;
    let frameCount = 0;
    let isRainbowModeActive = false;
    let rainbowAnimationInterval = null;
    let currentHue = 0;
    const fpsData = [];
    const memoryData = [];
    const cpuData = [];
    const MAX_GRAPH_POINTS = 100;
    let isSkordButtonOpacityApplied = false;
    let currentMenuBorderRadius = 8; // This will be set to defaultMenuBorderRadius
    let currentFontSize = 16; // This will be set to defaultFontSize
    let isInspectorEnabled = false;
    let isPersistentHighlight = false;
    const consoleLogs = [];
    let isCSSEditorEnabled = false;
    let isScriptInjectorEnabled = false;
    let isFullscreen = false; // Track fullscreen state - Initialize as false

    // Store original position and size to revert from fullscreen.
    // Initialize with a sensible default windowed size and centered position.
    let originalMenuPos = {
      width: 800, // Default width
      height: 600, // Default height
      left: (window.innerWidth - 800) / 2, // Centered horizontally
      top: (window.innerHeight - 600) / 2 // Centered vertically
    };

    // Removed resizing variables as resizing is disabled

    // Default theme values
    const defaultOpacity = '1.0';
    const defaultAccentColor = '#007bff';
    const defaultMenuBorderRadius = 10; // Changed to 10
    const defaultFontSize = 13; // Changed to 13
    const defaultBgColor = '#1c1f26';
    const defaultTextColor = 'white';
    // Removed initialPageTitle, defaultCursorUrl, defaultFaviconUrl as they are no longer exposed in UI
    // Keeping getFaviconUrl and resetFavicon for internal use if needed, but not tied to UI.
  
    // Set initial current values to match the desired defaults
    currentMenuBorderRadius = defaultMenuBorderRadius;
    currentFontSize = defaultFontSize;
  
    // --- Storage Functions ---
    async function saveSettings() {
      const settings = {
        theme: {
          opacity: document.body.style.opacity || defaultOpacity,
          applyOpacityToSkord: isSkordButtonOpacityApplied,
          accentColor: getComputedStyle(document.documentElement).getPropertyValue('--skord-accent-color').trim() || defaultAccentColor,
          borderRadius: currentMenuBorderRadius,
          fontSize: currentFontSize,
          bgColor: getComputedStyle(document.documentElement).getPropertyValue('--skord-bg-dark').trim() || defaultBgColor,
          textColor: getComputedStyle(document.documentElement).getPropertyValue('--skord-text-color').trim() || defaultTextColor,
          // Removed pageTitle, cursorUrl, faviconUrl from settings
        },
        devTools: {
          devToolsEnabled: isDevToolsEnabled,
          networkBlocking: isNetworkBlockingEnabled,
          networkLogging: isNetworkLoggingEnabled,
          inspectorEnabled: isInspectorEnabled,
          persistentHighlight: isPersistentHighlight,
          cssEditorEnabled: isCSSEditorEnabled,
          scriptInjectorEnabled: isScriptInjectorEnabled
        }
      };
      try {
        // Using chrome.storage.local for persistent storage
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            await chrome.storage.local.set({ skordSettings: settings });
            addLog('Settings saved to Chrome local storage.', 'STORAGE');
        } else {
            // Fallback for non-extension environment (e.g., running content.js directly in a browser console)
            localStorage.setItem('skordSettings', JSON.stringify(settings));
            addLog('Settings saved to browser local storage (Chrome storage not available).', 'STORAGE');
        }
      } catch (error) {
        addLog(`Failed to save settings: ${error.message}`, 'STORAGE');
      }
    }
  
    async function loadSettings() {
      try {
        let settings = null;
        // Using chrome.storage.local for persistent storage
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            const result = await chrome.storage.local.get(['skordSettings']);
            settings = result.skordSettings;
            if (settings) {
                addLog('Settings loaded from Chrome local storage.', 'STORAGE');
            }
        } else {
            // Fallback for non-extension environment
            settings = JSON.parse(localStorage.getItem('skordSettings'));
            if (settings) {
                addLog('Settings loaded from browser local storage (Chrome storage not available).', 'STORAGE');
            }
        }

        if (settings) {
            applySettings(settings);
        }
      } catch (error) {
        addLog(`Failed to load settings: ${error.message}`, 'STORAGE');
      }
    }

    function applySettings(settings) {
        // Theme Settings
        if (settings.theme) {
            document.body.style.opacity = settings.theme.opacity || defaultOpacity;
            isSkordButtonOpacityApplied = settings.theme.applyOpacityToSkord || false;
            document.documentElement.style.setProperty('--skord-accent-color', settings.theme.accentColor || defaultAccentColor);
            currentMenuBorderRadius = settings.theme.borderRadius || defaultMenuBorderRadius;
            document.documentElement.style.setProperty('--skord-menu-border-radius', `${currentMenuBorderRadius}px`);
            currentFontSize = settings.theme.fontSize || defaultFontSize;
            document.documentElement.style.setProperty('--skord-font-size', `${currentFontSize}px`);
            document.documentElement.style.setProperty('--skord-bg-dark', settings.theme.bgColor || defaultBgColor);
            document.documentElement.style.setProperty('--skord-text-color', settings.theme.textColor || defaultTextColor);
            // Removed pageTitle, cursorUrl, faviconUrl application
        }
        // Dev Tools Settings
        if (settings.devTools) {
            isDevToolsEnabled = settings.devTools.devToolsEnabled || false;
            isNetworkBlockingEnabled = settings.devTools.networkBlocking || false;
            isNetworkLoggingEnabled = settings.devTools.networkLogging || false;
            isInspectorEnabled = settings.devTools.inspectorEnabled || false;
            isPersistentHighlight = settings.devTools.persistentHighlight || false;
            isCSSEditorEnabled = settings.devTools.cssEditorEnabled || false;
            isScriptInjectorEnabled = settings.devTools.scriptInjectorEnabled || false;
            
            // Apply visibility settings for sidebar buttons
            const cssEditorBtn = document.getElementById('cssEditorBtn');
            const scriptInjectorBtn = document.getElementById('scriptInjectorBtn');
            if (cssEditorBtn) cssEditorBtn.style.display = isCSSEditorEnabled ? 'block' : 'none';
            if (scriptInjectorBtn) scriptInjectorBtn.style.display = isScriptInjectorEnabled ? 'block' : 'none';
        }
    }
  
    // --- Utility and Core Functions ---
    function loadScript(url) {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${url}"]`)) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = url;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
        document.head.appendChild(script);
      });
    }
  
    function addLog(message, category = 'GENERAL') {
      // Only log if DevTools is enabled, or if it's a critical error/storage message
      if (isDevToolsEnabled || category === 'STORAGE' || category === 'ERROR') {
        const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const fullMessage = `[${timestamp}] [${category}] ${message}`;
        loggedEvents.push(fullMessage);
        const logsOutput = document.getElementById('logs-output');
        if (logsOutput) {
          logsOutput.innerHTML += `<p style="margin: 2px 0; padding: 0;">${fullMessage}</p>`;
          logsOutput.scrollTop = logsOutput.scrollHeight;
        }
      }
    }
  
    function drawGraph(canvas, data, maxVal, color) {
      const ctx = canvas.getContext('2d');
      if (!ctx) return; // Ensure context is available
      ctx.clearRect(0, 0, canvas.width, canvas.height);
  
      ctx.fillStyle = 'var(--skord-chat-bg)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
  
      ctx.strokeStyle = '#3b404d';
      ctx.lineWidth = 0.5;
  
      for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height - (canvas.height / 4) * i);
        ctx.lineTo(canvas.width, canvas.height - (canvas.height / 4) * i);
        ctx.stroke();
      }
  
      if (data.length === 0) return;
  
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
  
      const step = canvas.width / (MAX_GRAPH_POINTS - 1);
  
      data.forEach((val, index) => {
        const x = index * step;
        const y = canvas.height - (val / maxVal) * canvas.height;
  
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    }
  
    function startPerformanceMonitoring(fpsOutputElement, memoryOutputElement, cpuOutputElement, fpsCanvas, memoryCanvas, cpuCanvas) {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
  
      let lastCpuTime = performance.now();
  
      const animate = (currentTime) => {
        frameCount++;
        if (currentTime > lastFpsUpdateTime + 1000) {
          const fps = Math.round((frameCount * 1000) / (currentTime - lastFpsUpdateTime));
          if (fpsOutputElement) fpsOutputElement.textContent = `FPS: ${fps}`;
  
          fpsData.push(fps);
          if (fpsData.length > MAX_GRAPH_POINTS) {
            fpsData.shift();
          }
          if (fpsCanvas) {
            drawGraph(fpsCanvas, fpsData, 60, 'rgb(0, 255, 0)');
          }
  
          frameCount = 0;
          lastFpsUpdateTime = currentTime;
        }
        if (memoryOutputElement && window.performance?.memory) {
          const memory = window.performance.memory;
          const usedMB = (memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
          const totalMB = (memory.totalJSHeapSize / 1024 / 1024).toFixed(2);
          if (memoryOutputElement) memoryOutputElement.textContent = `JS Heap: ${usedMB} MB / ${totalMB} MB`;
  
          memoryData.push(parseFloat(usedMB));
          if (memoryData.length > MAX_GRAPH_POINTS) {
            memoryData.shift();
          }
          if (memoryCanvas) {
            drawGraph(memoryCanvas, memoryData, parseFloat(totalMB) * 1.2, 'rgb(255, 165, 0)');
          }
        }
        if (cpuOutputElement && performance.now) {
          const deltaTime = currentTime - lastCpuTime;
          // Simple estimation of CPU usage, not truly accurate for browser context
          const cpuUsage = Math.min(100, (deltaTime / 1000) * 100).toFixed(2);
          if (cpuOutputElement) cpuOutputElement.textContent = `CPU Usage: ${cpuUsage}%`;
  
          cpuData.push(parseFloat(cpuUsage));
          if (cpuData.length > MAX_GRAPH_POINTS) {
            cpuData.shift();
          }
          if (cpuCanvas) {
            drawGraph(cpuCanvas, cpuData, 100, 'rgb(255, 0, 0)');
          }
          lastCpuTime = currentTime;
        }
        animationFrameId = requestAnimationFrame(animate);
      };
      animationFrameId = requestAnimationFrame(animate);
      addLog('Performance monitoring started.', 'PERFORMANCE');
    }
  
    function stopPerformanceMonitoring() {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
        addLog('Performance monitoring stopped.', 'PERFORMANCE');
      }
      fpsData.length = 0;
      memoryData.length = 0;
      cpuData.length = 0;
      const fpsCanvas = document.getElementById('fps-graph-canvas');
      const memoryCanvas = document.getElementById('memory-graph-canvas');
      const cpuCanvas = document.getElementById('cpu-graph-canvas');
      [fpsCanvas, memoryCanvas, cpuCanvas].forEach(canvas => {
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'var(--skord-chat-bg)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
        }
      });
    }
  
    function startRainbowAnimation() {
      if (isRainbowModeActive) return;
      isRainbowModeActive = true;
      currentHue = 0;
  
      const themeColorPicker = document.getElementById('theme-color-picker');
      const resetThemeColorBtn = document.getElementById('reset-theme-color-btn');
      if (themeColorPicker) themeColorPicker.disabled = true;
      if (resetThemeColorBtn) resetThemeColorBtn.disabled = true;
  
      rainbowAnimationInterval = setInterval(() => {
        currentHue = (currentHue + 1) % 360;
        const newColor = `hsl(${currentHue}, 100%, 50%)`;
        document.documentElement.style.setProperty('--skord-accent-color', newColor);
  
        const skordDiv = document.getElementById('skord-div-menu');
        if (skordDiv) {
          skordDiv.querySelectorAll('.logging-button').forEach(btn => {
            btn.style.backgroundColor = newColor;
          });
        }
      }, 50);
      addLog('Rainbow accent mode started.', 'THEME');
    }
  
    function stopRainbowAnimation() {
      if (!isRainbowModeActive) return;
      clearInterval(rainbowAnimationInterval);
      rainbowAnimationInterval = null;
      isRainbowModeActive = false;
  
      const themeColorPicker = document.getElementById('theme-color-picker');
      const resetThemeColorBtn = document.getElementById('reset-theme-color-btn');
      if (themeColorPicker) themeColorPicker.disabled = false;
      if (resetThemeColorBtn) resetThemeColorBtn.disabled = false;
  
      const defaultAccentColor = getComputedStyle(document.documentElement).getPropertyValue('--skord-primary-btn-bg').trim() || defaultAccentColor;
      document.documentElement.style.setProperty('--skord-accent-color', defaultAccentColor);
      if (themeColorPicker) themeColorPicker.value = defaultAccentColor;
  
      const skordDiv = document.getElementById('skord-div-menu');
      if (skordDiv) {
        skordDiv.querySelectorAll('.logging-button').forEach(btn => {
          btn.style.backgroundColor = defaultAccentColor;
        });
      }
      addLog('Rainbow accent mode stopped.', 'THEME');
    }
  
    // --- Favicon functions (kept for potential internal use, not exposed in UI) ---
    function getFaviconUrl() {
        let favicon = document.querySelector("link[rel~='icon']");
        return favicon ? favicon.href : '';
    }

    function setFavicon(url) {
        let favicon = document.createElement('link');
        favicon.rel = 'icon';
        favicon.href = url;
        // Remove existing favicons to ensure the new one takes precedence
        document.querySelectorAll("link[rel~='icon']").forEach(link => link.remove());
        document.head.appendChild(favicon);
        addLog(`Favicon set to: ${url}`, 'THEME');
    }

    // This function is no longer needed as there's no UI to reset favicon
    // function resetFavicon() {
    //     setFavicon(defaultFaviconUrl);
    //     addLog('Favicon reset to default.', 'THEME');
    // }

    // --- Console and Inspector Functions ---
    function setupConsoleInterceptor() {
      ['log', 'warn', 'error'].forEach(method => {
        const original = console[method];
        console[method] = (...args) => {
          const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg).join(' ');
          consoleLogs.push({
            type: method,
            message: `[${new Date().toLocaleTimeString('en-US', { hour12: false })}] ${message}`,
            timestamp: Date.now()
          });
          const consoleOutput = document.getElementById('console-output');
          if (consoleOutput) {
            consoleOutput.innerHTML += `<p style="margin: 2px 0; padding: 0; color: ${method === 'error' ? '#ff5555' : method === 'warn' ? '#ffaa00' : '#ffffff'}">${consoleLogs[consoleLogs.length - 1].message}</p>`;
            consoleOutput.scrollTop = consoleOutput.scrollHeight;
          }
          original.apply(console, args);
        };
      });
    }
  
    function setupElementInspector() {
      let lastClickedElement = null;
  
      const logElementStyles = (e) => {
        if (!isInspectorEnabled) return;
        const element = e.target;
        if (element.closest('#skord-div-menu')) return;
  
        e.preventDefault();
        e.stopPropagation();
  
        const computedStyles = window.getComputedStyle(element);
        const styles = {
          id: element.id || 'None',
          class: element.classList.length ? Array.from(element.classList).filter(cls => cls !== 'skord-highlight').join(' ') || 'None' : 'None',
          background: computedStyles.background || computedStyles.backgroundColor || 'None',
          borderRadius: computedStyles.borderRadius || 'None',
          border: computedStyles.border || 'None'
        };
  
        const message = `Element clicked: id=${styles.id}, class=${styles.class}, bg=${styles.background}, border-radius=${styles.borderRadius}, border=${styles.border}`;
        console.log(message); // Log to browser console as well
        consoleLogs.push({
          type: 'log',
          message: `[${new Date().toLocaleTimeString('en-US', { hour12: false })}] ${message}`,
          timestamp: Date.now()
        });
  
        const consoleOutput = document.getElementById('console-output');
          if (consoleOutput) {
            consoleOutput.innerHTML += `<p style="margin: 2px 0; padding: 0; color: #ffffff">${consoleLogs[consoleLogs.length - 1].message}</p>`;
            consoleOutput.scrollTop = consoleOutput.scrollHeight;
          }
  
        if (lastClickedElement && lastClickedElement !== element) {
          lastClickedElement.classList.remove('skord-highlight');
        }
        element.classList.add('skord-highlight');
        lastClickedElement = element;
  
        if (!isPersistentHighlight) {
          setTimeout(() => {
            if (lastClickedElement) {
              lastClickedElement.classList.remove('skord-highlight');
              lastClickedElement = null;
            }
          }, 500);
        }
      };
  
      document.addEventListener('click', logElementStyles);
  
      return () => {
        document.removeEventListener('click', logElementStyles);
        if (lastClickedElement) {
          lastClickedElement.classList.remove('skord-highlight');
        }
        addLog('Element inspector disabled.', 'INSPECTOR');
      };
    }
  
    // Initialize console interceptor
    setupConsoleInterceptor();
  
    // --- CSS-Editor helpers ---
    // This function now sends a message to the background script for injection
    function applyCSSToPage(cssCode, styleName) {
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage({
                action: "injectCSSInMainWorld",
                cssCode: cssCode,
                styleId: styleName
            }).then(response => {
                if (response && response.status === "success") {
                    // Log is handled by service worker sending message back
                } else {
                    addLog(`Failed to inject CSS "${styleName}" via service worker: ${response?.message || 'Unknown error'}`, 'CSS_EDITOR');
                }
            }).catch(error => {
                addLog(`Error sending CSS "${styleName}" to service worker: ${error.message}`, 'CSS_EDITOR');
            });
        } else {
            // Fallback for non-extension environment (direct injection)
            let styleEl = document.getElementById(styleName);
            if (!styleEl) {
                styleEl = document.createElement('style');
                styleEl.id = styleName;
                document.head.appendChild(styleEl);
            }
            styleEl.textContent = cssCode;
            addLog(`CSS "${styleName}" applied directly (not via service worker).`, 'CSS_EDITOR');
        }
    }
  
    // This function now sends a message to the background script for removal
    function removeCustomCSS(styleName) {
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage({
                action: "removeCSSFromMainWorld",
                styleId: styleName
            }).then(response => {
                if (response && response.status === "success") {
                    // Log is handled by service worker sending message back
                } else {
                    addLog(`Failed to remove CSS "${styleName}" via service worker: ${response?.message || 'Unknown error'}`, 'CSS_EDITOR');
                }
            }).catch(error => {
                addLog(`Error sending CSS removal for "${styleName}" to service worker: ${error.message}`, 'CSS_EDITOR');
            });
        } else {
            // Fallback for non-extension environment (direct removal)
            const el = document.getElementById(styleName);
            if (el) el.remove();
            addLog(`CSS "${styleName}" removed directly (not via service worker).`, 'CSS_EDITOR');
        }
    }
  
    // New functions for managing saved CSS styles using chrome.storage.local
    async function getSavedStyles() {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            return new Promise((resolve) => {
                chrome.storage.local.get(['skordCustomStyles'], (result) => {
                    resolve(result.skordCustomStyles || []);
                });
            });
        } else {
            // Fallback for non-extension environment
            return JSON.parse(localStorage.getItem('skordCustomStyles') || '[]');
        }
    }

    async function saveStyles(styles) {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            return new Promise((resolve, reject) => {
                chrome.storage.local.set({ skordCustomStyles: styles }, () => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve();
                    }
                });
            });
        } else {
            // Fallback for non-extension environment
            localStorage.setItem('skordCustomStyles', JSON.stringify(styles));
            return Promise.resolve();
        }
    }

    // Helper function to update the status message in the CSS Editor UI
    function updateStyleStatus(msg, color) {
        const statusDiv = document.getElementById('css-status');
        if (statusDiv) {
            statusDiv.textContent = `Status: ${msg}`;
            statusDiv.style.color = color;
        }
    }

    async function toggleStyle(index) {
        const styles = await getSavedStyles();
        if (styles[index]) {
            styles[index].enabled = !styles[index].enabled;
            const styleId = `skord-custom-css-${styles[index].name.replace(/\s+/g, '-')}`;
            
            if (styles[index].enabled) {
                applyCSSToPage(styles[index].cssCode, styleId); // Send to background for injection
            } else {
                removeCustomCSS(styleId); // Send to background for removal
            }
            
            await saveStyles(styles);
            // Re-render both lists to ensure consistency
            renderSavedStylesList('', 'editor');
            renderSavedStylesList('', 'saved'); 
            updateStyleStatus(`Style "${styles[index].name}" ${styles[index].enabled ? 'enabled' : 'disabled'}`, 'var(--skord-accent-color)');
            addLog(`Style "${styles[index].name}" ${styles[index].enabled ? 'enabled' : 'disabled'}.`, 'CSS_EDITOR');
        }
    }

    async function loadStyle(index) {
        const styles = await getSavedStyles();
        if (styles[index]) {
            const styleNameInput = document.getElementById('style-name');
            const cssEditor = document.getElementById('css-editor');
            const targetSitesSelect = document.getElementById('css-target-sites');
            const customTargetSitesInput = document.getElementById('css-custom-target-sites-input');

            if (styleNameInput && cssEditor && targetSitesSelect && customTargetSitesInput) {
                styleNameInput.value = styles[index].name;
                cssEditor.value = styles[index].cssCode;
                
                // Set target sites dropdown/input
                const styleTargetSites = styles[index].targetSites || [];
                if (styleTargetSites.includes('all_sites')) {
                    targetSitesSelect.value = 'all_sites';
                    customTargetSitesInput.style.display = 'none';
                } else if (styleTargetSites.includes(window.location.href)) {
                    targetSitesSelect.value = 'current_url';
                    customTargetSitesInput.style.display = 'none';
                } else if (styleTargetSites.includes(window.location.hostname)) {
                    targetSitesSelect.value = 'current_domain';
                    customTargetSitesInput.style.display = 'none';
                } else {
                    targetSitesSelect.value = 'custom';
                    customTargetSitesInput.style.display = 'block';
                    customTargetSitesInput.value = styleTargetSites.join(', ');
                }
                updateStyleStatus(`Style "${styles[index].name}" loaded for editing`, 'var(--skord-primary-btn-bg)');
                addLog(`Style "${styles[index].name}" loaded for editing.`, 'CSS_EDITOR');

                // Highlight the loaded item in the editor's sidebar
                document.querySelectorAll('#saved-styles-list-editor .file-item').forEach(item => {
                    item.classList.remove('active');
                    if (item.dataset.index == index) {
                        item.classList.add('active');
                    }
                });
            }
        }
    }

    async function deleteStyle(index) {
        const styles = await getSavedStyles();
        if (styles[index]) {
            showCustomConfirm(`Delete style "${styles[index].name}"?`, async () => {
                const styleId = `skord-custom-css-${styles[index].name.replace(/\s+/g, '-')}`;
                removeCustomCSS(styleId); // Send to background for removal
                const deletedName = styles[index].name;
                styles.splice(index, 1);
                await saveStyles(styles);
                // Re-render both lists after deletion
                renderSavedStylesList('', 'editor');
                renderSavedStylesList('', 'saved'); 
                updateStyleStatus(`Style "${deletedName}" deleted`, 'var(--skord-danger-btn-bg)');
                addLog(`Style "${deletedName}" deleted.`, 'CSS_EDITOR');
            });
        }
    }

    async function renderSavedStylesList(filter = '', targetList = 'editor') {
        const savedStylesList = document.getElementById(`saved-styles-list-${targetList}`);
        if (!savedStylesList) return;

        const styles = await getSavedStyles();
        const filteredStyles = styles.filter(style => 
            style.name.toLowerCase().includes(filter.toLowerCase())
        );

        if (filteredStyles.length === 0) {
            savedStylesList.innerHTML = '<p style="text-align: center; color: #888;">No saved styles found.</p>';
            return;
        }

        let stylesHtml = '';
        filteredStyles.forEach((style, index) => {
            // Find the original index to ensure correct toggle/load/delete actions
            const originalIndex = styles.findIndex(s => s.name === style.name);
            const targetDisplay = Array.isArray(style.targetSites) && style.targetSites.length > 0
                ? style.targetSites.includes('all_sites') ? 'All Sites' : style.targetSites.join(', ')
                : 'All Sites'; // Default to 'All Sites' if not specified
            
            if (targetList === 'editor') {
                stylesHtml += `
                <div class="file-item" data-index="${originalIndex}">
                  ${style.name}
                </div>
                `;
            } else { // targetList === 'saved'
                stylesHtml += `
                <div class="style-item-row" style="display: flex; flex-direction: column; align-items: flex-start; padding: 8px; margin-bottom: 5px; background: var(--vscode-item-bg); border-radius: 6px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                    <strong>${style.name}</strong>
                    <div style="display: flex; gap: 5px;">
                      <button class="tool-button style-action-button" data-action="toggle" data-index="${originalIndex}" style="background: var(--vscode-toggle-button-bg);">
                        ${style.enabled ? 'Disable' : 'Enable'}
                      </button>
                      <button class="tool-button style-action-button" data-action="load" data-index="${originalIndex}">Load</button>
                      <button class="tool-button style-action-button" data-action="delete" data-index="${originalIndex}" style="background: var(--vscode-delete-button-bg);">Delete</button>
                    </div>
                  </div>
                  <div style="font-size: 0.8em; color: #aaa; margin-top: 4px;">Target: ${targetDisplay}</div>
                </div>
                `;
            }
        });
        savedStylesList.innerHTML = stylesHtml;

        if (targetList === 'editor') {
            savedStylesList.querySelectorAll('.file-item').forEach(item => {
                item.addEventListener('click', (event) => {
                    const index = parseInt(event.target.dataset.index);
                    loadStyle(index);
                });
            });
        } else { // targetList === 'saved'
            savedStylesList.querySelectorAll('.style-action-button').forEach(button => {
                button.addEventListener('click', (event) => {
                    const action = event.target.dataset.action;
                    const index = parseInt(event.target.dataset.index);

                    switch (action) {
                        case 'toggle':
                            toggleStyle(index);
                            break;
                        case 'load':
                            loadStyle(index);
                            break;
                        case 'delete':
                            deleteStyle(index);
                            break;
                    }
                });
            });
        }
    }


    // --- Script Injector helpers ---
    // Modified executeScript to send message to service worker for main world injection
    function executeScript(scriptCode, scriptName) {
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage({
                action: "injectScriptInMainWorld", // Changed action name
                code: scriptCode,
                name: scriptName
            }).then(response => {
                if (response && response.status === "success") {
                    // Log is handled by service worker sending message back
                } else {
                    addLog(`Failed to execute script "${scriptName}" via service worker: ${response?.message || 'Unknown error'}`, 'SCRIPT_INJECTOR');
                }
            }).catch(error => {
                addLog(`Error sending script "${scriptName}" to service worker: ${error.message}`, 'SCRIPT_INJECTOR');
            });
            return true; // Assume success for now, actual success is confirmed by message from background
        } else {
            // Fallback for non-extension environment (original behavior)
            try {
                const script = document.createElement('script');
                script.textContent = scriptCode;
                script.setAttribute('data-skord-script', scriptName);
                document.head.appendChild(script);
                addLog(`Script "${scriptName}" executed directly (not via service worker).`, 'SCRIPT_INJECTOR');
                return true;
            } catch (error) {
                addLog(`Failed to execute script "${scriptName}" directly: ${error.message}`, 'SCRIPT_INJECTOR');
                return false;
            }
        }
    }
    
    function removeScript(scriptName) {
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage({
                action: "removeScriptFromMainWorld",
                scriptName: scriptName
            }).then(response => {
                if (response && response.status === "success") {
                    // Log is handled by service worker sending message back
                } else {
                    addLog(`Failed to remove script "${scriptName}" via service worker: ${response?.message || 'Unknown error'}`, 'SCRIPT_INJECTOR');
                }
            }).catch(error => {
                addLog(`Error sending script removal for "${scriptName}" to service worker: ${error.message}`, 'SCRIPT_INJECTOR');
            });
        } else {
            const scripts = document.querySelectorAll(`script[data-skord-script="${scriptName}"]`);
            scripts.forEach(script => script.remove());
        }
    }
  
    async function getSavedScripts() {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            return new Promise((resolve) => {
                chrome.storage.local.get(['skordCustomScripts'], (result) => {
                    resolve(result.skordCustomScripts || []);
                });
            });
        } else {
            return JSON.parse(localStorage.getItem('skordCustomScripts') || '[]');
        }
    }
  
    async function saveScripts(scripts) {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            return new Promise((resolve, reject) => {
                chrome.storage.local.set({ skordCustomScripts: scripts }, () => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve();
                    }
                });
            });
        } else {
            localStorage.setItem('skordCustomScripts', JSON.stringify(scripts));
            return Promise.resolve();
        }
    }
  
    // Auto-load saved scripts on page load - This logic now primarily resides in background.js
    // The content script will only receive messages from background.js to inject.

    // Helper function to update the status message in the Script Injector UI
    function updateScriptStatus(msg, color) {
        const statusDiv = document.getElementById('script-status');
        if (statusDiv) {
            statusDiv.textContent = `Status: ${msg}`;
            statusDiv.style.color = color;
        }
    }

    async function toggleScript(index) {
        const scripts = await getSavedScripts();
        if (scripts[index]) {
            scripts[index].enabled = !scripts[index].enabled;
            
            // When toggling, we don't directly inject/remove here.
            // The background script will handle the injection/removal based on the 'enabled' state
            // and the target sites when the tab updates or becomes active.
            // For immediate effect, we could send a message to background.js to re-evaluate.
            // For now, saving the state is sufficient, as background.js listens for tab changes.
            
            await saveScripts(scripts);
            // Re-render both lists to ensure consistency
            renderSavedScriptsList('', 'editor');
            renderSavedScriptsList('', 'saved'); 
            updateScriptStatus(`Script "${scripts[index].name}" ${scripts[index].enabled ? 'enabled' : 'disabled'}`, 'var(--skord-accent-color)');
            addLog(`Script "${scripts[index].name}" ${scripts[index].enabled ? 'enabled' : 'disabled'}.`, 'SCRIPT_INJECTOR');
        }
    }

    async function loadScript(index) {
        const scripts = await getSavedScripts();
        if (scripts[index]) {
            const scriptNameInput = document.getElementById('script-name');
            const scriptEditor = document.getElementById('script-editor');
            const targetSitesSelect = document.getElementById('script-target-sites');
            const customTargetSitesInput = document.getElementById('script-custom-target-sites-input');

            if (scriptNameInput && scriptEditor && targetSitesSelect && customTargetSitesInput) {
                scriptNameInput.value = scripts[index].name;
                scriptEditor.value = scripts[index].code;
                
                // Set target sites dropdown/input
                const scriptTargetSites = scripts[index].targetSites || [];
                if (scriptTargetSites.includes('all_sites')) {
                    targetSitesSelect.value = 'all_sites';
                    customTargetSitesInput.style.display = 'none';
                } else if (scriptTargetSites.includes(window.location.href)) {
                    targetSitesSelect.value = 'current_url';
                    customTargetSitesInput.style.display = 'none';
                } else if (scriptTargetSites.includes(window.location.hostname)) {
                    targetSitesSelect.value = 'current_domain';
                    customTargetSitesInput.style.display = 'none';
                } else {
                    targetSitesSelect.value = 'custom';
                    customTargetSitesInput.style.display = 'block';
                    customTargetSitesInput.value = scriptTargetSites.join(', ');
                }
                updateScriptStatus(`Script "${scripts[index].name}" loaded for editing`, 'var(--skord-primary-btn-bg)');
                addLog(`Script "${scripts[index].name}" loaded for editing.`, 'SCRIPT_INJECTOR');

                // Highlight the loaded item in the editor's sidebar
                document.querySelectorAll('#saved-scripts-list-editor .file-item').forEach(item => {
                    item.classList.remove('active');
                    if (item.dataset.index == index) {
                        item.classList.add('active');
                    }
                });
            }
        }
    }

    async function deleteScript(index) {
        const scripts = await getSavedScripts();
        if (scripts[index]) {
            // Using a custom modal for confirmation instead of alert/confirm
            showCustomConfirm(`Delete script "${scripts[index].name}"?`, async () => {
                removeScript(scripts[index].name); // Send to background for removal
                const deletedName = scripts[index].name;
                scripts.splice(index, 1);
                await saveScripts(scripts);
                // Re-render both lists after deletion
                renderSavedScriptsList('', 'editor');
                renderSavedScriptsList('', 'saved'); 
                updateScriptStatus(`Script "${deletedName}" deleted`, 'var(--skord-danger-btn-bg)');
                addLog(`Script "${deletedName}" deleted.`, 'SCRIPT_INJECTOR');
            });
        }
    }

    // Helper function to render the list of saved scripts
    async function renderSavedScriptsList(filter = '', targetList = 'editor') {
        const savedScriptsList = document.getElementById(`saved-scripts-list-${targetList}`);
        if (!savedScriptsList) return;

        const scripts = await getSavedScripts();
        const filteredScripts = scripts.filter(script => 
            script.name.toLowerCase().includes(filter.toLowerCase())
        );

        if (filteredScripts.length === 0) {
            savedScriptsList.innerHTML = '<p style="text-align: center; color: #888;">No saved scripts found.</p>';
            return;
        }

        // Build the HTML string
        let scriptsHtml = '';
        filteredScripts.forEach((script, index) => {
            // Find the original index to ensure correct toggle/load/delete actions
            const originalIndex = scripts.findIndex(s => s.name === script.name);
            const targetDisplay = Array.isArray(script.targetSites) && script.targetSites.length > 0
                ? script.targetSites.includes('all_sites') ? 'All Sites' : script.targetSites.join(', ')
                : 'All Sites'; // Default to 'All Sites' if not specified
            
            if (targetList === 'editor') {
                scriptsHtml += `
                <div class="file-item" data-index="${originalIndex}">
                  ${script.name}
                </div>
                `;
            } else { // targetList === 'saved'
                scriptsHtml += `
                <div class="script-item-row" style="display: flex; flex-direction: column; align-items: flex-start; padding: 8px; margin-bottom: 5px; background: var(--vscode-item-bg); border-radius: 6px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                    <strong>${script.name}</strong>
                    <div style="display: flex; gap: 5px;">
                      <button class="tool-button script-action-button" data-action="toggle" data-index="${originalIndex}" style="background: var(--vscode-toggle-button-bg);">
                        ${script.enabled ? 'Disable' : 'Enable'}
                      </button>
                      <button class="tool-button script-action-button" data-action="load" data-index="${originalIndex}">Load</button>
                      <button class="tool-button script-action-button" data-action="delete" data-index="${originalIndex}" style="background: var(--vscode-delete-button-bg);">Delete</button>
                    </div>
                  </div>
                  <div style="font-size: 0.8em; color: #aaa; margin-top: 4px;">Target: ${targetDisplay}</div>
                </div>
                `;
            }
        });
        savedScriptsList.innerHTML = scriptsHtml;

        if (targetList === 'editor') {
            savedScriptsList.querySelectorAll('.file-item').forEach(item => {
                item.addEventListener('click', (event) => {
                    const index = parseInt(event.target.dataset.index);
                    loadScript(index);
                });
            });
        } else { // targetList === 'saved'
            savedScriptsList.querySelectorAll('.script-action-button').forEach(button => {
                button.addEventListener('click', (event) => {
                    const action = event.target.dataset.action;
                    const index = parseInt(event.target.dataset.index);

                    switch (action) {
                        case 'toggle':
                            toggleScript(index);
                            break;
                        case 'load':
                            loadScript(index);
                            break;
                            break;
                        case 'delete':
                            deleteScript(index);
                            break;
                    }
                });
            });
        }
    }

    // Custom confirmation modal function
    function showCustomConfirm(message, onConfirm) {
        const modalId = 'skord-confirm-modal';
        let modal = document.getElementById(modalId);

        if (!modal) {
            modal = document.createElement('div');
            modal.id = modalId;
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            `;
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div style="
                background-color: var(--skord-bg-dark);
                padding: 20px;
                border-radius: var(--skord-menu-border-radius);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
                color: var(--skord-text-color);
                font-family: 'Roboto', sans-serif;
                text-align: center;
                max-width: 300px;
                width: 90%;
            ">
                <p style="margin-bottom: 20px; font-size: 1.1em;">${message}</p>
                <div style="display: flex; justify-content: center; gap: 10px;">
                    <button id="skord-confirm-yes" class="tool-button" style="background-color: var(--skord-danger-btn-bg);">Yes</button>
                    <button id="skord-confirm-no" class="tool-button" style="background-color: var(--skord-button-bg);">No</button>
                </div>
            </div>
        `;

        const confirmYesBtn = document.getElementById('skord-confirm-yes');
        const confirmNoBtn = document.getElementById('skord-confirm-no');

        if (confirmYesBtn) confirmYesBtn.onclick = () => {
            onConfirm();
            if (modal) modal.remove();
        };

        if (confirmNoBtn) confirmNoBtn.onclick = () => {
            if (modal) modal.remove();
        };
    }
  
    function createDraggableSkordDiv() {
      let skordDiv = document.getElementById('skord-div-menu');

      if (skordDiv) {
        // If menu already exists, make it visible again
        skordDiv.style.opacity = '1';
        skordDiv.style.pointerEvents = 'auto';
        skordDiv.style.visibility = 'visible';
        skordDiv.style.transform = 'scale(1) translateY(0)'; // Reset transform for smooth re-appearance
        addLog('Skord Menu already open, making it visible.', 'GENERAL');
        return;
      }
  
      // Load settings before rendering
      loadSettings();
  
      skordDiv = document.createElement('div');
      skordDiv.id = 'skord-div-menu';
      Object.assign(skordDiv.style, {
        position: 'fixed',
        border: 'none',
        boxShadow: '0 0 12px rgba(0,0,0,0.5)',
        zIndex: 9999,
        backgroundColor: 'var(--skord-bg-dark)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        color: 'var(--skord-text-color)',
        fontFamily: 'Roboto, sans-serif',
        opacity: '1', /* Ensure it's visible when created */
        pointerEvents: 'auto', /* Ensure it's interactive when created */
        visibility: 'visible' /* Ensure it's visible when created */
      });
  
      document.body.appendChild(skordDiv);

      // Apply initial windowed size and position from originalMenuPos
      skordDiv.style.width = `${originalMenuPos.width}px`;
      skordDiv.style.height = `${originalMenuPos.height}px`;
      skordDiv.style.left = `${originalMenuPos.left}px`;
      skordDiv.style.top = `${originalMenuPos.top}px`;
      skordDiv.style.borderRadius = `var(--skord-menu-border-radius)`; // Apply default border radius
  
      skordDiv.innerHTML = `
        <div class="titlebar" id="skord-titlebar">
          <h2>Skord Menu</h2>
          <div class="titlebar-buttons">
            <div id="minimizeBtn" class="titlebar-button yellow-button" title="Minimize Menu"></div>
            <div id="fullscreenBtn" class="titlebar-button green-button" title="Toggle Fullscreen"></div>
            <div id="closeBtn" class="titlebar-button red-button" title="Close Menu"></div>
          </div>
        </div>
        <div style="display: flex; flex-grow: 1; height: calc(100% - 32px);">
          <nav class="sidebar">
            <button class="sidebar-button" id="aboutBtn" title="Learn about Skord Menu">About</button>
            <button class="sidebar-button" id="featuresBtn" title="View all Skord features">Features</button>
            <button class="sidebar-button" id="devToolsBtn" title="Access developer tools">Dev Tools</button>
            <button class="sidebar-button" id="toolsBtn" title="Utility tools and performance monitoring">Performance</button>
            <button class="sidebar-button" id="themesBtn" title="Customize Skord's appearance">Light Editor</button>
            <button class="sidebar-button" id="cssEditorBtn" title="Edit custom CSS for the site" style="display: ${isCSSEditorEnabled ? 'block' : 'none'};">CSS Editor</button>
            <button class="sidebar-button" id="scriptInjectorBtn" title="Inject custom scripts" style="display: ${isScriptInjectorEnabled ? 'block' : 'none'};">Script Injector</button>
            <button class="sidebar-button" id="scriptLibraryBtn" title="Browse and download scripts">Script Library</button>
            <button class="sidebar-button" id="themeLibraryBtn" title="Browse and apply themes">Theme Library</button>
            <button class="sidebar-button" id="cacheBtn" title="Manage extension cache and data">Cache</button>
            <button class="sidebar-button logging-button" id="logsBtn" style="display: ${isDevToolsEnabled ? 'block' : 'none'};" title="View live logs">Logs</button>
            <button class="sidebar-button logging-button" id="logControlsBtn" style="display: ${isDevToolsEnabled ? 'block' : 'none'};" title="Control log settings">Log Controls</button>
            <button class="sidebar-button" id="documentationBtn" title="Learn how to use Skord Menu features">Documentation</button>
            <button class="sidebar-button" id="closeMenuBtn" style="background-color: var(--skord-danger-btn-bg); margin-top: auto;" title="Close Skord Menu">Close Menu</button>
          </nav>
          <main id="skord-main-content" style="flex-grow: 1; padding: 12px; overflow-y: auto; overflow-x: hidden; max-height: calc(100% - 32px);">
            <h1>Welcome to Skord</h1>
            <p>Select an option from the menu.</p>
          </main>
        </div>`;
  
      const titlebar = document.getElementById('skord-titlebar');
      let isDragging = false, offsetX, offsetY;
  
      titlebar.addEventListener('mousedown', e => {
        // Only start dragging if the click is directly on the titlebar, not its buttons
        // The titlebar itself should have default cursor, buttons have pointer
        if (e.target === titlebar || e.target.tagName === 'H2') {
            isDragging = true;
            offsetX = e.clientX - skordDiv.offsetLeft;
            offsetY = e.clientY - skordDiv.offsetTop;
            // No class added for grabbing cursor on titlebar itself
        }
      });
  
      document.addEventListener('mousemove', e => {
        if (isDragging) {
            let newLeft = e.clientX - offsetX;
            let newTop = e.clientY - offsetY;
      
            // Keep within viewport bounds
            newLeft = Math.min(Math.max(0, newLeft), window.innerWidth - skordDiv.offsetWidth);
            newTop = Math.min(Math.max(0, newTop), window.innerHeight - skordDiv.offsetHeight);
      
            skordDiv.style.left = `${newLeft}px`;
            skordDiv.style.top = `${newTop}px`;

            // Update original position if not in fullscreen
            if (!isFullscreen) {
                originalMenuPos.left = newLeft;
                originalMenuPos.top = newTop;
            }
        }
        // Removed resizing logic and associated cursor changes
      });
  
      document.addEventListener('mouseup', () => {
        isDragging = false;
        // No class removed for grabbing cursor on titlebar itself
      });

      // Removed mousedown listener on skordDiv for resizing
      // Removed mousemove listener on skordDiv for hover-to-resize cursors
      // Removed mouseleave listener on skordDiv for cursor reset
  
      const mainContent = document.getElementById('skord-main-content');
      const loggingButtons = skordDiv.querySelectorAll('.logging-button');
      const skordMenuButton = document.getElementById('skord-menu-button');
  
      if (isSkordButtonOpacityApplied && skordMenuButton && document.body.style.opacity) {
        skordMenuButton.style.opacity = document.body.style.opacity;
      }

      // Get references to new titlebar buttons
      const minimizeBtn = document.getElementById('minimizeBtn');
      const fullscreenBtn = document.getElementById('fullscreenBtn');
      const closeTitlebarBtn = document.getElementById('closeBtn'); // Renamed to avoid conflict with sidebar close button

      // Function to hide the menu with animation
      const hideMenu = () => {
        const skordDiv = document.getElementById('skord-div-menu');
        if (skordDiv) {
            skordDiv.style.opacity = '0';
            skordDiv.style.transform = 'scale(0.1) translateY(100px)'; // Shrink and move down-right
            // Set visibility to hidden after the transition completes
            setTimeout(() => {
                skordDiv.style.pointerEvents = 'none';
                skordDiv.style.visibility = 'hidden';
            }, 300); // Match CSS transition duration
            addLog('Skord Menu hidden.', 'UI');
            stopPerformanceMonitoring();
            stopRainbowAnimation();
            if (isInspectorEnabled) {
              isInspectorEnabled = false;
            }
            // Ensure overflow is restored if menu is hidden
            document.documentElement.classList.remove('skord-overflow-hidden');
            document.body.classList.remove('skord-overflow-hidden');
        }
      };

      // Add event listeners for titlebar buttons
      if (minimizeBtn) minimizeBtn.addEventListener('click', hideMenu);
      if (closeTitlebarBtn) closeTitlebarBtn.addEventListener('click', hideMenu); // Both yellow and red buttons hide the menu

      if (fullscreenBtn) fullscreenBtn.addEventListener('click', () => {
        const skordDiv = document.getElementById('skord-div-menu');
        if (!skordDiv) return;

        // Temporarily enable fullscreen transitions
        skordDiv.classList.add('fullscreen-transition');

        if (isFullscreen) {
          // EXITING fullscreen
          skordDiv.style.width = `${originalMenuPos.width}px`;
          skordDiv.style.height = `${originalMenuPos.height}px`;
          skordDiv.style.left = `${originalMenuPos.left}px`;
          skordDiv.style.top = `${originalMenuPos.top}px`;
          skordDiv.style.borderRadius = `var(--skord-menu-border-radius)`; // Revert border radius
          
          // Remove overflow: hidden from html and body
          document.documentElement.classList.remove('skord-overflow-hidden');
          document.body.classList.remove('skord-overflow-hidden');

          addLog('Skord Menu exited fullscreen.', 'UI');
        } else {
          // ENTERING fullscreen
          // Save current windowed dimensions and position BEFORE going fullscreen
          originalMenuPos.left = skordDiv.offsetLeft;
          originalMenuPos.top = skordDiv.offsetTop;
          originalMenuPos.width = skordDiv.offsetWidth;
          originalMenuPos.height = skordDiv.offsetHeight;

          skordDiv.style.width = '100vw';
          skordDiv.style.height = '100vh';
          skordDiv.style.left = '0';
          skordDiv.style.top = '0';
          skordDiv.style.borderRadius = '0px'; // Set border radius to 0

          // Add overflow: hidden to html and body
          document.documentElement.classList.add('skord-overflow-hidden');
          document.body.classList.add('skord-overflow-hidden');

          addLog('Skord Menu entered fullscreen.', 'UI');
        }
        isFullscreen = !isFullscreen;

        // Disable fullscreen transitions after a short delay (matching CSS transition duration)
        setTimeout(() => {
            skordDiv.classList.remove('fullscreen-transition');
        }, 300); // 300ms matches the transition duration
      });

      // REMOVED: The block that automatically triggers fullscreen on menu creation.
      // if (!isFullscreen) {
      //   setTimeout(() => {
      //       const fsBtn = document.getElementById('fullscreenBtn');
      //       if (fsBtn) {
      //           fsBtn.click();
      //       }
      //   }, 50);
      // }
  
      if (document.getElementById('aboutBtn')) document.getElementById('aboutBtn').addEventListener('click', () => {
        if (!mainContent) return;
        mainContent.innerHTML = `
          <h1>About Skord</h1>
          <p>Skord Menu is a versatile, draggable interface designed to enhance your browsing experience with powerful tools and utilities.</p>
          <p><strong>Version:</strong> Stable Release 1.0</p>
          <p>Built with modern web technologies, Skord integrates developer tools, and customization options for seamless interaction.</p>
          <h2>Contributors</h2>
          <ul>
            <li><strong>EvanRunner</strong> - Lead Developer</li>
            <li><strong>Lucky?</strong> - Core Developer</li>
          </ul>`;
        stopRainbowAnimation();
      });
  
      if (document.getElementById('featuresBtn')) document.getElementById('featuresBtn').addEventListener('click', () => {
        if (!mainContent) return;
        mainContent.innerHTML = `
          <h1>Skord Menu Features</h1>
          <h2>General</h2>
          <ul>
            <li><strong>Draggable Interface:</strong> Move the Skord Menu anywhere on the screen.</li>
            <li><strong>Fixed Window Size:</strong> The menu maintains a consistent size.</li>
            <li><strong>Customizable Appearance:</strong> Adjust colors, opacity, font size, and border radius via the Light Editor.</li>
            <li><strong>Responsive Design:</strong> Optimized for various browsing environments.</li>
            <li><strong>Persistent Settings:</strong> Save and load Light Editor and Dev Tools settings using browser storage.</li>
            <li><strong>Hotkey Activation:</strong> Press ~ to open the Skord Menu instantly.</li>
            <li><strong>Fullscreen Mode:</strong> Expand the menu to fill the entire screen, preventing page scrolling.</li>
            <li><strong>Minimize/Hide:</strong> Hide the menu while retaining its position for quick re-access.</li>
          </ul>
          <h2>Developer Tools</h2>
          <ul>
            <li><strong>Element Inspector:</strong> Click elements to log their ID, classes, and styles with optional persistent highlighting.</li>
            <li><strong>Console Viewer:</strong> Monitor console logs, warnings, and errors in real-time.</li>
            <li><strong>Network Interceptor:</strong> Block or log network requests (now handled by Service Worker).</li>
            <li><strong>Log Controls:</strong> Toggle logging for keyboard, mouse, page swaps, errors, and network events.</li>
            <li><strong>CSS Editor Toggle:</strong> Enable/disable the custom CSS editor.</li>
            <li><strong>Script Injector Toggle:</strong> Enable/disable the custom script injector.</li>
          </ul>
          <h2>Light Editor</h2>
          <ul>
            <li><strong>Global Opacity:</strong> Adjust page transparency with an option to apply to the Skord Menu button.</li>
            <li><strong>Accent Color:</strong> Customize the menu's accent color or enable a rainbow animation.</li>
            <li><strong>Font Size:</strong> Adjust the menu's text size for readability.</li>
            <li><strong>Border Radius:</strong> Modify the roundness of menu elements.</li>
            <li><strong>Background and Text Colors:</strong> Customize the menu's appearance.</li>
          </ul>
          <h2>Utilities</h2>
          <ul>
            <li><strong>Performance Monitor:</strong> Track FPS, JS heap memory, and estimated CPU usage with fixed-height graphs.</li>
          </ul>
          <h2>CSS Editor (Requires Dev Tools Toggle)</h2>
          <ul>
            <li><strong>Custom CSS:</strong> Write and apply custom CSS to the page.</li>
            <li><strong>Global Persistence:</strong> Saved CSS is stored globally using Chrome storage.</li>
            <li><strong>Site Targeting:</strong> Choose to apply styles to all sites, the current URL, the current domain, or custom URLs/domains.</li>
            <li><strong>Style Management:</strong> Save, enable/disable, load for editing, and delete multiple custom CSS styles.</li>
          </ul>
          <h2>Script Injector (Requires Dev Tools Toggle)</h2>
          <ul>
            <li><strong>Custom JavaScript:</strong> Add, manage, and execute custom JavaScript on the page (now injected into main world).</li>
            <li><strong>Global Persistence & Auto-load:</strong> Saved scripts are stored globally and can be enabled to auto-execute on page load based on site targeting.</li>
            <li><strong>Site Targeting:</strong> Choose to apply scripts to all sites, the current URL, the current domain, or custom URLs/domains.</li>
            <li><strong>Execution Control:</strong> Toggle, load, and delete individual scripts.</li>
          </ul>
          <h2>Script Library</h2>
          <ul>
            <li><strong>Search Scripts:</strong> Filter available scripts by name.</li>
            <li><strong>Download Scripts:</strong> Easily download scripts for use.</li>
          </ul>
          <h2>Theme Library</h2>
          <ul>
            <li><strong>Browse Themes:</strong> Discover pre-defined CSS themes.</li>
            <li><strong>Download CSS:</strong> Download the CSS code for a theme to copy and apply it using the CSS Editor.</li>
          </ul>`;
        stopRainbowAnimation();
      });
  
      if (document.getElementById('devToolsBtn')) document.getElementById('devToolsBtn').addEventListener('click', () => {
        if (!mainContent) return;
        mainContent.innerHTML = `
          <h1>Developer Tools</h1>
          <p>Manage and monitor web page interactions.</p>
          <div style="display:flex; flex-direction:column; gap:10px;">
            <button id="toggleInspectorBtn" class="tool-button">Toggle Element Inspector (${isInspectorEnabled ? 'ON' : 'OFF'})</button>
            <button id="togglePersistentHighlightBtn" class="tool-button">Toggle Persistent Highlight (${isPersistentHighlight ? 'ON' : 'OFF'})</button>
            <button id="toggleNetworkBlockingBtn" class="tool-button">Toggle Network Blocking (${isNetworkBlockingEnabled ? 'ON' : 'OFF'})</button>
            <button id="toggleNetworkLoggingBtn" class="tool-button">Toggle Network Logging (${isNetworkLoggingEnabled ? 'ON' : 'OFF'})</button>
            <button id="toggleCSSEditorBtn" class="tool-button">Toggle CSS Editor (${isCSSEditorEnabled ? 'ON' : 'OFF'})</button>
            <button id="toggleScriptInjectorBtn" class="tool-button">Toggle Script Injector (${isScriptInjectorEnabled ? 'ON' : 'OFF'})</button>
            <button id="clearConsoleBtn" class="tool-button">Clear Console Logs</button>
          </div>
          <div style="margin-top:15px;">
            <h2>Console Output</h2>
            <div id="console-output" style="height: 200px; background-color: var(--skord-chat-bg); border: 1px solid var(--skord-border-color); border-radius: var(--skord-menu-border-radius); padding: 10px; overflow-y: auto; font-family: monospace; font-size: 12px; color: white;"></div>
          </div>
        `;
        const toggleInspectorBtn = document.getElementById('toggleInspectorBtn');
        const togglePersistentHighlightBtn = document.getElementById('togglePersistentHighlightBtn');
        const toggleNetworkBlockingBtn = document.getElementById('toggleNetworkBlockingBtn');
        const toggleNetworkLoggingBtn = document.getElementById('toggleNetworkLoggingBtn');
        const toggleCSSEditorBtn = document.getElementById('toggleCSSEditorBtn');
        const toggleScriptInjectorBtn = document.getElementById('toggleScriptInjectorBtn');
        const clearConsoleBtn = document.getElementById('clearConsoleBtn');
        const consoleOutput = document.getElementById('console-output');
  
        // Populate console output with existing logs
        if (consoleOutput) {
            consoleOutput.innerHTML = consoleLogs.map(log =>
            `<p style="margin: 2px 0; padding: 0; color: ${log.type === 'error' ? '#ff5555' : log.type === 'warn' ? '#ffaa00' : '#ffffff'}">${log.message}</p>`).join('');
            consoleOutput.scrollTop = consoleOutput.scrollHeight;
        }
  
        let disableInspector = null;
  
        if (toggleInspectorBtn) toggleInspectorBtn.addEventListener('click', () => {
          isInspectorEnabled = !isInspectorEnabled;
          toggleInspectorBtn.textContent = `Toggle Element Inspector (${isInspectorEnabled ? 'ON' : 'OFF'})`;
          if (isInspectorEnabled) {
            disableInspector = setupElementInspector();
            addLog('Element inspector enabled.', 'INSPECTOR');
          } else {
            if (disableInspector) {
              disableInspector();
              disableInspector = null;
            }
          }
          saveSettings();
        });
  
        if (togglePersistentHighlightBtn) togglePersistentHighlightBtn.addEventListener('click', () => {
          isPersistentHighlight = !isPersistentHighlight;
          togglePersistentHighlightBtn.textContent = `Toggle Persistent Highlight (${isPersistentHighlight ? 'ON' : 'OFF'})`;
          addLog(`Persistent highlight ${isPersistentHighlight ? 'enabled' : 'disabled'}.`, 'INSPECTOR');
          saveSettings();
        });
  
        if (toggleNetworkBlockingBtn) toggleNetworkBlockingBtn.addEventListener('click', () => {
          isNetworkBlockingEnabled = !isNetworkBlockingEnabled;
          toggleNetworkBlockingBtn.textContent = `Toggle Network Blocking (${isNetworkBlockingEnabled ? 'ON' : 'OFF'})`;
          // Send message to service worker to toggle network blocking
          if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage({ action: "toggleNetworkBlocking", enabled: isNetworkBlockingEnabled });
          }
          saveSettings();
        });
  
        if (toggleNetworkLoggingBtn) toggleNetworkLoggingBtn.addEventListener('click', () => {
          isNetworkLoggingEnabled = !isNetworkLoggingEnabled;
          toggleNetworkLoggingBtn.textContent = `Toggle Network Logging (${isNetworkLoggingEnabled ? 'ON' : 'OFF'})`;
          // Send message to service worker to toggle network logging
          if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage({ action: "toggleNetworkLogging", enabled: isNetworkLoggingEnabled });
          }
          saveSettings();
        });
        
        if (toggleCSSEditorBtn) toggleCSSEditorBtn.addEventListener('click', () => {
          isCSSEditorEnabled = !isCSSEditorEnabled;
          toggleCSSEditorBtn.textContent = `Toggle CSS Editor (${isCSSEditorEnabled ? 'ON' : 'OFF'})`;
          
          const cssEditorBtn = document.getElementById('cssEditorBtn');
          if (cssEditorBtn) {
            cssEditorBtn.style.display = isCSSEditorEnabled ? 'block' : 'none';
          }
          
          addLog(`CSS Editor ${isCSSEditorEnabled ? 'enabled' : 'disabled'}.`, 'DEVTOOLS');
          saveSettings();
        });
  
        if (toggleScriptInjectorBtn) toggleScriptInjectorBtn.addEventListener('click', () => {
          isScriptInjectorEnabled = !isScriptInjectorEnabled;
          toggleScriptInjectorBtn.textContent = `Toggle Script Injector (${isScriptInjectorEnabled ? 'ON' : 'OFF'})`;
          
          const scriptInjectorBtn = document.getElementById('scriptInjectorBtn');
          if (scriptInjectorBtn) {
            scriptInjectorBtn.style.display = isScriptInjectorEnabled ? 'block' : 'none';
          }
          
          addLog(`Script Injector ${isScriptInjectorEnabled ? 'enabled' : 'disabled'}.`, 'DEVTOOLS');
          saveSettings();
        });
  
        if (clearConsoleBtn) clearConsoleBtn.addEventListener('click', () => {
          consoleLogs.length = 0;
          if (consoleOutput) consoleOutput.innerHTML = '<p style="margin: 2px 0; padding: 0; color: #ffffff;">Console cleared.</p>';
          addLog('Console logs cleared by user.', 'CONSOLE');
        });
        stopRainbowAnimation();
      });
  
      if (document.getElementById('toolsBtn')) document.getElementById('toolsBtn').addEventListener('click', () => {
        if (!mainContent) return;
        mainContent.innerHTML = `
          <h1>Performance & Utilities</h1>
          <p>Helpful functions for your Browse experience.</p>
          <div style="display:flex; flex-direction:column; gap:10px;">
            <button id="togglePerformanceMonitorBtn" class="tool-button">Start Performance Monitor</button>
            <div style="display:flex; flex-direction:column; gap:5px; margin-top:10px;">
              <p id="fps-output">FPS: --</p>
              <canvas id="fps-graph-canvas" width="300" height="80" style="background-color: var(--skord-chat-bg); border-radius: var(--skord-menu-border-radius);"></canvas>
              <p id="memory-output">JS Heap: -- MB</p>
              <canvas id="memory-graph-canvas" width="300" height="80" style="background-color: var(--skord-chat-bg); border-radius: var(--skord-menu-border-radius);"></canvas>
              <p id="cpu-output">CPU Usage: --%</p>
              <canvas id="cpu-graph-canvas" width="300" height="80" style="background-color: var(--skord-chat-bg); border-radius: var(--skord-menu-border-radius);"></canvas>
            </div>
          </div>
        `;
        const togglePerformanceMonitorBtn = document.getElementById('togglePerformanceMonitorBtn');
        const fpsOutput = document.getElementById('fps-output');
        const memoryOutput = document.getElementById('memory-output');
        const cpuOutput = document.getElementById('cpu-output');
        const fpsCanvas = document.getElementById('fps-graph-canvas');
        const memoryCanvas = document.getElementById('memory-graph-canvas');
        const cpuCanvas = document.getElementById('cpu-graph-canvas');
        // Removed clearCacheBtn and its associated logic as per user request
  
        let isMonitoring = false;
        if (togglePerformanceMonitorBtn) togglePerformanceMonitorBtn.addEventListener('click', () => {
          if (isMonitoring) {
            stopPerformanceMonitoring();
            togglePerformanceMonitorBtn.textContent = 'Start Performance Monitor';
            if (fpsOutput) fpsOutput.textContent = 'FPS: --';
            if (memoryOutput) memoryOutput.textContent = 'JS Heap: -- MB';
            if (cpuOutput) cpuOutput.textContent = 'CPU Usage: --%';
          } else {
            startPerformanceMonitoring(fpsOutput, memoryOutput, cpuOutput, fpsCanvas, memoryCanvas, cpuCanvas);
            togglePerformanceMonitorBtn.textContent = 'Stop Performance Monitor';
          }
          isMonitoring = !isMonitoring;
        });
        stopRainbowAnimation();
      });
  
      if (document.getElementById('themesBtn')) document.getElementById('themesBtn').addEventListener('click', () => {
        if (!mainContent) return;
        mainContent.innerHTML = `
          <h1>Light Editor</h1>
          <p>Customize the look and feel of Skord Menu and your browsing experience.</p>
          <div style="display:flex; flex-direction:column; gap:10px;">
            <button id="reset-all-theme-settings-btn" class="tool-button" style="background:var(--skord-danger-btn-bg);">Reset All Theme Settings</button>
            <hr style="border-color: var(--skord-border-color); margin: 10px 0;">

            <label for="page-opacity-slider">Page Opacity:</label>
            <div style="display:flex; align-items:center; gap:10px;">
                <input type="range" id="page-opacity-slider" min="0.1" max="1.0" step="0.01" value="${document.body.style.opacity || defaultOpacity}">
                <button id="reset-opacity-btn" class="tool-button" style="background:var(--skord-button-bg);">Reset</button>
            </div>
            <p>Apply opacity to Skord Menu button:
              <input type="checkbox" id="apply-opacity-to-skord-checkbox" ${isSkordButtonOpacityApplied ? 'checked' : ''}>
            </p>
  
            <label for="theme-color-picker">Accent Color:</label>
            <div style="display:flex; align-items:center; gap:10px;">
              <input type="color" id="theme-color-picker" value="${getComputedStyle(document.documentElement).getPropertyValue('--skord-accent-color').trim() || defaultAccentColor}">
              <button id="reset-accent-color-btn" class="tool-button" style="background:var(--skord-button-bg);">Reset</button>
              <button id="rainbow-mode-btn" class="tool-button" style="background:var(--skord-warning-btn-bg);color:var(--skord-warning-btn-text);">Rainbow Mode (${isRainbowModeActive ? 'ON' : 'OFF'})</button>
            </div>
  
            <label for="font-size-slider">Font Size: <span id="font-size-value">${currentFontSize}px</span></label>
            <div style="display:flex; align-items:center; gap:10px;">
                <input type="range" id="font-size-slider" min="12" max="24" value="${currentFontSize}">
                <button id="reset-font-size-btn" class="tool-button" style="background:var(--skord-button-bg);">Reset</button>
            </div>
  
            <label for="border-radius-slider">Border Radius: <span id="border-radius-value">${currentMenuBorderRadius}px</span></label>
            <div style="display:flex; align-items:center; gap:10px;">
                <input type="range" id="border-radius-slider" min="0" max="20" value="${currentMenuBorderRadius}">
                <button id="reset-border-radius-btn" class="tool-button" style="background:var(--skord-button-bg);">Reset</button>
            </div>
  
            <label for="bg-color-picker">Background Color:</label>
            <div style="display:flex; align-items:center; gap:10px;">
                <input type="color" id="bg-color-picker" value="${getComputedStyle(document.documentElement).getPropertyValue('--skord-bg-dark').trim() || defaultBgColor}">
                <button id="reset-bg-color-btn" class="tool-button" style="background:var(--skord-button-bg);">Reset</button>
            </div>
  
            <label for="text-color-picker">Text Color:</label>
            <div style="display:flex; align-items:center; gap:10px;">
                <input type="color" id="text-color-picker" value="${getComputedStyle(document.documentElement).getPropertyValue('--skord-text-color').trim() || defaultTextColor}">
                <button id="reset-text-color-btn" class="tool-button" style="background:var(--skord-button-bg);">Reset</button>
            </div>
  
            <button id="saveThemeSettingsBtn" class="tool-button" style="background:var(--skord-primary-btn-bg); margin-top: 15px;">Save Theme Settings</button>
          </div>`;
  
        const pageOpacitySlider = document.getElementById('page-opacity-slider');
        const applyOpacityToSkordCheckbox = document.getElementById('apply-opacity-to-skord-checkbox');
        const themeColorPicker = document.getElementById('theme-color-picker');
        const resetAccentColorBtn = document.getElementById('reset-accent-color-btn');
        const rainbowModeBtn = document.getElementById('rainbow-mode-btn');
        const fontSizeSlider = document.getElementById('font-size-slider');
        const fontSizeValue = document.getElementById('font-size-value');
        const borderRadiusSlider = document.getElementById('border-radius-slider');
        const borderRadiusValue = document.getElementById('border-radius-value');
        const bgColorPicker = document.getElementById('bg-color-picker');
        const textColorPicker = document.getElementById('text-color-picker');
        const saveThemeSettingsBtn = document.getElementById('saveThemeSettingsBtn');

        const resetOpacityBtn = document.getElementById('reset-opacity-btn');
        const resetFontSizeBtn = document.getElementById('reset-font-size-btn');
        const resetBorderRadiusBtn = document.getElementById('reset-border-radius-btn');
        const resetBgColorBtn = document.getElementById('reset-bg-color-btn');
        const resetTextColorBtn = document.getElementById('reset-text-color-btn');
        const resetAllThemeSettingsBtn = document.getElementById('reset-all-theme-settings-btn');
  
        if (pageOpacitySlider) pageOpacitySlider.addEventListener('input', (e) => {
          document.body.style.opacity = e.target.value;
          const skordMenuButton = document.getElementById('skord-menu-button');
          if (applyOpacityToSkordCheckbox && applyOpacityToSkordCheckbox.checked && skordMenuButton) {
            skordMenuButton.style.opacity = e.target.value;
          }
        });
        if (resetOpacityBtn) resetOpacityBtn.addEventListener('click', () => {
            document.body.style.opacity = defaultOpacity;
            if (pageOpacitySlider) pageOpacitySlider.value = defaultOpacity;
            const skordMenuButton = document.getElementById('skord-menu-button');
            if (applyOpacityToSkordCheckbox && applyOpacityToSkordCheckbox.checked && skordMenuButton) {
                skordMenuButton.style.opacity = defaultOpacity;
            }
            addLog('Page opacity reset.', 'THEME');
        });
  
        if (applyOpacityToSkordCheckbox) applyOpacityToSkordCheckbox.addEventListener('change', (e) => {
          isSkordButtonOpacityApplied = e.target.checked;
          const skordMenuButton = document.getElementById('skord-menu-button');
          if (isSkordButtonOpacityApplied && skordMenuButton) {
            skordMenuButton.style.opacity = document.body.style.opacity;
          } else if (skordMenuButton) {
            skordMenuButton.style.opacity = '1.0';
          }
        });
  
        if (themeColorPicker) themeColorPicker.addEventListener('input', (e) => {
          document.documentElement.style.setProperty('--skord-accent-color', e.target.value);
          skordDiv.querySelectorAll('.logging-button').forEach(btn => {
            btn.style.backgroundColor = e.target.value;
          });
          stopRainbowAnimation();
          if (rainbowModeBtn) rainbowModeBtn.textContent = 'Rainbow Mode (OFF)';
        });
  
        if (resetAccentColorBtn) resetAccentColorBtn.addEventListener('click', () => {
          document.documentElement.style.setProperty('--skord-accent-color', defaultAccentColor);
          if (themeColorPicker) themeColorPicker.value = defaultAccentColor;
          skordDiv.querySelectorAll('.logging-button').forEach(btn => {
            btn.style.backgroundColor = defaultAccentColor;
          });
          stopRainbowAnimation();
          if (rainbowModeBtn) rainbowModeBtn.textContent = 'Rainbow Mode (OFF)';
          addLog('Accent color reset.', 'THEME');
        });
  
        if (rainbowModeBtn) rainbowModeBtn.addEventListener('click', () => {
          if (isRainbowModeActive) {
            stopRainbowAnimation();
            rainbowModeBtn.textContent = 'Rainbow Mode (ON)';
          } else {
            startRainbowAnimation();
            rainbowModeBtn.textContent = 'Rainbow Mode (ON)';
          }
        });
  
        if (fontSizeSlider) fontSizeSlider.addEventListener('input', (e) => {
          currentFontSize = parseInt(e.target.value);
          document.documentElement.style.setProperty('--skord-font-size', `${currentFontSize}px`);
          if (fontSizeValue) fontSizeValue.textContent = `${currentFontSize}px`;
        });
        if (resetFontSizeBtn) resetFontSizeBtn.addEventListener('click', () => {
            currentFontSize = defaultFontSize;
            document.documentElement.style.setProperty('--skord-font-size', `${currentFontSize}px`);
            if (fontSizeSlider) fontSizeSlider.value = defaultFontSize;
            if (fontSizeValue) fontSizeValue.textContent = `${defaultFontSize}px`;
            addLog('Font size reset.', 'THEME');
        });
  
        if (borderRadiusSlider) borderRadiusSlider.addEventListener('input', (e) => {
          currentMenuBorderRadius = parseInt(e.target.value);
          document.documentElement.style.setProperty('--skord-menu-border-radius', `${currentMenuBorderRadius}px`);
          if (borderRadiusValue) borderRadiusValue.textContent = `${currentMenuBorderRadius}px`;
        });
        if (resetBorderRadiusBtn) resetBorderRadiusBtn.addEventListener('click', () => {
            currentMenuBorderRadius = defaultMenuBorderRadius;
            document.documentElement.style.setProperty('--skord-menu-border-radius', `${currentMenuBorderRadius}px`);
            if (borderRadiusSlider) borderRadiusSlider.value = defaultMenuBorderRadius;
            if (borderRadiusValue) borderRadiusValue.textContent = `${defaultMenuBorderRadius}px`;
            addLog('Border radius reset.', 'THEME');
        });
  
        if (bgColorPicker) bgColorPicker.addEventListener('input', (e) => {
          document.documentElement.style.setProperty('--skord-bg-dark', e.target.value);
        });
        if (resetBgColorBtn) resetBgColorBtn.addEventListener('click', () => {
            document.documentElement.style.setProperty('--skord-bg-dark', defaultBgColor);
            if (bgColorPicker) bgColorPicker.value = defaultBgColor;
            addLog('Background color reset.', 'THEME');
        });
  
        if (textColorPicker) textColorPicker.addEventListener('input', (e) => {
          document.documentElement.style.setProperty('--skord-text-color', e.target.value);
        });
        if (resetTextColorBtn) resetTextColorBtn.addEventListener('click', () => {
            document.documentElement.style.setProperty('--skord-text-color', defaultTextColor);
            if (textColorPicker) textColorPicker.value = defaultTextColor;
            addLog('Text color reset.', 'THEME');
        });
  
        if (saveThemeSettingsBtn) saveThemeSettingsBtn.addEventListener('click', () => {
          saveSettings();
          addLog('Theme settings saved.', 'THEME');
        });

        if (resetAllThemeSettingsBtn) resetAllThemeSettingsBtn.addEventListener('click', () => {
            showCustomConfirm('Are you sure you want to reset ALL theme settings to their defaults?', async () => {
                document.body.style.opacity = defaultOpacity;
                if (pageOpacitySlider) pageOpacitySlider.value = defaultOpacity;
                if (applyOpacityToSkordCheckbox) applyOpacityToSkordCheckbox.checked = false;
                const skordMenuButton = document.getElementById('skord-menu-button');
                if (skordMenuButton) skordMenuButton.style.opacity = '1.0';

                document.documentElement.style.setProperty('--skord-accent-color', defaultAccentColor);
                if (themeColorPicker) themeColorPicker.value = defaultAccentColor;
                skordDiv.querySelectorAll('.logging-button').forEach(btn => {
                    btn.style.backgroundColor = defaultAccentColor;
                });
                stopRainbowAnimation();
                if (rainbowModeBtn) rainbowModeBtn.textContent = 'Rainbow Mode (OFF)';

                currentFontSize = defaultFontSize;
                document.documentElement.style.setProperty('--skord-font-size', `${currentFontSize}px`);
                if (fontSizeSlider) fontSizeSlider.value = defaultFontSize;
                if (fontSizeValue) fontSizeValue.textContent = `${defaultFontSize}px`;

                currentMenuBorderRadius = defaultMenuBorderRadius;
                document.documentElement.style.setProperty('--skord-menu-border-radius', `${currentMenuBorderRadius}px`);
                if (borderRadiusSlider) borderRadiusSlider.value = defaultMenuBorderRadius;
                if (borderRadiusValue) borderRadiusValue.textContent = `${defaultMenuBorderRadius}px`;

                document.documentElement.style.setProperty('--skord-bg-dark', defaultBgColor);
                if (bgColorPicker) bgColorPicker.value = defaultBgColor;

                document.documentElement.style.setProperty('--skord-text-color', defaultTextColor);
                if (textColorPicker) textColorPicker.value = defaultTextColor;

                // Removed page title, cursor, and favicon reset logic
                
                await saveSettings(); // Ensure settings are saved after reset
                addLog('All theme settings reset to defaults.', 'THEME');
            });
        });
      });
  
      if (document.getElementById('cssEditorBtn')) document.getElementById('cssEditorBtn').addEventListener('click', async () => {
        if (!mainContent) return;
        activeEditorType = 'css'; // Set active editor type
        mainContent.innerHTML = `
          <h1>CSS Editor</h1>
          <p>Edit custom CSS for your current browsing experience. Save it once and it auto-loads every visit.</p>
          
          <div class="vscode-editor-tabs">
            <button class="vscode-tab-button active" data-tab="css-editor-tab">Editor</button>
            <button class="vscode-tab-button" data-tab="css-saved-tab">Saved Styles</button>
          </div>

          <div id="css-editor-tab" class="vscode-tab-content active">
            <div class="vscode-editor-container-inner">
              <div class="vscode-editor-sidebar-list">
                <h3>Files:</h3>
                <input type="text" id="css-search-bar-editor" placeholder="Search files..." class="vscode-input" style="margin-bottom: 10px;">
                <div id="saved-styles-list-editor" style="flex-grow: 1; overflow-y: auto;">
                  <!-- Simple list of style names here -->
                </div>
              </div>
              <div class="vscode-editor-main">
                <!-- Name and Target Sites for the currently loaded/new style -->
                <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 10px;">
                    <label for="style-name" style="display: block; font-weight: 600;">Style Name:</label>
                    <input type="text" id="style-name" placeholder="Enter style name..." class="vscode-input">
                    <label for="css-target-sites" style="display: block; font-weight: 600;">Apply to:</label>
                    <select id="css-target-sites" class="vscode-input">
                      <option value="all_sites">All Sites</option>
                      <option value="current_url">Current URL (${window.location.href})</option>
                      <option value="current_domain">Current Domain (${window.location.hostname})</option>
                      <option value="custom">Custom URLs/Domains (comma-separated)</option>
                    </select>
                    <input type="text" id="css-custom-target-sites-input" placeholder="e.g., example.com, sub.example.org/path" class="vscode-input" style="margin-top: 5px; display: none;">
                </div>
                <textarea id="css-editor" placeholder="/* write CSS here */" class="vscode-editor-textarea"></textarea>
                <div class="vscode-button-group" style="justify-content: flex-end;">
                  <button id="css-apply" class="tool-button" style="background:var(--skord-primary-btn-bg);">Apply</button>
                  <button id="css-clear" class="tool-button" style="background:var(--skord-danger-btn-bg);">Clear Editor</button>
                </div>
                <button id="css-save"  class="tool-button" style="background:var(--skord-accent-color); margin-top: 10px;">Save Current Style</button>
              </div>
            </div>
          </div>

          <div id="css-saved-tab" class="vscode-tab-content">
            <h3>Saved Styles:</h3>
            <input type="text" id="css-search-bar-saved" placeholder="Search saved styles..." class="vscode-input" style="margin-bottom: 10px;">
            <div id="saved-styles-list-saved" style="flex-grow: 1; overflow-y: auto;">
              <!-- Styles will be rendered here by renderSavedStylesList() -->
            </div>
          </div>
          <p id="css-status" style="margin-top:8px;font-size:14px; text-align: center;">Status: Ready</p>
        `;
  
        const styleNameInput = document.getElementById('style-name');
        const textarea = document.getElementById('css-editor');
        const status   = document.getElementById('css-status');
        const targetSitesSelect = document.getElementById('css-target-sites');
        const customTargetSitesInput = document.getElementById('css-custom-target-sites-input');
        const cssSearchBarEditor = document.getElementById('css-search-bar-editor');
        const cssSearchBarSaved = document.getElementById('css-search-bar-saved');
        const cssSaveBtn = document.getElementById('css-save');

        // Tab switching logic
        document.querySelectorAll('.vscode-tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                document.querySelectorAll('.vscode-tab-button').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.vscode-tab-content').forEach(content => content.classList.remove('active'));

                e.target.classList.add('active');
                const targetTabId = e.target.dataset.tab;
                document.getElementById(targetTabId).classList.add('active');

                // Re-render lists when tabs are switched
                if (targetTabId === 'css-editor-tab') {
                    renderSavedStylesList(cssSearchBarEditor.value, 'editor');
                } else if (targetTabId === 'css-saved-tab') {
                    renderSavedStylesList(cssSearchBarSaved.value, 'saved');
                }
            });
        });

        // Helper function for rendering saved styles in the correct list
        // This function is defined globally, but re-assigned here to ensure it uses the correct elements
        // within the CSS Editor context.
        // It's crucial that `renderSavedStylesList` is able to target the correct list element
        // based on the `targetList` parameter (`'editor'` or `'saved'`).
        // The global `renderSavedStylesList` function already handles this with `getElementById`.

        // Handle target sites dropdown change
        if (targetSitesSelect) {
            targetSitesSelect.addEventListener('change', (e) => {
                if (e.target.value === 'custom') {
                    customTargetSitesInput.style.display = 'block';
                } else {
                    customTargetSitesInput.style.display = 'none';
                }
            });
        }
        
        // Initial render for the editor's sidebar
        renderSavedStylesList('', 'editor');

        // Add event listeners for search bars
        if (cssSearchBarEditor) cssSearchBarEditor.addEventListener('input', (e) => {
            renderSavedStylesList(e.target.value, 'editor');
        });
        if (cssSearchBarSaved) cssSearchBarSaved.addEventListener('input', (e) => {
            renderSavedStylesList(e.target.value, 'saved');
        });

        const setStatus = (msg, color) => {
          if (status) {
            status.textContent = `Status: ${msg}`;
            status.style.color = color;
          }
        };
  
        const cssApplyBtn = document.getElementById('css-apply');
        const cssClearBtn = document.getElementById('css-clear');

        if (cssApplyBtn) cssApplyBtn.onclick = () => {
            if (!textarea) return;
            // Apply current editor content as a temporary style
            applyCSSToPage(textarea.value, 'skord-editor-preview-css');
            setStatus('CSS applied (not saved yet)', 'var(--skord-warning-btn-bg)');
        };
  
        if (cssSaveBtn) cssSaveBtn.onclick = async () => {
            if (!styleNameInput || !textarea || !targetSitesSelect || !customTargetSitesInput) return;
            const name = styleNameInput.value.trim();
            const cssCode = textarea.value.trim();
            
            if (!name || !cssCode) {
                updateStyleStatus('Name and CSS code are required', 'var(--skord-danger-btn-bg)');
                return;
            }

            let targetSites = [];
            const selectedOption = targetSitesSelect.value;
            if (selectedOption === 'all_sites') {
                targetSites = ['all_sites'];
            } else if (selectedOption === 'current_url') {
                targetSites = [window.location.href];
            } else if (selectedOption === 'current_domain') {
                targetSites = [window.location.hostname];
            } else if (selectedOption === 'custom') {
                targetSites = customTargetSitesInput.value.split(',').map(s => s.trim()).filter(s => s);
                if (targetSites.length === 0) {
                    updateStyleStatus('Custom URLs/Domains cannot be empty when "Custom" is selected', 'var(--skord-danger-btn-bg)');
                    return;
                }
            }
            
            const styles = await getSavedStyles();
            const existingIndex = styles.findIndex(s => s.name === name);
            
            if (existingIndex >= 0) {
                styles[existingIndex].cssCode = cssCode;
                styles[existingIndex].targetSites = targetSites;
                // If it was already enabled, re-apply it (background script will handle this on next tab update)
                if (styles[existingIndex].enabled) {
                    applyCSSToPage(cssCode, `skord-custom-css-${name.replace(/\s+/g, '-')}`);
                }
            } else {
                styles.push({ name, cssCode, enabled: false, targetSites }); // New styles are disabled by default
            }
            
            await saveStyles(styles);
            renderSavedStylesList('', 'editor'); // Re-render the editor's list
            renderSavedStylesList('', 'saved'); // Re-render the saved tab's list
            updateStyleStatus(`Style "${name}" saved`, 'var(--skord-accent-color)');
            addLog(`Style "${name}" saved.`, 'CSS_EDITOR');
        };
  
        if (cssClearBtn) cssClearBtn.onclick = () => {
            if (styleNameInput) styleNameInput.value = '';
            if (textarea) textarea.value = '';
            if (targetSitesSelect) targetSitesSelect.value = 'all_sites'; // Reset to default
            if (customTargetSitesInput) customTargetSitesInput.style.display = 'none'; // Hide custom input
            updateStyleStatus('Editor cleared', 'var(--skord-primary-btn-bg)');
            addLog('CSS editor cleared.', 'CSS_EDITOR');
            removeCustomCSS('skord-editor-preview-css'); // Clear temporary preview style
            // Clear active file highlight
            document.querySelectorAll('#saved-styles-list-editor .file-item').forEach(item => item.classList.remove('active'));
        };

        // Ctrl+S / Cmd+S save shortcut for CSS Editor
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's' && activeEditorType === 'css') {
                e.preventDefault();
                if (cssSaveBtn) cssSaveBtn.click();
            }
        });
      });
      
      if (document.getElementById('themeLibraryBtn')) document.getElementById('themeLibraryBtn').addEventListener('click', () => {
        if (!mainContent) return;
        mainContent.innerHTML = `
          <h1>Theme Library</h1>
          <p>Browse and download CSS themes. Copy the CSS and paste it into the CSS Editor to apply.</p>
          <div style="margin-bottom: 15px; text-align: center;">
            <input type="text" id="theme-search-bar" placeholder="Search themes..." 
              style="width: 90%; padding: 8px; border-radius: 4px; border: 1px solid var(--skord-border-color); background: var(--skord-button-bg); color: var(--skord-text-color);">
          </div>
          <div id="theme-library-content" style="max-height: 400px; overflow-y: auto;">
            <!-- Theme items will be rendered here by renderThemes() -->
          </div>
          <div style="margin-top: 15px; font-size: 0.9em; color: #888; text-align: center;">
            Click "Download" to save a theme's CSS to your computer
          </div>`;
        
        const themeSearch = document.getElementById('theme-search-bar');
        
        // Dummy theme data for demonstration
        const themeLibrary = [
            { name: "Dark Mode Classic", cssContent: "body { background-color: #333 !important; color: #eee !important; } a { color: #87ceeb !important; }" },
            { name: "Ocean Blue", cssContent: "body { background-color: #0a1128 !important; color: #e0f2f7 !important; } a { color: #bbdefb !important; }" },
            { name: "Forest Green", cssContent: "body { background-color: #1a361a !important; color: #e6ffe6 !important; } a { color: #a2d2a2 !important; }" },
            { name: "High Contrast", cssContent: "body { background-color: black !important; color: white !important; } a { color: yellow !important; }" },
            { name: "Soft Pastel", cssContent: "body { background-color: #f0f4f8 !important; color: #333 !important; } a { color: #6a5acd !important; }" }
        ];

        const renderThemes = (filter = '') => {
          const themeLibraryContent = document.getElementById('theme-library-content');
          if (!themeLibraryContent) return;
          themeLibraryContent.innerHTML = '';
          const filteredThemes = themeLibrary.filter(theme => 
            theme.name.toLowerCase().includes(filter.toLowerCase())
          );

          if (filteredThemes.length === 0) {
            themeLibraryContent.innerHTML = '<p style="text-align: center; color: #888;">No themes found matching your search.</p>';
            return;
          }

          filteredThemes.forEach(theme => {
            const themeDiv = document.createElement('div');
            themeDiv.className = 'theme-item';
            themeDiv.innerHTML = `
              <span class="theme-item-name">${theme.name}</span>
              <a class="theme-download-button" href="data:text/css;charset=utf-8,${encodeURIComponent(theme.cssContent)}" download="${theme.name.replace(/\s/g, '-')}.css" target="_blank">Download</a>
            `;
            themeLibraryContent.appendChild(themeDiv);
          });
        };

        if (themeSearch) themeSearch.addEventListener('input', (e) => {
          renderThemes(e.target.value);
        });

        renderThemes();
        stopRainbowAnimation();
      });

      if (document.getElementById('scriptInjectorBtn')) document.getElementById('scriptInjectorBtn').addEventListener('click', async () => {
        if (!mainContent) return;
        activeEditorType = 'script'; // Set active editor type
        mainContent.innerHTML = `
          <h1>Script Injector</h1>
          <p>Add, manage, and execute custom JavaScript for your current browsing experience.</p>
          
          <div class="vscode-editor-tabs">
            <button class="vscode-tab-button active" data-tab="script-editor-tab">Editor</button>
            <button class="vscode-tab-button" data-tab="script-saved-tab">Saved Scripts</button>
          </div>

          <div id="script-editor-tab" class="vscode-tab-content active">
            <div class="vscode-editor-container-inner">
              <div class="vscode-editor-sidebar-list">
                <h3>Files:</h3>
                <input type="text" id="script-search-bar-editor" placeholder="Search files..." class="vscode-input" style="margin-bottom: 10px;">
                <div id="saved-scripts-list-editor" style="flex-grow: 1; overflow-y: auto;">
                  <!-- Scripts will be rendered here by renderSavedScriptsList() -->
                </div>
              </div>
              <div class="vscode-editor-main">
                <div style="margin-bottom: 5px;">
                  <label for="script-name" style="display: block; margin-bottom: 5px; font-weight: 600;">Script Name:</label>
                  <input type="text" id="script-name" placeholder="Enter script name..." class="vscode-input">
                </div>

                <div style="margin-bottom: 5px;">
                  <label for="script-target-sites" style="display: block; margin-bottom: 5px; font-weight: 600;">Apply to:</label>
                  <select id="script-target-sites" class="vscode-input">
                    <option value="all_sites">All Sites</option>
                    <option value="current_url">Current URL (${window.location.href})</option>
                    <option value="current_domain">Current Domain (${window.location.hostname})</option>
                    <option value="custom">Custom URLs/Domains (comma-separated)</option>
                  </select>
                  <input type="text" id="script-custom-target-sites-input" placeholder="e.g., example.com, sub.example.org/path" class="vscode-input" style="margin-top: 5px; display: none;">
                </div>
                
                <textarea id="script-editor" placeholder="// Enter JavaScript code here..." class="vscode-editor-textarea"></textarea>
                
                <div class="vscode-button-group" style="justify-content: flex-end;">
                  <button id="execute-script-btn" class="tool-button" style="background: var(--skord-primary-btn-bg);">Execute</button>
                  <button id="clear-script-btn" class="tool-button" style="background: var(--skord-danger-btn-bg);">Clear</button>
                </div>
                <button id="save-script-btn" class="tool-button" style="background: var(--skord-accent-color); margin-top: 10px;">Save Current Script</button>
              </div>
            </div>
          </div>

          <div id="script-saved-tab" class="vscode-tab-content">
            <h3>Saved Scripts:</h3>
            <input type="text" id="script-search-bar-saved" placeholder="Search saved scripts..." class="vscode-input" style="margin-bottom: 10px;">
            <div id="saved-scripts-list-saved" style="flex-grow: 1; overflow-y: auto;">
              <!-- Scripts will be rendered here by renderSavedScriptsList() -->
            </div>
          </div>
          <div id="script-status" style="padding: 8px; border-radius: var(--skord-menu-border-radius); background: var(--skord-chat-bg); font-size: 14px; margin-top: 8px; text-align: center;">
            Status: Ready
          </div>
        `;
  
        const scriptNameInput = document.getElementById('script-name');
        const scriptEditor = document.getElementById('script-editor');
        const targetSitesSelect = document.getElementById('script-target-sites');
        const customTargetSitesInput = document.getElementById('script-custom-target-sites-input');
        const scriptSearchBarEditor = document.getElementById('script-search-bar-editor');
        const scriptSearchBarSaved = document.getElementById('script-search-bar-saved');
        const saveScriptBtn = document.getElementById('save-script-btn');

        // Tab switching logic
        document.querySelectorAll('.vscode-tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                document.querySelectorAll('.vscode-tab-button').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.vscode-tab-content').forEach(content => content.classList.remove('active'));

                e.target.classList.add('active');
                const targetTabId = e.target.dataset.tab;
                document.getElementById(targetTabId).classList.add('active');

                // Re-render lists when tabs are switched
                if (targetTabId === 'script-editor-tab') {
                    renderSavedScriptsList(scriptSearchBarEditor.value, 'editor');
                } else if (targetTabId === 'script-saved-tab') {
                    renderSavedScriptsList(scriptSearchBarSaved.value, 'saved');
                }
            });
        });

        // Helper function for rendering saved scripts in the correct list
        // This function is defined globally, but re-assigned here to ensure it uses the correct elements
        // within the Script Injector context.
        // It's crucial that `renderSavedScriptsList` is able to target the correct list element
        // based on the `targetList` parameter (`'editor'` or `'saved'`).
        // The global `renderSavedScriptsList` function already handles this with `getElementById`.

        // Handle target sites dropdown change
        if (targetSitesSelect) {
            targetSitesSelect.addEventListener('change', (e) => {
                if (e.target.value === 'custom') {
                    customTargetSitesInput.style.display = 'block';
                } else {
                    customTargetSitesInput.style.display = 'none';
                }
            });
        }
  
        // Initial render for the editor's sidebar
        renderSavedScriptsList('', 'editor');

        // Add event listeners for search bars
        if (scriptSearchBarEditor) scriptSearchBarEditor.addEventListener('input', (e) => {
            renderSavedScriptsList(e.target.value, 'editor');
        });
        if (scriptSearchBarSaved) scriptSearchBarSaved.addEventListener('input', (e) => {
            renderSavedScriptsList(e.target.value, 'saved');
        });
  
        const executeScriptBtn = document.getElementById('execute-script-btn');
        const clearScriptBtn = document.getElementById('clear-script-btn');

        if (executeScriptBtn) executeScriptBtn.addEventListener('click', () => {
          if (!scriptEditor) return;
          const code = scriptEditor.value.trim();
          const name = (scriptNameInput ? scriptNameInput.value.trim() : '') || 'Unnamed Script';
          
          if (!code) {
            updateScriptStatus('No code to execute', 'var(--skord-danger-btn-bg)');
            return;
          }
          
          executeScript(code, name); // Now sends to service worker
          updateScriptStatus('Script sent for execution', 'var(--skord-primary-btn-bg)');
        });
  
        if (saveScriptBtn) saveScriptBtn.addEventListener('click', async () => {
          if (!scriptNameInput || !scriptEditor || !targetSitesSelect || !customTargetSitesInput) return;
          const name = scriptNameInput.value.trim();
          const code = scriptEditor.value.trim();
          
          if (!name || !code) {
            updateScriptStatus('Name and code are required', 'var(--skord-danger-btn-bg)');
            return;
          }

          let targetSites = [];
          const selectedOption = targetSitesSelect.value;
          if (selectedOption === 'all_sites') {
              targetSites = ['all_sites'];
          } else if (selectedOption === 'current_url') {
              targetSites = [window.location.href];
          } else if (selectedOption === 'current_domain') {
              targetSites = [window.location.hostname];
          } else if (selectedOption === 'custom') {
              targetSites = customTargetSitesInput.value.split(',').map(s => s.trim()).filter(s => s);
              if (targetSites.length === 0) {
                  updateScriptStatus('Custom URLs/Domains cannot be empty when "Custom" is selected', 'var(--skord-danger-btn-bg)');
                  return;
              }
          }
          
          const scripts = await getSavedScripts();
          const existingIndex = scripts.findIndex(s => s.name === name);
          
          if (existingIndex >= 0) {
            scripts[existingIndex].code = code;
            scripts[existingIndex].targetSites = targetSites;
          } else {
            scripts.push({ name, code, enabled: false, targetSites });
          }
          
          await saveScripts(scripts);
          renderSavedScriptsList('', 'editor'); // Re-render the editor's list
          renderSavedScriptsList('', 'saved'); // Re-render the saved tab's list
          updateScriptStatus(`Script "${name}" saved`, 'var(--skord-accent-color)');
          addLog(`Script "${name}" saved.`, 'SCRIPT_INJECTOR');
        });
  
        if (clearScriptBtn) clearScriptBtn.addEventListener('click', () => {
          if (scriptNameInput) scriptNameInput.value = '';
          if (scriptEditor) scriptEditor.value = '';
          if (targetSitesSelect) targetSitesSelect.value = 'all_sites'; // Reset to default
          if (customTargetSitesInput) customTargetSitesInput.style.display = 'none'; // Hide custom input
          updateScriptStatus('Editor cleared', 'var(--skord-primary-btn-bg)');
          addLog('Script editor cleared.', 'SCRIPT_INJECTOR');
          // Clear active file highlight
          document.querySelectorAll('#saved-scripts-list-editor .file-item').forEach(item => item.classList.remove('active'));
        });

        // Ctrl+S / Cmd+S save shortcut for Script Injector
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's' && activeEditorType === 'script') {
                e.preventDefault();
                if (saveScriptBtn) saveScriptBtn.click();
            }
        });
      });

      if (document.getElementById('scriptLibraryBtn')) document.getElementById('scriptLibraryBtn').addEventListener('click', () => {
        if (!mainContent) return;
        mainContent.innerHTML = `
          <h1>Script Library</h1>
          <p>Browse and download useful scripts.</p>
          <div style="margin-bottom: 15px; text-align: center;">
            <input type="text" id="script-search-bar" placeholder="Search scripts..." 
              style="width: 90%; padding: 8px; border-radius: 4px; border: 1px solid var(--skord-border-color); background: var(--skord-button-bg); color: var(--skord-text-color);">
          </div>
          <div id="script-library-content" style="max-height: 400px; overflow-y: auto;">
            <!-- Scripts will be rendered here -->
          </div>
        `;

        const scriptSearchBar = document.getElementById('script-search-bar');
        const scriptLibraryContent = document.getElementById('script-library-content');

        // Dummy script data for demonstration
        const scriptLibrary = [
            { name: "Ad Blocker (Simple)", downloadLink: "data:text/javascript;charset=utf-8,alert('Simple Ad Blocker Activated!');" },
            { name: "Dark Mode Toggle", downloadLink: "data:text/javascript;charset=utf-8,document.body.classList.toggle('dark-mode');" },
            { name: "Scroll to Top Button", downloadLink: "data:text/javascript;charset=utf-8,window.scrollTo({ top: 0, behavior: 'smooth' });" },
            { name: "Highlight All Links", downloadLink: "data:text/javascript;charset=utf-8,document.querySelectorAll('a').forEach(link => link.style.border = '2px solid red');" },
            { name: "Image Hider", downloadLink: "data:text/javascript;charset=utf-8,document.querySelectorAll('img').forEach(img => img.style.display = 'none');" }
        ];

        const renderScripts = (filter = '') => {
          if (!scriptLibraryContent) return;
          scriptLibraryContent.innerHTML = '';
          const filteredScripts = scriptLibrary.filter(script => 
            script.name.toLowerCase().includes(filter.toLowerCase())
          );

          if (filteredScripts.length === 0) {
            scriptLibraryContent.innerHTML = '<p style="text-align: center; color: #888;">No scripts found matching your search.</p>';
            return;
          }

          filteredScripts.forEach(script => {
            const scriptDiv = document.createElement('div');
            scriptDiv.className = 'script-item';
            scriptDiv.innerHTML = `
              <span class="script-item-name">${script.name}</span>
              <a class="script-download-button" href="${script.downloadLink}" download="${script.name.replace(/\s/g, '-')}.js" target="_blank">Download</a>
            `;
            scriptLibraryContent.appendChild(scriptDiv);
          });
        };

        if (scriptSearchBar) scriptSearchBar.addEventListener('input', (e) => {
          renderScripts(e.target.value);
        });

        renderScripts();
        stopRainbowAnimation();
      });

      if (document.getElementById('documentationBtn')) document.getElementById('documentationBtn').addEventListener('click', () => {
        if (!mainContent) return;
        mainContent.innerHTML = `
          <h1>Skord Menu Documentation</h1>
          <p>This section provides detailed guides on how to use various features of the Skord Menu.</p>

          <h2>1. Using the Script Library and Script Injector</h2>
          <p>The Script Library offers pre-made scripts that you can download and use. The Script Injector allows you to manage and execute custom JavaScript code on the current webpage.</p>
          <h3>How to Add a Script from the Library:</h3>
          <ol>
            <li>Go to the "Script Library" tab.</li>
            <li>Browse or search for the script you want.</li>
            <li>Click the "Download" button next to the script. This will typically open the script's code in a new tab or download it as a file.</li>
            <li><strong>Copy the entire JavaScript code</strong> from the downloaded file or the new tab.</li>
            <li>Go to the "Dev Tools" tab, and ensure "Script Injector" is toggled "ON".</li>
            <li>Go to the "Script Injector" tab (it will now be visible in the sidebar).</li>
            <li>In the "Script Name" field, give your script a descriptive name (e.e.g., "My Custom Tab Script").</li>
            <li>Paste the copied JavaScript code into the "JavaScript Code" textarea.</li>
            <li><strong>Select the target sites</strong> for your script using the "Apply to:" dropdown. You can choose "All Sites", "Current URL", "Current Domain", or specify "Custom URLs/Domains" (comma-separated).</li>
            <li>Click "Save Script". Your script will be saved globally and appear in the "Saved Scripts" list below.</li>
            <li>To activate the script, click the "Enable" button next to its name in the "Saved Scripts" list. If you want it to run automatically every time you visit a matching page, ensure it's enabled.</li>
            <li>You can also click "Execute" to run the script immediately without saving it.</li>
          </ol>
          <h3>Managing Your Own Scripts in the Script Injector:</h3>
          <ul>
            <li><strong>Add New Script:</strong> Enter a name, code, and target sites, then click "Save Script".</li>
            <li><strong>Load for Editing:</strong> Click "Load" next to a saved script to bring its name, code, and target sites into the editor for modifications.</li>
            <li><strong>Execute:</strong> Runs the code currently in the editor (now injected into the main world).</li>
            <li><strong>Enable/Disable:</strong> Toggles whether a saved script will run automatically on page load for its target sites.</li>
            <li><strong>Delete:</strong> Permanently removes a script from your saved list.</li>
          </ul>

          <h2>2. Customizing Themes with the CSS Editor and Theme Library</h2>
          <p>You can customize the visual appearance of the webpage using the "CSS Editor" for advanced styling and the "Theme Library" for pre-defined themes.</p>
          <h3>Using the CSS Editor for Customization:</h3>
          <p>For granular control over the webpage's appearance, use the "CSS Editor".</p>
          <ol>
            <li>Go to the "Dev Tools" tab, and ensure "CSS Editor" is toggled "ON".</li>
            <li>Go to the "CSS Editor" tab (it will now be visible in the sidebar).</li>
            <li>In the "Style Name" field, give your style a descriptive name.</li>
            <li>In the large textarea, you can write standard CSS rules. These rules will be applied directly to the current webpage.</li>
            <li><strong>Example:</strong> To change the background color of all paragraphs to light blue:
              <pre style="background-color: var(--skord-chat-input-bg); padding: 10px; border-radius: var(--skord-menu-border-radius); color: var(--skord-text-color); overflow-x: auto;"><code>p {<br>  background-color: lightblue !important;<br>  color: black !important;<br>}</code></pre>
            </li>
            <li><strong>Select the target sites</strong> for your style using the "Apply to:" dropdown. You can choose "All Sites", "Current URL", "Current Domain", or specify "Custom URLs/Domains" (comma-separated).</li>
            <li>Click "Apply" to see your CSS changes immediately (they are not saved yet).</li>
            <li>Click "Save Style" to save your CSS. It will be saved globally and appear in the "Saved Styles" list below.</li>
            <li>To activate the style, click the "Enable" button next to its name in the "Saved Styles" list. If you want it to run automatically every time you visit a matching page, ensure it's enabled.</li>
            <li>You can also "Load" a saved style into the editor for further modifications, or "Delete" it.</li>
          </ol>
          <h3>How to Use Themes from the Theme Library:</h3>
          <ol>
            <li>Go to the "Theme Library" tab.</li>
            <li>Browse or search for the theme you want.</li>
            <li>Click the "Download" button next to the theme. This will open a new window/tab displaying the theme's CSS code.</li>
            <li><strong>Copy the entire CSS code</strong> from this new window.</li>
            <li>Go to the "Dev Tools" tab, and ensure "CSS Editor" is toggled "ON".</li>
            <li>Go to the "CSS Editor" tab (it will now be visible in the sidebar).</li>
            <li>In the "Style Name" field, give the theme a name (e.g., "Ocean Blue Theme").</li>
            <li>Paste the copied CSS code into the "CSS Editor" textarea.</li>
            <li><strong>Select the target sites</strong> for your theme using the "Apply to:" dropdown.</li>
            <li>Click "Save Style" to save this theme as a custom style.</li>
            <li>Then, click "Enable" next to its name in the "Saved Styles" list to apply it.</li>
          </ol>

          <h2>3. Custom Dev Tools Overview</h2>
          <p>The "Dev Tools" tab provides powerful utilities for inspecting and manipulating the current webpage.</p>
          <ul>
            <li><strong>Element Inspector:</strong> Click this to activate a mode where clicking any element on the page will log its ID, classes, and basic styles to the console output within Skord. "Toggle Persistent Highlight" will keep the last inspected element highlighted.</li>
            <li><strong>Console Output:</strong> A live viewer of all console.log, console.warn, and console.error messages from the webpage. You can "Clear Console Logs".</li>
            <li><strong>Network Interceptor:</strong>
              <ul>
                <li><strong>Toggle Network Blocking:</strong> Prevents all new network requests (fetch and XHR) from loading. Now handled by the Service Worker for more reliable interception.</li>
                <li><strong>Toggle Network Logging:</strong> Logs all network requests and their status to the "Logs" tab. Now handled by the Service Worker.</li>
              </ul>
            </li>
            <li><strong>CSS Editor Toggle:</strong> Controls the visibility of the "CSS Editor" tab in the sidebar.</li>
            <li><strong>Script Injector Toggle:</strong> Controls the visibility of the "Script Injector" tab in the sidebar.</li>
          </ul>
          
          <h2>4. Performance Monitoring</h2>
          <p>The "Performance" tab allows you to monitor the real-time performance metrics of the webpage.</p>
          <ul>
            <li><strong>Start/Stop Performance Monitor:</strong> Toggles the display of live FPS (Frames Per Second), JS Heap memory usage, and estimated CPU usage with fixed-height graphs.</li>
          </ul>

          <h2>5. Log Controls</h2>
          <p>The "Log Controls" tab allows you to specify which types of events are recorded in the "Live Logs" tab.</p>
          <ul>
            <li>You can toggle logging for: Keyboard Events, Mouse Events, Page Swaps (navigation), Errors, and Network Events.</li>
            <li>"Clear All Logs" will empty the entire log history.</li>
          </ul>
        `;
        stopRainbowAnimation();
      });
  
      if (document.getElementById('logsBtn')) document.getElementById('logsBtn').addEventListener('click', () => {
        if (!mainContent) return;
        mainContent.innerHTML = `
          <h1>Live Logs</h1>
          <p>Monitor real-time events and actions within Skord Menu.</p>
          <div id="logs-output" style="height: calc(100% - 70px); background-color: var(--skord-chat-bg); border: 1px solid var(--skord-border-color); border-radius: var(--skord-menu-border-radius); padding: 10px; overflow-y: auto; font-family: monospace; font-size: 12px; color: white;"></div>
        `;
        const logsOutput = document.getElementById('logs-output');
        if (logsOutput) {
            logsOutput.innerHTML = loggedEvents.map(log => `<p style="margin: 2px 0; padding: 0;">${log}</p>`).join('');
            logsOutput.scrollTop = logsOutput.scrollHeight;
        }
        stopRainbowAnimation();
      });
  
      if (document.getElementById('logControlsBtn')) document.getElementById('logControlsBtn').addEventListener('click', () => {
        if (!mainContent) return;
        mainContent.innerHTML = `
          <h1>Log Controls</h1>
          <p>Toggle logging for various event types.</p>
          <div style="display:flex; flex-direction:column; gap:10px;">
            <p>Keyboard Events: <input type="checkbox" id="logKeyboardCheckbox" ${logSettings.keyboard ? 'checked' : ''}></p>
            <p>Mouse Events: <input type="checkbox" id="logMouseCheckbox" ${logSettings.mouse ? 'checked' : ''}></p>
            <p>Page Swaps: <input type="checkbox" id="logPageSwapsCheckbox" ${logSettings.pageSwaps ? 'checked' : ''}></p>
            <p>Errors: <input type="checkbox" id="logErrorsCheckbox" ${logSettings.errors ? 'checked' : ''}></p>
            <p>Network Events: <input type="checkbox" id="logNetworkCheckbox" ${logSettings.network ? 'checked' : ''}></p>
            <button id="clearAllLogsBtn" class="tool-button" style="background:var(--skord-danger-btn-bg); margin-top:15px;">Clear All Logs</button>
          </div>
        `;
        const logKeyboardCheckbox = document.getElementById('logKeyboardCheckbox');
        const logMouseCheckbox = document.getElementById('logMouseCheckbox');
        const logPageSwapsCheckbox = document.getElementById('logPageSwapsCheckbox');
        const logErrorsCheckbox = document.getElementById('logErrorsCheckbox');
        const logNetworkCheckbox = document.getElementById('logNetworkCheckbox');
        const clearAllLogsBtn = document.getElementById('clearAllLogsBtn');
  
        const updateLogSetting = (setting, checkbox) => {
          logSettings[setting] = checkbox.checked;
          addLog(`${setting} logging ${checkbox.checked ? 'enabled' : 'disabled'}.`, 'LOG_CONTROL');
          setupEventListeners();
        };
  
        if (logKeyboardCheckbox) logKeyboardCheckbox.addEventListener('change', (e) => updateLogSetting('keyboard', e.target));
        if (logMouseCheckbox) logMouseCheckbox.addEventListener('change', (e) => updateLogSetting('mouse', e.target));
        if (logPageSwapsCheckbox) logPageSwapsCheckbox.addEventListener('change', (e) => updateLogSetting('pageSwaps', e.target));
        if (logErrorsCheckbox) logErrorsCheckbox.addEventListener('change', (e) => updateLogSetting('errors', e.target));
        if (logNetworkCheckbox) logNetworkCheckbox.addEventListener('change', (e) => updateLogSetting('network', e.target));
  
        if (clearAllLogsBtn) clearAllLogsBtn.addEventListener('click', () => {
          loggedEvents.length = 0;
          addLog('All logs cleared by user.', 'LOG_CONTROL');
          const logsOutput = document.getElementById('logs-output');
          if (logsOutput) logsOutput.innerHTML = '';
        });
        stopRainbowAnimation();
      });
  
      if (document.getElementById('cacheBtn')) document.getElementById('cacheBtn').addEventListener('click', () => {
        if (!mainContent) return;
        mainContent.innerHTML = `
          <h1>Cache & Data Management</h1>
          <p>Manage your Skord Menu extension data, including saved settings, scripts, and styles.</p>

          <div style="margin-bottom: 20px; padding: 15px; border: 1px solid var(--skord-border-color); border-radius: var(--skord-menu-border-radius); background: var(--skord-chat-bg);">
            <h2>Clear Data</h2>
            <button id="clearAllExtensionCacheBtn" class="tool-button" style="background: var(--skord-danger-btn-bg); width: 100%; margin-bottom: 10px;">Clear All Skord Data</button>
            <p style="font-size: 0.9em; color: #aaa; margin-bottom: 15px;">This will clear all saved settings, custom scripts, and custom styles for the entire Skord Menu extension.</p>

            <h3 style="margin-top: 20px;">Clear Data for Specific URLs/Domains</h3>
            <input type="text" id="clear-specific-url-input" placeholder="Enter URL or domain (e.g., example.com)" 
              style="width: calc(100% - 16px); padding: 8px; margin-bottom: 10px; background: var(--skord-chat-input-bg); color: var(--skord-text-color); border: 1px solid var(--skord-border-color); border-radius: var(--skord-menu-border-radius);">
            <button id="clear-specific-url-btn" class="tool-button" style="background: var(--skord-warning-btn-bg); width: 100%;">Clear Associated Scripts/Styles</button>
            <p style="font-size: 0.9em; color: #aaa; margin-top: 5px;">Removes saved scripts and styles that are specifically targeted to the entered URL or domain.</p>
          </div>

          <div style="padding: 15px; border: 1px solid var(--skord-border-color); border-radius: var(--skord-menu-border-radius); background: var(--skord-chat-bg);">
            <h2>Backup & Restore</h2>
            <button id="downloadAllDataBtn" class="tool-button" style="background: #28a745; width: 100%; margin-bottom: 10px;">Download All Skord Data (JSON)</button>
            <p style="font-size: 0.9em; color: #aaa; margin-bottom: 15px;">Downloads all your Skord Menu settings, custom scripts, and custom styles as a JSON file.</p>

            <input type="file" id="uploadDataInput" accept=".json" style="width: 100%; margin-bottom: 10px; color: var(--skord-text-color);">
            <button id="uploadAndLoadDataBtn" class="tool-button" style="background: var(--skord-primary-btn-bg); width: 100%;">Upload & Load Skord Data</button>
            <p style="font-size: 0.9em; color: #aaa; margin-top: 5px;">Uploads a previously downloaded JSON file to restore your Skord Menu data. This will overwrite existing data.</p>
          </div>

          <p id="cache-status" style="margin-top:15px;font-size:14px; text-align: center;">Status: Ready</p>
        `;
        stopRainbowAnimation();

        // Get references to the new buttons and input fields
        const clearAllExtensionCacheBtn = document.getElementById('clearAllExtensionCacheBtn');
        const clearSpecificUrlInput = document.getElementById('clear-specific-url-input');
        const clearSpecificUrlBtn = document.getElementById('clear-specific-url-btn');
        const downloadAllDataBtn = document.getElementById('downloadAllDataBtn');
        const uploadDataInput = document.getElementById('uploadDataInput');
        const uploadAndLoadDataBtn = document.getElementById('uploadAndLoadDataBtn');
        const cacheStatus = document.getElementById('cache-status');

        const setCacheStatus = (msg, color) => {
            if (cacheStatus) {
                cacheStatus.textContent = `Status: ${msg}`;
                cacheStatus.style.color = color;
            }
        };

        // Event Listeners for Cache Section
        if (clearAllExtensionCacheBtn) {
            clearAllExtensionCacheBtn.addEventListener('click', () => {
                showCustomConfirm('Are you sure you want to clear ALL Skord Menu data? This will reset all settings, scripts, and styles.', async () => {
                    try {
                        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                            await chrome.storage.local.clear();
                            setCacheStatus('All Skord data cleared. Reloading page...', 'var(--skord-danger-btn-bg)');
                            addLog('All Skord data cleared.', 'CACHE');
                            // Reload to re-initialize with default settings
                            location.reload();
                        } else {
                            localStorage.clear(); // Fallback
                            setCacheStatus('All Skord data cleared (localStorage fallback). Reloading page...', 'var(--skord-danger-btn-bg)');
                            addLog('All Skord data cleared (localStorage fallback).', 'CACHE');
                            location.reload();
                        }
                    } catch (error) {
                        setCacheStatus(`Failed to clear all data: ${error.message}`, 'var(--skord-danger-btn-bg)');
                        addLog(`Failed to clear all Skord data: ${error.message}`, 'ERROR');
                    }
                });
            });
        }

        if (clearSpecificUrlBtn) {
            clearSpecificUrlBtn.addEventListener('click', async () => {
                const target = clearSpecificUrlInput.value.trim();
                if (!target) {
                    setCacheStatus('Please enter a URL or domain to clear specific data.', 'var(--skord-warning-btn-bg)');
                    return;
                }

                showCustomConfirm(`Are you sure you want to clear saved scripts and styles associated with "${target}"?`, async () => {
                    try {
                        let scripts = await getSavedScripts();
                        let styles = await getSavedStyles();
                        let scriptsRemoved = 0;
                        let stylesRemoved = 0;

                        // Filter out scripts matching the target
                        const initialScriptCount = scripts.length;
                        scripts = scripts.filter(script => {
                            const shouldRemove = script.targetSites.some(site => site.includes(target));
                            if (shouldRemove && script.enabled) {
                                removeScript(script.name); // Ensure script is removed from DOM if active
                            }
                            return !shouldRemove;
                        });
                        scriptsRemoved = initialScriptCount - scripts.length;

                        // Filter out styles matching the target
                        const initialStyleCount = styles.length;
                        styles = styles.filter(style => {
                            const shouldRemove = style.targetSites.some(site => site.includes(target));
                            if (shouldRemove && style.enabled) {
                                removeCustomCSS(`skord-custom-css-${style.name.replace(/\s+/g, '-')}`); // Ensure style is removed from DOM if active
                            }
                            return !shouldRemove;
                        });
                        stylesRemoved = initialStyleCount - styles.length;

                        await saveScripts(scripts);
                        await saveStyles(styles);

                        setCacheStatus(`Cleared ${scriptsRemoved} scripts and ${stylesRemoved} styles for "${target}".`, 'var(--skord-accent-color)');
                        addLog(`Cleared ${scriptsRemoved} scripts and ${stylesRemoved} styles for "${target}".`, 'CACHE');
                        clearSpecificUrlInput.value = ''; // Clear input after action
                    } catch (error) {
                        setCacheStatus(`Failed to clear specific data: ${error.message}`, 'var(--skord-danger-btn-bg)');
                        addLog(`Failed to clear specific data for "${target}": ${error.message}`, 'ERROR');
                    }
                });
            });
        }

        if (downloadAllDataBtn) {
            downloadAllDataBtn.addEventListener('click', async () => {
                try {
                    let allData = {};
                    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                        allData = await new Promise(resolve => chrome.storage.local.get(null, resolve));
                    } else {
                        // Fallback for non-extension environment
                        for (let i = 0; i < localStorage.length; i++) {
                            const key = localStorage.key(i);
                            allData[key] = JSON.parse(localStorage.getItem(key));
                        }
                    }

                    const dataStr = JSON.stringify(allData, null, 2);
                    const blob = new Blob([dataStr], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'skord-save.json';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    setCacheStatus('All Skord data downloaded successfully!', '#28a745');
                    addLog('All Skord data downloaded.', 'CACHE');
                } catch (error) {
                    setCacheStatus(`Failed to download data: ${error.message}`, 'var(--skord-danger-btn-bg)');
                    addLog(`Failed to download Skord data: ${error.message}`, 'ERROR');
                }
            });
        }

        if (uploadAndLoadDataBtn) {
            uploadAndLoadDataBtn.addEventListener('click', () => {
                if (!uploadDataInput || !uploadDataInput.files || uploadDataInput.files.length === 0) {
                    setCacheStatus('Please select a JSON file to upload.', 'var(--skord-warning-btn-bg)');
                    return;
                }

                const file = uploadDataInput.files[0];
                const reader = new FileReader();

                reader.onload = async (e) => {
                    try {
                        const parsedData = JSON.parse(e.target.result);
                        showCustomConfirm('Are you sure you want to load this data? This will OVERWRITE your current Skord Menu settings, scripts, and styles.', async () => {
                            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                                await chrome.storage.local.clear(); // Clear existing data first
                                await chrome.storage.local.set(parsedData);
                                setCacheStatus('Data uploaded and loaded successfully! Reloading page...', 'var(--skord-primary-btn-bg)');
                                addLog('Skord data uploaded and loaded.', 'CACHE');
                                location.reload(); // Reload to apply new settings
                            } else {
                                // Fallback for non-extension environment
                                localStorage.clear();
                                for (const key in parsedData) {
                                    localStorage.setItem(key, JSON.stringify(parsedData[key]));
                                }
                                setCacheStatus('Data uploaded and loaded (localStorage fallback)! Reloading page...', 'var(--skord-primary-btn-bg)');
                                addLog('Skord data uploaded and loaded (localStorage fallback).', 'CACHE');
                                location.reload();
                            }
                        });
                    } catch (error) {
                        setCacheStatus(`Failed to load data: Invalid JSON file or ${error.message}`, 'var(--skord-danger-btn-bg)');
                        addLog(`Failed to load Skord data: ${error.message}`, 'ERROR');
                    }
                };

                reader.onerror = (error) => {
                    setCacheStatus(`Error reading file: ${error.message}`, 'var(--skord-danger-btn-bg)');
                    addLog(`Error reading uploaded file: ${error.message}`, 'ERROR');
                };

                reader.readAsText(file);
            });
        }
      });
  
      if (document.getElementById('closeMenuBtn')) document.getElementById('closeMenuBtn').addEventListener('click', () => {
        // Hide the menu instead of removing it (sidebar close button)
        hideMenu();
      });
  
      // Removed custom cursor application on menu creation
      // if (currentCustomCursorUrl) {
      //   document.body.style.cursor = `url('${currentCustomCursorUrl}'), auto`;
      // }
  
      document.documentElement.style.setProperty('--skord-menu-border-radius', `${currentMenuBorderRadius}px`);
      document.documentElement.style.setProperty('--skord-font-size', `${currentFontSize}px`);
    }
  
    // --- Event Listeners for Logging ---
    function setupEventListeners() {
      // Remove existing listeners to prevent duplicates before re-adding
      document.removeEventListener('keydown', handleKeyboardLog);
      document.removeEventListener('click', handleMouseLog);
      // For page swaps and errors, the original overrides are fine or handled by service worker
      window.removeEventListener('error', handleErrorLog);

      if (logSettings.keyboard) {
        document.addEventListener('keydown', handleKeyboardLog);
      }
      if (logSettings.mouse) {
        document.addEventListener('click', handleMouseLog);
      }
      if (logSettings.pageSwaps) {
        // Original pushState override is sufficient for content script logging
      }
      if (logSettings.errors) {
        window.addEventListener('error', handleErrorLog);
      }
    }

    // Handlers for event listeners to allow easy removal
    function handleKeyboardLog(e) {
        addLog(`Key pressed: ${e.key} (code: ${e.code})`, 'KEYBOARD');
    }

    function handleMouseLog(e) {
        addLog(`Mouse clicked at (${e.clientX}, ${e.clientY})`, 'MOUSE');
    }

    function handleErrorLog(e) {
        addLog(`Error: ${e.message} (File: ${e.filename}, Line: ${e.lineno})`, 'ERROR');
    }

    // Listen for messages from the service worker (background.js)
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === "addLog") {
                addLog(request.message, request.category);
                sendResponse({ status: "log received" });
            }
        });
    }
  })();
