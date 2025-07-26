// Terms of Service Modal Logic
document.addEventListener('DOMContentLoaded', (event) => {
    // Get references to the modal elements
    const tosModal = document.getElementById('tosModal');
    const acceptTosButton = document.getElementById('acceptTosButton');
    const body = document.body; // Get the body element

    // Check if the user has previously accepted the Terms of Service
    // The 'nullcampus_tos_accepted' key is used in localStorage to store this preference.
    const tosAccepted = localStorage.getItem('nullcampus_tos_accepted');

    // If the terms have not been accepted (i.e., it's the first visit or cleared storage)
    if (!tosAccepted) {
        // Display the modal by changing its display style to 'flex' (as per CSS)
        if (tosModal) { // Ensure the modal element exists before trying to display it
            tosModal.style.display = 'flex';
            // Directly set overflow: hidden !important on the body to prevent scrolling
            body.style.setProperty('overflow', 'hidden', 'important');
        }
    }

    // Add an event listener to the 'Accept' button
    if (acceptTosButton) { // Ensure the button element exists
        acceptTosButton.addEventListener('click', () => {
            // When the button is clicked, set the 'nullcampus_tos_accepted' flag in localStorage to 'true'
            localStorage.setItem('nullcampus_tos_accepted', 'true');
            // Hide the modal after acceptance
            if (tosModal) {
                tosModal.style.display = 'none';
                // Remove the overflow property from the body's style to re-enable scrolling
                body.style.removeProperty('overflow');
            }
        });
    }
});
