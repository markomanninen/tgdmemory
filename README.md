# TGD Memory Project

A project for exploring Topological Geometrodynamics (TGD) models of memory, featuring interactive presentations and equation explanations.

## Features

- Interactive presentations on TGD models of memory
- Equation explanation system that provides detailed explanations of mathematical formulas
- Academic papers in HTML format with LaTeX equation support
- Mobile-responsive design

## Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/tgdmemory.git
cd tgdmemory

# Run the initialization script
./init.sh

# Start both the main app and equation server
npm run dev:all
```

Visit http://localhost:5173/ in your browser to see the project.

## Documentation

- [Getting Started Guide](./GETTING_STARTED.md) - Basic setup and usage
- [Equation Explanation System](./EQUATION_EXPLANATION.md) - Detailed information about the equation explanation system
- [Admin Troubleshooting](./ADMIN_TROUBLESHOOTING.md) - Solving issues with the admin dashboard
- [Rate Limiting](./docs/RATE_LIMITING.md) - Information about the rate limiting implementation

## Project Structure

- `/src` - Main source code for the presentation
- `/src/pages/dirac_propagator` - HTML files for the Dirac propagator paper
- `/src/assets/js` - JavaScript files, including the equation explainer
- `/server` - Backend server for generating equation explanations

## Equation Explanation System

The project includes a system for explaining mathematical equations:

1. Click on an equation in the document to see its detailed explanation
2. The system fetches explanations from a local cache or generates them using AI
3. Explanations include step-by-step breakdowns of the mathematics

The system uses:
- OpenAI GPT-4.1-nano as the primary explanation engine
- Google Gemini 2.5 Flash as a fallback option

To use the equation explainer, make sure the server is running:

```bash
npm run start-equation-server
```

To test the AI models:

```bash
# Test OpenAI GPT-4.1-nano
cd server && npm run test:openai-nano

# Test Google Gemini 2.5 Flash
cd server && npm run test:gemini-flash
```

## License

[License information]