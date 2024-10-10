// tableRenderer.js

import { refreshDocuments, fetchSlideData, uploadFiles } from './api.js'; // Import the refreshDocuments function
import { showContentPopup } from './newSliderenderer.js';
import { generateTableRow, updateMatchesLink, handleAugmentContext } from './tableRow.js';
import { openAddSubtopicModal } from './addSubtopic.js';
import { createTableWithAddButton, createAddSubtopicModal, createDocsModal } from './htmlComponents.js';
import { initializeFileInputListener, openGallery } from './galleryManager.js';
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

    // Listen for attach button click
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
    initializeDocViewHandlers(); // Initialize event handlers after the DOM has been updated

    initializeRefreshHandlers(); // Initialize refresh button handlers

    initializeFileInputListener();  // Initialize the file input listener for tracking files and opening galleries
    setupAugmentContextButtons();
    initializeCheckboxHandler();// Initialize the checkbox handler
}
function setupAugmentContextButtons() {
    document.querySelectorAll('.augment-context-btn').forEach(button => {
        // Remove any existing event listeners
        button.removeEventListener('click', handleAugmentContext);
        // Add the new event listener
        button.addEventListener('click', handleAugmentContext);
    });
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

    // Initial compIndex and partIndex
    let compIndex = 100;
    let partIndex = 1;

    document.getElementById('add-subtopic-btn').addEventListener('click', () => {
        openAddSubtopicModal(async (refreshedPart) => {
            try {
                // Use dummy values if some fields are missing in refreshedPart
                const part = {
                    name: refreshedPart.name || 'New Subtopic',
                    relevant_docs: refreshedPart.relevant_docs || [],
                    links: refreshedPart.links || ['https://example.com'] // Dummy link if none provided
                };

                // Generate the new table row with compIndex and partIndex
                const newTableRow = generateTableRow(compIndex, partIndex, part);

                // Insert the new row into the table's body (append as the last row)
                const tableBody = document.getElementById('table-body');
                tableBody.insertAdjacentHTML('beforeend', newTableRow);

                // Optionally, update local storage with the refreshed part data
                updateLocalStorageWithRefreshedPart(compIndex, partIndex, refreshedPart);

                // Increment partIndex for the next subtopic
                partIndex++;

            } catch (error) {
                console.error('Error adding the new subtopic row:', error);
            }
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

    // Object to store the file URLs mapped to subtopics (using comp-index and part-index as unique keys)
    const subtopicFileUrls = {};


    // // Listen for file input change
    // document.addEventListener('change', async (event) => {
    //     if (event.target.classList.contains('file-input')) {
    //         const files = event.target.files;
    //         const compIndex = event.target.getAttribute('data-comp-index');
    //         const partIndex = event.target.getAttribute('data-part-index');
    //         const subtopicKey = `${compIndex}-${partIndex}`;
    //         const subtopic = globalData.competencies[compIndex].parts[partIndex].name;
    //         console.log(subtopic)
    //         if (files.length > 0) {
    //             console.log('Files attached:', files);

    //             // Initialize the subtopic's file list if not already done
    //             if (!subtopicFileUrls[subtopicKey]) {
    //                 subtopicFileUrls[subtopicKey] = [];
    //             }

    //             uploadFiles(files, "description", subtopic)
    //                 .then(response => {
    //                     console.log('Upload Success:', response);
    //                     // Update the file count next to the attach icon
    //                     const fileCountElement = document.querySelector(`.file-count[data-comp-index="${compIndex}"][data-part-index="${partIndex}"]`);
    //                     if (fileCountElement) {
    //                         fileCountElement.textContent = response.azure_blob_urls.length

    //                     }

    //                 })
    //                 .catch(error => {
    //                     console.error('Error during upload:', error);
    //                 });
    //             // Loop over each file and generate a dummy URL



    //             // Log the updated subtopic-to-file mapping
    //             console.log(`Updated file list for subtopic ${subtopicKey}:`, subtopicFileUrls[subtopicKey]);

    //             // If you want to display the file URLs in the UI, you could add logic here to render them.
    //             // For example, append the file URLs to a subtopic-specific list in the UI.
    //         }
    //     }
    // });
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

    part.relevant_docs.forEach((doc, index) => {
        const isUrl = doc.metadata.source.startsWith('http');
        const docHtml = `
            <div id="doc-${index}" class="bg-gray-100 text-gray-900 p-4 rounded-md shadow-md flex-col items-start mb-4 transition-all duration-200">
                <div class="flex-col">
                    <p class="text-sm break-all">${doc.page_content}</p>
                    <a href="${doc.metadata.source}/#:~:text=${encodeURIComponent(doc.page_content.split(' ').slice(0, 5).join(' '))}" 
                        class="text-blue-500 underline break-all" target="_blank">
                        ${doc.metadata.source}
                    </a>
                </div>
                <button data-index="${index}" class="delete-doc-btn mt-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        >
                    Delete
                </button>
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

function updateLocalStorageWithRefreshedPart(compIndex, partIndex, refreshedPart) {
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
    // Retrieve the current data from localStorage
    let storedData = localStorage.getItem("templateData");

    if (storedData) {
        storedData = JSON.parse(storedData);

        // Check if the competency exists in storedData
        if (!storedData.competencies[compIndex]) {
            // If the competency doesn't exist, initialize it with an empty parts array
            storedData.competencies[compIndex] = {
                parts: []
            };
        }

        // Check if the partIndex exists in the parts array
        if (storedData.competencies[compIndex].parts[partIndex]) {
            // Update the specific part if it exists
            storedData.competencies[compIndex].parts[partIndex] = refreshedPart;
        } else {
            // If the part doesn't exist, add it to the parts array
            storedData.competencies[compIndex].parts.push(refreshedPart);
        }

        // Store the updated data back into localStorage
        localStorage.setItem("templateData", JSON.stringify(storedData));

        // Update global variable after updating localStorage
        globalData = storedData;
    }
    else {
        console.log("no LO found")
    }


}

