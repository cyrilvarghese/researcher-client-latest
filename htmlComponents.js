// htmlComponents.js

// Function to generate the Add Subtopic modal
export function createAddSubtopicModal() {
    return `
        <!-- Scrim Layer for Add Subtopic -->
        <div id="add-subtopic-scrim" class="fixed inset-0 bg-black opacity-50 hidden z-10"></div>

        <!-- Modal for adding a new subtopic -->
        <div id="add-subtopic-modal" class="fixed z-20 inset-0 overflow-y-auto hidden text-left">
            <div class="flex items-center justify-center min-h-screen px-4">
                <div class="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
                    <div class="mb-4">
                        <h3 class="text-xl font-semibold mb-2 ">Add Subtopic</h3>
                        <button class="absolute top-0 right-0 m-4 text-gray-600" id="close-add-subtopic-btn">✖</button>
                    </div>
                    <div class="mb-4">
                        <label for="subtopic-input" class="block text-gray-700 font-semibold">New Subtopic:</label>
                        <input type="text" id="subtopic-input" class="block w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
                    </div>
                   <div class="flex justify-end">
                        <button id="save-subtopic-btn" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center">
                            <svg id="loading-spinner" class="hidden animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8V4z"></path>
                            </svg>
                            <span id="save-button-text">Save</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Function to generate the table with the "Add Subtopic" button
export function createTableWithAddButton(topicTitle, tableRows) {
    return `
        <h2 class="text-xl font-semibold mb-4 w-full text-left flex justify-between">
            ${topicTitle}
            <button id="add-subtopic-btn" class="text-sm bg-blue-600 text-white p-2 rounded-md shadow flex items-center">
                <i class="fa-solid fa-plus mr-2"></i>Add Subtopic
            </button>
        </h2>
        <table class="w-full border-collapse border border-gray-300">
            <thead>
                <tr class="bg-gray-100">
                    <th class="border border-gray-300 p-2 text-left">Subtopic</th>
                    <th class="border border-gray-300 p-2 pl-6 text-left">Search</th>
                </tr>
            </thead>
            <tbody id="table-body">
                ${tableRows}
            </tbody>
        </table>
    `;
}

// Function to generate the modal for displaying documents
export function createDocsModal() {
    return `
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
                    <div id="docs-container" class="space-y-4 break-all">
                        <!-- Post-it notes for docs will be inserted here -->
                    </div>
                </div>
            </div>
        </div>
    `;
}
