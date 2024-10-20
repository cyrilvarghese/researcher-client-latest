import { fetchImages } from './api.js';
import { getGlobalData, updateGlobalData } from './tableRenderer.js';
import { handleFileAttachment } from './galleryManager.js';
let selectedImageUrls = [];
let currentCompIndex, currentPartIndex; // Hold the current context

/**
 * Creates the HTML structure for the image gallery modal.
 * @param {Array} images - An array of image objects to display in the gallery.
 * @returns {string} The HTML string for the modal.
 */
function createImageGalleryModal(images) {
    return `
        <div id="image-gallery-scrim" class="fixed inset-0 bg-black opacity-50 hidden z-10"></div>
        <div id="image-gallery-modal" class="fixed z-20 inset-0 overflow-y-auto hidden text-left">
            <div class="flex items-center justify-center min-h-screen px-4">
                <div class="bg-white rounded-lg shadow-lg p-8 max-w-4xl w-full relative">
                    <div class="mb-4 flex justify-between items-center">
                        <h3 class="text-xl font-semibold">Image Gallery (<span id="selected-count">0 selected</span>)</h3>
                        <button class="text-gray-600" id="close-image-gallery-btn">✖</button>
                    </div>
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4" id="image-gallery-container">
                        ${images.map(image => `
                            <div class="flex items-start space-x-2 image-item p-2 rounded-md transition-all duration-200 hover:bg-gray-100" data-image-url="${image.title}">
                                <input type="checkbox" class="image-select-checkbox form-checkbox h-5 w-5 text-blue-600 mt-1">
                                <div class="flex-grow">
                                    <img src="${image.title}" alt="${image.text}" class="w-full h-48 object-cover rounded-md">
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="flex justify-end">
                        <button id="confirm-selection-btn" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                            Confirm Selection
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}


/**
 * Initializes the image gallery functionality.
 * Sets up event listeners if they have not been set up before.
 */
function initializeImageGallery() {
    const modal = document.getElementById('image-gallery-modal');
    const scrim = document.getElementById('image-gallery-scrim');
    const closeBtn = document.getElementById('close-image-gallery-btn');
    const confirmBtn = document.getElementById('confirm-selection-btn');
    const selectedCountEl = document.getElementById('selected-count');
    const imageItems = document.querySelectorAll('.image-item');

    modal.classList.remove('hidden');
    scrim.classList.remove('hidden');

    function resetSelections() {
        selectedImageUrls = [];
        imageItems.forEach(item => {
            const checkbox = item.querySelector('.image-select-checkbox');
            checkbox.checked = false;
            item.classList.remove('shadow-md', 'border-b-2', 'border-blue-500');
        });
        selectedCountEl.textContent = '0 selected';
    }

    // Ensure event listeners are added only once
    if (!closeBtn.dataset.listenerAttached) {
        closeBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
            scrim.classList.add('hidden');
            resetSelections();
        });
        closeBtn.dataset.listenerAttached = true;
    }

    // Add listeners to checkboxes for selecting/deselecting images
    imageItems.forEach(item => {
        const checkbox = item.querySelector('.image-select-checkbox');
        const imageUrl = item.dataset.imageUrl;

        if (!checkbox.dataset.listenerAttached) {
            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    selectedImageUrls.push(imageUrl);
                    item.classList.add('shadow-md', 'border-b-2', 'border-gray-500');
                } else {
                    selectedImageUrls = selectedImageUrls.filter(url => url !== imageUrl);
                    item.classList.remove('shadow-md', 'border-b-2', 'border-gray-500');
                }
                selectedCountEl.textContent = `${selectedImageUrls.length} selected`;
            });
            checkbox.dataset.listenerAttached = true;
        }
    });

    // Ensure confirm button listener is only added once
    if (!confirmBtn.dataset.listenerAttached) {
        confirmBtn.addEventListener('click', handleConfirmClick);
        confirmBtn.dataset.listenerAttached = true;
    }
}

/**
 * Handles the click on the confirm button.
 */
function handleConfirmClick() {
    handleConfirmButtonClick(currentCompIndex, currentPartIndex);
}


function handleConfirmButtonClick(compIndex, partIndex) {
    const selectedImages = Array.from(document.querySelectorAll('.image-select-checkbox:checked'))
        .map(checkbox => checkbox.closest('.image-item').dataset.imageUrl);

    console.log('Selected images:', selectedImages);

    // Here you can add your logic to handle the selected images
    // For example, you might want to call a function to process these images
    handleFileAttachment([], compIndex, partIndex, selectedImages);
    // Close the modal
    const modal = document.getElementById('image-gallery-modal');
    const scrim = document.getElementById('image-gallery-scrim');
    modal.classList.add('hidden');
    scrim.classList.add('hidden');
}



/**
 * Opens the image gallery modal.
 * Sets or updates the current context for competency and part indexes.
 * @param {number} compIndex - The competency index.
 * @param {number} partIndex - The part index within the competency.
 */
export async function openImageGallery(compIndex, partIndex) {
    try {
        // Check if the modal already exists
        let modalExists = document.getElementById('image-gallery-modal');

        // If the modal doesn't exist, create it
        if (!modalExists) {
            const imageData = await fetchImages();
            const galleryHTML = createImageGalleryModal(imageData.sources);
            document.body.insertAdjacentHTML('beforeend', galleryHTML);
        }

        // Update the current context variables
        currentCompIndex = compIndex;
        currentPartIndex = partIndex;

        // Initialize the gallery, but avoid reattaching duplicate listeners
        initializeImageGallery();
    } catch (error) {
        console.error('Failed to open image gallery:', error);
    }
}

/**
 * Returns the array of selected image URLs.
 * @returns {Array} An array of selected image URLs.
 */
export function getSelectedImages() {
    return selectedImageUrls;
}
