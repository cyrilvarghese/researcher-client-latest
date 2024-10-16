import { getGlobalData, updateGlobalData } from './tableRenderer.js';
import { augmentSubtopic } from './api.js';
import { openImageGallery } from './imageNotesGallery.js';
import { handleFileAttachment } from './galleryManager.js';

function generateTableRow(compIndex, partIndex, part) {
    return `
        <tr class="hover:bg-gray-100" data-comp-index="${compIndex}" data-part-index="${partIndex}">
            <td class="border border-gray-300 p-2 text-left">
                <div class="flex justify-between items-center">
                    <div class="flex items-center">
                        <input type="checkbox" disabled class="subtopic-checkbox h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2" data-comp-index="${compIndex}" data-part-index="${partIndex}" aria-label="Select Subtopic">
                        
                        <div class="flex items-center  pr-4">
                            

                            <div class="flex flex-col w-[350px]">
                               <p class="font-semibold  truncate  sub-topic " data-comp-index="${compIndex}" data-part-index="${partIndex}">
                                ${part.name}
                                </p>
                                <div class="mt-2 w-full hidden" id="augmented-info-${compIndex}-${partIndex}">
                                    <textarea class="w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm text-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50" rows="4"></textarea>
                                </div>
                            </div>
                             
                            <!-- Augment Context Button (lightning bolt icon) -->
                            <button id="augment-context-${compIndex}-${partIndex}" 
                                    class="augment-context-btn p-1 rounded-full hover:bg-gray-200 transition-colors duration-200 flex-shrink-0" 
                                    data-comp-index="${compIndex}" 
                                    data-part-index="${partIndex}"
                                    title="Augment context">
                                <i class="fa-solid fa-bolt text-yellow-500"></i>
                            </button>
                        </div>
                        
                        ${part.relevant_docs.length > 0 ?
            `<a href="#" class="text-blue-500  underline w-[100px] view-docs-link ml-2" data-comp-index="${compIndex}" data-part-index="${partIndex}"> Matches (${part.relevant_docs.length})</a>
                                    <button  class="p-1 rounded-full hover:bg-gray-200 transition-colors duration-200  refresh-button mr-2" data-comp-index="${compIndex}" data-part-index="${partIndex}" title="Rerun Matches" aria-label="Refresh">
                                                    <i class="fa-solid fa-sync-alt text-gray-500"></i>
                                                </button>`:
            `<a href="#" class="rounded-full text-red-500 underline  w-[100px] view-docs-link  ml-2" data-comp-index="${compIndex}" data-part-index="${partIndex}">Matches (0)</a>
                                    <button class="p-1 refresh-button mr-2 rounded-full hover:bg-gray-200 transition-colors duration-200 " data-comp-index="${compIndex}" data-part-index="${partIndex}" title="Rerun Matches" aria-label="Refresh">
                                                    <i class="fa-solid fa-sync-alt text-gray-500"></i>
                                                </button>`}
                      
                        
                       

                        <div class="ml-6">
                            <!-- uploaded file Count Span with Data Attributes -->
                            <span class="file-count ml-1" data-comp-index="${compIndex}" data-part-index="${partIndex}">(0)</span> <!-- Initial file count -->
                            <input type="file" class="hidden file-input" multiple accept="image/*" data-comp-index="${compIndex}" data-part-index="${partIndex}">
                        </div>    
                        
                         <!-- Attach Icon with Hidden File Input next to View Docs -->
                        <div class="relative inline-block text-left ml-2">
                            <button type="button" class="p-1 rounded-full hover:bg-gray-200 transition-colors duration-200 attach-button text-gray-500 hover:text-blue-500 cursor-pointer" id="attach-menu-${compIndex}-${partIndex}" aria-expanded="false" aria-haspopup="true" title="Attach Images To Slides" data-comp-index="${compIndex}" data-part-index="${partIndex}" aria-label="Attach">
                                <i class="fa-solid fa-paperclip"></i>
                            </button>
                            <div class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 hidden z-50" role="menu" aria-orientation="vertical" aria-labelledby="attach-menu-${compIndex}-${partIndex}" id="attach-dropdown-${compIndex}-${partIndex}">
                                <div class="py-1 bg-gray-100" role="none">
                                    <button class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 hover:text-gray-900" role="menuitem" id="attach-gallery-${compIndex}-${partIndex}">
                                        <i class="fa-solid fa-images mr-2"></i>Attach from Gallery
                                    </button>
                                    <button class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 hover:text-gray-900" role="menuitem" id="attach-desktop-${compIndex}-${partIndex}">
                                        <i class="fa-solid fa-desktop mr-2"></i>Attach from Desktop
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- Presentation Slides Button -->
                    <button class=" p-1 rounded-full hover:bg-gray-200 transition-colors duration-200  slides-button text-gray-500 hover:text-orange-700 cursor-pointer ml-2" data-comp-index="${compIndex}" data-part-index="${partIndex}" aria-label="Slides">
                        <i class="fa-solid fa-chalkboard"></i>
                    </button>
                </div>
            </td>
            <td class="border border-gray-300 p-2 text-left ${part.relevant_docs.length === 0 ? 'text-red-500' : ''}">
                <div class="flex items-center justify-center h-full relative group">
                    ${part.links.length > 0 ? `
                        <a href="${part.links[0]}" 
                           class="p-1 rounded-full hover:bg-gray-200 transition-colors duration-200   ${part.relevant_docs.length === 0 ? 'text-red-500' : 'text-blue-500'} flex items-center justify-center h-full w-full" 
                           target="_blank">
                            <i class="fas fa-search"></i>
                            <span class="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                                Search on PubMed
                            </span>
                        </a>
                    ` : ''}
                </div>
            </td>
        </tr>
    `;
}

export function updateMatchesLink(compIndex, partIndex, part) {
    const matchesLink = document.querySelector(`a.view-docs-link[data-comp-index="${compIndex}"][data-part-index="${partIndex}"]`);

    if (matchesLink) {
        const newText = `Matches (${part.relevant_docs.length})`;
        matchesLink.textContent = newText;
    } else {
        console.warn(`Matches link not found for comp index ${compIndex} and part index ${partIndex}`);
    }
}

export function handleAugmentContext(event) {
    event.preventDefault();
    event.stopPropagation();

    const button = event.currentTarget;
    const icon = button.querySelector('i');
    const compIndex = button.dataset.compIndex;
    const partIndex = button.dataset.partIndex;

    // Show loading state
    button.disabled = true;
    icon.classList.add('animate-pulse');

    // Call the API
    augmentContext(compIndex, partIndex)
        .then(augmentedData => {
            console.log('Context augmented successfully:', augmentedData);
            updateUIWithAugmentedData(compIndex, partIndex, augmentedData);
        })
        .catch(error => {
            console.error('Error augmenting context:', error);
            // Handle error (e.g., show an error message to the user)
        })
        .finally(() => {
            // Reset button state
            button.disabled = false;
            icon.classList.remove('animate-pulse');
        });
}

async function augmentContext(compIndex, partIndex) {
    const currentData = getGlobalData();
    const competency = currentData.competencies[compIndex];
    const part = competency.parts[partIndex];

    const topic = currentData["Main Topic"];
    const subtopic = part.name;

    try {
        const augmentedData = await augmentSubtopic(topic, subtopic);

        // Update the global data with the new augmented information
        currentData.competencies[compIndex].parts[partIndex].augmented_info = augmentedData.augmented_response;
        updateGlobalData(currentData);

        return augmentedData;
    } catch (error) {
        console.error('Failed to augment context:', error);
        throw error;
    }
}

function updateUIWithAugmentedData(compIndex, partIndex, augmentedData) {
    const element = document.querySelector(`.sub-topic[data-comp-index="${compIndex}"][data-part-index="${partIndex}"]`);
    if (!element) return;

    const augmentedInfoDiv = document.querySelector(`#augmented-info-${compIndex}-${partIndex}`);
    if (augmentedInfoDiv) {
        const existingTextarea = augmentedInfoDiv.querySelector('textarea');
        existingTextarea.value = augmentedData.augmented_response || 'No augmented information available.';
        element.classList.add('text-blue-500', 'underline', 'cursor-pointer');

    } else {
        console.log('No div found');

    }

    // Add click event listener to the new link
    // const newLink = document.querySelector(`a[data-comp-index="${compIndex}"][data-part-index="${partIndex}"]`);
    element.addEventListener('click', (event) => {
        event.preventDefault();
        const infoDiv = document.getElementById(`augmented-info-${compIndex}-${partIndex}`);
        infoDiv.classList.toggle('hidden');
    });

    // Add event listener to save changes when the textarea loses focus
    const textarea = document.querySelector(`#augmented-info-${compIndex}-${partIndex} textarea`);
    textarea.addEventListener('blur', () => {
        saveAugmentedInfo(compIndex, partIndex, textarea.value);
    });
}

function saveAugmentedInfo(compIndex, partIndex, newValue) {
    const currentData = getGlobalData();
    currentData.competencies[compIndex].parts[partIndex].augmented_info = newValue;
    updateGlobalData(currentData);
    console.log('Augmented info updated and saved.');
}

function initializeAttachmentDropdowns() {
    document.addEventListener('click', function (event) {
        // Toggle dropdown
        const toggleButton = event.target.closest('[id^="attach-menu-"]');
        if (toggleButton) {
            const dropdownId = toggleButton.id.replace('menu', 'dropdown');
            const dropdown = document.getElementById(dropdownId);
            dropdown.classList.toggle('hidden');
            event.stopPropagation(); // Prevent immediate closing
        }

        // Handle "Attach from Gallery" option
        const attachGalleryButton = event.target.closest('[id^="attach-gallery-"]');
        if (attachGalleryButton) {
            const [compIndex, partIndex] = attachGalleryButton.id.split('-').slice(-2);
            console.log(`Open gallery for comp ${compIndex}, part ${partIndex}`);
            openImageGallery(compIndex, partIndex);
            closeDropdown(attachGalleryButton);
            event.stopPropagation();
        }

        // Handle "Attach from Desktop" option
        const attachDesktopButton = event.target.closest('[id^="attach-desktop-"]');
        if (attachDesktopButton) {
            const [compIndex, partIndex] = attachDesktopButton.id.split('-').slice(-2);
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.multiple = true;
            input.onchange = (e) => {
                const files = Array.from(e.target.files);
                handleFileAttachment(files, compIndex, partIndex);
            };
            input.click();
            closeDropdown(attachDesktopButton);
            event.stopPropagation();
        }

        // Close all dropdowns when clicking outside
        if (!event.target.closest('.relative')) {
            document.querySelectorAll('[id^="attach-dropdown-"]').forEach(dropdown => {
                dropdown.classList.add('hidden');
            });
        }
    });
}

// Add this function to close the dropdown
function closeDropdown(button) {
    const dropdownId ="attach-dropdown-"+ button.id.split('-').slice(-2).join('-');
    const dropdown = document.getElementById(dropdownId);
    if (dropdown) {
        dropdown.classList.add('hidden');
    }
}

export { generateTableRow, initializeAttachmentDropdowns };
