import { refreshDocuments } from './api.js'; // Import the refreshDocuments function

/**
 * Opens the "Add Subtopic" modal and handles the subtopic save.
 * @param {function} onSaveCallback - A callback function to run when the subtopic is successfully saved.
 */
export function openAddSubtopicModal(onSaveCallback) {
    const addSubtopicScrim = document.getElementById('add-subtopic-scrim');
    const addSubtopicModal = document.getElementById('add-subtopic-modal');
    const saveSubtopicBtn = document.getElementById('save-subtopic-btn');
    const closeAddSubtopicBtn = document.getElementById('close-add-subtopic-btn');
    const subtopicInput = document.getElementById('subtopic-input');

    // Show the modal and scrim
    addSubtopicScrim.classList.remove('hidden');
    addSubtopicModal.classList.remove('hidden');

    // Close the modal function
    function closeAddSubtopicModal() {
        subtopicInput.value = ''; // Clear the input
        addSubtopicScrim.classList.add('hidden');
        addSubtopicModal.classList.add('hidden');
    }

    // Close modal event
    closeAddSubtopicBtn.addEventListener('click', closeAddSubtopicModal);

    // Save Subtopic when "Save" is clicked
    saveSubtopicBtn.addEventListener('click', async () => {
        const subtopicName = subtopicInput.value.trim();

        if (subtopicName) {
            try {
                // Call the API to refresh documents for the subtopic
                const refreshedPart = await refreshDocuments(subtopicName);

                if (refreshedPart) {
                    // Run the callback if save is successful
                    onSaveCallback(refreshedPart);

                    // Close the modal after saving
                    closeAddSubtopicModal();
                }
            } catch (error) {
                console.error('Error saving subtopic:', error);
            }
        } else {
            alert('Please enter a valid subtopic.');
        }
    });
}
