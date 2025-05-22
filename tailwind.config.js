/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.jsx",
    "./src/**/*.{js,ts,jsx,tsx,html}",
    "./public/**/*.{html,js}",
  ],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            color: '#374151',
            h3: {
              color: '#1e40af',
              fontWeight: '600',
              borderBottom: '1px solid #f3f4f6',
              paddingBottom: '0.25rem',
              marginTop: '1.5rem',
              marginBottom: '0.5rem',
            },
            p: {
              marginTop: '0.75rem',
              marginBottom: '0.75rem',
              lineHeight: '1.625',
            },
            a: {
              color: '#0284c7',
              '&:hover': {
                color: '#0369a1',
              },
            },
            pre: {
              backgroundColor: '#f9fafb',
              padding: '1rem',
              borderRadius: '0.375rem',
              border: '1px solid #e5e7eb',
            },
            code: {
              backgroundColor: '#f3f4f6',
              padding: '0.125rem 0.25rem',
              borderRadius: '0.25rem',
              fontSize: '0.875em',
              border: '1px solid #e5e7eb',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
