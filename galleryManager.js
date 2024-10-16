
import { getGlobalData, updateGlobalData } from './tableRenderer.js';

// Add this at the top of your file or where you declare your global variables
let subtopicImageUrls = {};
const subtopicFileUrls = {}; // Memory object to store files for each subtopic

/**
 * Opens the gallery modal to display the files for the specified subtopic.
 * @param {string} subtopicKey - The unique key for the subtopic (compIndex-partIndex).
 */
export function openGallery(subtopicKey) {
    const galleryModal = document.getElementById('gallery-modal');
    const galleryImages = document.getElementById('gallery-images');

    // Clear existing gallery content
    galleryImages.innerHTML = '';

    // Add images to the gallery modal
    if (subtopicImageUrls[subtopicKey]) {
        subtopicImageUrls[subtopicKey].forEach((url, index) => {
            const imgElement = createImageElement(url, index, 'url', subtopicKey);
            galleryImages.appendChild(imgElement);
        });
    }

    // Add this block to handle subtopicFileUrls
    if (subtopicFileUrls[subtopicKey]) {
        subtopicFileUrls[subtopicKey].forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imgElement = createImageElement(e.target.result, index, 'file', subtopicKey);
                galleryImages.appendChild(imgElement);
            };
            reader.readAsDataURL(file);
        });
    }

    // Show the gallery modal
    galleryModal.classList.remove('hidden');

    // Close the gallery modal
    const closeGalleryButton = document.getElementById('close-gallery');
    closeGalleryButton.removeEventListener('click', closeGalleryHandler);
    closeGalleryButton.addEventListener('click', closeGalleryHandler);
}

/**
 * Handler to close the gallery modal.
 */
function closeGalleryHandler() {
    const galleryModal = document.getElementById('gallery-modal');
    galleryModal.classList.add('hidden');
}

/**
 * Removes an image from the subtopic file list.
 * @param {string} subtopicKey - The unique key for the subtopic (compIndex-partIndex).
 * @param {number} index - The index of the image to be removed.
 * @param {string} type - The type of the image (url/file).
 */
function removeImage(subtopicKey, index, type) {
    if (type === 'url') {
        subtopicImageUrls[subtopicKey].splice(index, 1);
    } else if (type === 'file') {
        subtopicFileUrls[subtopicKey].splice(index, 1);
    }
    updateGallery(subtopicKey);
    updateImageCount(subtopicKey.split('-')[0], subtopicKey.split('-')[1]);
}

/**
 * Handles file attachment for a specific subtopic.
 * @param {FileList} files - The list of files to attach.
 * @param {string} compIndex - The competency index.
 * @param {string} partIndex - The part index.
 * @param {Array} imageUrls - An array of image URLs to attach.
 */
export function handleFileAttachment(files = [], compIndex, partIndex, imageUrls = []) {
    const subtopicKey = `${compIndex}-${partIndex}`;

    if (imageUrls.length > 0) {
        console.log('Image URLs attached:', imageUrls);
        if (!subtopicImageUrls[subtopicKey]) {
            subtopicImageUrls[subtopicKey] = [];
        }

        subtopicImageUrls[subtopicKey] = [...subtopicImageUrls[subtopicKey], ...imageUrls];

        let globalData = getGlobalData();
        globalData.competencies[compIndex].parts[partIndex].attachmentsFromGallery = subtopicImageUrls[subtopicKey] || [];
        updateGlobalData(globalData);
    }

    if (files.length > 0) {
        console.log('Files attached:', files);

        if (!subtopicFileUrls[subtopicKey]) {
            subtopicFileUrls[subtopicKey] = [];
        }

        subtopicFileUrls[subtopicKey] = [...subtopicFileUrls[subtopicKey], ...files];

        const fileCountElement = document.querySelector(`.file-count[data-comp-index="${compIndex}"][data-part-index="${partIndex}"]`);
        if (fileCountElement) {
            const fileCount = (subtopicFileUrls[subtopicKey] || []).length;
            const imageUrlCount = (subtopicImageUrls[subtopicKey] || []).length;
            const totalCount = fileCount + imageUrlCount;

            fileCountElement.innerHTML = `<a href="#" class="open-gallery-link text-blue-500 underline" data-comp-index="${compIndex}" data-part-index="${partIndex}">Images (${totalCount})</a>`;
        }

        const galleryLink = document.querySelector(`.open-gallery-link[data-comp-index="${compIndex}"][data-part-index="${partIndex}"]`);

        if (galleryLink) {
            galleryLink.removeEventListener('click', openGalleryHandler);
            galleryLink.addEventListener('click', (e) => openGalleryHandler(e, subtopicKey));
        }

        let globalData = getGlobalData();
        globalData.competencies[compIndex].parts[partIndex].images = subtopicFileUrls[subtopicKey] || [];
        updateGlobalData(globalData);
    }

    updateCountAndAttachEvents(subtopicKey, compIndex, partIndex);
}


/**
 * Updates the gallery and file count link, and attaches event handlers for the gallery link.
 * @param {string} subtopicKey - The unique key for the subtopic.
 * @param {string} compIndex - The competency index.
 * @param {string} partIndex - The part index.
 */
function updateCountAndAttachEvents(subtopicKey, compIndex, partIndex) {
    console.log(`Updated file list for subtopic ${subtopicKey}:`, subtopicFileUrls[subtopicKey]);

    const fileCountElement = document.querySelector(`.file-count[data-comp-index="${compIndex}"][data-part-index="${partIndex}"]`);
    if (fileCountElement) {
        const fileCount = (subtopicFileUrls[subtopicKey] || []).length;
        const imageUrlCount = (subtopicImageUrls[subtopicKey] || []).length;
        const totalCount = fileCount + imageUrlCount;

        fileCountElement.innerHTML = `<a href="#" class="open-gallery-link text-blue-500 underline" data-comp-index="${compIndex}" data-part-index="${partIndex}">Images (${totalCount})</a>`;
    }

    const galleryLink = document.querySelector(`.open-gallery-link[data-comp-index="${compIndex}"][data-part-index="${partIndex}"]`);

    if (galleryLink) {
        galleryLink.removeEventListener('click', openGalleryHandler);
        galleryLink.addEventListener('click', (e) => openGalleryHandler(e, subtopicKey));
    }
}


/**
 * Event handler to open the gallery modal.
 * @param {Event} e - The click event.
 * @param {string} subtopicKey - The unique key for the subtopic.
 */
function openGalleryHandler(e, subtopicKey) {
    e.preventDefault();
    openGallery(subtopicKey);
}

/**
 * Refreshes the gallery display for a specific subtopic.
 * @param {string} subtopicKey - The key identifying the subtopic.
 */
function updateGallery(subtopicKey) {
    const galleryContainer = document.getElementById('gallery-images');
    if (!galleryContainer) return;

    galleryContainer.innerHTML = ''; // Clear existing content

    if (subtopicImageUrls[subtopicKey]) {
        subtopicImageUrls[subtopicKey].forEach((url, index) => {
            const imgElement = createImageElement(url, index, 'url', subtopicKey);
            galleryContainer.appendChild(imgElement);
        });
    }

    if (subtopicFileUrls[subtopicKey]) {
        subtopicFileUrls[subtopicKey].forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imgElement = createImageElement(e.target.result, index, 'file', subtopicKey);
                galleryContainer.appendChild(imgElement);
            };
            reader.readAsDataURL(file);
        });
    }
}

/**
 * Creates an image element for the gallery.
 * @param {string} src - The source URL or data URL of the image.
 * @param {number} index - The index of the image in its array.
 * @param {string} type - The type of image ('url' or 'file').
 * @param {string} subtopicKey - The key identifying the subtopic.
 * @returns {HTMLElement} The created image element.
 */
function createImageElement(src, index, type, subtopicKey) {
    const imgElement = document.createElement('div');
    imgElement.classList.add('relative', 'inline-block', 'm-2');
    imgElement.innerHTML = `
        <img src="${src}" class="w-48 h-48 object-cover rounded-lg shadow-lg">
        <button class="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full remove-image-btn" data-index="${index}" data-type="${type}">
            <i class="fa-solid fa-trash"></i>
        </button>
    `;
    imgElement.querySelector('.remove-image-btn').addEventListener('click', () => removeImage(subtopicKey, index, type));
    return imgElement;
}

/**
 * Updates the image count display for a specific subtopic.
 * @param {number} compIndex - The competency index.
 * @param {number} partIndex - The part index within the competency.
 */
function updateImageCount(compIndex, partIndex) {
    const subtopicKey = `${compIndex}-${partIndex}`;
    const fileCountElement = document.querySelector(`.file-count[data-comp-index="${compIndex}"][data-part-index="${partIndex}"]`);
    if (fileCountElement) {
        const fileCount = (subtopicFileUrls[subtopicKey] || []).length;
        const imageUrlCount = (subtopicImageUrls[subtopicKey] || []).length;
        const totalCount = fileCount + imageUrlCount;

        fileCountElement.innerHTML = `<a href="#" class="open-gallery-link text-blue-500 underline" data-comp-index="${compIndex}" data-part-index="${partIndex}">Images (${totalCount})</a>`;

        const galleryLink = fileCountElement.querySelector('.open-gallery-link');
        if (galleryLink) {
            galleryLink.removeEventListener('click', openGalleryHandler);
            galleryLink.addEventListener('click', (e) => openGalleryHandler(e, subtopicKey));
        }
    }
}




// // Don't forget to export these functions if they need to be used in other modules
// export { updateGallery, updateImageCount, removeImage };


