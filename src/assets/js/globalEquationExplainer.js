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
    
    // Add the overflow-hidden class to body to prevent scrolling
    document.body.classList.add('overflow-hidden');
    
    // Set the modal content with both the equation and a placeholder for the explanation
    modalBody.innerHTML = `
      <div class="p-2 border border-gray-200 rounded bg-gray-50 mb-4 text-base overflow-x-auto equation-display">
        ${latexToDisplayInModal || 'No LaTeX equation provided'} 
      </div>
      <div id="equationExplanationContent" class="explanation-container">
        <p class="text-gray-700"><i>Loading explanation...</i></p>
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
  
  const cacheKey = simpleHash(latexEquation + (equationFullTitle || ''));
  const loadingHTML = '<p class="text-gray-700"><i>Loading explanation...</i></p>';
  explanationContainerElement.innerHTML = loadingHTML;
  
  try {
    // First try to fetch from cache
    const cacheUrl = `/explanations-cache/${cacheKey}.json`;
    try {
      const cacheResponse = await fetch(cacheUrl);
      if (cacheResponse.ok) {
        const cacheData = await cacheResponse.json();
        if (cacheData && cacheData.explanation) {
          explanationContainerElement.innerHTML = `<div class="explanation-content">${cacheData.explanation}</div>`;
          // Typeset the explanation content with MathJax
          if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
            await MathJax.typesetPromise([explanationContainerElement]);
          }
          return;
        }
      }
    } catch (cacheError) {
      console.log('Cache miss, proceeding to API:', cacheError);
    }
    
    // Then try primary API
    try {
      const apiUrl = 'http://localhost:3000/api/explain';
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
        const data = await response.json();
        if (data && data.explanation) {
          explanationContainerElement.innerHTML = `<div class="explanation-content">${data.explanation}</div>`;
          // Typeset the explanation content with MathJax
          if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
            await MathJax.typesetPromise([explanationContainerElement]);
          }
          return;
        }
      }
    } catch (primaryApiError) {
      console.warn('Primary API failed, trying fallback:', primaryApiError);
    }
    
    // Finally try fallback API
    try {
      const fallbackUrl = 'http://localhost:3000/api/explain-with-gemini';
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
        const fallbackData = await fallbackResponse.json();
        if (fallbackData && fallbackData.explanation) {
          explanationContainerElement.innerHTML = `<div class="explanation-content">${fallbackData.explanation}</div>`;
          // Typeset the explanation content with MathJax
          if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
            await MathJax.typesetPromise([explanationContainerElement]);
          }
          return;
        }
      } else {
        throw new Error(`Fallback API returned status: ${fallbackResponse.status}`);
      }
    } catch (fallbackError) {
      console.error('All explanation sources failed:', fallbackError);
      explanationContainerElement.innerHTML = `
        <p class="text-red-500">Sorry, we couldn't generate an explanation for this equation.</p>
        <p class="text-gray-700">Please try again later or contact support if the issue persists.</p>
      `;
    }
  } catch (error) {
    console.error('Error in fetchAndDisplayExplanation:', error);
    explanationContainerElement.innerHTML = `
      <p class="text-red-500">An error occurred while fetching the explanation.</p>
      <p class="text-gray-700">Error details: ${escapeHtml(error.message)}</p>
      <p class="text-sm mt-4">
        <strong>Troubleshooting:</strong><br>
        - Check that the equation explanation server is running<br>
        - Verify that API keys are set in server/.env file<br>
        - See EQUATION_EXPLANATION.md for more help
      </p>
    `;
  }
}

document.addEventListener('DOMContentLoaded', function() {

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
