// tabsModule.js

// Function to initialize Tabs and their behavior
export function initTabs() {
    document.getElementById('notes-tab').addEventListener('click', function() {
        activateTab('notes');
    });

    document.getElementById('books-tab').addEventListener('click', function() {
        activateTab('books');
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

    if (tab === 'notes') {
        notesContainer.classList.remove('hidden');
        booksContainer.classList.add('hidden');
        activeTabTitle.textContent = 'Notes';
        deleteButton.innerHTML = '<i class="fa-solid fa-trash mr-2"></i>Delete Notes';
    } else if (tab === 'books') {
        booksContainer.classList.remove('hidden');
        notesContainer.classList.add('hidden');
        activeTabTitle.textContent = 'Books';
        deleteButton.innerHTML = '<i class="fa-solid fa-trash mr-2"></i>Delete Books';
    }

    // Update tab button styles
    document.getElementById('notes-tab').classList.toggle('border-blue-500', tab === 'notes');
    document.getElementById('books-tab').classList.toggle('border-blue-500', tab === 'books');
    document.getElementById('notes-tab').classList.toggle('text-blue-500', tab === 'notes');
    document.getElementById('books-tab').classList.toggle('text-blue-500', tab === 'books');
}
