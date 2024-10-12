// galleryManager.js
import { getGlobalData, updateGlobalData } from './tableRenderer.js';


const subtopicFileUrls = {}; // Memory object to store files for each subtopic

/**
 * Initialize the file input change listener.
 * Tracks files locally per subtopic and updates the file count.
 */
export function initializeFileInputListener() {
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
    document.addEventListener('change', async (event) => {
        if (event.target.classList.contains('file-input')) {
            const files = event.target.files;
            const compIndex = event.target.getAttribute('data-comp-index');
            const partIndex = event.target.getAttribute('data-part-index');
            const subtopicKey = `${compIndex}-${partIndex}`;

          
            if (files.length > 0) {
                console.log('Files attached:', files);

                // Initialize the subtopic's file list if not already done
                if (!subtopicFileUrls[subtopicKey]) {
                    subtopicFileUrls[subtopicKey] = [];
                }

                // Add files to subtopic memory list
                for (let file of files) {
                    subtopicFileUrls[subtopicKey].push(file);
                }

                // Log the updated subtopic-to-file mapping
                console.log(`Updated file list for subtopic ${subtopicKey}:`, subtopicFileUrls[subtopicKey]);

                // Update the file count link next to the attach icon
                const fileCountElement = document.querySelector(`.file-count[data-comp-index="${compIndex}"][data-part-index="${partIndex}"]`);
                if (fileCountElement) {
                    fileCountElement.innerHTML = `<a href="#" class="open-gallery-link text-blue-500 underline" data-comp-index="${compIndex}" data-part-index="${partIndex}">Images (${subtopicFileUrls[subtopicKey].length})</a>`;
                }

                // Add event listener to open the gallery
                const galleryLink = document.querySelector(`.open-gallery-link[data-comp-index="${compIndex}"][data-part-index="${partIndex}"]`);
                
                galleryLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    openGallery(subtopicKey);
                });
                let globalData = getGlobalData();
                globalData.competencies[compIndex].parts[partIndex].images = subtopicFileUrls[subtopicKey] || [];
                updateGlobalData(globalData);   
            }
        }
    });
}

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
    subtopicFileUrls[subtopicKey].forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const imgElement = document.createElement('div');
            imgElement.classList.add('relative');
            imgElement.innerHTML = `
            <img src="${e.target.result}" class="w-48 h-48 object-cover rounded-lg shadow-lg">
            <button class="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full remove-image-btn" data-index="${index}">
                <i class="fa-solid fa-trash"></i>  <!-- Trash icon -->
            </button>
            `;
            galleryImages.appendChild(imgElement);

            // Add event listener for remove button
            imgElement.querySelector('.remove-image-btn').addEventListener('click', () => {
                removeImage(subtopicKey, index);
            });
        };
        reader.readAsDataURL(file); // Convert file to base64 URL
    });

    // Show the gallery modal
    galleryModal.classList.remove('hidden');

    // Close the gallery modal
    document.getElementById('close-gallery').addEventListener('click', () => {
        galleryModal.classList.add('hidden');
    });


}

/**
 * Removes an image from the subtopic file list.
 * @param {string} subtopicKey - The unique key for the subtopic (compIndex-partIndex).
 * @param {number} index - The index of the image to be removed.
 */
function removeImage(subtopicKey, index) {
    // Extract compIndex and partIndex
    const [compIndex, partIndex] = subtopicKey.split('-');
    debugger
    const galleryModal = document.getElementById('gallery-modal');

    // Remove the file from the memory list
    subtopicFileUrls[subtopicKey].splice(index, 1);
    const fileCountElement = document.querySelector(`.file-count[data-comp-index="${compIndex}"][data-part-index="${partIndex}"]`);
    if (fileCountElement) {
        fileCountElement.innerHTML = `<a href="#" class="open-gallery-link text-blue-500 underline" data-comp-index="${compIndex}" data-part-index="${partIndex}">Images (${subtopicFileUrls[subtopicKey].length})</a>`;
        //  Add event listener to open the gallery
        const galleryLink = document.querySelector(`.open-gallery-link[data-comp-index="${compIndex}"][data-part-index="${partIndex}"]`);
        galleryLink.addEventListener('click', (e) => {
            e.preventDefault();
            openGallery(subtopicKey);
        });
    }
    if (subtopicFileUrls[subtopicKey].length === 0) {
        debugger
        galleryModal.classList.add('hidden');
        fileCountElement.innerHTML = `<a href="#" class="open-gallery-link" data-comp-index="${compIndex}" data-part-index="${partIndex}"> (${subtopicFileUrls[subtopicKey].length})</a>`;

    }
    else {
        console.log(`Updated file list for subtopic ${subtopicKey}:`, subtopicFileUrls[subtopicKey]);

        // Refresh the gallery view
        openGallery(subtopicKey);
    }


}
