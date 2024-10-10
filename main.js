// main.js

import { fetchNotes, deleteNotes, extractText, getTableData, refreshDocuments, fetchIndexedChapters } from './api.js';
import { renderExtractedDataTable } from './tableRenderer.js'; // Import the module
import { initTabs } from './tabsModule.js';
import { initTOCDropdowns } from './tocDropdowns.js';
import { renderBooks } from './booksRenderer.js';
import { renderStreamedTable } from './streamedTableRenderer.js';

// Switch flag to toggle between streamed and non-streamed versions
const USE_STREAMING = false;

// Attach event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the Tabs using the imported function from tabsModule
    initTabs();
    //renderBooks();
    const filename = 'SLO scabies'; // Replace with the actual filename or obtain it dynamically

    // Check if data for this file already exists
    const dataExists = checkForExistingData(filename);

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

    setLoadingState(deleteButton, true); // Set loading state

    await deleteNotes();

    setLoadingState(deleteButton, false); // Remove loading state

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


/**
 * Sets the loading state for a button.
 * @param {HTMLButtonElement} button - The button to set the loading state on.
 * @param {boolean} isLoading - Whether to set or remove the loading state.
 */
function setLoadingState(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        button.classList.add('bg-gray-400', 'cursor-not-allowed');
        button.classList.remove('bg-blue-600', 'bg-red-600', 'bg-gray-300');
        button.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-2"></i>Loading...`;
    } else {
        button.disabled = false;
        button.classList.remove('bg-gray-400', 'cursor-not-allowed');
        // Restore original button color and text based on the button's id or another identifier
        if (button.id === 'upload-button') {
            button.classList.add('bg-blue-600');
            button.innerHTML = `<i class="fa-solid fa-upload mr-2"></i>Upload`;
        } else if (button.id === 'delete-button') {
            button.classList.add('bg-red-600');
            button.innerHTML = `<i class="fa-solid fa-trash mr-2"></i>Clean`;
        }
    }
}


// Consolidated file upload handler
async function handleFileUpload(event) {
    event.preventDefault();
    const files = document.getElementById('file-input').files;

    if (files.length === 0) {
        alert('Please select at least one file.');
        return;
    }

    const uploadButton = document.querySelector('#upload-button');
    setLoadingState(uploadButton, true); // Set loading state

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
                localStorage.setItem(fileName, JSON.stringify(data));

                // Render the table with the parsed data
                await renderExtractedDataTable(data, false);
            } else {
                console.log('No data returned from extract-text API.');
            }
        }
    } catch (error) {
        console.error('Error processing files:', error);
        alert('An error occurred while processing the files. Please try again.');
    } finally {
        setLoadingState(uploadButton, false); // Remove loading state
    }
}


function checkForExistingData(filename) {
    const fileNameWithoutExt = filename.split('.').slice(0, -1).join('.');

    const storedData = localStorage.getItem(filename);

    if (storedData) {
        const data = JSON.parse(storedData);
        console.log(`Data found for ${fileNameWithoutExt}:`, data);
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

