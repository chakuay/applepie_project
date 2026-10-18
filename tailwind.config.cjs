/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: { colors: { apple: { green: '#335e46', paper: '#f7f5ef', ink: '#302d28', orange: '#b9693b' } } } },
  plugins: [require('daisyui')],
}
