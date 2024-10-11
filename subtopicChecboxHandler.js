// checkboxHandler.js
import { setButtonLoadingState } from './utils.js';
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
    initializeAddToSummaryButton();
    // Return the refresh function for external use
    return refreshCheckboxHandlers;
}
function initializeAddToSummaryButton() {
    const addToSummaryBtn = document.getElementById('add-to-summary-btn');

    addToSummaryBtn.addEventListener('click', () => {
        const selectedSubtopics = [];
        const checkboxes = document.querySelectorAll('.subtopic-checkbox:checked');

        checkboxes.forEach(checkbox => {
            const compIndex = checkbox.dataset.compIndex;
            const partIndex = checkbox.dataset.partIndex;
            const subtopicName = checkbox.closest('tr').querySelector('.sub-topic').textContent.trim();

            selectedSubtopics.push({
                compIndex,
                partIndex,
                name: subtopicName
            });
        });

        console.log('Selected Subtopics:', selectedSubtopics);
        setButtonLoadingState( addToSummaryBtn, true,{loadingText:"Creating Summary Slide" });

    });
}

export { initializeCheckboxHandler };