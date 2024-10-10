import { fetchIndexedChapters } from './api.js'; // Import the API function to fetch indexed chapters

/**
 * Renders the files and chapters in the Books tab with animations and checkboxes.
 */
export async function renderBooks() {
    const booksContainer = document.getElementById('books-container');
    booksContainer.innerHTML = ''; // Clear the container

    // Store selected chapters
    let selectedChapters = [];

    // Fetch the data from the API
    const booksData = await fetchIndexedChapters();

    if (booksData.length === 0) {
        renderEmptyStateBooks();
    } else {
        // Iterate over each book in the response
        booksData.forEach(book => {
            // Create a post-it note style div for each file
            const bookElement = document.createElement('div');
            bookElement.classList.add('bg-blue-200', 'bg-blue-200', 'p-4', 'rounded-md', 'shadow-md', 'mb-4', 'cursor-pointer');

            // File name element (clickable) with + icon
            bookElement.innerHTML = `
            <div class="flex items-center file-name text-lg font-semibold text-blue-600">
                <i class="fa-solid fa-plus mr-2" id="icon-${book.file_name.replace(/\s+/g, '-')}"></i>
                 ${book.file_name} <span class="ml-4 pt-1 text-sm chapter-count"> (0)</span> 
            </div>
 
            <div class="chapter-list  overflow-auto  ease-in-out opacity-0 max-h-0  text-sm pl-4">
                ${book.chapter_names.map((chapter, index) => `
                    <div class="flex items-start mt-4"> <!-- Added margin for spacing between chapters -->
                        <input type="checkbox" class="chapter-checkbox mr-2 mt-1" data-book="${book.file_name}" data-chapter="${chapter}" id="checkbox-${book.file_name.replace(/\s+/g, '-')}-${index}">
                        <label for="checkbox-${book.file_name.replace(/\s+/g, '-')}-${index}" class="chapter-name">${chapter}</label>  
                    </div>`).join('')}
            </div>
        `;

            // Toggle chapters on click
            bookElement.querySelector('.file-name').addEventListener('click', () => {
                const chapterList = bookElement.querySelector('.chapter-list');
                const iconElement = document.getElementById(`icon-${book.file_name.replace(/\s+/g, '-')}`);
                const booksContainer = document.getElementById('books-container'); // Get the container reference

                if (chapterList.classList.contains('opacity-0')) {
                    chapterList.classList.remove('opacity-0', 'max-h-0');
                    chapterList.classList.add('opacity-100', 'max-h-xl');
                    iconElement.classList.replace('fa-plus', 'fa-minus'); // Change to minus when expanded
                    booksContainer.classList.add('overflow-auto'); // Add overflow-auto when expanded

                } else {
                    chapterList.classList.add('opacity-0', 'max-h-0');
                    chapterList.classList.remove('opacity-100', 'max-h-xl');
                    iconElement.classList.replace('fa-minus', 'fa-plus'); // Change back to plus when collapsed
                    booksContainer.classList.remove('overflow-auto'); // Remove overflow-auto when collapsed
                }
            });

            // Add event listener for checkboxes
            const checkboxes = bookElement.querySelectorAll('.chapter-checkbox');
            const chapterCount = bookElement.querySelector('.chapter-count'); // Reference to the count element next to the book title
            let selectedCount = 0; // Initialize count for selected chapters
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', (event) => {
                    const bookName = event.target.getAttribute('data-book');
                    const chapterName = event.target.getAttribute('data-chapter');
                    const label = event.target.nextElementSibling; // Get the label for the checkbox

                    if (event.target.checked) {
                        // Add the chapter to selectedChapters if checked
                        selectedChapters.push({ book: bookName, chapter: chapterName });

                        // Make the label bold when selected
                        label.classList.add('font-bold');

                        // Increase the selected count and update the count next to the book title
                        selectedCount++;
                    } else {
                        // Remove the chapter if unchecked
                        selectedChapters = selectedChapters.filter(item => item.chapter !== chapterName || item.book !== bookName);

                        // Remove bold styling from the label
                        label.classList.remove('font-bold');

                        // Decrease the selected count and update the count next to the book title
                        selectedCount--;
                    }

                    // Update the chapter count display
                    chapterCount.textContent = `(${selectedCount} Selected)`;

                    console.log('Selected Chapters:', selectedChapters);
                });
            });

            booksContainer.appendChild(bookElement); // Append to the books tab container
        });
    }
}

/**
 * Renders an empty state for the books tab if no data is available.
 */
function renderEmptyStateBooks() {
    const notesContainer = document.querySelector('#books-container');
    notesContainer.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full text-center text-gray-600">
            <i class="fa-solid fa-book fa-3x mb-4"></i>
            <p class="text-lg">No Books found.</p>
        </div>
    `;
}