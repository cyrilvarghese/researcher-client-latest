import { generateTableRow, updateMatchesLink, handleAugmentContext } from './tableRow.js';
import { openAddSubtopicModal } from './addSubtopic.js';
import { createTableWithAddButton, createAddSubtopicModal, createDocsModal } from './htmlComponents.js';
import { initializeFileInputListener, openGallery } from './galleryManager.js';
import { refreshDocuments, fetchSlideData, uploadFiles } from './api.js';
import { showContentPopup } from './newSliderenderer.js';

let globalData = { competencies: [] };

export function updateGlobalData(newData) {
    globalData = newData;
}

export function getGlobalData() {
    return globalData;
}

export async function renderStreamedTable(formData) {
    const templateDiv = document.querySelector('#learning-template-breakup');

    // Create the initial table structure
    templateDiv.innerHTML = `
    <h2 id="topic-title">Topic: Loading...</h2>
    <div id="status" class="mb-4 text-gray-600"></div>
    <table id="data-table" class="w-full">
      <thead>
        <tr>
          <th>Subtopic</th>
          <th>Documents</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody id="table-body">
      </tbody>
    </table>
    <button id="add-subtopic-btn" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Add Subtopic</button>
    ${createDocsModal()}
    ${createAddSubtopicModal()}
    `;

    try {
        await fetchAndProcessStream(formData);

        initializeDocViewHandlers();
        initializeRefreshHandlers();
        initializeFileInputListener();
        setupAugmentContextButtons();

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

    } catch (error) {
        console.error('Error rendering table:', error);
        templateDiv.innerHTML += `<p class="error">Error loading data: ${error.message}</p>`;
    }
}

async function fetchAndProcessStream(formData) {
    const response = await fetch('/extract-text-stream', {
        method: 'POST',
        body: formData
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(Boolean);

        for (const line of lines) {
            const data = JSON.parse(line);
            if (data.competency) {
                globalData.competencies.push(data.competency);
                updateTable(data.competency);
            } else if (data.status) {
                updateStatus(data.status);
            } else if (data.main_topic) {
                updateMainTopic(data.main_topic);
            }
        }
    }
}

function updateTable(competency) {
    const tableBody = document.querySelector('#table-body');
    const compIndex = globalData.competencies.length - 1;
    competency.parts.forEach((part, partIndex) => {
        const row = generateTableRow(compIndex, partIndex, part);
        tableBody.insertAdjacentHTML('beforeend', row);
    });
}

function updateStatus(status) {
    document.querySelector('#status').textContent = status;
}

function updateMainTopic(mainTopic) {
    document.querySelector('#topic-title').textContent = `Topic: ${mainTopic}`;
}

// ... (keep all other functions from the original streamedTableRenderer.js)

function setupAugmentContextButtons() {
    document.querySelectorAll('.augment-context-btn').forEach(button => {
        button.removeEventListener('click', handleAugmentContext);
        button.addEventListener('click', handleAugmentContext);
    });
}

function initializeDocViewHandlers() {
    document.querySelectorAll('.view-docs-link').forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const compIndex = event.currentTarget.getAttribute('data-comp-index');
            const partIndex = event.currentTarget.getAttribute('data-part-index');
            showDocs(compIndex, partIndex);
        });
    });

    document.getElementById('add-subtopic-btn').addEventListener('click', () => {
        openAddSubtopicModal(async (refreshedPart) => {
            try {
                const part = {
                    name: refreshedPart.name || 'New Subtopic',
                    relevant_docs: refreshedPart.relevant_docs || [],
                    links: refreshedPart.links || ['https://example.com']
                };

                const newTableRow = generateTableRow(compIndex, partIndex, part);
                const tableBody = document.getElementById('table-body');
                tableBody.insertAdjacentHTML('beforeend', newTableRow);

                updateLocalStorageWithRefreshedPart(compIndex, partIndex, refreshedPart);

                partIndex++;
            } catch (error) {
                console.error('Error adding the new subtopic row:', error);
            }
        });
    });

    document.getElementById('close-docs-btn').addEventListener('click', closeDocs);

    document.querySelectorAll('.slides-button').forEach(button => {
        button.addEventListener('click', async (event) => {
            const compIndex = event.currentTarget.getAttribute('data-comp-index');
            const partIndex = event.currentTarget.getAttribute('data-part-index');
            const partName = globalData.competencies[compIndex].parts[partIndex].name;
            const relevantDocs = globalData.competencies[compIndex].parts[partIndex].relevant_docs.map(doc => doc.page_content);

            const buttonIcon = button.querySelector('i');
            const originalHTML = button.innerHTML;

            button.innerHTML = `<i class="fa-solid fa-chalkboard"></i> Creating slides...`;
            button.classList.add('animate-pulse');

            try {
                const data = JSON.parse(await fetchSlideData(partName, relevantDocs));
                showContentPopup(data);
            } catch (error) {
                console.error('Failed to fetch slide data:', error);
            } finally {
                button.innerHTML = originalHTML;
                button.classList.remove('animate-pulse');
            }
        });
    });
}

function initializeRefreshHandlers() {
    document.querySelectorAll('.refresh-button').forEach(button => {
        button.addEventListener('click', async (event) => {
            const compIndex = event.currentTarget.getAttribute('data-comp-index');
            const partIndex = event.currentTarget.getAttribute('data-part-index');
            const part = globalData.competencies[compIndex].parts[partIndex];

            try {
                const refreshedPart = await refreshDocuments(part.name, part.relevant_docs);
                updateTableRow(compIndex, partIndex, refreshedPart);
                updateLocalStorageWithRefreshedPart(compIndex, partIndex, refreshedPart);
            } catch (error) {
                console.error('Error refreshing documents:', error);
            }
        });
    });
}

function showDocs(compIndex, partIndex) {
    const part = globalData.competencies[compIndex].parts[partIndex];
    const subtopicName = part.name;

    const docsModal = document.querySelector('#docs-modal');
    const docsBooksContainer = document.querySelector('#docs-books');
    const docsLinksContainer = document.querySelector('#docs-links');

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
                <button data-index="${index}" class="delete-doc-btn mt-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
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

    document.querySelectorAll('.delete-doc-btn').forEach((btn) => {
        btn.addEventListener('click', () => deleteDoc(compIndex, partIndex, btn.getAttribute('data-index'), globalData));
    });

    setupTabEventListeners();

    document.querySelector('#books-tab-btn').click();
    document.querySelector('#scrim-layer').classList.remove('hidden');
    document.querySelector('#docs-modal').classList.remove('hidden');
}

function deleteDoc(compIndex, partIndex, docIndex, globalData) {
    const docElement = document.getElementById(`doc-${docIndex}`);

    if (docElement) {
        docElement.classList.add('transition-all', 'duration-300', 'ease-in-out');
        docElement.style.height = `${docElement.offsetHeight}px`;
        docElement.offsetHeight; // Force reflow
        docElement.classList.add('h-0', 'opacity-0', 'overflow-hidden');

        setTimeout(() => {
            docElement.remove();
            globalData.competencies[compIndex].parts[partIndex].relevant_docs.splice(docIndex, 1);
            updateMatchesLink(compIndex, partIndex, globalData.competencies[compIndex].parts[partIndex]);
            showDocs(compIndex, partIndex);
        }, 300);
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

function closeDocs() {
    document.querySelector('#scrim-layer').classList.add('hidden');
    document.querySelector('#docs-modal').classList.add('hidden');
}

function updateTableRow(compIndex, partIndex, refreshedPart) {
    const rowSelector = `tr[data-comp-index="${compIndex}"][data-part-index="${partIndex}"]`;
    const tableRow = document.querySelector(rowSelector);

    if (tableRow) {
        const newRowContent = generateTableRow(compIndex, partIndex, refreshedPart);
        tableRow.innerHTML = newRowContent;
        initializeDocViewHandlers();
        initializeRefreshHandlers();
    }
}

function updateLocalStorageWithRefreshedPart(compIndex, partIndex, refreshedPart) {
    const fileName = 'SLO scabies'; // Use the actual filename or a variable holding it
    let storedData = localStorage.getItem(fileName);

    if (storedData) {
        storedData = JSON.parse(storedData);

        if (!storedData.competencies[compIndex]) {
            storedData.competencies[compIndex] = { parts: [] };
        }

        if (storedData.competencies[compIndex].parts[partIndex]) {
            storedData.competencies[compIndex].parts[partIndex] = refreshedPart;
        } else {
            storedData.competencies[compIndex].parts.push(refreshedPart);
        }

        localStorage.setItem(fileName, JSON.stringify(storedData));
        globalData = storedData;
    } else {
        console.log("no LO found");
    }
}