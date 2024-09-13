import React, { createContext, useContext, useState, useEffect } from 'react';

const MobileContext = createContext(false);

export const useMobile = () => useContext(MobileContext);

export const MobileProvider = ({ children }) => {
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const checkIfMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};

		checkIfMobile();
		window.addEventListener('resize', checkIfMobile);

		return () => {
			window.removeEventListener('resize', checkIfMobile);
		};
	}, []);

	return <MobileContext.Provider value={isMobile}>{children}</MobileContext.Provider>;
};
