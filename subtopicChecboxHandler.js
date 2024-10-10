// checkboxHandler.js

function initializeCheckboxHandler() {
    const checkboxes = document.querySelectorAll('.subtopic-checkbox');
    const addToSummaryBtn = document.getElementById('add-to-summary-btn');

    function updateButtonVisibility() {
        const anyChecked = Array.from(checkboxes).some(checkbox => checkbox.checked);
        addToSummaryBtn.classList.toggle('hidden', !anyChecked);
    }

    function attachCheckboxListeners() {
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', updateButtonVisibility);
        });
    }

    function refreshCheckboxHandlers() {
        // Remove existing listeners to prevent duplicates
        checkboxes.forEach(checkbox => {
            checkbox.removeEventListener('change', updateButtonVisibility);
        });

        // Reattach listeners
        attachCheckboxListeners();

        // Update button visibility
        updateButtonVisibility();
    }

    // Initial setup
    attachCheckboxListeners();
    updateButtonVisibility();

    // Return the refresh function for external use
    return refreshCheckboxHandlers;
}

export { initializeCheckboxHandler };