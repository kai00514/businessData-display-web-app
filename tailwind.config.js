/** @type {import('tailwindcss').Config} */

module.exports = {
	mode: 'jit',
	content: [
		'./app/**/*.{js,ts,jsx,tsx,mdx}',
		'./pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./components/**/*.{js,ts,jsx,tsx,mdx}',

		// Or if using `src` directory:
		'./src/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			colors: {
				main: '#e6e0e0',
				'main-dark': '#b3b3b3',
				sub: '#38bbcd',
				'sub-dark': '#2a8ca0',
				accent: '#db6273',
				'accent-dark': '#b24d5c',
			},
		},
	},
	plugins: [],
};
