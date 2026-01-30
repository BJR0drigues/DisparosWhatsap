/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                whatsapp: {
                    green: '#25D366',
                    teal: '#128C7E',
                    dark: '#075E54',
                    chat: '#ECE5DD', // Light mode chat bg
                    darkchat: '#0b141a', // Dark mode chat bg
                    messageReceived: '#202c33',
                    messageSent: '#005c4b',
                }
            }
        },
    },
    plugins: [],
}
