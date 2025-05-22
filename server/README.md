# Equation Explanation Server

This server provides API endpoints for generating explanations for mathematical equations. It includes caching functionality to improve performance for repeated requests.

## Features

- `/api/explain` - Primary API endpoint for generating equation explanations
- `/api/explain-with-gemini` - Fallback API using Google's Gemini model
- Automatic caching of explanations for improved performance
- CORS support for cross-origin requests

## Installation

1. Install dependencies:
```bash
cd server
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Add your API keys and configure models in the `.env` file:
```
GOOGLE_API_KEY=your_google_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Model configurations
OPENAI_MODEL=gpt-4-turbo  # Options: gpt-4-turbo, gpt-4o, gpt-3.5-turbo, etc.
GEMINI_MODEL=gemini-2.5-flash-preview-05-20   # Recommended: latest Gemini model for better math explanations

# Output configurations
MAX_TOKENS=1500           # Maximum number of tokens in the output
TEMPERATURE=0.2           # Controls randomness (0.0-1.0)
```

## Testing the AI Models

### Testing Gemini 2.5 Flash Model

To check if the Gemini 2.5 Flash model is available with your API key:

```bash
npm run check:gemini
```

To test the Gemini 2.5 Flash model with a sample equation:

```bash
npm run test:gemini-flash
```

### Testing OpenAI GPT-4.1-nano Model

To check if the GPT-4.1-nano model is available with your API key:

```bash
npm run check:openai
```

To test the OpenAI GPT-4.1-nano model with a sample equation:

```bash
npm run test:openai-nano
```

### Comparing Both Models

To run a direct comparison between OpenAI GPT-4.1-nano and Gemini 2.5 Flash:

```bash
npm run test:compare
```

This will generate explanations for the same equation using both models and display them side by side with timing information.

## Running the Server

Start the server in development mode:
```bash
npm run dev
```

Start the server in production mode:
```bash
npm start
```

The server will run on `http://localhost:3000` by default.

## API Endpoints

### Generate Explanation (Primary)

```
POST /api/explain
```

Request body:
```json
{
  "latex": "E = mc^2",
  "title": "Einstein's Energy-Mass Equivalence - Equation 1"
}
```

Response:
```json
{
  "explanation": "<p>HTML-formatted explanation</p>"
}
```

### Generate Explanation (Fallback with Gemini)

```
POST /api/explain-with-gemini
```

Request body: Same as primary endpoint.

Response: Same format as primary endpoint.

## Cached Explanations

Explanations are cached at `/server/explanations-cache/{hash}.json`, where `{hash}` is a hash of the LaTeX equation and title.

To access a cached explanation directly:
```
GET /explanations-cache/{hash}.json
```

## Implementation Notes

- The primary endpoint (`/api/explain`) currently uses a placeholder implementation. Replace it with your preferred LLM service.
- The fallback endpoint (`/api/explain-with-gemini`) uses Google's Gemini API and requires a valid API key.
- Both endpoints automatically cache results to improve performance for repeated requests.
