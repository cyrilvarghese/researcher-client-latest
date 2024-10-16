// tabsModule.js

// Function to initialize Tabs and their behavior
export function initTabs() {
    document.getElementById('notes-tab').addEventListener('click', function () {
        activateTab('notes');
    });

    document.getElementById('books-tab').addEventListener('click', function () {
        activateTab('books');
    });

    document.getElementById('images-tab').addEventListener('click', function () {
        activateTab('images');
    });

    // Set the initial active tab to 'Notes'
    activateTab('notes');
}

// Function to activate a specific tab and switch the content
function activateTab(tab) {
    const notesContainer = document.getElementById('notes-container');
    const booksContainer = document.getElementById('books-container');
    const activeTabTitle = document.getElementById('active-tab-title');
    const deleteButton = document.getElementById('delete-button');
    const imagesContainer = document.getElementById('images-container');
    if (tab === 'notes') {
        notesContainer.classList.remove('hidden');
        booksContainer.classList.add('hidden');
        imagesContainer.classList.add('hidden');

        activeTabTitle.textContent = 'Notes';
    } else if (tab === 'books') {
        booksContainer.classList.remove('hidden');
        notesContainer.classList.add('hidden');
        activeTabTitle.textContent = 'Books';
        imagesContainer.classList.add('hidden');
    } else if (tab === 'images') {
        booksContainer.classList.add('hidden');
        imagesContainer.classList.remove('hidden');
        notesContainer.classList.add('hidden');
        activeTabTitle.textContent = 'Gallery';
    }
    // Update tab button styles
    document.getElementById('notes-tab').classList.toggle('border-blue-500', tab === 'notes');
    document.getElementById('books-tab').classList.toggle('border-blue-500', tab === 'books');
    document.getElementById('images-tab').classList.toggle('border-blue-500', tab === 'images');
    document.getElementById('notes-tab').classList.toggle('text-blue-500', tab === 'notes');
    document.getElementById('books-tab').classList.toggle('text-blue-500', tab === 'books');
    document.getElementById('images-tab').classList.toggle('text-blue-500', tab === 'images');
}
