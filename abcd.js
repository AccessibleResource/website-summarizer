// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
    
    // --- DOM Element Selection ---
    const addUrlBtn = document.getElementById('addUrlBtn');
    const removeAllUrlsBtn = document.getElementById('removeAllUrlsBtn');
    const urlInputsContainer = document.getElementById('urlInputsContainer');
    const promptTextarea = document.getElementById('prompt');
    const sendPromptBtn = document.getElementById('sendPromptBtn');
    const chatArea = document.getElementById('chatArea');
    const alerts = document.getElementById('alerts');

    // --- API Configuration ---
    // Note: It's highly recommended to use a backend proxy to hide your API key.
    // Exposing it on the client-side is a security risk.
    const API_KEY = "AIzaSyAsnCW93NN4GS7WD5f8su5S6EeVdQiA_Ls"; // Replace with your actual Gemini API Key
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
    
    // --- State Management ---
    let initialChatPlaceholder = chatArea.innerHTML; // Store initial placeholder to remove it later

    // --- Helper Functions ---

    /**
     * Toggles the visibility of the 'Remove All URLs' button based on the number of URL inputs.
     */
    const toggleRemoveAllButton = () => {
        const urlInputCount = urlInputsContainer.querySelectorAll('.url-input').length;
        if (urlInputCount > 2) {
            removeAllUrlsBtn.classList.remove('hidden');
        } else {
            removeAllUrlsBtn.classList.add('hidden');
        }
    };
    
    /**
     * Creates and appends a new URL input field to the form.
     */
    const addUrlInput = () => {
        const inputId = `url_${Date.now()}`; // Use a timestamp for a unique ID
        const newUrlDiv = document.createElement('div');
        newUrlDiv.className = 'flex items-center gap-2 fade-in';
        newUrlDiv.innerHTML = `
            <input type="url" id="${inputId}" class="url-input flex-grow block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3" placeholder="https://example.com">
            <button type="button" class="remove-url-btn flex-shrink-0 rounded-full p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300 transition-colors" aria-label="Remove URL">
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        `;
        urlInputsContainer.appendChild(newUrlDiv);
        toggleRemoveAllButton();
    };

    /**
     * Displays a temporary alert message to the user.
     * @param {string} message - The message to display.
     * @param {boolean} isError - If true, displays the message in red.
     */
    const showAlert = (message, isError = false) => {
        alerts.textContent = message;
        alerts.className = isError 
            ? 'text-sm text-red-500 dark:text-red-400 text-right h-5' 
            : 'text-sm text-green-600 dark:text-green-400 text-right h-5';
        setTimeout(() => alerts.textContent = '', 5000);
    };

    /**
     * Appends a new message container to the chat area.
     * @param {string} sender - Who sent the message ('You' or 'AI').
     * @param {string} content - The HTML content of the message.
     * @returns {HTMLElement} The created message container element.
     */
    const appendMessage = (sender, content) => {
        // Clear initial "Your conversation will appear here" placeholder if it exists
        if (chatArea.innerHTML.trim() === initialChatPlaceholder.trim()) {
            chatArea.innerHTML = '';
        }

        const isAI = sender === 'AI';
        const messageDiv = document.createElement('div');
        messageDiv.className = 'fade-in';
        messageDiv.innerHTML = `
            <h3 class="text-sm font-semibold ${isAI ? 'text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-white'}">${sender === 'You' ? 'You said' : 'AI Response'}</h3>
            <div class="response-content mt-2 text-gray-700 dark:text-gray-300 prose prose-sm dark:prose-invert max-w-none">
                ${content}
            </div>
        `;
        chatArea.appendChild(messageDiv);
        chatArea.scrollTop = chatArea.scrollHeight; // Auto-scroll to the bottom
        return messageDiv;
    };

    /**
     * Updates an existing AI message container with final content and action buttons.
     * @param {HTMLElement} container - The message container element to update.
     * @param {string} htmlContent - The final HTML content from the AI.
     */
    const updateAiMessage = (container, htmlContent) => {
        const responseContent = container.querySelector('.response-content');
        const responseId = `response-${Date.now()}`;
        responseContent.id = responseId;
        responseContent.innerHTML = htmlContent;

        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'flex items-center gap-4 mt-4 opacity-70';
        controlsDiv.innerHTML = `
            <button class="copy-btn flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors" data-clipboard-target="#${responseId}">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                Copy
            </button>
            <button class="share-btn flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>
                Share
            </button>
        `;
        container.appendChild(controlsDiv);
        
        // Initialize clipboard.js for the newly added copy button
        new ClipboardJS('.copy-btn');
    };

    /**
     * Fetches data from a URL with an exponential backoff retry mechanism for rate limiting.
     * @param {string} url - The URL to fetch.
     * @param {object} options - The options for the fetch request.
     * @param {number} retries - The number of times to retry.
     * @param {number} backoff - The initial backoff delay in milliseconds.
     * @returns {Promise<Response>}
     */
    async function fetchWithRetry(url, options, retries = 3, backoff = 500) {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(url, options);
                // Specifically retry on 429: Too Many Requests
                if (response.status === 429) {
                   throw new Error('Rate limited');
                }
                return response;
            } catch (error) {
                if (i === retries - 1) throw error;
                await new Promise(resolve => setTimeout(resolve, backoff * (2 ** i)));
            }
        }
    }


    // --- Event Listeners ---

    // Add a new URL input field when the button is clicked
    addUrlBtn.addEventListener('click', addUrlInput);

    // Remove all URL input fields
    removeAllUrlsBtn.addEventListener('click', () => {
        urlInputsContainer.innerHTML = '';
        addUrlInput(); // Add one empty field back
        toggleRemoveAllButton(); // This will re-evaluate and hide the button
    });

    // Handle removal of a single URL input using event delegation
    urlInputsContainer.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.remove-url-btn');
        if (removeBtn) {
            removeBtn.parentElement.remove();
            toggleRemoveAllButton();
        }
    });

    // Enable or disable the send button based on whether there is text in the prompt
    promptTextarea.addEventListener('input', () => {
        sendPromptBtn.disabled = promptTextarea.value.trim() === '';
    });

    // Handle the main action of sending the prompt to the AI
    sendPromptBtn.addEventListener('click', async () => {
        const urls = Array.from(document.querySelectorAll('.url-input'))
            .map(input => input.value.trim())
            .filter(url => url !== '');

        const promptText = promptTextarea.value.trim();

        if (!promptText) {
            showAlert('Please enter a prompt.', true);
            return;
        }

        // --- UI Updates for Sending ---
        sendPromptBtn.disabled = true;
        showAlert('AI is typing...');
        appendMessage('You', promptText.replace(/\n/g, '<br>'));
        const aiMessageContainer = appendMessage('AI', `<p class="text-gray-500">Typing...</p>`);

        // --- API Call ---
        try {
            const fullPrompt = `${promptText}\n\nURLs: ${urls.join('\n')}`;
            const payload = {
                contents: [{ parts: [{ text: fullPrompt }] }],
                tools: [{ "urlContext": {} }]
            };

            const response = await fetchWithRetry(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({})); // Gracefully handle non-JSON error responses
                const errorMessage = errorData.error?.message || `HTTP error! Status: ${response.status}`;
                throw new Error(errorMessage);
            }

            const result = await response.json();
            const candidate = result.candidates?.[0];

            if (candidate && candidate.content?.parts?.[0]?.text) {
                const aiText = candidate.content.parts[0].text;
                const formattedHtml = marked.parse(aiText);
                updateAiMessage(aiMessageContainer, formattedHtml);
            } else {
                // Handle cases where the API returns no content, e.g., due to safety filters
                const finishReason = candidate?.finishReason;
                const safetyMessage = finishReason === 'SAFETY' ? "Response blocked due to safety settings." : "Invalid or empty response from API.";
                throw new Error(safetyMessage);
            }

        } catch (error) {
            console.error("Error calling Gemini API:", error);
            const errorMessage = `<p class="text-red-500">Sorry, something went wrong. ${error.message}</p>`;
            updateAiMessage(aiMessageContainer, errorMessage);
        } finally {
            // --- UI Cleanup ---
            promptTextarea.value = ''; // Clear only the prompt textarea
            sendPromptBtn.disabled = true; // Keep button disabled until user types again
        }
    });

    // Handle Copy & Share buttons using event delegation on the chat area
    chatArea.addEventListener('click', (e) => {
        const shareBtn = e.target.closest('.share-btn');
        if (shareBtn) {
            const responseContainer = shareBtn.closest('.fade-in');
            const responseContent = responseContainer.querySelector('.response-content');
            const textToShare = responseContent.innerText;
            
            if (navigator.share) {
                navigator.share({
                    title: 'AI Summary',
                    text: textToShare,
                }).catch(err => console.error("Share failed:", err));
            } else {
                navigator.clipboard.writeText(textToShare).then(() => {
                   showAlert('Share not supported, copied to clipboard instead.');
                });
            }
        }
        
        const copyBtn = e.target.closest('.copy-btn');
        if (copyBtn) {
            showAlert('Copied to clipboard!');
        }
    });

    // --- Initial Setup ---
    addUrlInput(); // Start the page with one URL input field
});
