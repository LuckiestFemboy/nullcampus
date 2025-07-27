(function() {
    // --- Load JSZip library for zip file generation ---
    // This script dynamically loads JSZip from a CDN.
    const jszipScript = document.createElement('script');
    jszipScript.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
    document.head.appendChild(jszipScript);

    // --- Load Font Awesome for icons ---
    const fontAwesomeScript = document.createElement('script');
    // Using a generic Font Awesome CDN. For production, consider using your own kit URL.
    fontAwesomeScript.src = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/js/all.min.js";
    fontAwesomeScript.crossOrigin = "anonymous";
    document.head.appendChild(fontAwesomeScript);


    // --- Prevent multiple injections ---
    // If the IDE container already exists, log a message and exit to prevent duplicates.
    if (document.getElementById('simple-web-ide-container')) {
        console.log("Simple Web IDE is already running.");
        return;
    }

    // --- Global CSS Styles for macOS-like window and VS Code-like UI ---
    // Inject a style element into the document head to apply all necessary CSS.
    const styleEl = document.createElement('style');
    styleEl.id = 'simple-web-ide-styles';
    document.head.appendChild(styleEl);
    styleEl.textContent = `
        /* General Reset & Font */
        :root {
            --ide-bg: #1e1e1e; /* VS Code dark background */
            --ide-panel-bg: #252526; /* VS Code sidebar/panel background */
            --ide-text-color: #cccccc; /* VS Code default text color */
            --ide-border-color: #333333; /* VS Code border color */
            --ide-input-bg: #333333; /* VS Code input/editor background */
            --ide-input-border: #555555;
            --ide-button-bg: #0e639c; /* VS Code primary button */
            --ide-button-hover-bg: #1177bb;
            --ide-tab-inactive-bg: #2d2d2d;
            --ide-tab-active-bg: #1e1e1e;
            --ide-tab-border-active: #007acc; /* VS Code active tab indicator */
            --ide-traffic-red: #ff5f56;
            --ide-traffic-yellow: #ffbd2e;
            --ide-traffic-green: #27c93f;
            --ide-traffic-hover-bg: rgba(255, 255, 255, 0.1);
            --ide-resizer-color: #6a6a6a;
            --ide-file-item-hover: #3a3a3a;
            --ide-file-item-active: #007acc;
        }

        /* Main Window Container */
        #simple-web-ide-container {
            position: fixed;
            top: 50px; /* Initial position */
            left: 50px;
            width: 90vw; /* Responsive width */
            max-width: 1200px; /* Max width for desktop */
            height: 80vh; /* Responsive height */
            max-height: 800px; /* Max height for desktop */
            min-width: 600px;
            min-height: 400px;
            background-color: var(--ide-bg);
            z-index: 99999;
            display: flex;
            flex-direction: column; /* Changed to column for top and bottom panels */
            font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: var(--ide-text-color);
            border-radius: 8px; /* macOS-like rounded corners */
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5); /* macOS-like shadow */
            overflow: hidden; /* Important for rounded corners */
            resize: both; /* Enable native resizing */
            outline: none; /* Remove focus outline */
            /* Removed transform/opacity transition here to prevent slow dragging */
        }

        /* Hide native resize handle if using custom ones */
        #simple-web-ide-container::-webkit-resizer {
            display: none;
        }

        /* Title Bar */
        #ide-title-bar {
            -webkit-app-region: drag; /* Makes the entire bar draggable on macOS */
            height: 40px; /* Increased height */
            background-color: var(--ide-panel-bg);
            border-bottom: 1px solid var(--ide-border-color);
            display: flex;
            align-items: center;
            padding: 0 10px;
            font-size: 0.85em;
            position: relative;
            user-select: none;
            cursor: default; /* Changed to default cursor */
        }

        /* Removed .dragging cursor change */

        #ide-title-text {
            position: absolute; /* Position absolutely for centering */
            left: 50%;
            transform: translateX(-50%); /* Center horizontally */
            color: #999999; /* Lighter text for title */
            white-space: nowrap; /* Prevent text wrapping */
            overflow: hidden; /* Hide overflow if buttons overlap */
            text-overflow: ellipsis; /* Add ellipsis if text is too long */
            max-width: calc(100% - 220px); /* Adjust max-width to leave more space for buttons */
        }

        /* Title Bar Buttons (New Workspace, Import Project) */
        #title-bar-buttons {
            display: flex;
            -webkit-app-region: no-drag; /* Prevents dragging when clicking buttons */
            margin-left: auto; /* Push to the right */
            position: absolute; /* Position absolutely to not affect title text flow */
            right: 10px; /* Align to the right */
        }

        #title-bar-buttons button {
            background-color: var(--ide-button-bg);
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.8em;
            margin-left: 10px; /* Space between buttons */
            display: flex;
            align-items: center;
            gap: 5px; /* Space between icon and text */
        }
        #title-bar-buttons button:hover {
            background-color: var(--ide-button-hover-bg);
        }
        #title-bar-buttons button i {
            font-size: 1em; /* Adjust icon size */
        }


        /* Traffic Light Buttons */
        #ide-traffic-lights {
            display: flex;
            -webkit-app-region: no-drag; /* Prevents dragging when clicking buttons */
            position: absolute;
            left: 10px;
        }

        .traffic-light-btn {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 7px;
            cursor: pointer;
            border: 1px solid rgba(0,0,0,0.2); /* Subtle border */
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.1s ease;
        }

        .traffic-light-btn:hover {
            opacity: 0.8; /* Subtle hover effect */
        }

        .traffic-light-btn.close { background-color: var(--ide-traffic-red); }
        .traffic-light-btn.minimize { background-color: var(--ide-traffic-yellow); }
        .traffic-light-btn.maximize { background-color: var(--ide-traffic-green); }

        /* Top Content Area (Sidebar + Editor) */
        #ide-top-content {
            display: flex; /* Flex row for sidebar and editor */
            flex-grow: 1; /* Allows it to take available vertical space */
            overflow: hidden;
        }

        /* Sidebar (File Explorer) */
        #ide-sidebar {
            width: 250px; /* Initial width for sidebar */
            min-width: 100px; /* Minimum width for sidebar */
            max-width: 500px; /* Maximum width for sidebar */
            background-color: var(--ide-panel-bg);
            border-right: 1px solid var(--ide-border-color);
            display: flex;
            flex-direction: column;
            overflow-y: auto; /* Scroll for file list */
            overflow-x: hidden; /* Hide horizontal overflow */
            flex-shrink: 0; /* Prevent shrinking below min-width */
            position: relative; /* For resizer positioning */
        }

        #sidebar-header {
            padding: 10px;
            font-weight: bold;
            border-bottom: 1px solid var(--ide-border-color);
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.9em;
        }

        #sidebar-header button {
            background: none;
            border: none;
            color: var(--ide-text-color);
            font-size: 1.2em; /* Larger for icon */
            cursor: pointer;
            padding: 0 5px;
            margin-left: 5px;
        }
        #sidebar-header button:hover {
            color: white;
        }


        #file-tree {
            list-style: none;
            padding: 10px 0;
            margin: 0;
        }

        .file-item {
            padding: 5px 15px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 0.9em;
        }

        .file-item:hover {
            background-color: var(--ide-file-item-hover);
        }

        .file-item.active {
            background-color: var(--ide-file-item-active);
            color: white;
        }

        .file-item-name {
            flex-grow: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            display: flex;
            align-items: center;
            gap: 8px; /* Space between icon and text */
        }
        .file-item-name i {
            font-size: 1em; /* Icon size for file types */
            color: #61afef; /* Default icon color, can be overridden */
        }
        /* Specific file icon colors */
        .file-item-name i.fa-html5 { color: #e34c26; }
        .file-item-name i.fa-css3-alt { color: #264de4; }
        .file-item-name i.fa-js-square { color: #f7df1e; }
        .file-item-name i.fa-file-code { color: #c678dd; } /* Generic code file */
        .file-item-name i.fa-file-alt { color: #abb2bf; } /* Generic text file */
        .file-item-name i.fa-image { color: #98c379; } /* Image file */
        .file-item-name i.fa-file-image { color: #98c379; } /* Image file */
        .file-item-name i.fa-file { color: #abb2bf; } /* Generic file */


        .file-item-actions {
            display: none; /* Hidden by default */
        }

        .file-item:hover .file-item-actions {
            display: flex; /* Show on hover */
        }

        .file-item-actions button {
            background: none;
            border: none;
            color: var(--ide-text-color);
            font-size: 0.8em;
            margin-left: 5px;
            cursor: pointer;
            padding: 2px 5px;
            border-radius: 3px;
        }
        .file-item-actions button:hover {
            background-color: rgba(255,255,255,0.1);
        }

        /* Editor Area */
        #ide-editor-area {
            flex-grow: 1; /* Allows editor to take remaining horizontal space */
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        #editor-tabs {
            display: flex;
            background-color: var(--ide-tab-inactive-bg);
            border-bottom: 1px solid var(--ide-border-color);
            overflow-x: auto; /* Enable horizontal scrolling for many tabs */
            white-space: nowrap; /* Prevent tabs from wrapping */
        }

        .editor-tab {
            padding: 8px 15px;
            cursor: pointer;
            border-right: 1px solid var(--ide-border-color);
            font-size: 0.85em;
            transition: background-color 0.1s ease;
            position: relative; /* For close button positioning */
            flex-shrink: 0; /* Prevent tabs from shrinking */
        }

        .editor-tab:hover {
            background-color: var(--ide-file-item-hover);
        }

        .editor-tab.active {
            background-color: var(--ide-tab-active-bg);
            border-bottom: 2px solid var(--ide-tab-border-active);
            padding-bottom: 7px; /* Adjust padding for border */
        }

        .editor-tab:first-child { border-left: none; } /* No left border on first tab */

        .editor-tab .close-tab-btn {
            position: absolute;
            right: 5px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: var(--ide-text-color);
            font-size: 0.9em;
            cursor: pointer;
            padding: 2px;
            line-height: 1;
            opacity: 0; /* Hidden by default */
            transition: opacity 0.1s ease;
        }

        .editor-tab:hover .close-tab-btn {
            opacity: 1; /* Show on tab hover */
        }
        .editor-tab.active .close-tab-btn {
            opacity: 1; /* Always show on active tab */
        }


        #editor-content {
            flex-grow: 1;
            display: flex;
            overflow: hidden;
            /* position: relative; Removed as preview is now bottom panel */
        }

        .ide-code-editor {
            flex-grow: 1;
            width: 100%;
            height: 100%;
            background-color: var(--ide-input-bg);
            border: none;
            color: var(--ide-text-color);
            padding: 15px;
            font-family: 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
            font-size: 14px;
            resize: none;
            box-sizing: border-box;
            outline: none;
            line-height: 1.5;
            tab-size: 4;
            white-space: pre;
            word-wrap: normal;
            overflow: auto; /* Enable scrolling for content */
            display: none; /* Hidden by default, shown by JS */
        }
        .ide-code-editor.active {
            display: block;
        }

        /* Bottom Panel (for Preview) */
        #ide-bottom-panel {
            height: 200px; /* Initial height for bottom panel */
            min-height: 50px; /* Minimum height */
            max-height: 80%; /* Max height relative to container */
            background-color: var(--ide-panel-bg);
            border-top: 1px solid var(--ide-border-color);
            display: flex;
            flex-direction: column;
            flex-shrink: 0; /* Prevent shrinking below min-height */
            overflow: hidden;
            position: relative; /* For resizer positioning */
        }

        #preview-header {
            padding: 8px;
            background-color: var(--ide-panel-bg);
            border-bottom: 1px solid var(--ide-border-color);
            font-weight: bold;
            font-size: 0.9em;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: relative; /* For resizer inside header */
        }

        #preview-header button {
            background-color: var(--ide-button-bg);
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.8em;
            margin-left: 10px; /* Space between buttons */
        }
        #preview-header button:hover {
            background-color: var(--ide-button-hover-bg);
        }

        #ide-preview-iframe {
            flex-grow: 1;
            width: 100%;
            height: 100%;
            border: none;
            background-color: white; /* Default background for iframe */
        }

        /* Resizers */
        .horizontal-resizer {
            height: 5px;
            background-color: var(--ide-resizer-color);
            cursor: ns-resize;
            position: absolute;
            left: 0;
            right: 0;
            z-index: 100000;
        }
        .vertical-resizer {
            width: 5px;
            background-color: var(--ide-resizer-color);
            cursor: ew-resize;
            position: absolute;
            top: 0;
            bottom: 0;
            z-index: 100000;
        }

        /* Positioning for specific resizers */
        #sidebar-resizer {
            right: -2.5px; /* Center on sidebar's right border */
        }

        #bottom-panel-resizer {
            top: -2.5px; /* Center on bottom panel's top border */
            width: 100%; /* Ensure it spans the full width of the header */
        }


        /* Fullscreen Mode */
        #simple-web-ide-container.fullscreen {
            width: 100vw !important;
            height: 100vh !important;
            top: 0 !important;
            left: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            resize: none !important;
        }

        /* Minimized/Closed state for animation */
        #simple-web-ide-container.minimized {
            opacity: 0;
            transform: scale(0.05) translate(50vw, 50vh); /* Shrink to a tiny point near center-bottom */
            pointer-events: none; /* Disable interactions when minimized */
            transition: transform 0.3s ease-out, opacity 0.3s ease-out; /* Apply transition here */
        }
        /* New class for truly hidden state, toggled by Alt key */
        #simple-web-ide-container.fully-hidden {
            display: none; /* Completely remove from layout */
            opacity: 0; /* Ensure it's invisible */
            pointer-events: none; /* No interactions */
            /* No transition here, as it's meant for immediate hide/show */
        }


        /* Modal for prompts/alerts */
        .ide-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000000;
        }

        .ide-modal-content {
            background-color: var(--ide-panel-bg);
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            width: 300px;
            color: var(--ide-text-color);
            font-size: 0.9em;
        }

        .ide-modal-content input {
            width: calc(100% - 20px);
            padding: 8px 10px;
            margin-top: 10px;
            margin-bottom: 15px;
            border: 1px solid var(--ide-input-border);
            background-color: var(--ide-input-bg);
            color: var(--ide-text-color);
            border-radius: 4px;
        }

        .ide-modal-content .modal-buttons {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
        }

        .ide-modal-content button {
            background-color: var(--ide-button-bg);
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 4px;
            cursor: pointer;
        }

        .ide-modal-content button.cancel {
            background-color: #555;
        }

        .ide-modal-content button:hover {
            opacity: 0.9;
        }
    `;

    // --- Main Container and Structure ---
    // Create the main IDE container div and append it to the document body.
    const ideContainer = document.createElement('div');
    ideContainer.id = 'simple-web-ide-container';
    document.body.appendChild(ideContainer);

    // Store initial/previous dimensions for fullscreen toggle
    let prevIdeWidth = '90vw'; // Default from CSS
    let prevIdeHeight = '80vh'; // Default from CSS
    let prevIdeTop = '50px'; // Default from CSS
    let prevIdeLeft = '50px'; // Default from CSS


    // Title Bar (for dragging and window controls)
    const titleBar = document.createElement('div');
    titleBar.id = 'ide-title-bar';
    ideContainer.appendChild(titleBar);

    // Traffic Light Buttons (Close, Minimize, Maximize)
    const trafficLights = document.createElement('div');
    trafficLights.id = 'ide-traffic-lights';
    titleBar.appendChild(trafficLights);

    const closeBtn = document.createElement('div');
    closeBtn.className = 'traffic-light-btn close';
    trafficLights.appendChild(closeBtn);

    const minimizeBtn = document.createElement('div');
    minimizeBtn.className = 'traffic-light-btn minimize';
    trafficLights.appendChild(minimizeBtn);

    const maximizeBtn = document.createElement('div');
    maximizeBtn.className = 'traffic-light-btn maximize';
    trafficLights.appendChild(maximizeBtn);

    const titleText = document.createElement('span');
    titleText.id = 'ide-title-text';
    titleText.textContent = 'Simple Web IDE (HTML/CSS/JS)';
    titleBar.appendChild(titleText);

    // Title Bar Buttons (New Workspace, Import Project)
    const titleBarButtons = document.createElement('div');
    titleBarButtons.id = 'title-bar-buttons';
    titleBar.appendChild(titleBarButtons);

    const newWorkspaceBtn = document.createElement('button');
    newWorkspaceBtn.id = 'new-workspace-btn';
    newWorkspaceBtn.innerHTML = '<i class="fas fa-folder-plus"></i> New Workspace';
    titleBarButtons.appendChild(newWorkspaceBtn);

    const importProjectBtn = document.createElement('button');
    importProjectBtn.id = 'import-project-btn';
    importProjectBtn.innerHTML = '<i class="fas fa-file-import"></i> Import Project';
    titleBarButtons.appendChild(importProjectBtn);


    // --- Top Content Area (Sidebar + Editor) ---
    const ideTopContent = document.createElement('div');
    ideTopContent.id = 'ide-top-content';
    ideContainer.appendChild(ideTopContent);

    // Sidebar (File Explorer)
    const sidebar = document.createElement('div');
    sidebar.id = 'ide-sidebar';
    ideTopContent.appendChild(sidebar);

    // Sidebar Resizer
    const sidebarResizer = document.createElement('div');
    sidebarResizer.className = 'vertical-resizer';
    sidebarResizer.id = 'sidebar-resizer';
    sidebar.appendChild(sidebarResizer); // Append to sidebar for relative positioning

    const sidebarHeader = document.createElement('div');
    sidebarHeader.id = 'sidebar-header';
    sidebarHeader.innerHTML = `
        <span>EXPLORER</span>
        <button id="new-file-btn" class="icon-button" title="New File"><i class="fas fa-plus"></i></button> <!-- Plus icon -->
    `;
    sidebar.appendChild(sidebarHeader);

    // Hidden file input for importing zip
    const importZipInput = document.createElement('input');
    importZipInput.type = 'file';
    importZipInput.id = 'import-zip-input';
    importZipInput.accept = '.zip';
    importZipInput.style.display = 'none';
    document.body.appendChild(importZipInput); // Append to body, hidden

    const fileTree = document.createElement('ul');
    fileTree.id = 'file-tree';
    sidebar.appendChild(fileTree);

    // Editor Area
    const editorArea = document.createElement('div');
    editorArea.id = 'ide-editor-area';
    ideTopContent.appendChild(editorArea);

    // Editor Tabs (HTML, CSS, JS)
    const editorTabs = document.createElement('div');
    editorTabs.id = 'editor-tabs';
    editorArea.appendChild(editorTabs);

    // Editor content container
    const editorContent = document.createElement('div');
    editorContent.id = 'editor-content';
    editorArea.appendChild(editorContent);

    // --- Bottom Panel (for Preview) ---
    const ideBottomPanel = document.createElement('div');
    ideBottomPanel.id = 'ide-bottom-panel';
    ideContainer.appendChild(ideBottomPanel);

    const previewHeader = document.createElement('div');
    previewHeader.id = 'preview-header';
    previewHeader.innerHTML = `
        <span>PREVIEW</span>
        <div>
            <button id="run-code-btn">Run Code</button>
            <button id="download-project-btn">Download Project</button>
        </div>
    `;
    ideBottomPanel.appendChild(previewHeader);

    // Bottom Panel Resizer - now a child of previewHeader
    const bottomPanelResizer = document.createElement('div');
    bottomPanelResizer.className = 'horizontal-resizer';
    bottomPanelResizer.id = 'bottom-panel-resizer';
    previewHeader.appendChild(bottomPanelResizer); // Moved here

    const previewIframe = document.createElement('iframe');
    previewIframe.id = 'ide-preview-iframe';
    ideBottomPanel.appendChild(previewIframe);

    // --- State Variables ---
    let currentProjectName = 'default-project';
    // Stores file content and metadata for the current project
    // Example: { 'index.html': { content: '...', lang: 'html' }, 'style.css': { content: '...', lang: 'css' } }
    let currentProjectFiles = {};
    // List of filenames currently open in editor tabs
    let openFileTabs = [];
    // Name of the currently active file in the editor
    let activeFileName = null;

    const STORAGE_PREFIX = 'simple-web-ide-project-';
    const PROJECT_LIST_KEY = 'simple-web-ide-projects';
    const LAST_ACTIVE_PROJECT_KEY = 'simple-web-ide-last-active-project';
    const LAST_OPEN_FILES_KEY_PREFIX = 'simple-web-ide-last-open-files-'; // Per project
    const LAST_ACTIVE_FILE_KEY_PREFIX = 'simple-web-ide-last-active-file-'; // Per project

    // --- Utility Functions ---

    // Custom Modal for prompts and confirms (replaces alert/prompt/confirm)
    function showModal(message, type = 'alert', defaultValue = '') {
        return new Promise(resolve => {
            const overlay = document.createElement('div');
            overlay.className = 'ide-modal-overlay';
            document.body.appendChild(overlay);

            const modalContent = document.createElement('div');
            modalContent.className = 'ide-modal-content';
            overlay.appendChild(modalContent);

            const messagePara = document.createElement('p');
            messagePara.textContent = message;
            modalContent.appendChild(messagePara);

            let inputField;
            if (type === 'prompt') {
                inputField = document.createElement('input');
                inputField.type = 'text';
                inputField.value = defaultValue;
                modalContent.appendChild(inputField);
                inputField.focus();
                inputField.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        confirmButton.click();
                    }
                });
            }

            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'modal-buttons';
            modalContent.appendChild(buttonContainer);

            const confirmButton = document.createElement('button');
            confirmButton.textContent = 'OK';
            confirmButton.addEventListener('click', () => {
                overlay.remove();
                resolve(type === 'prompt' ? inputField.value : true);
            });
            buttonContainer.appendChild(confirmButton);

            if (type === 'confirm' || type === 'prompt') {
                const cancelButton = document.createElement('button');
                cancelButton.textContent = 'Cancel';
                cancelButton.className = 'cancel';
                cancelButton.addEventListener('click', () => {
                    overlay.remove();
                    resolve(false);
                });
                buttonContainer.appendChild(cancelButton);
            }
        });
    }

    // --- Local Storage Management ---

    function getProjectList() {
        try {
            const projects = JSON.parse(localStorage.getItem(PROJECT_LIST_KEY) || '[]');
            if (projects.length === 0 || !projects.includes('default-project')) {
                projects.push('default-project');
                localStorage.setItem(PROJECT_LIST_KEY, JSON.stringify(projects));
            }
            return projects;
        } catch (e) {
            console.error("Error reading project list from localStorage:", e);
            return ['default-project'];
        }
    }

    function saveProjectList(projects) {
        try {
            localStorage.setItem(PROJECT_LIST_KEY, JSON.stringify(projects));
        } catch (e) {
            console.error("Error saving project list to localStorage:", e);
            showModal("Could not save project list. Local storage might be full.", "alert");
        }
    }

    function loadProject(projectName, filesToLoad = null) {
        try {
            // Save current project's state before loading a new one
            if (currentProjectName) {
                saveCurrentProject();
                localStorage.setItem(LAST_OPEN_FILES_KEY_PREFIX + currentProjectName, JSON.stringify(openFileTabs));
                localStorage.setItem(LAST_ACTIVE_FILE_KEY_PREFIX + currentProjectName, activeFileName);
            }

            // Clear existing editors from the DOM
            document.querySelectorAll('.ide-code-editor').forEach(editor => editor.remove());

            // If filesToLoad are provided (e.g., from import), use them. Otherwise, load from storage.
            if (filesToLoad) {
                currentProjectFiles = filesToLoad;
            } else {
                const projectData = JSON.parse(localStorage.getItem(STORAGE_PREFIX + projectName) || '{}');
                currentProjectFiles = projectData.files || {};
            }

            currentProjectName = projectName;

            // Load last open files and active file for this project
            const lastOpenFiles = JSON.parse(localStorage.getItem(LAST_OPEN_FILES_KEY_PREFIX + projectName) || '[]');
            const lastActiveFile = localStorage.getItem(LAST_ACTIVE_FILE_KEY_PREFIX + projectName);

            openFileTabs = []; // Clear existing tabs
            activeFileName = null; // Clear active file

            // Re-open previous tabs or default to index.html if no files or no previous tabs
            if (Object.keys(currentProjectFiles).length === 0) {
                // If the project is empty, create default files
                createDefaultFiles();
            }

            if (lastOpenFiles.length > 0) {
                lastOpenFiles.forEach(fileName => {
                    if (currentProjectFiles[fileName]) {
                        openFile(fileName); // This will add to openFileTabs and create editor
                    }
                });
            } else if (currentProjectFiles['index.html']) {
                openFile('index.html'); // Default to index.html if no previous tabs
            } else if (Object.keys(currentProjectFiles).length > 0) {
                openFile(Object.keys(currentProjectFiles)[0]); // Open the first available file
            }


            if (lastActiveFile && currentProjectFiles[lastActiveFile]) {
                setActiveFile(lastActiveFile);
            } else if (openFileTabs.length > 0) {
                setActiveFile(openFileTabs[0]); // Set first open tab as active
            } else {
                setActiveFile(null); // No active file
            }


            updateFileTree(); // Refresh sidebar to show files of the new project
            updateEditorTabsUI(); // Refresh editor tabs UI
            runCode(); // Update preview
            console.log(`Project "${projectName}" loaded.`);
        } catch (e) {
            console.error(`Error loading project "${projectName}":`, e);
            showModal(`Could not load project "${projectName}". It might be corrupted.`, "alert");
            // Fallback to a clean state if load fails
            currentProjectFiles = {};
            openFileTabs = [];
            activeFileName = null;
            createDefaultFiles(); // Recreate default files for a clean start
            updateFileTree();
            updateEditorTabsUI();
            runCode();
        }
    }

    function saveCurrentProject() {
        // Collect current content from all active textareas
        document.querySelectorAll('.ide-code-editor').forEach(editor => {
            const fileName = editor.dataset.fileName;
            if (fileName && currentProjectFiles[fileName]) {
                currentProjectFiles[fileName].content = editor.value;
            }
        });

        const projectData = {
            files: currentProjectFiles,
        };
        try {
            localStorage.setItem(STORAGE_PREFIX + currentProjectName, JSON.stringify(projectData));
            let projects = getProjectList();
            if (!projects.includes(currentProjectName)) {
                projects.push(currentProjectName);
                saveProjectList(projects);
            }
            // Save current open tabs and active tab state for this project
            localStorage.setItem(LAST_OPEN_FILES_KEY_PREFIX + currentProjectName, JSON.stringify(openFileTabs));
            localStorage.setItem(LAST_ACTIVE_FILE_KEY_PREFIX + currentProjectName, activeFileName);
            console.log(`Project "${currentProjectName}" saved.`);
        } catch (e) {
            console.error(`Error saving project "${currentProjectName}":`, e);
            showModal("Could not save project. Local storage might be full or corrupted.", "alert");
        }
    }

    function deleteProject(projectName) {
        let projects = getProjectList();
        if (projects.length === 1) {
            showModal("Cannot delete the last project. Create a new one first if you wish to clear this one.", "alert");
            return;
        }

        showModal(`Are you sure you want to delete project "${projectName}"? This action cannot be undone.`, "confirm").then(confirmed => {
            if (confirmed) {
                try {
                    localStorage.removeItem(STORAGE_PREFIX + projectName);
                    localStorage.removeItem(LAST_OPEN_FILES_KEY_PREFIX + projectName);
                    localStorage.removeItem(LAST_ACTIVE_FILE_KEY_PREFIX + projectName);

                    const updatedProjects = projects.filter(p => p !== projectName);
                    saveProjectList(updatedProjects);

                    if (currentProjectName === projectName) {
                        currentProjectName = updatedProjects[0] || 'default-project';
                        loadProject(currentProjectName);
                    } else {
                        updateFileTree();
                    }
                    showModal(`Project "${projectName}" deleted.`, "alert");
                } catch (e) {
                    console.error(`Error deleting project "${projectName}":`, e);
                    showModal(`Could not delete project "${projectName}".`, "alert");
                }
            }
        });
    }

    // --- File Management Functions ---

    function getFileExtension(filename) {
        const parts = filename.split('.');
        return parts.length > 1 ? parts.pop().toLowerCase() : '';
    }

    function getLanguageFromExtension(ext) {
        switch (ext) {
            case 'html': return 'html';
            case 'css': return 'css';
            case 'js': return 'js';
            case 'json': return 'json';
            case 'txt': return 'text';
            case 'png':
            case 'jpg':
            case 'jpeg':
            case 'gif':
            case 'svg': return 'image';
            default: return 'text'; // Fallback for unknown types
        }
    }

    function getFileIconClass(fileName) {
        const ext = getFileExtension(fileName);
        switch (ext) {
            case 'html': return 'fas fa-html5';
            case 'css': return 'fas fa-css3-alt';
            case 'js': return 'fab fa-js-square';
            case 'json': return 'fas fa-file-code'; // Or a specific JSON icon if available
            case 'txt': return 'fas fa-file-alt';
            case 'png':
            case 'jpg':
            case 'jpeg':
            case 'gif': return 'fas fa-file-image'; // More specific image icon
            case 'svg': return 'fas fa-file-image'; // SVG can also be file-code or file-image
            default: return 'fas fa-file'; // Generic file icon
        }
    }

    function createDefaultFiles() {
        currentProjectFiles = {
            'index.html': {
                content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${currentProjectName}</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>Hello from ${currentProjectName}!</h1>
    <p>Edit HTML, CSS, and JS in the panels above.</p>
    <button id="myButton">Click Me</button>
    <script src="script.js"></script>
</body>
</html>`,
                lang: 'html'
            },
            'style.css': {
                content: `body {
    font-family: sans-serif;
    background-color: #282c34;
    color: #abb2bf;
    margin: 20px;
}

h1 {
    color: #61afef;
}

button {
    background-color: #98c379;
    color: #282c34;
    padding: 10px 15px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}
`,
                lang: 'css'
            },
            'script.js': {
                content: `document.getElementById('myButton').addEventListener('click', () => {
    console.log('Button was clicked!');
});
`,
                lang: 'js'
            }
        };
        // Ensure default files are opened and active
        openFileTabs = ['index.html', 'style.css', 'script.js'];
        activeFileName = 'index.html';
    }

    async function createNewFile() {
        const fileName = await showModal("Enter new file name (e.g., about.html, main.js):", "prompt");
        if (!fileName || fileName.trim() === "") {
            return;
        }
        const trimmedName = fileName.trim();
        if (currentProjectFiles[trimmedName]) {
            showModal(`File "${trimmedName}" already exists.`, "alert");
            return;
        }

        const fileExt = getFileExtension(trimmedName);
        const fileLang = getLanguageFromExtension(fileExt);

        currentProjectFiles[trimmedName] = {
            content: '',
            lang: fileLang
        };
        saveCurrentProject(); // Save the new file to storage
        updateFileTree(); // Update sidebar
        openFile(trimmedName); // Open the new file in an editor tab
        setActiveFile(trimmedName); // Make it the active file
    }

    async function renameFile(oldName) {
        const newName = await showModal(`Rename "${oldName}" to:`, "prompt", oldName);
        if (!newName || newName.trim() === "" || newName.trim() === oldName) {
            return;
        }
        const trimmedName = newName.trim();
        if (currentProjectFiles[trimmedName]) {
            showModal(`File "${trimmedName}" already exists.`, "alert");
            return;
        }

        // Save current content of the old file before renaming
        const oldEditor = document.querySelector(`.ide-code-editor[data-file-name="${oldName}"]`);
        if (oldEditor) {
            currentProjectFiles[oldName].content = oldEditor.value;
        }

        // Transfer file data to new name
        currentProjectFiles[trimmedName] = currentProjectFiles[oldName];
        delete currentProjectFiles[oldName];

        // Update open tabs
        const oldTabIndex = openFileTabs.indexOf(oldName);
        if (oldTabIndex !== -1) {
            openFileTabs[oldTabIndex] = trimmedName;
        }

        // Update active file
        if (activeFileName === oldName) {
            activeFileName = trimmedName;
        }

        saveCurrentProject();
        updateFileTree();
        updateEditorTabsUI(); // Re-render tabs to reflect new name
        setActiveFile(activeFileName); // Re-activate the file under its new name
        showModal(`File "${oldName}" renamed to "${trimmedName}".`, "alert");
    }

    async function deleteFile(fileName) {
        if (!currentProjectFiles[fileName]) return;

        showModal(`Are you sure you want to delete "${fileName}"? This action cannot be undone.`, "confirm").then(confirmed => {
            if (confirmed) {
                // If deleting the active file, switch to another open file or null
                if (activeFileName === fileName) {
                    const fileIndex = openFileTabs.indexOf(fileName);
                    if (openFileTabs.length > 1) {
                        // Activate next or previous tab
                        setActiveFile(openFileTabs[fileIndex === 0 ? 1 : fileIndex - 1]);
                    } else {
                        setActiveFile(null); // No other files open
                    }
                }

                // Remove from open tabs
                openFileTabs = openFileTabs.filter(name => name !== fileName);

                // Remove from project files
                delete currentProjectFiles[fileName];

                saveCurrentProject();
                updateFileTree();
                updateEditorTabsUI();
                runCode(); // Update preview as content might have changed
                showModal(`File "${fileName}" deleted.`, "alert");
            }
        });
    }

    // --- UI Update Functions ---

    // Updates the file tree (sidebar) with files of the current project.
    function updateFileTree() {
        fileTree.innerHTML = ''; // Clear existing list items
        // Display current workspace name prominently
        const workspaceTitle = document.createElement('li');
        workspaceTitle.className = 'file-item active'; // Highlight current workspace
        workspaceTitle.style.fontWeight = 'bold';
        workspaceTitle.style.cursor = 'default';
        workspaceTitle.style.backgroundColor = 'var(--ide-file-item-active)';
        workspaceTitle.style.color = 'white';
        workspaceTitle.style.marginBottom = '10px';
        workspaceTitle.innerHTML = `<span><i class="fas fa-folder"></i> ${currentProjectName}</span>`; // Folder icon
        fileTree.appendChild(workspaceTitle);

        // Add a separator or title for "Files"
        const filesHeader = document.createElement('li');
        filesHeader.style.padding = '5px 15px';
        filesHeader.style.fontWeight = 'bold';
        filesHeader.style.fontSize = '0.8em';
        filesHeader.style.color = '#888';
        filesHeader.textContent = 'FILES';
        fileTree.appendChild(filesHeader);


        // Sort files alphabetically
        const sortedFileNames = Object.keys(currentProjectFiles).sort((a, b) => {
            // Prioritize index.html, style.css, script.js
            const order = { 'index.html': 1, 'style.css': 2, 'script.js': 3 };
            const orderA = order[a] || 99;
            const orderB = order[b] || 99;
            if (orderA !== orderB) return orderA - orderB;
            return a.localeCompare(b);
        });

        sortedFileNames.forEach(fileName => {
            const li = document.createElement('li');
            li.className = 'file-item';
            li.dataset.fileName = fileName;
            if (activeFileName === fileName) {
                li.classList.add('active'); // Highlight the active file
            }

            const nameSpan = document.createElement('span');
            nameSpan.className = 'file-item-name';
            // Add icon based on file type
            nameSpan.innerHTML = `<i class="${getFileIconClass(fileName)}"></i> ${fileName}`;
            li.appendChild(nameSpan);

            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'file-item-actions';

            const renameBtn = document.createElement('button');
            renameBtn.innerHTML = '<i class="fas fa-pencil-alt"></i>'; // Pencil icon
            renameBtn.title = 'Rename File';
            renameBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent opening file
                renameFile(fileName);
            });
            actionsDiv.appendChild(renameBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>'; // Trash can icon
            deleteBtn.title = 'Delete File';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent opening file
                deleteFile(fileName);
            });
            actionsDiv.appendChild(deleteBtn);

            li.appendChild(actionsDiv);

            li.addEventListener('click', () => {
                openFile(fileName);
                setActiveFile(fileName);
            });
            fileTree.appendChild(li);
        });

        // Add a separator or title for "Workspaces"
        const workspacesHeader = document.createElement('li');
        workspacesHeader.style.padding = '5px 15px';
        workspacesHeader.style.fontWeight = 'bold';
        workspacesHeader.style.fontSize = '0.8em';
        workspacesHeader.style.color = '#888';
        workspacesHeader.style.marginTop = '10px';
        workspacesHeader.textContent = 'WORKSPACES';
        fileTree.appendChild(workspacesHeader);

        // List other workspaces
        const allProjects = getProjectList();
        allProjects.filter(p => p !== currentProjectName).sort().forEach(projName => {
            const li = document.createElement('li');
            li.className = 'file-item';
            li.dataset.projectName = projName;
            li.innerHTML = `<span><i class="fas fa-folder"></i> ${projName}</span>`; // Folder icon
            li.addEventListener('click', () => {
                loadProject(projName);
            });

            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'file-item-actions';

            const renameBtn = document.createElement('button');
            renameBtn.innerHTML = '<i class="fas fa-pencil-alt"></i>'; // Pencil icon
            renameBtn.title = 'Rename Workspace';
            renameBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent loading project
                promptRenameProject(projName);
            });
            actionsDiv.appendChild(renameBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>'; // Trash can icon
            deleteBtn.title = 'Delete Workspace';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent loading project
                deleteProject(projName);
            });
            actionsDiv.appendChild(deleteBtn);

            li.appendChild(actionsDiv);
            fileTree.appendChild(li);
        });
    }

    // Opens a file in an editor tab. If already open, just activates it.
    function openFile(fileName) {
        if (!currentProjectFiles[fileName]) {
            console.error(`File not found: ${fileName}`);
            return;
        }

        // Add to open tabs if not already there
        if (!openFileTabs.includes(fileName)) {
            openFileTabs.push(fileName);
            // Create a new textarea for this file
            const editor = document.createElement('textarea');
            editor.id = `editor-${fileName.replace(/[^a-zA-Z0-9]/g, '-')}`; // Sanitize ID
            editor.className = 'ide-code-editor';
            editor.spellcheck = false;
            editor.dataset.fileName = fileName;
            editor.dataset.lang = currentProjectFiles[fileName].lang;
            editor.value = currentProjectFiles[fileName].content;
            editorContent.appendChild(editor);

            // Add auto-save listener to new editor
            editor.addEventListener('input', () => {
                clearTimeout(saveTimeoutId);
                saveTimeoutId = setTimeout(saveCurrentProject, 1000);
                runCode(); // Also run code on input
            });
        }
        updateEditorTabsUI();
        setActiveFile(fileName);
    }

    // Sets the currently active file in the editor.
    function setActiveFile(fileName) {
        // Save content of previously active file before switching
        if (activeFileName) {
            const prevEditor = document.querySelector(`.ide-code-editor[data-file-name="${activeFileName}"]`);
            if (prevEditor) {
                currentProjectFiles[activeFileName].content = prevEditor.value;
            }
        }

        activeFileName = fileName;

        // Deactivate all editors
        document.querySelectorAll('.ide-code-editor').forEach(editor => {
            editor.classList.remove('active');
            editor.style.display = 'none'; // Ensure it's hidden
        });

        // Activate the selected editor
        if (activeFileName) {
            const editorToActivate = document.querySelector(`.ide-code-editor[data-file-name="${activeFileName}"]`);
            if (editorToActivate) {
                editorToActivate.classList.add('active');
                editorToActivate.style.display = 'block'; // Show it
                editorToActivate.focus();
            }
        }
        updateEditorTabsUI(); // Update tab visual state
        updateFileTree(); // Update sidebar active state
        runCode(); // Update preview
    }

    // Updates the editor tabs UI based on openFileTabs array.
    function updateEditorTabsUI() {
        editorTabs.innerHTML = ''; // Clear existing tabs
        openFileTabs.forEach(fileName => {
            const tab = document.createElement('div');
            tab.className = 'editor-tab';
            tab.dataset.fileName = fileName;
            tab.textContent = fileName;

            if (fileName === activeFileName) {
                tab.classList.add('active');
            }

            const closeTabBtn = document.createElement('button');
            closeTabBtn.className = 'close-tab-btn';
            closeTabBtn.innerHTML = '&times;'; // 'x' icon
            closeTabBtn.title = `Close ${fileName}`;
            closeTabBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent tab activation
                closeFileTab(fileName);
            });
            tab.appendChild(closeTabBtn);

            tab.addEventListener('click', () => setActiveFile(fileName));
            editorTabs.appendChild(tab);
        });
    }

    // Closes a file tab and removes its editor.
    function closeFileTab(fileNameToClose) {
        // Save content of the file being closed
        const editorToClose = document.querySelector(`.ide-code-editor[data-file-name="${fileNameToClose}"]`);
        if (editorToClose) {
            currentProjectFiles[fileNameToClose].content = editorToClose.value;
            editorToClose.remove(); // Remove the textarea element
        }

        const index = openFileTabs.indexOf(fileNameToClose);
        if (index > -1) {
            openFileTabs.splice(index, 1); // Remove from open tabs array
        }

        // If the closed file was active, activate another tab or set to null
        if (activeFileName === fileNameToClose) {
            if (openFileTabs.length > 0) {
                setActiveFile(openFileTabs[Math.max(0, index - 1)]); // Activate previous or first tab
            } else {
                setActiveFile(null); // No active file
            }
        }

        saveCurrentProject(); // Save changes to open tabs state
        updateEditorTabsUI(); // Re-render tabs
        runCode(); // Update preview
    }


    // Runs the current HTML, CSS, and JS code in the preview iframe.
    function runCode() {
        // Get content for preview (prioritize index.html, style.css, script.js)
        const htmlContent = currentProjectFiles['index.html'] ? currentProjectFiles['index.html'].content : '';
        const cssContent = currentProjectFiles['style.css'] ? `<style>${currentProjectFiles['style.css'].content}</style>` : '';
        const jsContent = currentProjectFiles['script.js'] ? `<script>${currentProjectFiles['script.js'].content}<\/script>` : '';

        const iframeDoc = previewIframe.contentWindow.document;
        iframeDoc.open();
        // Write the complete HTML document including styles and script.
        iframeDoc.write(`<!DOCTYPE html><html><head><title>Preview</title>${cssContent}</head><body>${htmlContent}${jsContent}</body></html>`);
        iframeDoc.close();
    }

    // --- Window Dragging and Resizing ---
    let isDragging = false;
    let startX, startY, initialX, initialY;

    // Event listener for dragging the title bar.
    titleBar.addEventListener('mousedown', (e) => {
        // Do not initiate drag if clicking on traffic light buttons or other buttons in title bar.
        if (e.target.closest('.traffic-light-btn') || e.target.closest('#title-bar-buttons button')) {
            return;
        }
        isDragging = true;
        // Removed titleBar.classList.add('dragging'); to prevent cursor change
        startX = e.clientX;
        startY = e.clientY;
        initialX = ideContainer.offsetLeft;
        initialY = ideContainer.offsetTop;
        e.preventDefault(); // Prevent text selection during drag
    });

    // Update IDE position during drag.
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        ideContainer.style.left = `${initialX + dx}px`;
        ideContainer.style.top = `${initialY + dy}px`;
    });

    // Stop dragging on mouseup.
    document.addEventListener('mouseup', () => {
        isDragging = false;
        // Removed titleBar.classList.remove('dragging');
    });

    // --- Resizing Panels ---

    // Sidebar Vertical Resizer (for horizontal resizing of sidebar)
    let isResizingSidebar = false;
    let sidebarInitialWidth;

    sidebarResizer.addEventListener('mousedown', (e) => {
        isResizingSidebar = true;
        sidebarInitialWidth = sidebar.offsetWidth;
        startX = e.clientX;
        e.preventDefault();
        document.body.style.cursor = 'ew-resize'; // Change cursor for horizontal resize
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizingSidebar) return;
        const dx = e.clientX - startX;
        const newWidth = sidebarInitialWidth + dx;

        // Apply new width, respecting min/max constraints from CSS
        if (newWidth >= parseInt(getComputedStyle(sidebar).minWidth) &&
            newWidth <= parseInt(getComputedStyle(sidebar).maxWidth)) {
            sidebar.style.width = `${newWidth}px`;
        }
    });

    // Bottom Panel Horizontal Resizer (for vertical resizing of bottom panel)
    let isResizingBottomPanel = false;
    let bottomPanelInitialHeight;
    let ideTopContentInitialHeight; // Store initial height of the top content area

    bottomPanelResizer.addEventListener('mousedown', (e) => {
        isResizingBottomPanel = true;
        bottomPanelInitialHeight = ideBottomPanel.offsetHeight;
        ideTopContentInitialHeight = ideTopContent.offsetHeight; // Capture initial height
        startY = e.clientY; // Capture mouse Y at start of drag
        e.preventDefault();
        document.body.style.cursor = 'ns-resize'; // Change cursor for vertical resize
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizingBottomPanel) return;
        const dy = e.clientY - startY; // Delta Y from start of drag

        // New bottom panel height: current height minus change in Y (moving up decreases Y, increases height)
        const newBottomHeight = bottomPanelInitialHeight - dy;
        // New top content height: current height plus change in Y (moving up decreases Y, increases top content height)
        const newTopHeight = ideTopContentInitialHeight + dy;


        // Get min/max heights from CSS
        const minBottomHeight = parseInt(getComputedStyle(ideBottomPanel).minHeight);
        const maxBottomHeight = ideContainer.offsetHeight * (parseInt(getComputedStyle(ideBottomPanel).maxHeight) / 100);
        const minTopHeight = 100; // Minimum height for the editor area

        // Ensure both panels maintain minimum size and don't exceed max
        if (newBottomHeight >= minBottomHeight && newTopHeight >= minTopHeight && newBottomHeight <= maxBottomHeight) {
            ideBottomPanel.style.height = `${newBottomHeight}px`;
            ideTopContent.style.height = `${newTopHeight}px`;
            ideTopContent.style.flexGrow = '0'; // Fix flex-grow during resize
            ideBottomPanel.style.flexGrow = '0'; // Fix flex-grow during resize
        }
    });


    document.addEventListener('mouseup', () => {
        if (isResizingSidebar) {
            isResizingSidebar = false;
            document.body.style.cursor = ''; // Reset cursor
        }
        if (isResizingBottomPanel) {
            isResizingBottomPanel = false;
            document.body.style.cursor = ''; // Reset cursor
            // Allow panels to flex again after resize is complete
            ideTopContent.style.flexGrow = '1';
            ideTopContent.style.height = 'auto';
            ideBottomPanel.style.flexGrow = '1';
            ideBottomPanel.style.height = 'auto';
        }
    });

    // --- Event Listeners for UI Interactions ---

    // Traffic Light Buttons functionality
    closeBtn.addEventListener('click', () => {
        saveCurrentProject(); // Save before minimizing
        // Apply 'minimized' class for the animation effect
        ideContainer.classList.add('minimized');
        ideContainer.classList.remove('fullscreen'); // Ensure fullscreen is off
        ideContainer.classList.remove('fully-hidden'); // Ensure fully-hidden is off
        titleText.textContent = 'Simple Web IDE (Hidden)';
        document.body.style.overflow = 'hidden'; // Hide body scrollbar
        ideContainer.style.pointerEvents = 'none'; // Disable interactions
    });

    minimizeBtn.addEventListener('click', () => {
        // If it's fully hidden (closed by Alt), bring it back to minimized state
        if (ideContainer.classList.contains('fully-hidden')) {
            ideContainer.classList.remove('fully-hidden');
            ideContainer.classList.add('minimized'); // Bring it back to the minimized state
            // Ensure opacity and transform are set for minimized state
            ideContainer.style.opacity = '0';
            ideContainer.style.transform = 'scale(0.05) translate(50vw, 50vh)';
            ideContainer.style.pointerEvents = 'auto';
            titleText.textContent = 'Simple Web IDE (Hidden)'; // Still hidden, but minimized
            document.body.style.overflow = 'hidden';
        } else {
            // Toggle the minimized state (yellow button behavior)
            const isCurrentlyMinimized = ideContainer.classList.toggle('minimized');

            if (isCurrentlyMinimized) {
                titleText.textContent = 'Simple Web IDE (Hidden)';
                document.body.style.overflow = 'hidden';
                // Ensure opacity and transform are set for minimized state
                ideContainer.style.opacity = '0';
                ideContainer.style.transform = 'scale(0.05) translate(50vw, 50vh)';
                ideContainer.style.pointerEvents = 'none';
            } else {
                titleText.textContent = 'Simple Web IDE (HTML/CSS/JS)';
                document.body.style.overflow = '';
                // Reset opacity and transform when un-minimized
                ideContainer.style.opacity = '1';
                ideContainer.style.transform = 'scale(1) translate(0, 0)';
                ideContainer.style.pointerEvents = 'auto';
            }
        }
    });

    maximizeBtn.addEventListener('click', () => {
        const isFullscreen = ideContainer.classList.contains('fullscreen');
        if (isFullscreen) {
            // Exit fullscreen: Restore previous dimensions
            ideContainer.classList.remove('fullscreen');
            ideContainer.style.width = prevIdeWidth;
            ideContainer.style.height = prevIdeHeight;
            ideContainer.style.top = prevIdeTop;
            ideContainer.style.left = prevIdeLeft;
            document.body.style.overflow = ''; // Restore body overflow
        } else {
            // Enter fullscreen: Store current dimensions and apply fullscreen styles
            prevIdeWidth = window.getComputedStyle(ideContainer).width; // Get current computed width
            prevIdeHeight = window.getComputedStyle(ideContainer).height; // Get current computed height
            prevIdeTop = window.getComputedStyle(ideContainer).top;
            prevIdeLeft = window.getComputedStyle(ideContainer).left;

            ideContainer.classList.add('fullscreen');
            document.body.style.overflow = 'hidden'; // Hide body scrollbar
        }
    });

    // Editor Tab Switching (delegated to parent)
    editorTabs.addEventListener('click', (e) => {
        if (e.target.classList.contains('editor-tab')) {
            setActiveFile(e.target.dataset.fileName);
        }
    });

    // Run Code Button
    document.getElementById('run-code-btn').addEventListener('click', runCode);

    // Download Project Button
    document.getElementById('download-project-btn').addEventListener('click', async () => {
        if (typeof JSZip === 'undefined') {
            showModal("JSZip library not loaded. Please try again in a moment.", "alert");
            return;
        }

        saveCurrentProject(); // Ensure all latest changes are saved

        const zip = new JSZip();
        for (const fileName in currentProjectFiles) {
            if (currentProjectFiles.hasOwnProperty(fileName)) {
                zip.file(fileName, currentProjectFiles[fileName].content);
            }
        }

        try {
            const content = await zip.generateAsync({ type: "blob" });
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${currentProjectName}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showModal(`Project "${currentProjectName}.zip" downloaded!`, "alert");
        } catch (error) {
            console.error("Error generating zip:", error);
            showModal("Failed to generate zip file. See console for details.", "alert");
        }
    });

    // New Workspace Button (now on title bar)
    newWorkspaceBtn.addEventListener('click', async () => {
        const newName = await showModal("Enter new workspace name:", "prompt");
        if (newName && newName.trim() !== "") {
            const trimmedName = newName.trim();
            let projects = getProjectList();
            if (projects.includes(trimmedName)) {
                showModal(`Workspace "${trimmedName}" already exists. Please choose a different name.`, "alert");
                return;
            }
            saveCurrentProject(); // Save current workspace before creating new
            currentProjectName = trimmedName;
            currentProjectFiles = {}; // Clear files for new workspace
            openFileTabs = [];
            activeFileName = null;
            createDefaultFiles(); // Populate with default HTML, CSS, JS
            saveCurrentProject(); // Save the new workspace with default content
            updateFileTree(); // Refresh sidebar to show new workspace
            updateEditorTabsUI(); // Refresh editor tabs
            loadProject(currentProjectName); // Load it to activate in UI
        }
    });

    // Import Project Button (now on title bar)
    importProjectBtn.addEventListener('click', () => {
        importZipInput.click(); // Trigger the hidden file input
    });

    importZipInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) {
            event.target.value = ''; // Clear the file input
            return;
        }

        if (typeof JSZip === 'undefined') {
            showModal("JSZip library not loaded. Please try again in a moment.", "alert");
            event.target.value = ''; // Clear the file input
            return;
        }

        try {
            const zip = await JSZip.loadAsync(file);
            const extractedFiles = {};
            let hasHtml = false;
            let hasCss = false;
            let hasJs = false;

            // Iterate over zip entries
            for (const relativePath in zip.files) {
                if (zip.files.hasOwnProperty(relativePath)) {
                    const zipEntry = zip.files[relativePath];
                    if (!zipEntry.dir) { // Only process files, not directories
                        // Extract just the filename, ignoring any directory paths within the zip
                        const fileNameParts = relativePath.split('/');
                        const fileName = fileNameParts[fileNameParts.length - 1];

                        // Skip files that are not directly in the root or are hidden files
                        if (fileName === '' || fileName.startsWith('.')) {
                            continue;
                        }

                        const fileExt = getFileExtension(fileName);
                        const fileLang = getLanguageFromExtension(fileExt);

                        if (['html', 'css', 'js'].includes(fileLang)) {
                            const content = await zipEntry.async("string");
                            extractedFiles[fileName] = { content: content, lang: fileLang };
                            if (fileLang === 'html') hasHtml = true;
                            if (fileLang === 'css') hasCss = true;
                            if (fileLang === 'js') hasJs = true;
                        }
                    }
                }
            }

            if (!hasHtml && !hasCss && !hasJs) {
                showModal("The zip file does not contain any recognizable HTML, CSS, or JS files at its root level.", "alert");
                event.target.value = ''; // Clear the file input
                return;
            }

            const newWorkspaceName = await showModal("Enter a name for the imported workspace:", "prompt", file.name.replace('.zip', ''));
            if (!newWorkspaceName || newWorkspaceName.trim() === "") {
                showModal("Workspace name cannot be empty. Import cancelled.", "alert");
                return;
            }
            const trimmedName = newWorkspaceName.trim();

            if (getProjectList().includes(trimmedName)) {
                showModal(`Workspace "${trimmedName}" already exists. Please choose a different name.`, "alert");
                event.target.value = ''; // Clear the file input
                return;
            }

            saveCurrentProject(); // Save current workspace before loading imported one
            currentProjectName = trimmedName;
            currentProjectFiles = extractedFiles; // Set files directly
            openFileTabs = []; // Clear tabs, will be repopulated by loadProject
            activeFileName = null; // Will be set by loadProject

            // Add the new workspace to the project list
            let projects = getProjectList();
            projects.push(trimmedName);
            saveProjectList(projects);

            loadProject(trimmedName, extractedFiles); // Load the new workspace with extracted files
            showModal(`Project "${trimmedName}" imported successfully!`, "alert");

        } catch (error) {
            console.error("Error importing zip file:", error);
            showModal("Failed to import project. Please ensure it's a valid zip file and contains valid web files.", "alert");
        } finally {
            event.target.value = ''; // Clear the file input
        }
    });


    // New File Button
    document.getElementById('new-file-btn').addEventListener('click', createNewFile);


    // Prompt for renaming a project (now workspace).
    async function promptRenameProject(oldName) {
        const newName = await showModal(`Rename workspace "${oldName}" to:`, "prompt", oldName);
        if (!newName || newName.trim() === "" || newName.trim() === oldName) {
            return;
        }
        const trimmedName = newName.trim();
        let projects = getProjectList();
        if (projects.includes(trimmedName)) {
            showModal(`Workspace "${trimmedName}" already exists. Please choose a different name.`, "alert");
            return;
        }

        // Get old project data
        const oldProjectData = JSON.parse(localStorage.getItem(STORAGE_PREFIX + oldName) || '{}');
        // Save new project data
        localStorage.setItem(STORAGE_PREFIX + trimmedName, JSON.stringify(oldProjectData));
        // Remove old project data
        localStorage.removeItem(STORAGE_PREFIX + oldName);
        localStorage.removeItem(LAST_OPEN_FILES_KEY_PREFIX + oldName);
        localStorage.removeItem(LAST_ACTIVE_FILE_KEY_PREFIX + oldName);


        // Update project list
        const updatedProjects = projects.map(p => p === oldName ? trimmedName : p);
        saveProjectList(updatedProjects);

        if (currentProjectName === oldName) {
            currentProjectName = trimmedName;
            loadProject(currentProjectName); // This will refresh editors and run code
        } else {
            updateFileTree(); // Just refresh the list
        }
        showModal(`Workspace "${oldName}" renamed to "${trimmedName}".`, "alert");
    }

    // Auto-save on input (debounced) - now handled by individual editor event listeners
    let saveTimeoutId;


    // --- Global Keydown Listener (to prevent Ctrl+1 from interfering and add Alt) ---
    // This function prevents the browser's default behavior for Ctrl+1 (Cmd+1 on Mac)
    // if the IDE window is currently visible and active, and adds Alt to toggle visibility.
    function handleGlobalKeydown(e) {
        // Check if Ctrl+1 (or Cmd+1 on Mac) is pressed
        if ((e.ctrlKey || e.metaKey) && e.key === '1') {
            // Check if our IDE container exists and is currently visible (not minimized/closed)
            if (ideContainer && ideContainer.style.display !== 'none' && !ideContainer.classList.contains('minimized') && !ideContainer.classList.contains('closed') && !ideContainer.classList.contains('fully-hidden')) {
                e.preventDefault(); // Prevent default browser action (e.g., switching to tab 1)
                e.stopPropagation(); // Stop propagation to other listeners
                console.log("Prevented Ctrl+1 from interfering with Simple Web IDE.");
            }
        }
        // Check if Alt is pressed to toggle IDE visibility
        if (e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) { // Ensure only Alt is pressed
            e.preventDefault(); // Prevent default browser action (e.g., opening menu)
            e.stopPropagation(); // Stop propagation

            if (ideContainer.classList.contains('fully-hidden')) {
                // If fully hidden, bring it back to normal state
                ideContainer.classList.remove('fully-hidden');
                ideContainer.classList.remove('minimized'); // Ensure minimized class is also removed
                ideContainer.classList.remove('closed'); // Ensure closed animation class is removed
                ideContainer.style.opacity = '1';
                ideContainer.style.transform = 'scale(1) translate(0, 0)'; // Reset transform
                ideContainer.style.pointerEvents = 'auto';
                titleText.textContent = 'Simple Web IDE (HTML/CSS/JS)';
                document.body.style.overflow = '';
            } else {
                // If visible or minimized, make it fully hidden
                saveCurrentProject(); // Save before hiding
                // Apply 'closed' animation, then 'fully-hidden'
                ideContainer.classList.add('closed'); // Use 'closed' for the animation
                ideContainer.addEventListener('transitionend', function handler() {
                    ideContainer.classList.add('fully-hidden'); // Then hide fully
                    ideContainer.classList.remove('closed'); // Remove animation class
                    ideContainer.classList.remove('minimized'); // Ensure minimized is off
                    titleText.textContent = 'Simple Web IDE (Hidden)';
                    document.body.style.overflow = '';
                    ideContainer.removeEventListener('transitionend', handler);
                }, { once: true });
            }
        }
    }
    // Add the global keydown listener when the IDE script is injected.
    document.addEventListener('keydown', handleGlobalKeydown);


    // --- Initial Setup ---
    // Wait for JSZip and Font Awesome to load before proceeding with initial setup
    let scriptsLoaded = 0;
    const totalScripts = 2; // JSZip and Font Awesome

    const checkScriptsLoaded = () => {
        scriptsLoaded++;
        if (scriptsLoaded === totalScripts) {
            // All necessary scripts are loaded, proceed with IDE initialization

            // Capture initial computed styles once the element is in the DOM
            const initialComputedStyle = window.getComputedStyle(ideContainer);
            prevIdeWidth = initialComputedStyle.width;
            prevIdeHeight = initialComputedStyle.height;
            prevIdeTop = initialComputedStyle.top;
            prevIdeLeft = initialComputedStyle.left;

            updateFileTree(); // Populate the sidebar with existing projects

            // Load the last active project and its last active editor tab.
            const lastActiveProject = localStorage.getItem(LAST_ACTIVE_PROJECT_KEY) || 'default-project';

            if (getProjectList().includes(lastActiveProject)) {
                loadProject(lastActiveProject);
            } else {
                // If the last active project doesn't exist, load the default project.
                loadProject('default-project');
            }

            // Save current project name and active editor tab on window unload
            // This ensures the IDE reopens to the same state next time.
            window.addEventListener('beforeunload', () => {
                saveCurrentProject();
                localStorage.setItem(LAST_ACTIVE_PROJECT_KEY, currentProjectName);
            });

            runCode(); // Perform an initial run of the code to display the preview

            console.log("Simple Web IDE injected. Use the traffic light buttons to manage the window.");
        }
    };

    jszipScript.onload = checkScriptsLoaded;
    fontAwesomeScript.onload = checkScriptsLoaded;

})();
