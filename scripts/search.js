/**
 * Sets up a search filter for a list of items on a webpage.
 *
 * @param {string} inputId The ID of the search input field.
 * @param {string} itemSelector The CSS selector for the individual items to be filtered (e.g., '.download-card', '.guide-item').
 * @param {string} titleSelector The CSS selector for the element within each item that contains the text to search against (e.g., 'h4', '.guide-title-label').
 */
function setupSearch(inputId, itemSelector, titleSelector) {
    const searchInput = document.getElementById(inputId);
    if (!searchInput) {
        console.error(`Search input with ID '${inputId}' not found.`);
        return;
    }

    searchInput.addEventListener('keyup', (event) => {
        const searchTerm = event.target.value.toLowerCase();
        const items = document.querySelectorAll(itemSelector);

        items.forEach(item => {
            const titleElement = item.querySelector(titleSelector);
            if (titleElement) {
                const titleText = titleElement.textContent.toLowerCase();
                // Check if the title element itself contains the download button, and exclude its text from search
                const downloadButton = titleElement.querySelector('.download-button-inline');
                let searchableText = titleText;
                if (downloadButton) {
                    searchableText = titleText.replace(downloadButton.textContent.toLowerCase(), '').trim();
                }

                if (searchableText.includes(searchTerm)) {
                    item.style.display = ''; // Show the item
                } else {
                    item.style.display = 'none'; // Hide the item
                }
            }
        });
    });
}
