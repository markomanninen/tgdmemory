function escapeHtml(unsafe) {
  if (typeof unsafe !== 'string') {
    return '';
  }
  return unsafe
       .replace(/&/g, "&amp;")
       .replace(/</g, "&lt;")
       .replace(/>/g, "&gt;")
       .replace(/"/g, "&quot;")
       .replace(/'/g, "&#039;");
}

/**
 * Creates a consistent cache key that matches the server's implementation
 * @param {string} latex - The LaTeX equation
 * @param {string} title - The equation title
 * @return {string} - A consistent cache key
 */
async function createConsistentCacheKey(latex, title) {
  try {
    // This mimics the server-side Buffer.from(...).toString('hex').substring(0, 16)
    const input = latex + (title || '');
    
    // Convert to UTF-8 bytes
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    
    // Use a more robust hashing approach that considers all characters
    // Create a string that summarizes the whole equation, not just the beginning
    let fullHash = '';
    
    // Add all bytes to create hash
    for (let i = 0; i < data.length; i++) {
      const hex = data[i].toString(16);
      fullHash += (hex.length === 1 ? '0' + hex : hex);
    }
    
    // To make a shorter but still unique hash, take:
    // - 4 chars from the beginning (common LaTeX prefix)
    // - 8 chars from the middle (equation-specific content)
    // - 4 chars from the end (equation-specific content + title)
    const hashLength = fullHash.length;
    const prefix = fullHash.substring(0, 4);
    const middle = hashLength > 20 ? 
      fullHash.substring(Math.floor(hashLength / 2) - 4, Math.floor(hashLength / 2) + 4) :
      fullHash.substring(4, Math.min(12, hashLength - 4));
    const suffix = fullHash.substring(Math.max(0, hashLength - 4));
    
    // Combine the parts to create a 16-character hash
    return prefix + middle + suffix;
  } catch (error) {
    console.error('Error creating consistent cache key (primary logic failed, using fallback):', error);
    // Fallback logic: mimics server's Buffer.from(input).toString('hex').substring(0, 16)
    const input = latex + (title || '');
    const encoder = new TextEncoder(); // Should be available in modern browsers
    const data = encoder.encode(input);
    let fullHex = '';
    for (let i = 0; i < data.length; i++) {
      const byteHex = data[i].toString(16);
      fullHex += (byteHex.length === 1 ? '0' + byteHex : byteHex);
    }
    return fullHex.substring(0, 16);
  }
}

/**
 * Simple string hashing function to create cache keys
 * @param {string} str - The string to hash
 * @return {string} - A hash string
 */
function simpleHash(str) {
  if (typeof str !== 'string') {
    return '';
  }
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Convert to a positive hex string
  return Math.abs(hash).toString(16);
}

/**
 * Determines the base URL for API calls based on the environment.
 * @returns {string} The base URL for the API.
 */
function getApiBaseUrl() {
  if (import.meta.env.PROD) {
    // In production, no dynamic API calls should be made.
    // Static cache is the only source.
    return null;
  } else {
    // In development, use localhost:3000 for the API server
    return 'http://localhost:3000';
  }
}

function showExplanation(latexEquation, rawTitleFromAttribute, clickedContainerElement) {
  console.log("showExplanation called with LaTeX:", latexEquation, "rawTitle:", rawTitleFromAttribute, "element:", clickedContainerElement); // DEBUG updated
  const modal = document.getElementById('equationExplanationModal');
  const modalTitleElement = document.getElementById('equationExplanationModalTitle');
  const modalBody = document.getElementById('equationExplanationModalBody');
  
  if (modal && modalTitleElement && modalBody) {
    // Try to determine equation number from MathJax elements first
    let equationNumber = 0;
    
    if (clickedContainerElement) {
      // First try to get the equation number from a MathJax element with a number
      const mjxEqnNums = clickedContainerElement.querySelectorAll('.mjx-eqn-num');
      if (mjxEqnNums.length > 0) {
        // Extract the number directly from the MathJax element
        const mjxNum = mjxEqnNums[0].textContent.trim().replace(/[()]/g, '');
        if (!isNaN(parseInt(mjxNum))) {
          equationNumber = parseInt(mjxNum);
        }
      } 
      
      // If we couldn't get the number from MathJax, fall back to container order
      if (equationNumber === 0) {
        const allEquationContainers = Array.from(document.querySelectorAll('.explainable-equation-container'));
        const index = allEquationContainers.indexOf(clickedContainerElement);
        if (index !== -1) {
          equationNumber = index + 1;
        }
      }
    }

    // Process the title to extract descriptive name
    let descriptiveNamePart = '';
    if (typeof rawTitleFromAttribute === 'string' && rawTitleFromAttribute.trim() !== '') {
      // Remove " - Equation X" or "(Eq. X)" patterns from the title
      descriptiveNamePart = rawTitleFromAttribute
        .replace(/ - Equation \d+$/, '')
        .replace(/ \(Eq\. \d+\)$/, '')
        .trim();
    }
    
    // Create the final title
    let finalTitle;
    if (descriptiveNamePart && equationNumber > 0) {
      finalTitle = `${descriptiveNamePart} - Equation ${equationNumber}`;
    } else if (descriptiveNamePart) { 
      finalTitle = descriptiveNamePart; // Only name, no (valid) number
    } else if (equationNumber > 0) { 
      finalTitle = `Equation ${equationNumber}`; // Only number, no name
    } else {
      finalTitle = 'Equation Explanation'; // Fallback
    }
    
    modalTitleElement.textContent = escapeHtml(finalTitle);
    
    // Prepare LaTeX for modal to ensure it displays without equation numbers
    let latexToDisplayInModal = '';
    
    if (latexEquation) {
      // Check if the equation is already in an unnumbered format
      const alreadyUnnumbered = 
        latexEquation.includes('$$') || 
        latexEquation.includes('\\[') || 
        latexEquation.includes('\\begin{equation*}') ||
        latexEquation.includes('\\begin{align*}') ||
        latexEquation.includes('\\begin{gather*}') ||
        latexEquation.includes('\\begin{multline*}') ||
        latexEquation.includes('\\begin{displaymath}') ||
        latexEquation.includes('\\begin{math}');
      
      if (alreadyUnnumbered) {
        latexToDisplayInModal = latexEquation;
      } else {
        // Convert numbered environments to starred (unnumbered) versions
        latexToDisplayInModal = latexEquation;
        
        // Remove any \\label{...} commands to prevent "multiply defined" errors
        // when we convert to unnumbered environments for the modal.
        latexToDisplayInModal = latexToDisplayInModal.replace(/\\\\label\\{[^}]+\\}/g, ''); 

        const environmentsToStar = ['equation', 'align', 'gather', 'multline', 'flalign', 'eqnarray'];
        
        for (const env of environmentsToStar) {
          // Only add star if the environment doesn't already have one
          const beginRegex = new RegExp(`\\\\begin\\{${env}\\}(?!\\*)`, 'g');
          const endRegex = new RegExp(`\\\\end\\{${env}\\}`, 'g');
          
          latexToDisplayInModal = latexToDisplayInModal.replace(beginRegex, `\\begin{${env}*}`);
          latexToDisplayInModal = latexToDisplayInModal.replace(endRegex, `\\end{${env}*}`);
        }
        
        // Handle inline math
        if (latexToDisplayInModal.startsWith('\\(') && latexToDisplayInModal.endsWith('\\)')) {
          latexToDisplayInModal = '$$ ' + latexToDisplayInModal.slice(2, -2) + ' $$';
        } else if (latexToDisplayInModal.startsWith('$') && latexToDisplayInModal.endsWith('$') && 
                  !latexToDisplayInModal.startsWith('$$')) {
          // Convert single dollar to double dollar (displaystyle)
          latexToDisplayInModal = '$$ ' + latexToDisplayInModal.slice(1, -1) + ' $$';
        } 
        
        // If no special formatting detected, wrap in $$ for display mode
        if (!latexToDisplayInModal.includes('\\begin{') && 
            !latexToDisplayInModal.includes('$$') && 
            !latexToDisplayInModal.includes('\\[') && 
            latexToDisplayInModal.trim() !== '') {
          latexToDisplayInModal = '$$ ' + latexToDisplayInModal + ' $$';
        }
      }
    }
    
    // After all other transformations on latexToDisplayInModal, remove labels and nonumber tags
    if (latexToDisplayInModal && typeof latexToDisplayInModal === 'string') {
        // Try multiple label patterns since the escaping can vary
        const labelPatterns = [
            /\\label\{[^}]+\}/g,           // Basic \label{...}
            /\\\\label\{[^}]+\}/g,         // Escaped \\label{...}
            /\\\\label\\{[^}]+\\}/g,       // Fully escaped \\label\{\...}
            /\{\\label\{[^}]+\}\}/g        // Grouped {\label{...}}
        ];
        
        // Apply each pattern
        for (const pattern of labelPatterns) {
            latexToDisplayInModal = latexToDisplayInModal.replace(pattern, '');
        }
        
        // Remove \nonumber commands
        latexToDisplayInModal = latexToDisplayInModal
            .replace(/\\nonumber/g, '')
            .replace(/\\\\nonumber/g, '');
            
        // Log the final LaTeX that will be rendered to help with debugging
        console.log('Final LaTeX for modal (after label removal):', latexToDisplayInModal);
    }
    
    // Add the overflow-hidden class to body to prevent scrolling
    document.body.classList.add('overflow-hidden');
    
    // Set the modal content with both the equation and a placeholder for the explanation
    modalBody.innerHTML = `
      <div class="p-2 border border-gray-200 rounded bg-gray-50 mb-4 text-base overflow-x-auto equation-display">
        ${latexToDisplayInModal || 'No LaTeX equation provided'}
        <button class="copy-button" title="Copy equation" data-latex="${escapeHtml(latexEquation || '')}">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          <span>Copy</span>
        </button>
      </div>
      <div id="equationExplanationContent" class="explanation-container">
        <div class="explanation-loading">
          <div class="explanation-loading-spinner"></div>
          <span>Generating explanation...</span>
        </div>
      </div>
      <p class="text-xs text-gray-400 mt-4">Raw LaTeX: <code>${escapeHtml(latexEquation || '')}</code></p>
    `;
    
    // Show the modal
    modal.classList.remove('hidden');
    modalBody.scrollTop = 0; 
    
    // First typeset just the equation
    if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
      MathJax.typesetPromise([modalBody.querySelector('.equation-display')])
        .then(() => {
          // After equation is typeset, fetch and display the explanation
          const explanationContainer = document.getElementById('equationExplanationContent');
          if (explanationContainer) {
            fetchAndDisplayExplanation(latexEquation, finalTitle, explanationContainer);
          }
        })
        .catch(function (err) {
          console.error('MathJax typesetting error in modal:', err);
        });
    } else {
      // If MathJax isn't available, still try to fetch the explanation
      const explanationContainer = document.getElementById('equationExplanationContent');
      if (explanationContainer) {
        fetchAndDisplayExplanation(latexEquation, finalTitle, explanationContainer);
      }
    }
  } else {
    console.error("Equation explanation modal elements (equationExplanationModal or equationExplanationModalBody) NOT FOUND in showExplanation."); // DEBUG
  }
}

function closeExplanationModal() {
  const modal = document.getElementById('equationExplanationModal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden'); // Allow scrolling when modal is closed
  }
}

/**
 * Fetches equation explanation from either cache or API endpoints
 * @param {string} latexEquation - The LaTeX equation to explain
 * @param {string} equationFullTitle - The title to include in the explanation
 * @param {HTMLElement} explanationContainerElement - DOM element to update with the explanation
 */
async function fetchAndDisplayExplanation(latexEquation, equationFullTitle, explanationContainerElement) {
  if (!latexEquation || !explanationContainerElement) return;
  
  // Create cache key - we need to ensure this matches the server's hash method
  const cacheKey = await createConsistentCacheKey(latexEquation, equationFullTitle || '');
  console.log(`Generated cache key: ${cacheKey} for equation: "${latexEquation.substring(0, 30)}..."`);
  console.log(`Title: "${equationFullTitle || ''}"`);
  
  const loadingHTML = `
    <div class="explanation-loading">
      <div class="explanation-loading-spinner"></div>
      <span>Generating explanation...</span>
    </div>
  `;
  explanationContainerElement.innerHTML = loadingHTML;
  
  const apiBaseUrl = getApiBaseUrl();

  try {
    // Try both potential cache locations (client-side and server-side)
    // clientCacheUrl remains a root-relative path. Vite should handle prepending the base path in production.
    const clientCacheUrl = `/explanations-cache/${cacheKey}.json`; 
    console.log(`Checking client cache for key: ${cacheKey} at ${clientCacheUrl}`);
    
    try {
      // First try client-side cache (public/explanations-cache)
      const cacheResponse = await fetch(clientCacheUrl, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Accept': 'application/json' // Request JSON explicitly
        }
      });
      
      console.log(`Client cache response status: ${cacheResponse.status} ${cacheResponse.statusText}`);
      console.log(`Response URL: ${cacheResponse.url}`);
      
      // Check if the response is JSON before proceeding
      const contentType = cacheResponse.headers.get('content-type');
      if (contentType && !contentType.includes('application/json')) {
        console.warn(`Expected JSON but got ${contentType} - this is likely a false positive from the dev server`);
        throw new Error(`Invalid content type: ${contentType}`);
      }
      
      if (cacheResponse.ok) {
        try {
          // First check if the response has content
          const responseText = await cacheResponse.text();
          
          if (!responseText || responseText.trim() === '') {
            console.warn('Cache file exists but is empty');
            throw new Error('Empty cache file');
          }
          
          // Check if the response is actually HTML instead of JSON
          if (responseText.trim().toLowerCase().startsWith('<!doctype html>') || 
              responseText.trim().toLowerCase().startsWith('<html') ||
              responseText.includes('<head>') ||
              responseText.includes('<body>') ||
              (responseText.includes('<') && responseText.includes('>') && !responseText.includes('{'))) {
            console.warn('Cache file exists but contains HTML instead of JSON - this is a false positive');
            console.log('HTML content found in cache:', responseText.substring(0, 100) + '...');
            console.log('Full response URL:', cacheResponse.url);
            console.log('This is a known issue with the dev server returning HTML for missing files');
            // Create a clearer error message that helps identify this as a false positive
            throw new Error('False positive: HTML received instead of JSON cache file');
          }
          
          try {
            const cacheData = JSON.parse(responseText);
            if (cacheData && cacheData.explanation) {
              console.log('Cache hit! Using cached explanation');
              explanationContainerElement.innerHTML = `<div class="explanation-content">${cacheData.explanation}</div>`;
              // Typeset the explanation content with MathJax
              if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
                await MathJax.typesetPromise([explanationContainerElement]);
              }
              return;
            } else {
              console.warn('Cache data exists but has no explanation property');
              throw new Error('Invalid cache data format');
            }
          } catch (jsonParseError) {
            console.warn('Cache file contains invalid JSON:', jsonParseError);
            console.log('Invalid JSON content:', responseText.substring(0, 100) + '...');
            throw jsonParseError;
          }
        } catch (contentError) {
          console.warn('Error processing cache content:', contentError);
          // Continue to API if content processing fails
        }
      } else {
        console.log('Client cache miss: No cached explanation found');
      }
    } catch (cacheError) {
      console.log('Client cache error:', cacheError.message);
      
      // If the error indicates an HTML response, log additional information
      if (cacheError.message.includes('HTML content found') || 
          cacheError.message.includes('unexpected character') ||
          cacheError.message.includes('False positive') ||
          cacheError.message.includes('Invalid content type')) {
        console.warn('The dev server returned HTML instead of a 404 for the missing cache file.');
        console.warn('This is a known issue with Vite and other dev servers - it\'s not a real error.');
      }

      // If in production (apiBaseUrl is null) and static cache failed (this catch block was entered),
      // show message and stop.
      if (apiBaseUrl === null) {
        console.log('Production mode: Static cache failed. No API fallback.');
        explanationContainerElement.innerHTML = `
          <div class="explanation-content">
            <h3 class="text-yellow-600">Explanation Not Available</h3>
            <p class="text-gray-700">A pre-generated explanation for this equation could not be found.</p>
            <p class="text-xs text-gray-500 mt-2">This is expected if the explanation has not been cached yet.</p>
          </div>
        `;
        return; // Exit function, no further attempts
      }
      console.log('Continuing to server-side checks (dev mode or non-HTML error in prod).');
    } // End of client cache catch block

    // The following blocks will only execute if apiBaseUrl is not null (i.e., development mode)
    // OR if client cache succeeded in production (in which case we would have returned already).
    // If apiBaseUrl is null AND client cache failed, we returned above.
    if (apiBaseUrl) {
      // Try server API cache endpoint as a backup
      try {
        const serverCacheUrl = `${apiBaseUrl}/cache/${cacheKey}`;
        console.log(`Checking server cache at: ${serverCacheUrl}`);
        
        const serverCacheResponse = await fetch(serverCacheUrl, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      console.log(`Server cache response status: ${serverCacheResponse.status} ${serverCacheResponse.statusText}`);
      
      if (serverCacheResponse.ok) {
        try {
          const cacheData = await serverCacheResponse.json();
          if (cacheData && cacheData.explanation) {
            console.log('Server cache hit! Using cached explanation');
            explanationContainerElement.innerHTML = `<div class="explanation-content">${cacheData.explanation}</div>`;
            // Typeset the explanation content with MathJax
            if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
              await MathJax.typesetPromise([explanationContainerElement]);
            }
            return;
          }
        } catch (serverCacheError) {
          console.warn('Server cache error:', serverCacheError.message);
        }
      } else {
        console.log('Server cache miss');
      }
    } catch (serverError) {
      console.log('Server cache unavailable:', serverError.message);
      }
      
      // Then try primary API
      try {
        const apiUrl = `${apiBaseUrl}/api/explain`;
        console.log('Fetching explanation from primary API...');
        
        const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latex: latexEquation,
          title: equationFullTitle || ''
        }),
        timeout: 15000 // 15 second timeout
      });
      
      if (response.ok) {
        try {
          const data = await response.json();
          if (data && data.explanation) {
            explanationContainerElement.innerHTML = `<div class="explanation-content">${data.explanation}</div>`;
            // Typeset the explanation content with MathJax
            if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
              await MathJax.typesetPromise([explanationContainerElement]);
            }
            return;
          } else {
            console.warn('Primary API returned success but no explanation data');
          }
        } catch (jsonParseError) {
          console.warn('Primary API returned invalid JSON:', jsonParseError);
          throw new Error('Invalid response format from primary API');
        }
      } else {
        console.warn(`Primary API returned status: ${response.status}`);
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
    } catch (primaryApiError) {
      console.warn('Primary API failed, trying fallback:', primaryApiError.message);
      }
      
      // Finally try fallback API
      try {
        const fallbackUrl = `${apiBaseUrl}/api/explain-with-gemini`;
        console.log('Fetching explanation from fallback API...');
        
        const fallbackResponse = await fetch(fallbackUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latex: latexEquation,
          title: equationFullTitle || ''
        }),
        timeout: 20000 // 20 second timeout for fallback
      });
      
      if (fallbackResponse.ok) {
        try {
          const fallbackData = await fallbackResponse.json();
          if (fallbackData && fallbackData.explanation) {
            explanationContainerElement.innerHTML = `<div class="explanation-content">${fallbackData.explanation}</div>`;
            // Typeset the explanation content with MathJax
            if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
              await MathJax.typesetPromise([explanationContainerElement]);
            }
            return;
          } else {
            console.warn('Fallback API returned success but no explanation data');
            throw new Error('No explanation content in fallback API response');
          }
        } catch (jsonParseError) {
          console.warn('Fallback API returned invalid JSON:', jsonParseError);
          throw new Error('Invalid response format from fallback API');
        }
      } else {
        console.warn(`Fallback API returned status: ${fallbackResponse.status}`);
        throw new Error(`Fallback API error: ${fallbackResponse.status} ${fallbackResponse.statusText}`);
      }
    } catch (fallbackError) {
      console.error('All explanation sources failed:', fallbackError.message);
      explanationContainerElement.innerHTML = `
        <div class="explanation-content">
          <h3 class="text-red-600">Explanation Generation Failed</h3>
          <p class="text-red-500">Sorry, we couldn't generate an explanation for this equation.</p>
          <p class="text-gray-700">Please try again later or contact support if the issue persists.</p>
          
          <div class="mt-4 p-3 bg-gray-50 border border-gray-200 rounded">
            <h4 class="text-sm font-medium text-gray-700">Troubleshooting:</h4>
            <ul class="text-sm text-gray-600 pl-5 mt-2 list-disc">
              <li>If in development, check that the local server is running at ${apiBaseUrl}</li>
              <li>Verify that API keys are set in server/.env file (for development)</li>
              <li>See EQUATION_EXPLANATION.md for more help</li>
            </ul>
          </div>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error in fetchAndDisplayExplanation:', error);
    explanationContainerElement.innerHTML = `
      <div class="explanation-content">
        <h3 class="text-red-600">Error Occurred</h3>
        <p class="text-red-500">An error occurred while fetching the explanation.</p>
        <p class="text-gray-700">Error details: ${escapeHtml(error.message || 'Unknown error')}</p>
        
        <div class="mt-4 p-3 bg-gray-50 border border-gray-200 rounded">
          <h4 class="text-sm font-medium text-gray-700">Troubleshooting:</h4>
          <ul class="text-sm text-gray-600 pl-5 mt-2 list-disc">
              <li>If in development, check that the local server is running (expected at ${apiBaseUrl})</li>
            <li>Verify that API keys are set in server/.env file (for development)</li>
            <li>Check the browser console for more detailed error messages</li>
            <li>See EQUATION_EXPLANATION.md for more help</li>
          </ul>
        </div>
      </div>
    `;
    } // End of if(apiBaseUrl) - this ensures dev-only API calls are wrapped
  } catch (error) { // This is the outermost catch for any unexpected errors NOT caught by inner blocks
    console.error('Error in fetchAndDisplayExplanation:', error);
    explanationContainerElement.innerHTML = `
      <div class="explanation-content">
        <h3 class="text-red-600">Error Occurred</h3>
        <p class="text-red-500">An error occurred while fetching the explanation.</p>
        <p class="text-gray-700">Error details: ${escapeHtml(error.message || 'Unknown error')}</p>
        
        <div class="mt-4 p-3 bg-gray-50 border border-gray-200 rounded">
          <h4 class="text-sm font-medium text-gray-700">Troubleshooting:</h4>
          <ul class="text-sm text-gray-600 pl-5 mt-2 list-disc">
              <li>If in development, check that the local server is running (expected at ${apiBaseUrl})</li>
            <li>Verify that API keys are set in server/.env file (for development)</li>
            <li>Check the browser console for more detailed error messages</li>
            <li>See EQUATION_EXPLANATION.md for more help</li>
          </ul>
        </div>
      </div>
    `;
  }
}

document.addEventListener('DOMContentLoaded', function() {
  // Event Delegation for copy buttons
  document.body.addEventListener('click', function(event) {
    const copyButton = event.target.closest('.copy-button');
    if (copyButton) {
      event.preventDefault();
      const latex = copyButton.getAttribute('data-latex');
      if (latex) {
        navigator.clipboard.writeText(latex).then(() => {
          // Visual feedback
          copyButton.classList.add('copied');
          const originalText = copyButton.querySelector('span').textContent;
          copyButton.querySelector('span').textContent = 'Copied!';
          
          // Reset after 2 seconds
          setTimeout(() => {
            copyButton.classList.remove('copied');
            copyButton.querySelector('span').textContent = originalText;
          }, 2000);
        }).catch(err => {
          console.error('Failed to copy equation:', err);
          // Show error feedback
          copyButton.querySelector('span').textContent = 'Failed to copy';
          setTimeout(() => {
            copyButton.querySelector('span').textContent = 'Copy';
          }, 2000);
        });
      }
    }
  });

  // Event Delegation for equation triggers:
  document.body.addEventListener('click', function(event) {
    const trigger = event.target.closest('.equation-explainer-trigger');
    if (trigger) {
      console.log("Equation explainer trigger clicked:", trigger); // DEBUG
      event.preventDefault(); 
      const parentContainer = trigger.closest('.explainable-equation-container');
      if (parentContainer) {
        const latexEquation = parentContainer.getAttribute('data-latex-equation');
        const rawTitleFromAttribute = parentContainer.getAttribute('title'); // Get the raw title attribute
        if (latexEquation) {
          showExplanation(latexEquation, rawTitleFromAttribute, parentContainer); // Pass element and raw title
        } else {
          console.error("Trigger's parent container '.explainable-equation-container' is missing 'data-latex-equation' attribute.");
        }
      } else {
         console.error("Trigger '.equation-explainer-trigger' is not inside an '.explainable-equation-container'.");
      }
    }
  });

  const closeModalButton = document.getElementById('closeEquationExplanationModalButton');
  if (closeModalButton) {
      closeModalButton.addEventListener('click', closeExplanationModal);
  } else {
      console.error("Close modal button (closeEquationExplanationModalButton) NOT FOUND."); // DEBUG
  }
  
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      const modal = document.getElementById('equationExplanationModal');
      if (modal && !modal.classList.contains('hidden')) {
        closeExplanationModal();
      }
    }
  });

  const modalOverlay = document.getElementById('equationExplanationModal');
  if (modalOverlay) {
      modalOverlay.addEventListener('click', function(event) {
          if (event.target === modalOverlay) { 
              closeExplanationModal();
          }
      });
  } else {
      console.error("Modal overlay (equationExplanationModal) NOT FOUND for outside click listener."); // DEBUG
  }
});
