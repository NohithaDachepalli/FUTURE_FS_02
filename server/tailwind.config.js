export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui']
      },
      colors: {
        ink: '#111827',
        brand: '#2563eb',
        mint: '#10b981',
        amber: '#f59e0b',
        coral: '#f97316'
      },
      boxShadow: {
        soft: '0 18px 45px rgba(15, 23, 42, 0.09)'
      }
    }
  },
  plugins: []
};

