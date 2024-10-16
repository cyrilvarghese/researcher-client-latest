import { setButtonLoadingState } from './utils.js';
import { getGlobalData } from './tableRenderer.js';
import { fetchSlideData } from './api.js';
import { showContentPopup } from './newSliderenderer.js';

/**
 * Initializes the checkbox handler for subtopics.
 * Sets up event listeners and manages the visibility of the "Add to Summary" button.
 * @returns {Function} A function to refresh checkbox handlers.
 */
function initializeCheckboxHandler() {
    const checkboxes = document.querySelectorAll('.subtopic-checkbox');
    const addToSummaryBtn = document.getElementById('add-to-summary-btn');

    /**
     * Updates the visibility of the "Add to Summary" button based on checkbox states.
     */
    function updateButtonVisibility() {
        const anyChecked = Array.from(checkboxes).some(checkbox => checkbox.checked);
        addToSummaryBtn.classList.toggle('hidden', !anyChecked);
    }

    /**
     * Attaches change event listeners to all subtopic checkboxes.
     */
    function attachCheckboxListeners() {
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', updateButtonVisibility);
        });
    }

    /**
     * Refreshes checkbox handlers by removing and reattaching event listeners.
     */
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

/**
 * Initializes the "Add to Summary" button functionality.
 * Sets up click event listener to create a summary slide from selected subtopics.
 */
function initializeAddToSummaryButton() {
    const addToSummaryBtn = document.getElementById('add-to-summary-btn');

    addToSummaryBtn.addEventListener('click', async () => {
        const selectedSubtopics = [];
        const checkboxes = document.querySelectorAll('.subtopic-checkbox:checked');

        // Collect data for selected subtopics
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

        let globalData = getGlobalData();

        // Extract summaries for selected subtopics
        let summaries = [];
        selectedSubtopics.forEach(subtopic => {
            summaries.push(globalData.competencies[subtopic.compIndex].parts[subtopic.partIndex].summary);
        });
        console.log('Selected Subtopics:', summaries);

        // Set button to loading state
        setButtonLoadingState(addToSummaryBtn, true, { loadingText: "Creating Summary Slide" });

        let textContent = summaries.map(summary => summary.text);
        try {
            // Fetch summary slide data
            let summarySlideData = await fetchSlideData(globalData["Main Topic"], textContent, true);
            console.log('Summary Slide:', summarySlideData);

            // Display the summary slide content
            showContentPopup(summarySlideData);

        } catch (error) {
            console.error('Error creating summary slide:', error);
            // Handle error here (e.g., show an error message to the user)
        } finally {
            // Reset button state
            setButtonLoadingState(addToSummaryBtn, false, { defaultText: "Create Summary Slide", defaultIcon: "fa-solid fa-file-lines" });
        }
    });
}

export { initializeCheckboxHandler };
