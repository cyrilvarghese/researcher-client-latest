/**
 * Sets the loading state of a button
 * @param {HTMLButtonElement} button - The button element to modify
 * @param {boolean} isLoading - Whether the button should be in a loading state
 * @param {Object} options - Additional options for customizing the button appearance
 * @param {string} options.loadingText - Text to display when loading (default: "Loading...")
 * @param {string} options.loadingIcon - CSS classes for the loading icon (default: "fa-solid fa-spinner fa-spin")
 * @param {string} options.defaultText - Default text for the button when not loading
 * @param {string} options.defaultIcon - CSS classes for the default icon
 * @param {string} options.defaultClass - CSS class to apply when not loading
 * @param {string} options.loadingClass - CSS class to apply when loading (default: "bg-gray-400")
 */
export function setButtonLoadingState(button, isLoading, options = {}) {
    const {
        loadingText = "Loading...",
        loadingIcon = "fa-solid fa-spinner fa-spin",
        defaultText,
        defaultIcon,
        defaultClass,
        loadingClass = "bg-gray-400"
    } = options;

    if (isLoading) {
        button.disabled = true;
        button.classList.remove('hover:bg-blue-600');
        button.classList.add(loadingClass, 'cursor-not-allowed');
        if (defaultClass) button.classList.remove(defaultClass);
        button.innerHTML = `<i class="${loadingIcon} mr-2"></i>${loadingText}`;
    } else {
        button.disabled = false;
        button.classList.remove(loadingClass, 'cursor-not-allowed');
        button.classList.add('hover:bg-blue-600');
        if (defaultClass) button.classList.add(defaultClass);
        button.innerHTML = defaultIcon ? `<i class="fa-solid ${defaultIcon} mr-2"></i>${defaultText}` : defaultText;
    }
}

/**
 * Shows a loading state in the empty state container
 */
export function showLoadingState() {
    const emptyStateContainer = document.getElementById('empty-state');
    if (emptyStateContainer) {
        const heading = emptyStateContainer.querySelector('h2');
        if (heading) {
            heading.textContent = 'Loading the Learning Template';
        }

        const paragraph = emptyStateContainer.querySelector('p');
        if (paragraph) {
            paragraph.textContent = 'Please wait while we prepare your learning experience.';
        }

        const icon = emptyStateContainer.querySelector('i');
        if (icon) {
            icon.className = 'fas fa-spinner fa-spin fa-3x mb-4 text-gray-400';
        }
    }
}

/**
 * Shows or hides a loading state in the empty state container
 * @param {boolean} isLoading - True to show loading state, false to show default state
 */
export function toggleLoadingState(isLoading) {
    const emptyStateContainer = document.getElementById('empty-state');
    if (emptyStateContainer) {
        const heading = emptyStateContainer.querySelector('h2');
        const paragraph = emptyStateContainer.querySelector('p');
        const icon = emptyStateContainer.querySelector('i');

        if (isLoading) {
            // Show loading state
            if (heading) heading.textContent = 'Loading the Learning Template';
            if (paragraph) paragraph.textContent = 'Please wait while we prepare your learning experience.';
            if (icon) icon.className = 'fas fa-spinner fa-spin fa-3x mb-4 text-gray-400';
        } else {
            // Show default state
            if (heading) heading.textContent = 'No Learning Template Available';
            if (paragraph) paragraph.textContent = 'Please upload a learning template to get started.';
            if (icon) icon.className = 'fas fa-file-upload fa-3x mb-4 text-gray-400';
        }

        // emptyStateContainer.classList.remove('hidden');
    }
    else {

        emptyStateContainer.classList.add('hidden');
    }
}