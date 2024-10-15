// api.js

// Base URL and API endpoints
const BASE_URL = 'http://127.0.0.1:8000';
const SOURCES_SLUG = '/sources';
const EXTRACT_TEXT_SLUG = '/extract-text';
const REFRESH_SEARCH_SLUG = '/extract-text/refresh-search';
const GET_INDEXED_CHAPTERS_SLUG = '/process-pdf/indexed-chapters';
const GET_TOC_SLUG = '/process-pdf/toc';
const AUGMENT_SUBTOPIC_SLUG = '/augment-subtopic';
const GET_SLIDE_UPLOAD_SLUG = '/get-slide-upload';
const GET_SUMMARY_SLIDE_SLUG = '/get-summary-slide';

// const UPLOAD_STORE = '/upload-store';
const GET_SLIDE_SLUG = '/get-slide';
// const EXTRACT_TEXT_STREAM_SLUG = '/extract-text-stream';
/**
 * Uploads files to the server along with a description.
 * @param {FileList} files - The list of files selected by the user.
 * @param {string} description - The description for the files.
 * @param {string} subtopic - The subtopic name to upload.
 * @returns {Promise<Object>} A promise that resolves to the uploaded response.
 */
async function uploadFiles(files, description, subtopic) {
    try {

        debugger
        const formData = new FormData();
        formData.append('subtopic_name', subtopic); // Subtopic field
        formData.append('description', description); // Append description

        // Append multiple files
        Array.from(files).forEach((file) => {
            formData.append('files', file);
        });

        const response = await fetch(`${BASE_URL}${UPLOAD_STORE}`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to upload files');
        }

        const responseData = await response.json();
        return responseData;
    } catch (error) {
        console.error('Error uploading files:', error);
        return null;
    }
}

/**
 * Fetches the Post-it notes from the API.
 * @returns {Promise<Array>} A promise that resolves to an array of notes.
 */
async function fetchNotes() {
    try {
        const response = await fetch(`${BASE_URL}${SOURCES_SLUG}`);
        if (!response.ok) {
            throw new Error('Failed to fetch notes');
        }
        const notes = await response.json();
        return notes;
    } catch (error) {
        console.error('Error fetching notes:', error);
        return [];
    }
}

/**
 * Fetches the Table of Contents (TOC) from the API.
 * @returns {Promise<Object>} A promise that resolves to the TOC data.
 */
export async function fetchTOC() {
    try {
        const response = await fetch(`${BASE_URL}${GET_TOC_SLUG}`);
        if (!response.ok) {
            throw new Error('Failed to fetch TOC');
        }
        const tocData = await response.json();
        return tocData;
    } catch (error) {
        console.error('Error fetching TOC:', error);
        return null;
    }
}
/**
 * Deletes all Post-it notes via the API.
 * @returns {Promise<void>} A promise that resolves when the deletion is complete.
 */
async function deleteNotes() {
    try {
        const response = await fetch(`${BASE_URL}${DELETE_SLUG}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Failed to delete notes');
        }
    } catch (error) {
        console.error('Error deleting notes:', error);
    }
}

/**
 * Sends selected files to the API to extract text from PDFs.
 * @param {FileList} files - The list of files selected by the user.
 * @returns {Promise<Object>} A promise that resolves to the extracted text data.
 */
async function extractText(files) {
    try {
        const formData = new FormData();
        Array.from(files).forEach(file => {
            formData.append('files', file);
        });

        const response = await fetch(`${BASE_URL}${EXTRACT_TEXT_SLUG}`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to extract text');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error extracting text:', error);
        return null;
    }
}

/**
 * Refreshes the documents for a specific part of a competency.
 * @param {number} compIndex - The index of the competency.
 * @param {number} partIndex - The index of the part within the competency.
 * @returns {Promise<Object>} A promise that resolves to the updated data.
 */
async function refreshDocuments(partName, augmentedInfo = "") {
    try {
        const response = await fetch(`${BASE_URL}${REFRESH_SEARCH_SLUG}?part_name=${encodeURIComponent(partName)}&augmented_info=${encodeURIComponent(augmentedInfo)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to refresh documents');
        }

        const updatedData = await response.json();
        return updatedData;
    } catch (error) {
        console.error('Error refreshing documents:', error);
        return null;
    }
}
// api.js

// Base URL and API endpoint

/**
 * Fetches slide data for the given subtopic and relevant documents.
 * @param {string} subtopic - The name of the part/subtopic.
 * @param {Array<string>} textContent - The relevant documents' text content.
 * @returns {Promise<Object>} A promise that resolves to the API response data.
 */
async function fetchSlideData(subtopic, textContent, summary = false) {
    try {
        const requestBody = {
            subtopic: subtopic,
            text_content: textContent,
            is_summary_slide: summary
        };

        const response = await fetch(`${BASE_URL}${GET_SLIDE_SLUG}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error('Failed to fetch slides: ' + response.statusText);
        }

        const responseData = await response.json();
        return responseData;

    } catch (error) {
        console.error('Error during API call:', error);
        throw error;
    }
}


/**
 * Fetches the indexed chapters for PDFs.
 * @returns {Promise<Array>} A promise that resolves to an array of indexed chapters.
 */
async function fetchIndexedChapters() {
    try {
        const response = await fetch(`${BASE_URL}${GET_INDEXED_CHAPTERS_SLUG}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch indexed chapters');
        }

        const data = await response.json(); // Parse the JSON data
        return data;
    } catch (error) {
        console.error('Error fetching indexed chapters:', error);
        return [];
    }
}
/**
 * Augments a subtopic by providing detailed information.
 * @param {string} topic - The main topic to discuss.
 * @param {string} subtopic - The subtopic to augment and explain.
 * @returns {Promise<Object>} A promise that resolves to the augmented subtopic data.
 */
async function augmentSubtopic(topic, subtopic) {
    try {
        const queryParams = new URLSearchParams({
            topic: topic,
            subtopic: subtopic
        });

        const response = await fetch(`${BASE_URL}${AUGMENT_SUBTOPIC_SLUG}?${queryParams}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to augment subtopic');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error augmenting subtopic:', error);
        throw error;
    }
}
/**
 * Sends files, description, subtopic, and text content (as a single string) in a single API call to the backend.
 * @param {FileList} files - The list of files selected by the user.
 * @param {string} description - The description for the files.
 * @param {string} subtopic - The subtopic name to upload and use for slide generation.
 * @param {string} textContent - The text content for slide generation (as a single string).
 * @returns {Promise<Object>} A promise that resolves to the combined API response from the backend.
 */
async function fetchSlideDataWithImages(files, description, subtopic, textContent) {
    try {
        const formData = new FormData();
        formData.append('subtopic_name', subtopic);  // Subtopic field for both slide generation and upload
        formData.append('description', description); // Append description for the upload

        // Append multiple files for upload
        Array.from(files).forEach((file) => {
            formData.append('files', file);
        });

        // Append text content for slide generation as a single string
        formData.append('text_content', textContent);

        // Send the request to the combined API endpoint
        const response = await fetch(`${BASE_URL}${GET_SLIDE_UPLOAD_SLUG}`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to complete the request: ' + response.statusText);
        }

        // Parse and return the combined response from the backend
        const responseData = await response.json();
        return responseData;

    } catch (error) {
        console.error('Error during API call:', error);
        throw error;
    }
}


export async function* getTableData(formData, useStream = true) {
    const response = await fetch(`${BASE_URL}${EXTRACT_TEXT_STREAM_SLUG}`, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let buffer = '';

    while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
            if (line.trim() === '') continue;

            try {
                const update = JSON.parse(line);
                yield update;
            } catch (error) {
                console.error('Error parsing JSON:', error);
            }
        }
    }
}

/**
 * Fetches a summary slide based on the provided summaries.
 * @param {Array<string>} summaries - An array of summary texts.
 * @returns {Promise<Object>} A promise that resolves to the summary slide data.
 */
async function fetchSummarySlide(summaries) {
    try {
        const response = await fetch(`${BASE_URL}${GET_SUMMARY_SLIDE_SLUG}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ summaries }),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch summary slide');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching summary slide:', error);
        throw error;
    }
}

async function deleteSourceById(sourceId) {
    try {
        const response = await fetch(`${BASE_URL}${SOURCES_SLUG}/${sourceId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                // Add any necessary authentication headers here
            },
        });

        if (!response.ok) {
            throw new Error('Failed to delete source');
        }

        return await response.json();
    } catch (error) {
        console.error('Error deleting source:', error);
        throw error;
    }
}

// Export the functions for use in other modules
export { fetchNotes, deleteNotes, deleteSourceById, extractText, fetchSummarySlide, fetchIndexedChapters, refreshDocuments, fetchSlideData, uploadFiles, augmentSubtopic, fetchSlideDataWithImages };
