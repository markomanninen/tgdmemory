// Use import.meta.glob to load HTML section content
// Paths are relative to this JS file: src/assets/js/ -> src/pages/dirac_propagator/sections/
const sectionModules = import.meta.glob('../../pages/dirac_propagator/sections/*.html', { as: 'raw', eager: true });

let allHeadingsForToc = [];
let tocLinksForHighlight = [];
let autoTocIdCounter = 0;

const SECTION_CONTAINER_IDS = [
    'abstract-container',
    'introduction-sec-container',
    'how-propagation-takes-place-container',
    'foundational-questions-container',
    'appendix-a-container',
    'acknowledgements-container',
    'references-container',
];

async function loadSections() {
    const sectionFileMappings = {
        'abstract-container': 'abstract.html',
        'introduction-sec-container': 'introduction.html',
        'how-propagation-takes-place-container': 'how_propagation_takes_place.html',
        'foundational-questions-container': 'foundational_questions.html',
        'appendix-a-container': 'appendix_a.html',
        'acknowledgements-container': 'acknowledgements.html',
        'references-container': 'references.html',
    };

    console.log("Available section modules:", Object.keys(sectionModules));

    for (const containerId of SECTION_CONTAINER_IDS) { // Ensure SECTION_CONTAINER_IDS is defined
        const fileName = sectionFileMappings[containerId];
        const container = document.getElementById(containerId);
        const moduleKey = `../../pages/dirac_propagator/sections/${fileName}`;

        if (container && sectionModules[moduleKey]) {
            container.innerHTML = sectionModules[moduleKey];
        } else {
            console.warn(`Problem loading section into '${containerId}':`);
            if (!container) console.warn(`  Container element with ID '${containerId}' not found.`);
            if (!sectionModules[moduleKey]) console.warn(`  Module for key '${moduleKey}' not found.`);
        }
    }
    
    console.log("All HTML sections loaded into DOM.");

    // Enhanced MathJax handling with new startup events
    const processMathJaxAndGenerateToc = () => {
        console.log("Processing MathJax content and generating ToC...");
        if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
            window.MathJax.typesetPromise([document.getElementById('article-content')])
                .then(() => {
                    console.log("MathJax typesetting complete for dynamic content.");
                    // Generate ToC *after* MathJax has potentially altered the layout
                    generateFullToc();
                    initializeTocHighlighting();
                })
                .catch((err) => {
                    console.error("MathJax typesetting error:", err);
                    // Still generate ToC even if MathJax fails, but log the error
                    generateFullToc();
                    initializeTocHighlighting();
                });
        } else {
            console.log("MathJax typesetting not available, proceeding with ToC generation.");
            generateFullToc();
            initializeTocHighlighting();
        }
    };

    // Check if MathJax is ready using the new event system
    if (window.mathJaxReady) {
        console.log("MathJax already ready, processing content immediately.");
        processMathJaxAndGenerateToc();
    } else {
        console.log("Waiting for MathJax ready event...");
        // Listen for the custom mathjax-ready event
        window.addEventListener('mathjax-ready', () => {
            console.log("MathJax ready event received, processing content.");
            processMathJaxAndGenerateToc();
        });

        // Fallback: also listen to the traditional startup promise (for compatibility)
        if (window.MathJax && window.MathJax.startup && typeof window.MathJax.startup.promise !== 'undefined') {
            window.MathJax.startup.promise.then(() => {
                console.log("MathJax startup promise resolved as fallback.");
                if (!window.mathJaxReady) {
                    processMathJaxAndGenerateToc();
                }
            }).catch(err => {
                console.error("MathJax startup promise failed:", err);
                if (!window.mathJaxReady) {
                    generateFullToc();
                    initializeTocHighlighting();
                }
            });
        } else {
            // Final fallback: proceed without MathJax after a short delay
            setTimeout(() => {
                if (!window.mathJaxReady) {
                    console.warn("MathJax not available, proceeding without it.");
                    generateFullToc();
                    initializeTocHighlighting();
                }
            }, 2000);
        }
    }
}

function generateFullToc() {
    const tocListElement = document.getElementById('toc-list');
    if (!tocListElement) {
        console.error("ToC list element (#toc-list) not found.");
        return;
    }
    tocListElement.innerHTML = ''; // Clear existing ToC items
    allHeadingsForToc = []; // Reset
    autoTocIdCounter = 0;

    SECTION_CONTAINER_IDS.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (!container) return;

        const headings = container.querySelectorAll('h2, h3, h4');
        headings.forEach(heading => {
            if (!heading.id) {
                heading.id = `auto-toc-id-${autoTocIdCounter++}`;
            }
            // Ensure scroll-margin-top for accurate anchoring
            heading.classList.add('scroll-mt-custom'); 
            
            allHeadingsForToc.push(heading);

            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.href = `#${heading.id}`;
            
            let textContent = heading.textContent.trim();
            // Attempt to remove existing numbering like "1. ", "A.1 ", etc. for cleaner ToC
            textContent = textContent.replace(/^[A-Z0-9]+\.\d*\s*|^[A-Z]+\.\s*/, '');


            link.textContent = textContent;
            link.classList.add('hover:text-blue-500', 'block', 'py-1');

            if (heading.tagName === 'H2') {
                link.classList.add('font-semibold');
            } else if (heading.tagName === 'H3') {
                link.classList.add('ml-4');
            } else if (heading.tagName === 'H4') {
                link.classList.add('ml-8');
            }
            listItem.appendChild(link);
            tocListElement.appendChild(listItem);
        });
    });
    console.log("Generated ToC with headings:", allHeadingsForToc.map(h => h.id));
}


function initializeTocHighlighting() {
    tocLinksForHighlight = Array.from(document.querySelectorAll('#toc-list a'));
    
    if (allHeadingsForToc.length > 0 && tocLinksForHighlight.length > 0) {
        window.addEventListener('scroll', highlightTocLink, { passive: true });
        highlightTocLink(); // Initial highlight
        console.log("ToC highlighting initialized for sections:", allHeadingsForToc.map(s => s.id));
    } else {
        console.warn("ToC highlighting: No valid headings or ToC links found. Check generation process.");
    }
}

function highlightTocLink() {
    let currentSectionId = null;
    const viewportHeight = window.innerHeight;
    // Activate when the top of the section is within the top 40% of the viewport
    // or if the section takes up a large part of the viewport.
    const activationOffset = viewportHeight * 0.4; 

    for (let i = allHeadingsForToc.length - 1; i >= 0; i--) {
        const section = allHeadingsForToc[i];
        const rect = section.getBoundingClientRect();

        // Section is considered active if its top is above the activation offset
        // AND either its bottom is below the offset (it spans the offset)
        // OR its top is simply above the offset (it's the highest one that passed the offset)
        if (rect.top < activationOffset) {
             currentSectionId = section.id;
             break; 
        }
    }
    
    // If no section is above the threshold (e.g. scrolled to top, or very short page)
    // highlight the first one if it's visible at all.
    if (!currentSectionId && allHeadingsForToc.length > 0) {
        const firstSectionRect = allHeadingsForToc[0].getBoundingClientRect();
        if (firstSectionRect.bottom > 0 && firstSectionRect.top < viewportHeight) {
            currentSectionId = allHeadingsForToc[0].id;
        }
    }

    // If scrolled to the very bottom, highlight the last section.
    if ((window.innerHeight + window.scrollY + 50) >= document.body.offsetHeight) { 
        if (allHeadingsForToc.length > 0) {
            currentSectionId = allHeadingsForToc[allHeadingsForToc.length - 1].id;
        }
    }

    tocLinksForHighlight.forEach(link => {
        const isActive = link.getAttribute('href') === `#${currentSectionId}`;
        link.classList.toggle('active', isActive);
        link.classList.toggle('text-blue-600', isActive);
        link.classList.toggle('font-bold', isActive);
        link.classList.toggle('text-gray-600', !isActive); // Ensure non-active links have default color
        if (isActive) {
            link.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadSections(); // This will now also trigger ToC generation and highlighting setup

    const decreaseFontButton = document.getElementById('decrease-font');
    const increaseFontButton = document.getElementById('increase-font');
    const articleContent = document.getElementById('article-content');
    let currentFontSize = 1.2; // Represents 1.2em (initial size +2)

    const updateFontSize = () => {
        if (articleContent) {
            articleContent.style.fontSize = `${currentFontSize}em`;
        }
    };

    // Set initial font size to +2
    updateFontSize();

    if (decreaseFontButton && increaseFontButton && articleContent) {
        decreaseFontButton.addEventListener('click', () => {
            if (currentFontSize > 0.5) { // Minimum size
                currentFontSize = Math.max(0.5, currentFontSize - 0.1);
                updateFontSize();
            }
        });
        increaseFontButton.addEventListener('click', () => {
            if (currentFontSize < 2.5) { // Maximum size
                currentFontSize = Math.min(2.5, currentFontSize + 0.1);
                updateFontSize();
            }
        });
    } else {
        console.warn("Font sizer elements not all found. Sizer may not work.");
    }
});
