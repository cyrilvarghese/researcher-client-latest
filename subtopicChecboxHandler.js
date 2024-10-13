import { setButtonLoadingState } from './utils.js';
import { getGlobalData } from './tableRenderer.js';
import { fetchSlideData } from './api.js';
import { showContentPopup } from './newSliderenderer.js';
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

    addToSummaryBtn.addEventListener('click', async () => {
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
        let globalData = getGlobalData();
        //iterate through selectedSubtopics and get summary from globalState  and append to a summary array  
        let summaries = [];
        selectedSubtopics.forEach(subtopic => {
            summaries.push(globalData.competencies[subtopic.compIndex].parts[subtopic.partIndex].summary);
        });
        console.log('Selected Subtopics:', summaries);
        setButtonLoadingState(addToSummaryBtn, true, { loadingText: "Creating Summary Slide" });

        let textContent = summaries.map(summary => summary.text);
        try {
            let summarySlideData = await fetchSlideData(globalData["Main Topic"], textContent, true);
            console.log('Summary Slide:', summarySlideData);
            // Handle successful slide creation here
            showContentPopup(summarySlideData);


        } catch (error) {
            console.error('Error creating summary slide:', error);
            // Handle error here (e.g., show an error message to the user)
        } finally {
            setButtonLoadingState(addToSummaryBtn, false, { defaultText: "Create Summary Slide", defaultIcon: "fa-solid fa-file-lines" });
        }
    });
}

export { initializeCheckboxHandler };
