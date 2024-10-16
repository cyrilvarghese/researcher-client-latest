// tableRenderer.js

import { refreshDocuments, fetchSlideDataWithImages } from './api.js'; // Import the refreshDocuments function
import { showContentPopup } from './newSliderenderer.js';
import { generateTableRow, updateMatchesLink, handleAugmentContext, initializeAttachmentDropdowns } from './tableRow.js';
import { openAddSubtopicModal } from './addSubtopic.js';
import { createTableWithAddButton, createAddSubtopicModal, createDocsModal } from './htmlComponents.js';
import { initializeCheckboxHandler } from './subtopicChecboxHandler.js';

// Private variable to hold our global data
let globalData = [];

// Function to update the global data
export function updateGlobalData(newData) {
    globalData = newData;
}

// Function to get the global data
export function getGlobalData() {
    return globalData;
}


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

    // Insert the table with "Add Subtopic" button
    templateDiv.innerHTML = `
    ${createTableWithAddButton(topicTitle, tableRows)}
    ${createDocsModal()}
    ${createAddSubtopicModal()}
    `;

    initializeAllEventHandlers(); // Initialize all event handlers after the DOM has been updated
}

function initializeAllEventHandlers() {
    initializeDocViewHandlers();
    initializeSlidesButtons();
    initializeRefreshHandlers();
    setupAugmentContextButtons();
    initializeCheckboxHandler();
    initializeAddSubtopicButton();
    initializeAttachmentDropdowns();
}




function setupAugmentContextButtons() {
    document.querySelectorAll('.augment-context-btn').forEach(button => {
        // Remove any existing event listeners
        button.removeEventListener('click', handleAugmentContext);
        // Add the new event listener
        button.addEventListener('click', handleAugmentContext);
    });
}

//-----------------------------------
// Define the handler function
function handleAddSubtopic() {

    openAddSubtopicModal()
}

//-----------------------------------
function initializeSlidesButtons() {
    document.querySelectorAll('.slides-button').forEach(button => {
        button.addEventListener('click', handleSlidesButtonClick);
    });
}

function initializeAddSubtopicButton() {
    const addSubtopicBtn = document.getElementById('add-subtopic-btn');

    // Remove existing event listener
    addSubtopicBtn.removeEventListener('click', handleAddSubtopic);

    // Add new event listener
    addSubtopicBtn.addEventListener('click', handleAddSubtopic);
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




}


//-----------------------------------
async function handleSlidesButtonClick(event) {
    const button = event.currentTarget;
    const compIndex = button.getAttribute('data-comp-index');
    const partIndex = button.getAttribute('data-part-index');
    const partName = globalData.competencies[compIndex].parts[partIndex].name;
    const relevantDocs = globalData.competencies[compIndex].parts[partIndex].relevant_docs.map(doc => doc.page_content);
    const attachmentsFromDesktop = globalData.competencies[compIndex].parts[partIndex].images || [];
    const attachmentsFromGallery = globalData.competencies[compIndex].parts[partIndex].attachmentsFromGallery || [];
    const buttonIcon = button.querySelector('i');
    const originalHTML = button.innerHTML;

    button.innerHTML = `<i class="fa-solid fa-chalkboard"></i> Creating slides...`;
    button.classList.add('animate-pulse');

    try {
        const data = await fetchSlideDataWithImages(attachmentsFromDesktop, attachmentsFromGallery, partName, partName, relevantDocs);
        showContentPopup(data, compIndex, partIndex);

        const checkbox = document.querySelector(`.subtopic-checkbox[data-comp-index="${compIndex}"][data-part-index="${partIndex}"]`);

        if (checkbox) {
            checkbox.disabled = false;
        } else {
            console.warn(`Checkbox not found for compIndex ${compIndex} and partIndex ${partIndex}`);
        }
    } catch (error) {
        console.error('Failed to fetch slide data:', error);
    } finally {
        button.innerHTML = originalHTML;
        button.classList.remove('animate-pulse');
    }
}
//-----------------------------------


/**
 * Initializes the event handlers for the refresh buttons.
 */
function initializeRefreshHandlers() {
    document.querySelectorAll('.refresh-button').forEach(button => {
        button.addEventListener('click', async (event) => {
            const compIndex = event.currentTarget.getAttribute('data-comp-index');
            const partIndex = event.currentTarget.getAttribute('data-part-index');
            const partName = globalData.competencies[compIndex].parts[partIndex].name; // Get the part name (subtopic)
            const augmentedInfo = globalData.competencies[compIndex].parts[partIndex].augmented_info; // Get the part name (subtopic)

            const refreshIcon = event.currentTarget.querySelector('i'); // Select the icon element
            refreshIcon.classList.add('animate-spin'); // Add Tailwind's rotate class to indicate loading

            try {
                // Call the API to refresh documents for this part
                const refreshedPart = await refreshDocuments(partName, augmentedInfo);


                if (refreshedPart) {
                    updateMatchesLink(compIndex, partIndex, refreshedPart);
                    // updateTableRow(compIndex, partIndex, refreshedPart);

                    // Update the corresponding data in localStorage
                    updateLocalStorageWithRefreshedPart(compIndex, partIndex, refreshedPart);




                }

            } catch (error) {
                console.error('Error refreshing documents:', error);
            } finally {
                refreshIcon.classList.remove('animate-spin'); // Remove rotate class after API call completes
            }
        });
    });
}



// show docs section----------------------------------------

/**
 * Shows the documents for a given part index.
 * @param {number} compIndex - The index of the competency in the API response.
 * @param {number} partIndex - The index of the part in the API response.
 */
function showDocs(compIndex, partIndex) {

    const docsBooksContainer = document.querySelector('#docs-books');
    const docsLinksContainer = document.querySelector('#docs-links');
    const part = globalData.competencies[compIndex].parts[partIndex];

    const subtopicName = part.name;

    // Clear previous content
    docsBooksContainer.innerHTML = '';
    docsLinksContainer.innerHTML = '';

    // Add the subtopic (part name) as a subtitle in both tabs
    const booksTitle = `<h4 class="text-lg font-semibold mb-4">${subtopicName} (From Books)</h4>`;
    const linksTitle = `<h4 class="text-lg font-semibold mb-4">${subtopicName} (From Links)</h4>`;

    docsBooksContainer.innerHTML = booksTitle;
    docsLinksContainer.innerHTML = linksTitle;
    part.relevant_docs.sort((a, b) => b.score - a.score);

    part.relevant_docs.forEach((doc, index) => {
        const isUrl = doc.metadata.source.startsWith('http');
        const docHtml = `
                <div id="doc-${index}" class="bg-gray-100 text-gray-900 p-4 rounded-md shadow-md flex flex-col mb-4 transition-all duration-200">
                    <div class="flex items-center h-5 mr-3 hidden">
                        <input type="checkbox" id="checkbox-${index}" 
                            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer">
                    </div>
                    <div>
                        <p class="text-sm break-all mb-2">${doc.page_content}</p>
                        <div class="flex justify-between items-center">
                            <a href="${doc.metadata.source}/#:~:text=${encodeURIComponent(doc.page_content.split(' ').slice(0, 5).join(' '))}" 
                                class="text-blue-600 w-[450px] hover:text-blue-800 text-sm underline break-all" target="_blank">
                                ${doc.metadata.source}
                            </a>
                            ${renderRelevanceScore(doc.score)}
                        </div>
                          <button data-index="${index}" class="delete-doc-btn mt-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
                                Delete
                            </button>
                        </div>
                  
                </div>
            `;

        if (isUrl) {
            docsLinksContainer.innerHTML += docHtml;
        } else {
            docsBooksContainer.innerHTML += docHtml;
        }

    });
    // Add event listeners for delete buttons
    document.querySelectorAll('.delete-doc-btn').forEach((btn) => {
        btn.addEventListener('click', () => deleteDoc(compIndex, partIndex, btn.getAttribute('data-index'), globalData));
    });
    setupTabEventListeners();

    // Show the books tab by default
    document.querySelector('#books-tab-btn').click();

    // Show the scrim and modal
    document.querySelector('#scrim-layer').classList.remove('hidden');
    document.querySelector('#docs-modal').classList.remove('hidden');
}


function scoreToStars(score) {
    const roundedScore = Math.round(score);
    const starCount = Math.min(Math.max(roundedScore, 1), 5); // Ensure score is between 1 and 5
    return '<span style="font-size: 1.5em;">★</span>'.repeat(starCount) + '<span style="font-size: 1.5em;">☆</span>'.repeat(5 - starCount);
}

function renderRelevanceScore(score) {
    const stars = scoreToStars(score);
    return `
        <span class="text-sm text-blue-900  px-2 py-1 rounded-full" title="Relevance Score: ${score.toFixed(2)}">
            ${stars}
        </span>
    `;
}
// Add this function to handle document deletion
function deleteDoc(compIndex, partIndex, docIndex, globalData) {
    const docElement = document.getElementById(`doc-${docIndex}`);

    if (docElement) {
        // Add animation classes
        docElement.classList.add('transition-all', 'duration-300', 'ease-in-out');

        // Animate the height and opacity
        docElement.style.height = `${docElement.offsetHeight}px`;
        docElement.offsetHeight; // Force reflow
        docElement.classList.add('h-0', 'opacity-0', 'overflow-hidden');

        // Remove the element after animation completes
        setTimeout(() => {
            docElement.remove();

            // Remove the document from the globalData structure
            globalData.competencies[compIndex].parts[partIndex].relevant_docs.splice(docIndex, 1);

            // Update the Matches link text
            updateMatchesLink(compIndex, partIndex, globalData.competencies[compIndex].parts[partIndex]);
            // Re-render the docs to ensure proper indexing
            showDocs(compIndex, partIndex);
            console.log('Updated relevant_docs:', globalData.competencies[compIndex].parts[partIndex].relevant_docs);
        }, 300); // Match this with the duration-300 class
    }
}
function setupTabEventListeners() {
    document.getElementById('books-tab-btn').addEventListener('click', () => {
        document.getElementById('docs-books').classList.remove('hidden');
        document.getElementById('docs-links').classList.add('hidden');
        document.getElementById('books-tab-btn').className = 'tab-button border-b-2 border-blue-500 text-blue-500';
        document.getElementById('links-tab-btn').className = 'tab-button text-gray-500 hover:text-blue-500';
    });

    document.getElementById('links-tab-btn').addEventListener('click', () => {
        document.getElementById('docs-books').classList.add('hidden');
        document.getElementById('docs-links').classList.remove('hidden');
        document.getElementById('links-tab-btn').className = 'tab-button border-b-2 border-blue-500 text-blue-500';
        document.getElementById('books-tab-btn').className = 'tab-button text-gray-500 hover:text-blue-500';
    });
}
// Function to toggle document selection
function toggleDocSelection(relevantDocs, index, isChecked, compIndex, partIndex) {
    const selectedDoc = relevantDocs[index];

    // Create selected_docs array if it doesn't exist
    if (!globalData.competencies[compIndex].parts[partIndex].selected_docs) {
        globalData.competencies[compIndex].parts[partIndex].selected_docs = [];
    }

    let selectedDocs = globalData.competencies[compIndex].parts[partIndex].selected_docs;

    if (isChecked) {
        // Add the document to selected_docs
        selectedDocs.push(selectedDoc);
    } else {
        // Remove the document from selected_docs
        selectedDocs = selectedDocs.filter(doc => doc.text !== selectedDoc.text);
    }

    // Update the selected_docs in the global data structure
    globalData.competencies[compIndex].parts[partIndex].selected_docs = selectedDocs;

    // Update the UI
    const docElement = document.getElementById(`doc-${index}`);
    if (isChecked) {
        docElement.classList.add('border-blue-500', 'bg-blue-200');
        docElement.classList.remove('bg-gray-100');
    } else {
        docElement.classList.remove('border-blue-500', 'bg-blue-200');
        docElement.classList.add('bg-gray-100');
    }

    console.log('Updated selected_docs:', globalData.competencies[compIndex].parts[partIndex].selected_docs);
}

//--------------------------



/**
 * Closes the documents modal.
 */
function closeDocs() {
    document.querySelector('#scrim-layer').classList.add('hidden');
    document.querySelector('#docs-modal').classList.add('hidden');

}


// Function to update a specific row based on the refreshed part data
function updateTableRow(compIndex, partIndex, refreshedPart) {
    // Update global data
    if (!globalData.competencies[compIndex]) {
        globalData.competencies[compIndex] = { parts: [] };
    }

    if (globalData.competencies[compIndex].parts[partIndex]) {
        // Update the specific part if it exists
        globalData.competencies[compIndex].parts[partIndex] = refreshedPart;
    } else {
        // If the part doesn't exist, add it to the parts array
        globalData.competencies[compIndex].parts.push(refreshedPart);
    }

    // Update localStorage
    localStorage.setItem("templateData", JSON.stringify(globalData));

    // Existing code to update the table row
    const rowSelector = `tr[data-comp-index="${compIndex}"][data-part-index="${partIndex}"]`;
    const tableRow = document.querySelector(rowSelector);

    if (tableRow) {
        const newRowContent = generateTableRow(compIndex, partIndex, refreshedPart);

        // Replace the row's inner HTML with the updated content
        tableRow.innerHTML = newRowContent;

        // Reattach event listeners for the new elements (View Docs and Refresh)
        initializeDocViewHandlers(); // Re-initialize document view handlers
        initializeRefreshHandlers(); // Re-initialize refresh button handlers
        setupAugmentContextButtons();// Re-initialize augment context buttons

    }
}

export function updateLocalStorageWithRefreshedPart(compIndex, partIndex, refreshedPart) {
    // Update global data
    if (!globalData.competencies[compIndex]) {
        globalData.competencies[compIndex] = { competency: "Custom", parts: [] };
    }


    if (globalData.competencies[compIndex].parts[partIndex]) {
        // Update the specific part if it exists
        globalData.competencies[compIndex].parts[partIndex] = refreshedPart;
    } else {
        // If the part doesn't exist, add it to the parts array
        globalData.competencies[compIndex].parts.push(refreshedPart);
    }


    // Store the updated data back into localStorage
    localStorage.setItem("templateData", JSON.stringify(globalData));



}

