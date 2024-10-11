/**
 * Shows the documents for a given part index.
 * @param {number} compIndex - The index of the competency in the API response.
 * @param {number} partIndex - The index of the part in the API response.
 */

export function showDocs(compIndex, partIndex,globalData) {
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
            <div id="doc-${index}" class="bg-gray-100 text-gray-900 p-4 rounded-md shadow-md flex items-start mb-4 transition-all duration-200">
                <div class="flex items-center h-5 mr-3 hidden">
                    <input type="checkbox" id="checkbox-${index}" 
                           class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer">
                </div>
                <div class="flex-grow">
                    <div class="flex justify-between items-center mb-2">
                        <p class="text-sm break-all flex-grow">${doc.page_content}</p>
                        <span class="text-xs text-gray-500 ml-2" title="Relevance Score">
                            ${doc.score.toFixed(2)}
                        </span>
                    </div>
                    <a href="${doc.metadata.source}/#:~:text=${encodeURIComponent(doc.page_content.split(' ').slice(0, 5).join(' '))}" 
                        class="text-blue-600 hover:text-blue-800 text-sm underline break-all" target="_blank">
                        ${doc.metadata.source}
                    </a>
                </div>
            </div>
        `;

        if (isUrl) {
            docsLinksContainer.innerHTML += docHtml;
        } else {
            docsBooksContainer.innerHTML += docHtml;
        }
    });

    setupTabEventListeners();

    // Show the books tab by default
    document.querySelector('#books-tab-btn').click();

    // Show the scrim and modal
    document.querySelector('#scrim-layer').classList.remove('hidden');
    document.querySelector('#docs-modal').classList.remove('hidden');
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

// If globalData is defined elsewhere, you might need to import it or pass it as a parameter
// import { globalData } from './globalData.js';

// Export any other functions you want to make available
// export { otherFunction1, otherFunction2 };