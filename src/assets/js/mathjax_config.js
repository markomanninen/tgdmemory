window.MathJax = {
    tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']], // Added \\( \\) for inline math
        displayMath: [['$$', '$$'], ['\\[', '\\]']],
        processEscapes: true,
        tags: 'ams', // Automatic equation numbering
        packages: {'[+]': ['ams']}, // Explicitly load ams package
        macros: {
            // Define custom macros if needed, e.g.,
            // R: '\\mathbb{R}',
            // C: '\\mathbb{C}',
            // H: '\\mathbb{H}',
            // CP: 'CP_2',
            // M: 'M^4'
            // Example: S_F: '{S_F}', // For S_F(h1,h2)
        }
    },
    loader: {
        load: ['[tex]/ams']
    },
    svg: {
        fontCache: 'global'
    },
    startup: {
        ready: () => {
            MathJax.startup.defaultReady();
            // Additional setup after MathJax is ready, if needed
        }
    }
};
