import '@/styles/global.css';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme';
import { MobileProvider } from '../contexts/MobileContext';

export default function MyApp({ Component, pageProps }) {
	return (
		<MobileProvider>
			<ThemeProvider theme={theme}>
				<Component {...pageProps} />
			</ThemeProvider>
		</MobileProvider>
	);
}