export function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content-lm');

    tabButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('border-b-2', 'border-blue-600'));
            tabContents.forEach(content => content.classList.add('hidden'));

            button.classList.add('border-b-2', 'border-blue-600');
            tabContents[index].classList.remove('hidden');
        });
    });

    // Initialize the first tab as active
    tabButtons[0].classList.add('border-b-2', 'border-blue-600');
    tabContents[0].classList.remove('hidden');
}