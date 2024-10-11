import { refreshDocuments } from './api.js'; // Import the refreshDocuments function
import { getGlobalData } from './tableRenderer.js'; // Import the getGlobalData function
import { generateTableRow } from './tableRow.js'; // Assuming these functions are in a separate file
import { updateLocalStorageWithRefreshedPart } from './tableRenderer.js';
import { setButtonLoadingState } from './utils.js';
/**
 * Opens the "Add Subtopic" modal and handles the subtopic save.
 * @param {function} onSaveCallback - A callback function to run when the subtopic is successfully saved.
 */
export function openAddSubtopicModal(callback) {
    let onSaveCallback = callback;
    const addSubtopicScrim = document.getElementById('add-subtopic-scrim');
    const addSubtopicModal = document.getElementById('add-subtopic-modal');
    const closeAddSubtopicBtn = document.getElementById('close-add-subtopic-btn');
    const saveSubtopicBtn = document.getElementById('save-subtopic-btn');

    // Show the modal and scrim
    addSubtopicScrim.classList.remove('hidden');
    addSubtopicModal.classList.remove('hidden');

    // Add event listeners
    closeAddSubtopicBtn.addEventListener('click', handleClose);
    saveSubtopicBtn.addEventListener('click', handleSave);
}

function handleSave() {
    saveSubtopic();
}

function handleClose() {
    closeAddSubtopicModal();
}

export async function saveSubtopic() {
    const saveSubtopicBtn = document.getElementById('save-subtopic-btn');
    setButtonLoadingState(saveSubtopicBtn, true, { loadingClass: "hover:bg-gray-400" });
    const subtopicInput = document.getElementById('subtopic-input');
    const subtopicName = subtopicInput.value.trim();

    if (subtopicName) {
        try {
            // Call the API to refresh documents for the subtopic
            const refreshedPart = await refreshDocuments(subtopicName);

            if (refreshedPart) {
                // Run the callback if save is successful
                handleRefreshedPart(refreshedPart);
                setButtonLoadingState(saveSubtopicBtn, false, { defaultText: "Save" });

            }
        } catch (error) {
            console.error('Error saving subtopic:', error);
        }
    } else {
        alert('Please enter a valid subtopic.');
    }
}

export function closeAddSubtopicModal() {
    const addSubtopicScrim = document.getElementById('add-subtopic-scrim');
    const addSubtopicModal = document.getElementById('add-subtopic-modal');
    const subtopicInput = document.getElementById('subtopic-input');
    const closeAddSubtopicBtn = document.getElementById('close-add-subtopic-btn');
    const saveSubtopicBtn = document.getElementById('save-subtopic-btn');

    subtopicInput.value = ''; // Clear the input
    addSubtopicScrim.classList.add('hidden');
    addSubtopicModal.classList.add('hidden');

    // Remove event listeners
    closeAddSubtopicBtn.removeEventListener('click', handleClose);
    saveSubtopicBtn.removeEventListener('click', handleSave);
}

export function handleRefreshedPart(refreshedPart) {
    try {
        // Get the global data
        let customCompIndex = getGlobalData().competencies.length;
        if (getGlobalData().competencies[customCompIndex - 1].competency === "Custom") {
            customCompIndex = customCompIndex - 1;
        }
        else {
            customCompIndex = getGlobalData().competencies.length;
        }
        let currentCustomPartIndex = 0;
        if (getGlobalData().competencies[customCompIndex]) {
            currentCustomPartIndex = getGlobalData().competencies[customCompIndex].parts.length;
        }

        // Use dummy values if some fields are missing in refreshedPart
        const part = {
            name: refreshedPart.name || 'New Subtopic',
            relevant_docs: refreshedPart.relevant_docs || [],
            links: refreshedPart.links || ['https://example.com'] // Dummy link if none provided
        };

        // Generate the new table row with compIndex and partIndex
        const newTableRow = generateTableRow(customCompIndex, currentCustomPartIndex, part);

        // Insert the new row into the table's body (append as the last row)
        const tableBody = document.getElementById('table-body');
        tableBody.insertAdjacentHTML('afterbegin', newTableRow);

        // Optionally, update local storage with the refreshed part data
        updateLocalStorageWithRefreshedPart(customCompIndex, currentCustomPartIndex, refreshedPart);

        // Close the modal after saving
        closeAddSubtopicModal();


    } catch (error) {
        console.error('Error adding the new subtopic row:', error);
    }
}


