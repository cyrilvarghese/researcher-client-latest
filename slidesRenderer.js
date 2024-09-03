// slidesRender.js

/**
 * Displays the slide data in a popup window with a toggle between text view and slideshow.
 * @param {Object} slideData - The data returned from the /get-slide API.
 */
export function showSlidesPopup(slideData) {
    // Create the popup structure
    const popupHtml = `
        <div id="json-popup" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white p-4 rounded-lg shadow-lg w-[500px] h-[80%] flex flex-col">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-lg font-semibold">${slideData.title}</h2>
                    <button id="close-popup" class="text-gray-500 hover:text-gray-700">
                        <i class="fa-solid fa-times"></i>
                    </button>
                </div>
                <div class="flex flex-start items-center mb-4">
                   <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="toggle-switch" class="sr-only peer">
                        <div class="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-blue-600 peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 transition-colors duration-300"></div>
                        <div class="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transform peer-checked:translate-x-5 transition-transform duration-300"></div>
                    </label>
                    <span id="toggle-label" class="ml-3 text-gray-700">View Slideshow</span>
                </div>
                <div id="json-content" class="overflow-auto flex-1 bg-gray-100 rounded-lg p-4">
                    ${slideData.content.map(section => `
                        <div class="mb-4">
                            <h3 class="font-semibold text-gray-800">${section.heading}</h3>
                            <ul class="list-disc pl-5 text-gray-700">
                                ${section.bullet_points.map(point => `<li>${point}</li>`).join('')}
                            </ul>
                        </div>
                    `).join('')}
                </div>
                <div id="slideshow-content" class="slideshow-content hidden flex-1 flex flex-col items-center flex-start bg-blue-900 text-white rounded-lg p-8">
                    ${slideData.content.map((section, index) => `
                        <div class="slide ${index === 0 ? 'active' : 'hidden'}">
                            <h3 class="text-2xl font-bold mb-4">${section.heading}</h3>
                            <ul class="list-disc pl-5 text-lg leading-relaxed">
                                ${section.bullet_points.map(point => `<li class="mb-2">${point}</li>`).join('')}
                            </ul>
                            <div class="mt-8 text-sm text-gray-200 text-left">
                                Slide ${index + 1} of ${slideData.content.length}
                            </div>
                        </div>
                    `).join('')}
                    <div class="flex justify-between mt-8 w-full">
                        <button id="prev-slide" class="text-blue-200 hover:text-white cursor-pointer flex items-center" disabled>
                            <i class="fa-solid fa-chevron-left mr-2"></i>Previous
                        </button>
                        <button id="next-slide" class="text-blue-200 hover:text-white cursor-pointer flex items-center">
                            Next<i class="fa-solid fa-chevron-right ml-2"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Append the popup to the body
    document.body.insertAdjacentHTML('beforeend', popupHtml);

    // Initialize slideshow controls
    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide');

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
            slide.classList.toggle('hidden', i !== index);
        });
    }

    // Event listeners for slideshow navigation buttons
    document.getElementById('next-slide').addEventListener('click', () => {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    });

    document.getElementById('prev-slide').addEventListener('click', () => {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    });

    // Event listener to close the popup
    document.getElementById('close-popup').addEventListener('click', () => {
        document.getElementById('json-popup').remove();
    });


    document.getElementById('toggle-switch').addEventListener('change', function () {
        if (this.checked) {
            // Toggle is ON - Show Slideshow View
            document.getElementById('json-content').classList.add('hidden');
            document.getElementById('slideshow-content').classList.remove('hidden');
            document.getElementById('toggle-label').textContent = 'View Text';
        } else {
            // Toggle is OFF - Show Text View
            document.getElementById('json-content').classList.remove('hidden');
            document.getElementById('slideshow-content').classList.add('hidden');
            document.getElementById('toggle-label').textContent = 'View Slideshow';
        }
    });


    const totalSlides = slides.length;

    function updateSlideNavigation() {
        showSlide(currentSlide);

        // Disable "Previous" button if on the first slide
        const prevButton = document.getElementById('prev-slide');
        const nextButton = document.getElementById('next-slide');

        if (currentSlide === 0) {
            prevButton.disabled = true;
            prevButton.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            prevButton.disabled = false;
            prevButton.classList.remove('opacity-50', 'cursor-not-allowed');
        }

        // Disable "Next" button if on the last slide
        if (currentSlide === totalSlides - 1) {
            nextButton.disabled = true;
            nextButton.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            nextButton.disabled = false;
            nextButton.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }

    document.getElementById('next-slide').addEventListener('click', () => {
        if (currentSlide < totalSlides - 1) {
            currentSlide++;
            updateSlideNavigation();
        }
    });

    document.getElementById('prev-slide').addEventListener('click', () => {
        if (currentSlide > 0) {
            currentSlide--;
            updateSlideNavigation();
        }
    });

    // Initial call to set the correct button states on load
    updateSlideNavigation();
}
