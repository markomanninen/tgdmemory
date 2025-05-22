# Getting Started with TGD Memory Project

This guide will help you set up and run the TGD Memory project, including the equation explanation system.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository (if you haven't already):
   ```bash
   git clone https://github.com/yourusername/tgdmemory.git
   cd tgdmemory
   ```

2. Install dependencies for the main project:
   ```bash
   npm install
   ```

3. Set up the equation explanation server:
   ```bash
   npm run setup-equation-server
   ```

4. Edit API keys in the server's `.env` file:
   ```bash
   cd server
   nano .env  # or use any text editor
   ```
   
   Add your API keys:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   GOOGLE_API_KEY=your_google_api_key_here
   ```

## Running the Project

### Option 1: Start everything at once

```bash
npm run dev:all
```

This will start both the main Vite server and the equation explanation server concurrently.

### Option 2: Start components separately

1. Start the main Vite development server:
   ```bash
   npm run dev
   ```

2. In a separate terminal, start the equation explanation server:
   ```bash
   npm run start-equation-server
   ```

## Testing

Test the equation explanation server:
```bash
npm run test-equation-server
```

## Accessing the Project

- Main website: http://localhost:5173/
- Equation explanation server: http://localhost:3000/

## Additional Documentation

For more detailed information about the equation explanation system, see [EQUATION_EXPLANATION.md](./EQUATION_EXPLANATION.md).

## Troubleshooting

- If you encounter issues with the equation explanation system, ensure your API keys are correctly set in the `.env` file.
- Check that both servers are running on their expected ports.
- For more advanced debugging, examine the server logs in the terminal windows.
