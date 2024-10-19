import { getGlobalData, updateGlobalData } from './tableRenderer.js';
export function showContentPopup(content, compIndex = null, partIndex = null) {
    let data = content.content;
    let imagesURLs = content.images;
    let presentationURL = content.presentation_url.public_url;
    if (compIndex && partIndex) {//called frm tableRenderer
        setSummary(data.summary, compIndex, partIndex);
    }
    // Create the popup structure
    const popupHtml = `
    <div id="json-popup" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 transition-all duration-500">
        <div id="popup-container" class="bg-white p-4 rounded-lg shadow-lg h-[80%] flex flex-col w-[500px] transition-all duration-500">
            <!-- Close Button -->
            <div class="relative">
                <button id="close-popup" class="cursor-pointer absolute top-0 right-0 text-gray-500 hover:text-gray-700">
                   ✖
                </button>
            </div>

            <!-- Tabs and Content -->
            ${compIndex && partIndex ? `${createTabs()}
            ${createSlidesContent(data.slides, imagesURLs, presentationURL)}
            ${createQuizContent(data.quiz)}
            ${createCaseContent(data.case_based)}
            ${createBloomsContent(data.blooms)}` : `${createSlidesTab()}
            ${createSlidesContent(data.slides, imagesURLs, presentationURL)}`}
            
        </div>
    </div>
`;

    // Append the popup to the body
    document.body.insertAdjacentHTML('beforeend', popupHtml);

    // Initialize tab and slide functionality
    initializeTabs();
    initializeSlideNavigation();
    initializeToggle();
    document.getElementById('close-popup').addEventListener('click', () => {
        document.getElementById('json-popup').remove();
    });
}

function createTabs() {
    return `
    <!-- Tabs for switching between content -->
    <div class="flex space-x-4 border-b-2 mb-4">
        <button id="slides-tab" class="tab-button-content font-semibold">Slides</button>
        <button id="quiz-tab" class="tab-button-content font-semibold">Quiz</button>
        <button id="case-tab" class="tab-button-content font-semibold">Case-Based</button>
        <button id="blooms-tab" class="tab-button-content font-semibold">Bloom's</button>
    </div>`;
}
function createSlidesTab() {
    return `<button id="slides-tab" class="tab-button-content font-semibold">Slides</button>`;
}

function createSlidesContent(slides, imageUrls, presentationURL) {
    // Create a homogeneous structure for all slides
    const homogenousSlides = slides.flatMap(slide =>
        slide.content.map(section => ({
            type: 'text',
            title: slide.title,
            heading: section.heading,
            content: section.bullet_points
        }))
    );

    // Add image slides
    imageUrls.forEach((url, index) => {
        homogenousSlides.push({
            type: 'image',
            title: `Image Slide ${index + 1}`,
            heading: `Image ${index + 1}`,
            content: url
        });
    });

    return `
    <div id="slides-content" class="tab-content-lm h-[calc(100%-50px)] overflow-hidden">
        <div class="flex flex-col justify-between items-start mb-4">
            <h2 class="text-lg font-semibold w-full truncate overflow-hidden cursor-pointer">${homogenousSlides[0].title}</h2>
           
            </div>
        <div class="flex justify-between items-center mb-4 pl-1">
            <div class="flex justify-center items-center">
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" id="toggle-switch" class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-blue-600 peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 transition-colors duration-300"></div>
                    <div class="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transform peer-checked:translate-x-5 transition-transform duration-300"></div>
                </label>
                <span id="toggle-label" class="ml-3 text-gray-700">Slideshow Off</span>
            </div>
            <a href="${presentationURL}" class="text-blue-500 underline" target="_blank">link to the slides</a>
        </div>
        <div id="json-content" class="h-[calc(100%-70px)] w-full overflow-auto flex-1 bg-gray-100 rounded-lg p-4 ">
            ${homogenousSlides.map(slide => `
                <div class="mb-4 animate-fade-in">
                    <h3 class="font-semibold text-gray-800">${slide.heading}</h3>
                    ${slide.type === 'image'
            ? `<img src="${slide.content}" alt="${slide.heading}" class="max-w-full h-auto mb-2">`
            : `<ul class="list-disc pl-5 text-gray-700">
                            ${slide.content.map(point => `<li>${point}</li>`).join('')}
                           </ul>`
        }
                </div>
            `).join('')}
        </div>
        <div id="slideshow-content" class="slideshow-content hidden flex-1 h-full flex flex-col items-center">
            <div class="w-full p-8 overflow-y-auto bg-blue-900 text-white rounded-lg">
                ${homogenousSlides.map((slide, index) => `
                    <div class="slide ${index === 0 ? 'active animate-fade-in' : 'hidden'}">
                        <div class="sticky top-0 bg-blue-900 z-10">
                            <h3 class="text-2xl font-bold mb-4">${slide.heading}</h3>
                        </div>
                        ${slide.type === 'image'
                ? `<div class="flex justify-center items-center h-[194px]">
                                <img src="${slide.content}" alt="${slide.heading}" class="max-w-full max-h-full object-contain">
                               </div>`
                : `<ul class="list-disc pl-5 text-lg leading-relaxed h-[194px] overflow-y-auto">
                                ${slide.content.map(point => `<li class="mb-2">${point}</li>`).join('')}
                               </ul>`
            }
                        <div class="mt-8 text-sm text-gray-200 text-left">
                            Slide ${index + 1} of ${homogenousSlides.length}
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="w-full bg-white p-4">
                <div class="flex justify-between w-full">
                    <button id="prev-slide" class="text-blue-900 hover:text-blue-700 cursor-pointer flex items-center">
                        <i class="fa-solid fa-chevron-left mr-2"></i>Previous
                    </button>
                    <button id="next-slide" class="text-blue-900 hover:text-blue-700 cursor-pointer flex items-center">
                        Next<i class="fa-solid fa-chevron-right ml-2"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>`;
}

function createQuizContent(quiz) {
    return `
    <!-- Quiz Content -->
    <div id="quiz-content" class="hidden tab-content-lm">
        ${quiz.map((q, qIndex) => `
            <div class="mb-4">
                <h3 class="font-semibold text-gray-800 mb-2">${q.jeopardy_mcq.answer}</h3>
                <form>
                    ${q.jeopardy_mcq.options.map((option, index) => `
                        <label class="flex items-center mb-2 cursor-pointer">
                            <input type="radio" name="quiz-${qIndex}" value="${option}" class="mr-2">
                            <span>${option}</span>
                        </label>
                    `).join('')}
                </form>
            </div>
        `).join('')}
    </div>`;
}

function createCaseContent(caseBased) {
    return `
    <!-- Case-Based Questions Content (Initially Hidden) -->
    <div id="case-content" class="hidden tab-content-lm">
        ${caseBased.map(caseData => `
            <div class="mb-4">
                <h3 class="font-semibold text-gray-800">${caseData.case.description}</h3>
                ${caseData.case.questions.map(question => `
                    <h4 class="mt-2">${question.question}</h4>
                    <ul class="list-disc pl-5 text-gray-700">
                        ${question.options.map(option => `<li>${option}</li>`).join('')}
                    </ul>
                `).join('')}
            </div>
        `).join('')}
    </div>`;
}

function createBloomsContent(blooms) {
    return `
    <!-- Bloom's Questions Content (Initially Hidden) -->
    <div id="blooms-content" class="hidden tab-content-lm">
        ${blooms.map(bloom => `
            <div class="mb-4">
                <h3 class="font-semibold text-gray-800">${bloom.level}</h3>
                <p>${bloom.question}</p>
            </div>
        `).join('')}
    </div>`;
}

function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-button-content');
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

function initializeSlideNavigation() {
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;
    const totalSlides = slides.length;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
            slide.classList.toggle('hidden', i !== index);
            if (i === index) {
                slide.classList.add('animate-fade-in');
            } else {
                slide.classList.remove('animate-fade-in');
            }
        });
    }

    function updateSlideNavigation() {
        showSlide(currentSlide);

        // Disable "Previous" button if on the first slide
        if (currentSlide === 0) {
            document.getElementById('prev-slide').disabled = true;
            document.getElementById('prev-slide').classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            document.getElementById('prev-slide').disabled = false;
            document.getElementById('prev-slide').classList.remove('opacity-50', 'cursor-not-allowed');
        }

        // Disable "Next" button if on the last slide
        if (currentSlide === totalSlides - 1) {
            document.getElementById('next-slide').disabled = true;
            document.getElementById('next-slide').classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            document.getElementById('next-slide').disabled = false;
            document.getElementById('next-slide').classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }

    // Event listeners for slideshow navigation buttons
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

function initializeToggle() {
    document.getElementById('toggle-switch').addEventListener('change', function () {
        const popupContainer = document.getElementById('popup-container');
        if (this.checked) {
            document.getElementById('json-content').classList.add('hidden');
            document.getElementById('slideshow-content').classList.remove('hidden');
            popupContainer.classList.remove('w-[500px]');
            popupContainer.classList.add('w-[800px]');
            document.getElementById('toggle-label').textContent = 'SlideShow On';
        } else {
            document.getElementById('json-content').classList.remove('hidden');
            document.getElementById('slideshow-content').classList.add('hidden');
            popupContainer.classList.remove('w-[800px]');
            popupContainer.classList.add('w-[500px]');
            document.getElementById('toggle-label').textContent = 'Slideshow Off';
        }
    });
}
function setSummary(summary, compIndex, partIndex) {
    const globalData = getGlobalData();

    // Ensure globalData is defined and has the necessary structure
    if (!globalData || !globalData.competencies) {
        console.error('globalData or competencies not initialized');
        return;
    }

    // Check if the competency exists
    if (!globalData.competencies[compIndex]) {
        console.error(`Competency at index ${compIndex} does not exist`);
        return;
    }

    // Check if the part exists within the competency
    if (!globalData.competencies[compIndex].parts[partIndex]) {
        console.error(`Part at index ${partIndex} does not exist in competency ${compIndex}`);
        return;
    }

    // Set the summary
    globalData.competencies[compIndex].parts[partIndex].summary = summary;
    console.log(`Summary set for competency ${compIndex}, part ${partIndex}`);
}
