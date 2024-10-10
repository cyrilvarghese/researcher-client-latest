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
            <button id="add-subtopic-btn" class="text-sm bg-blue-600 text-white p-4 rounded-md shadow flex items-center">
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
                        <button class="absolute top-0 right-0 m-4 text-gray-600" id="close-docs-btn">
                            <i class="fa-solid fa-close"></i>
                        </button>
                    </div>

                    <div class="flex justify-start space-x-4 border-b   mb-4">
                        <button id="books-tab-btn" class="tab-button border-b-2 border-blue-500 text-blue-500">Docs from Books</button>
                        <button id="links-tab-btn" class="tab-button text-gray-500 hover:text-blue-500">Docs from Links</button>
                    </div>

                    <!-- Tab content -->
                    <div id="docs-content">
                        <!-- Books Content -->
                        <div id="docs-books" class="tab-content space-y-4 break-all">
                            <!-- Books documents will be inserted here -->
                        </div>

                        <!-- Links Content -->
                        <div id="docs-links" class="tab-content space-y-4 break-all hidden">
                            <!-- Links documents will be inserted here -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}


/**
 * Creates a gallery of images from the uploaded blob URLs.
 * @param {Array<string>} blobUrls - Array of URLs pointing to the uploaded images.
 */
export function createImageGallery(blobUrls) {
    // Get the gallery container or create a new one if it doesn't exist
    let galleryContainer = document.getElementById('image-gallery');

    if (!galleryContainer) {
        galleryContainer = document.createElement('div');
        galleryContainer.id = 'image-gallery';
        galleryContainer.classList.add('grid', 'grid-cols-3', 'gap-4', 'p-4');
        document.body.appendChild(galleryContainer);
    }

    // Clear any existing images in the gallery
    galleryContainer.innerHTML = '';

    // Loop through the blob URLs and create img elements
    blobUrls.forEach((url) => {
        const imageWrapper = document.createElement('div');
        imageWrapper.classList.add('p-2', 'border', 'border-gray-300', 'rounded', 'shadow-md', 'overflow-hidden');

        const img = document.createElement('img');
        img.src = url;
        img.alt = 'Uploaded Image';
        img.classList.add('w-full', 'h-32', 'object-cover', 'rounded'); // Small-sized image for gallery display

        imageWrapper.appendChild(img);
        galleryContainer.appendChild(imageWrapper);
    });
}