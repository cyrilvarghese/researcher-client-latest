// main.js

import { fetchNotes, deleteNotes, extractText, getTableData, refreshDocuments, fetchIndexedChapters } from './api.js';
import { renderExtractedDataTable } from './tableRenderer.js'; // Import the module
import { initTabs } from './tabsModule.js';
import { initTOCDropdowns } from './tocDropdowns.js';
import { renderBooks } from './booksRenderer.js';
import { renderStreamedTable } from './streamedTableRenderer.js';
import { setButtonLoadingState, showLoadingState } from './utils.js';

// Switch flag to toggle between streamed and non-streamed versions
const USE_STREAMING = false;

// Attach event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the Tabs using the imported function from tabsModule
    initTabs();
    //renderBooks();
    const filename = 'SLO scabies'; // Replace with the actual filename or obtain it dynamically

    // Check if data for this file already exists
    const dataExists = checkForExistingData("templateData");

    if (!dataExists) {
        init();
    }
    // Call the renderBooks function on page load or when the Books tab is clicked - commented for now
    document.getElementById('books-tab').addEventListener('click', renderBooks);

    // Initialize TOC dropdowns when the page loads
    // initTOCDropdowns();

    // Attach delete button event
    const deleteButton = document.querySelector('#delete-button');
    deleteButton.addEventListener('click', handleDelete);

    // Attach upload button event
    const uploadButton = document.querySelector('#upload-button');
    uploadButton.addEventListener('click', () => {
        const fileInput = document.querySelector('#file-input');
        fileInput.value = ''; // Clear the file input value
        fileInput.click();
    });

    // Attach file input change event
    const fileInput = document.querySelector('#file-input');
    fileInput.addEventListener('change', handleFileUpload);
});


/**
 * Renders a single Post-it note.
 * @param {Object} note - The note object containing title and summary.
 * @returns {string} - The HTML string for the note.
 */
function renderNote(note) {
    return `
        <div class="bg-yellow-200 p-4 rounded-md shadow-md mb-4">
            <a href="${note.title}" class="text-lg font-semibold text-blue-600 break-all">${note.title}</a>
            <div class="mt-2 text-sm">
                <p class="font-semibold">Summary:</p>
                <p class="break-words">${note.summary.replace(/^- /gm, '')}</p> <!-- Removes any leading '- ' from each line -->
            </div>
        </div>
    `;
}

/**
 * Renders all notes and inserts them into the DOM.
 * @param {Array} notes - An array of note objects.
 */
function renderNotes(notes) {
    const notesContainer = document.querySelector('#notes-container');
    notesContainer.innerHTML = notes.map(note => renderNote(note)).join('');
}

/**
 * Initializes the page by fetching and rendering the notes.
 */
async function init() {
    const response = await fetchNotes();
    if (response.sources.length === 0) {
        renderEmptyState();
    } else {
        renderNotes(response.sources);
    }
}

/**
 * Handles the delete action by calling the delete API and reloading the notes.
 */
async function handleDelete() {
    const deleteButton = document.querySelector('#delete-button');

    setButtonLoadingState(deleteButton, true); // Set loading state

    await deleteNotes();

    setButtonLoadingState(deleteButton, false); // Remove loading state

    await init();  // Reload notes after deletion
}


// Initialize the page when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    init();

    // Attach delete button event
    const deleteButton = document.querySelector('#delete-button');
    deleteButton.addEventListener('click', handleDelete);
});


/**
 * Renders an empty state when no notes are found.
 */
function renderEmptyState() {
    const notesContainer = document.querySelector('#notes-container');
    notesContainer.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full text-center text-gray-600">
            <i class="fa-solid fa-folder-open fa-3x mb-4"></i>
            <p class="text-lg">No notes found.</p>
        </div>
    `;
}



// Consolidated file upload handler
async function handleFileUpload(event) {
    event.preventDefault();
    const files = document.getElementById('file-input').files;
    showLoadingState();

    if (files.length === 0) {
        alert('Please select at least one file.');
        return;
    }

    const uploadButton = document.querySelector('#upload-button');
    setButtonLoadingState(uploadButton, true); // Set loading state

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
    }

    try {
        if (USE_STREAMING) {
            // Streamed version
            await renderStreamedTable(formData);
        } else {
            // Non-streamed version
            const response = await extractText(files);

            if (response && response.llm_response) {
                const emptyState = document.getElementById('empty-state');
                const learningTemplateBreakup = document.getElementById('learning-template-breakup');

                // Hide the empty state
                emptyState.classList.add('hidden');
                // Show the learning template breakup
                learningTemplateBreakup.classList.remove('hidden');

                // Get the first file's name and remove the extension
                const fileName = files[0].name.split('.').slice(0, -1).join('.');

                // Parse the llm_response property
                const data = JSON.parse(response.llm_response);
                console.log('Parsed Data:', data);

                // Store the parsed data in localStorage with the file name (without extension) as the key
                localStorage.setItem("templateData", JSON.stringify(data));

                // Render the table with the parsed data
                renderExtractedDataTable(data, false);
            } else {
                console.log('No data returned from extract-text API.');
            }
        }
    } catch (error) {
        console.error('Error processing files:', error);
        alert('An error occurred while processing the files. Please try again.');
    } finally {
        setButtonLoadingState(uploadButton, false,{defaultText:"Upload",defaultIcon:"fa-upload"}); // Remove loading state
    }
}


function checkForExistingData(key) {

    const storedData = localStorage.getItem(key);

    if (storedData) {
        const data = JSON.parse(storedData);
        console.log(`Data found for ${data["Main Topic"]}:`, data);
        const emptyState = document.getElementById('empty-state');
        const learningTemplateBreakup = document.getElementById('learning-template-breakup');

        // Hide the empty state
        emptyState.classList.add('hidden');
        // Show the learning template breakup
        learningTemplateBreakup.classList.remove('hidden');
        renderExtractedDataTable(data);
        return true;
    }

    return false;
}

