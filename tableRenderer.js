// tableRenderer.js

import { refreshDocuments, fetchSlideData } from './api.js'; // Import the refreshDocuments function
import { showContentPopup } from './newSliderenderer.js';
// Store data globally within the module
let globalData = [];

/**
 * Renders the extracted data into the #learning-template-breakup div.
 * @param {Object} data - The parsed data received from the API.
 */
export function renderExtractedDataTable(data) {
    globalData = data; // Store data globally for access in other functions

    const templateDiv = document.querySelector('#learning-template-breakup');

    // Update the Topic Title
    const topicTitle = `Topic: ${data['Main Topic']}`;

    // Generate the table rows based on the data
    const tableRows = data.competencies.map((competency, compIndex) =>
        competency.parts.map((part, partIndex) =>
            generateTableRow(compIndex, partIndex, part)
        ).join('')
    ).join('');

    // Insert the updated content into the div
    templateDiv.innerHTML = `
        <h2 class="text-xl font-semibold mb-4 w-full text-left">${topicTitle}</h2>
        <table class="w-full border-collapse border border-gray-300">
            <thead>
                <tr class="bg-gray-100">
                    <th class="border border-gray-300 p-2 text-left">Subtopic</th>
                    <th class="border border-gray-300 p-2 text-left">Documents Found</th>
                </tr>
            </thead>
            <tbody id="table-body">
                ${tableRows}
            </tbody>
        </table>

        <!-- Scrim Layer -->
        <div id="scrim-layer" class="fixed inset-0 bg-black opacity-50 hidden z-10"></div>

        <!-- Modal for displaying documents -->
        <div id="docs-modal" class="fixed z-20 inset-0 overflow-y-auto hidden text-left">
            <div class="flex items-center justify-center min-h-screen px-4">
                <div class="bg-white rounded-lg shadow-lg p-8 max-w-3xl w-full relative">
                    <div class="mb-4">
                        <h3 class="text-xl font-semibold mb-2">Relevant Documents</h3>
                        <button class="absolute top-0 right-0 m-4 text-gray-600" id="close-docs-btn">✖</button>
                    </div>
                    <div id="docs-container" class="space-y-4 breal-all">
                        <!-- Post-it notes for docs will be inserted here -->
                    </div>
                </div>
            </div>
        </div>
    `;

    // Initialize event handlers after the DOM has been updated
    initializeDocViewHandlers();
    initializeRefreshHandlers(); // Initialize refresh button handlers
}

/**
 * Initializes the event handlers for the "View Docs" links.
 */
function initializeDocViewHandlers() {
    document.querySelectorAll('.view-docs-link').forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const compIndex = event.currentTarget.getAttribute('data-comp-index');
            const partIndex = event.currentTarget.getAttribute('data-part-index');
            showDocs(compIndex, partIndex);
        });
    });

    document.getElementById('close-docs-btn').addEventListener('click', closeDocs);


    /**
     * Initializes the event handlers for the slides.
     */


    document.querySelectorAll('.slides-button').forEach(button => {
        button.addEventListener('click', async (event) => {
            const compIndex = event.currentTarget.getAttribute('data-comp-index');
            const partIndex = event.currentTarget.getAttribute('data-part-index');
            const partName = globalData.competencies[compIndex].parts[partIndex].name;
            const relevantDocs = globalData.competencies[compIndex].parts[partIndex].relevant_docs.map(doc => doc.page_content); // Extract text content

            // Add the "Creating slides..." text and apply the pulse animation
            const buttonIcon = button.querySelector('i');
            const originalHTML = button.innerHTML;

            button.innerHTML = `<i class="fa-solid fa-chalkboard"></i> Creating slides...`;
            button.classList.add('animate-pulse');

            try {
                // Call the fetchSlideData function from api.js
                const data = JSON.parse(await fetchSlideData(partName, relevantDocs));
                debugger
                // Optionally, show a popup with the raw JSON data
                showContentPopup(data);



            } catch (error) {
                console.error('Failed to fetch slide data:', error);
            } finally {
                // Restore the button's original state after the API call completes
                button.innerHTML = originalHTML;
                button.classList.remove('animate-pulse');
            }
        });
    });



    document.addEventListener('click', function (event) {
        if (event.target.closest('.attach-button')) {
            const button = event.target.closest('.attach-button');
            const compIndex = button.getAttribute('data-comp-index');
            const partIndex = button.getAttribute('data-part-index');
            const fileInput = document.querySelector(`.file-input[data-comp-index="${compIndex}"][data-part-index="${partIndex}"]`);

            // Trigger the file input
            fileInput.click();
        }
    });

    // Listen for file input change
    document.addEventListener('change', function (event) {
        if (event.target.classList.contains('file-input')) {
            const files = event.target.files;
            if (files.length > 0) {
                console.log('Files attached:', files);
                // Handle the file upload logic here
            }
        }
    });
}

/**
 * Initializes the event handlers for the refresh buttons.
 */
function initializeRefreshHandlers() {
    document.querySelectorAll('.refresh-button').forEach(button => {
        button.addEventListener('click', async (event) => {
            const compIndex = event.currentTarget.getAttribute('data-comp-index');
            const partIndex = event.currentTarget.getAttribute('data-part-index');
            const partName = globalData.competencies[compIndex].parts[partIndex].name; // Get the part name (subtopic)

            const refreshIcon = event.currentTarget.querySelector('i'); // Select the icon element
            refreshIcon.classList.add('animate-spin'); // Add Tailwind's rotate class to indicate loading

            try {
                // Call the API to refresh documents for this part
                const refreshedPart = await refreshDocuments(partName);


                if (refreshedPart) {
                    // Update the corresponding data in localStorage
                    updateLocalStorageWithRefreshedPart(compIndex, partIndex, refreshedPart);

                    // Update the specific row with the new data
                    updateTableRow(compIndex, partIndex, refreshedPart);


                }

            } catch (error) {
                console.error('Error refreshing documents:', error);
            } finally {
                refreshIcon.classList.remove('animate-spin'); // Remove rotate class after API call completes
            }
        });
    });
}

/**
 * Shows the documents for a given part index.
 * @param {number} compIndex - The index of the competency in the API response.
 * @param {number} partIndex - The index of the part in the API response.
 */
function showDocs(compIndex, partIndex) {
    const docsContainer = document.querySelector('#docs-container');
    const part = globalData.competencies[compIndex].parts[partIndex];

    // Add the subtopic (part name) as a subtitle in the modal
    const subtopicName = part.name;

    docsContainer.innerHTML = `
        <h4 class="text-lg font-semibold mb-4">${subtopicName}</h4>
        ${part.relevant_docs.map(doc => `
            <div class="bg-blue-200 text-blue-900 p-4 rounded-md shadow-md">
                <p class="text-sm break-all">${doc.page_content}</p>
                <a href="${doc.metadata.source}/#:~:text=${encodeURIComponent(doc.page_content.split(' ').slice(0, 5).join(' '))}" class="text-blue-500 underline break-all" target="_blank">${doc.metadata.source}</a>
            </div>
        `).join('')}
    `;

    // Show the scrim and modal
    document.querySelector('#scrim-layer').classList.remove('hidden');
    document.querySelector('#docs-modal').classList.remove('hidden');
}

/**
 * Closes the documents modal.
 */
function closeDocs() {
    document.querySelector('#scrim-layer').classList.add('hidden');
    document.querySelector('#docs-modal').classList.add('hidden');
}


// Function to update a specific row based on the refreshed part data
function updateTableRow(compIndex, partIndex, refreshedPart) {
    const rowSelector = `tr[data-comp-index="${compIndex}"][data-part-index="${partIndex}"]`;
    const tableRow = document.querySelector(rowSelector);

    if (tableRow) {
        const newRowContent = generateTableRow(compIndex, partIndex, refreshedPart);

        // Replace the row's inner HTML with the updated content
        tableRow.innerHTML = newRowContent;

        // Reattach event listeners for the new elements (View Docs and Refresh)
        initializeDocViewHandlers(); // Re-initialize document view handlers
        initializeRefreshHandlers(); // Re-initialize refresh button handlers
    }
}

function updateLocalStorageWithRefreshedPart(compIndex, partIndex, refreshedPart) {
    // Get the first file's name used for the key in localStorage
    const fileName = 'SLO scabies'; // Use the actual filename or a variable holding it

    // Retrieve the current data from localStorage
    let storedData = localStorage.getItem(fileName);

    if (storedData) {
        storedData = JSON.parse(storedData);

        // Update the specific part in the data
        storedData.competencies[compIndex].parts[partIndex] = refreshedPart;

        // Store the updated data back into localStorage
        localStorage.setItem(fileName, JSON.stringify(storedData));

        //update global variable after updating local Storage
        globalData = storedData;
    }


}

function generateTableRow(compIndex, partIndex, part) {
    return `
        <tr class="hover:bg-gray-100" data-comp-index="${compIndex}" data-part-index="${partIndex}">
            <td class="border border-gray-300 p-2 text-left">
                <div class="flex justify-between items-center">
                    <div class="flex items-center">
                        <p class="font-semibold mr-2">${part.name}</p>
                        ${part.relevant_docs.length > 0 ?
            `<a href="#" class="text-blue-500 underline view-docs-link mr-2" data-comp-index="${compIndex}" data-part-index="${partIndex}">View Docs</a>`
            : ''}
                        <!-- Attach Icon with Hidden File Input next to View Docs -->
                        <button class="attach-button text-gray-500 hover:text-blue-500 cursor-pointer ml-2" data-comp-index="${compIndex}" data-part-index="${partIndex}" aria-label="Attach">
                            <i class="fa-solid fa-paperclip"></i>
                        </button>
                        <input type="file" class="hidden file-input" accept="image/*" data-comp-index="${compIndex}" data-part-index="${partIndex}">
                    </div>
                    <!-- Presentation Slides Button -->
                    <button class="slides-button text-gray-500 hover:text-orange-700 cursor-pointer ml-2" data-comp-index="${compIndex}" data-part-index="${partIndex}" aria-label="Slides">
                        <i class="fa-solid fa-chalkboard"></i>
                    </button>
                </div>
            </td>
            <td class="border border-gray-300 p-2 text-left ${part.relevant_docs.length === 0 ? 'text-red-500' : ''}">
                <div class="flex items-center">
                    ${part.relevant_docs.length} 
                      <!-- Refresh Button (stays on the right of the document count) -->
                    <button class="refresh-button ml-2" data-comp-index="${compIndex}" data-part-index="${partIndex}" aria-label="Refresh">
                        <i class="fa-solid fa-sync-alt text-gray-500"></i>
                    </button>
                    ${part.links.length > 0 ? `   <a href="${part.links[0]}" class="pl-4 ${part.relevant_docs.length === 0 ? 'text-red-500' : 'text-blue-500'} underline" target="_blank">Search Pubmed</a>` : ''}
                  
                </div>
            </td>
        </tr>
    `;
}