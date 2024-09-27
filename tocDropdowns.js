// tocDropdowns.js

import { fetchTOC } from './api.js';

/**
 * Initializes the TOC dropdowns and populates chapters, sections, and subsections.
 */
export async function initTOCDropdowns() {


    const tocData = await fetchTOC();

    if (!tocData || tocData.toc.length === 0) {
        console.error('No TOC data available');
        return;
    }
    const addButton = document.getElementById('add-item-btn');
    const chapterDropdown = document.getElementById('chapter-dropdown');
    const sectionDropdown = document.getElementById('section-dropdown');
    const subsectionDropdown = document.getElementById('subsection-dropdown');
    const tocList = document.getElementById('toc-list');


    addButton.addEventListener('click', () => {
        // Get the most specific selected value
        const selectedSubsection = subsectionDropdown.value;
        const selectedSection = sectionDropdown.value;
        const selectedChapter = chapterDropdown.value;

        let itemHtml = '';

        // Determine the leaf to add: Subsection > Section > Chapter
        if (selectedSubsection) {
            // Subsection selected, skip parent levels
            const subsectionText = subsectionDropdown.options[subsectionDropdown.selectedIndex].text;
            itemHtml = `
            <div class="flex items-start space-x-4 bg-gray-100 p-3 rounded-lg shadow-md">
                <div class="flex-grow">
                    <p class="font-semibold">Section: </p>
                    <p>${subsectionText}</p>
                </div>
                <button class="delete-item-btn text-red-500 hover:text-red-700">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>`;
        } else if (selectedSection) {
            // Section selected, skip Chapter
            const sectionText = sectionDropdown.options[sectionDropdown.selectedIndex].text;
            itemHtml = `
            <div class="flex items-start space-x-4 bg-gray-100 p-3 rounded-lg shadow-md">
                <div class="flex-grow">
                    <p class="font-semibold">Chapter:</p>
                    <p >${sectionText}</p>
                </div>
                <button class="delete-item-btn text-red-500 hover:text-red-700">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>`;
        } else if (selectedChapter) {
            // Only Chapter selected
            const chapterText = chapterDropdown.options[chapterDropdown.selectedIndex].text;
            itemHtml = `
            <div class="flex items-start space-x-4 bg-gray-100 p-3 rounded-lg shadow-md">
                <div class="flex-grow">
                    <p class="font-semibold">Part:</p>
                    <p >${chapterText}</p>
                </div>
                <button class="delete-item-btn text-red-500 hover:text-red-700">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>`;
        } else {
            // If no chapter is selected, alert the user
            alert('Please select at least a chapter before adding.');
            return;
        }

        // Add the item to the list
        tocList.insertAdjacentHTML('beforeend', itemHtml);

        // Add delete functionality to the new item
        const deleteButtons = tocList.querySelectorAll('.delete-item-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const item = e.target.closest('.flex');
                item.remove(); // Remove the item
            });
        });
    });




    // Populate Chapter Dropdown
    tocData.toc.forEach((chapter, index) => {
        const option = document.createElement('option');
        option.value = index; // Store index to reference the chapter
        option.textContent = `${chapter.title} (Pages ${chapter.from_page}-${chapter.to_page})`;
        chapterDropdown.appendChild(option);
    });



    // Handle Chapter Selection
    chapterDropdown.addEventListener('change', (event) => {
        const selectedChapterIndex = event.target.value;
        if (selectedChapterIndex === '') {
            sectionDropdown.disabled = true;
            sectionDropdown.innerHTML = '<option value="">Select Section</option>';
            subsectionDropdown.disabled = true;
            subsectionDropdown.innerHTML = '<option value="">Select Subsection</option>';
            return;
        }

        const selectedChapter = tocData.toc[selectedChapterIndex];
        populateSectionsDropdown(selectedChapter);
    });

    // Function to populate the Section Dropdown
    function populateSectionsDropdown(chapter) {
        sectionDropdown.disabled = false;
        sectionDropdown.innerHTML = '<option value="">Select Section</option>'; // Clear previous sections

        chapter.subsections.forEach((section, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${section.title} (Pages ${section.from_page}-${section.to_page})`;
            sectionDropdown.appendChild(option);
        });

        // Handle Section Selection
        sectionDropdown.addEventListener('change', (event) => {
            const selectedSectionIndex = event.target.value;
            if (selectedSectionIndex === '') {
                subsectionDropdown.disabled = true;
                subsectionDropdown.innerHTML = '<option value="">Select Subsection</option>';
                return;
            }

            const selectedSection = chapter.subsections[selectedSectionIndex];
            populateSubsectionsDropdown(selectedSection);
        });
    }

    // Function to populate the Subsection Dropdown
    function populateSubsectionsDropdown(section) {
        subsectionDropdown.disabled = false;
        subsectionDropdown.innerHTML = '<option value="">Select Subsection</option>'; // Clear previous subsections

        section.subsections.forEach((subsection) => {
            const option = document.createElement('option');
            option.textContent = `${subsection.title} (Pages ${subsection.from_page}-${subsection.to_page})`;
            subsectionDropdown.appendChild(option);
        });
    }
}
