
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        teal: { 50:'#E0F2F7', 500:'#219EBC', 600:'#1F8FA3' },
        lime: { 400:'#C6E423', 500:'#BEEA00' }
      },
      borderRadius: { '4xl':'32px' }
    }
  },
  plugins: []
}
