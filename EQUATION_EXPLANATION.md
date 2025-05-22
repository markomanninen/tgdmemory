# TGD Memory Project - Equation Explanation System

This document explains how to set up and use the equation explanation functionality in the TGD Memory project.

## Overview

The equation explanation system allows readers to click on equations in the document and receive detailed explanations of the mathematics. The system:

1. Displays equations without equation numbers in the modal
2. Shows the equation with a descriptive title
3. Fetches an explanation from either:
   - A local cache file
   - A primary API (OpenAI GPT-4.1-nano-based)
   - A fallback API (Google Gemini 2.5 Flash-based)

## Setup Instructions

### 1. Start the Backend Server

The backend server handles explanation generation and caching. To set it up:

```bash
# Navigate to the server directory
cd server

# Run the setup script
./setup.sh

# Edit the .env file to add your API keys and configure models
# GOOGLE_API_KEY=your_google_api_key_here
# OPENAI_API_KEY=your_openai_api_key_here
# OPENAI_MODEL=gpt-4.1-nano    # New default: using the fast nano model
# GEMINI_MODEL=gemini-2.5-flash-preview-05-20   # Recommended: latest Gemini model
# MAX_TOKENS=1500           # Set the maximum output length
# TEMPERATURE=0.2           # Control randomness (0.0-1.0)

# Start the server in development mode
npm run dev
```

The server will run on http://localhost:3000 with the following endpoints:
- `/api/explain` - Primary API using OpenAI GPT-4.1-nano
- `/api/explain-with-gemini` - Fallback API using Google Gemini 2.5 Flash

### 2. Test the System

1. Ensure the server is running
2. Open one of the HTML pages with equations
3. Click on an equation's explanation icon
4. The modal should display the equation and fetch an explanation

## How it Works

1. **Frontend (`globalEquationExplainer.js`):**
   - Detects clicks on equation trigger elements
   - Shows a modal with the unnumbered equation
   - Fetches explanations through a multi-step process
   - Handles caching for improved performance

2. **Backend (`server.js` and integration modules):**
   - Provides API endpoints for generating explanations
   - Uses LLM services to create detailed explanations
   - Caches results for future requests

## Adding Explainable Equations

To make an equation explainable:

1. Wrap it in a container with the class `explainable-equation-container`
2. Add the `data-latex-equation` attribute with the LaTeX content
3. Add a descriptive `title` attribute
4. Include a trigger element with class `equation-explainer-trigger`

Example:

```html
<div class="explainable-equation-container" 
     data-latex-equation="\begin{equation} E = mc^2 \end{equation}"
     title="Energy-Mass Equivalence">
  
  <!-- Equation content rendered by MathJax -->
  
  <button class="equation-explainer-trigger">
    <span>Explain</span>
  </button>
</div>
```

## Troubleshooting

- **No explanation appears**: Check that the server is running and API keys are set
- **Equation numbers still showing in modal**: Check the LaTeX transformation logic
- **Cache not working**: Ensure the cache directories exist and are writable

## Managing the Cache

The system caches explanations in two locations:
- Server cache: `/server/explanations-cache/`
- Public cache: `/public/explanations-cache/`

To clear all cached explanations (useful during development or to force regeneration):

```bash
# From project root
npm run clean-caches

# Or from server directory
cd server
npm run clean
```

This will remove all cached explanations, and new ones will be generated on demand.

## Credits

- Frontend equation handling uses MathJax
- Explanations generated with OpenAI GPT-4.1-nano and Google Gemini 2.5 Flash APIs
- Both models are optimized for fast, efficient explanations with high quality
