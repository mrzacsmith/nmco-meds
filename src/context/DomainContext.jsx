import { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Create the context
const DomainContext = createContext();

// Custom hook to use the domain context
export const useDomain = () => {
  return useContext(DomainContext);
};

// Provider component
export const DomainProvider = ({ children }) => {
  const location = useLocation();
  // Use environment variable as default if available
  const defaultDomain = import.meta.env.VITE_DOMAIN || '505meds';
  const [currentDomain, setCurrentDomain] = useState(defaultDomain);

  // Domain configurations
  const domainConfig = {
    '505meds': {
      name: '505 Meds',
      domain: '505meds.com',
      state: 'New Mexico',
      stateCode: 'NM',
      content: {
        hero: {
          title: 'Find Cannabis in New Mexico',
          subtitle: 'Discover the best dispensaries and products in the Land of Enchantment',
        },
      },
      colors: {
        dark: '#172A3A',      // Prussian blue - for text, headers, footer bg
        mid: '#508991',       // Blue Munsell - for secondary elements, buttons
        light: '#75DDDD',     // Tiffany Blue - for accents, highlights
        accent: '#004346',    // Midnight green - for borders, focused elements
        background: '#FFFFFF', // White - main background
        warmAccent: '#E5C687', // Ecru - warm accent for special highlights
        white: '#FFFFFF',     // Pure white for text on dark backgrounds
      },
    },
    '303meds': {
      name: '303 Meds',
      domain: '303meds.com',
      state: 'Colorado',
      stateCode: 'CO',
      content: {
        hero: {
          title: 'Find Cannabis in Colorado',
          subtitle: 'Discover the best dispensaries and products in the Centennial State',
        },
      },
      colors: {
        dark: '#172A3A',      // Prussian blue - for text, headers, footer bg
        mid: '#508991',       // Blue Munsell - for secondary elements, buttons
        light: '#75DDDD',     // Tiffany Blue - for accents, highlights
        accent: '#004346',    // Midnight green - for borders, focused elements
        background: '#FFFFFF', // White - main background
        warmAccent: '#E5C687', // Ecru - warm accent for special highlights
        white: '#FFFFFF',     // Pure white for text on dark backgrounds
      },
    },
  };

  // Update domain based on URL parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const domainParam = searchParams.get('domain');

    if (domainParam && domainConfig[domainParam]) {
      setCurrentDomain(domainParam);
    }
  }, [location.search]);

  // Get the current domain configuration
  const domainData = domainConfig[currentDomain] || domainConfig['505meds'];

  // Apply theme colors as CSS variables
  useEffect(() => {
    const colors = domainData.colors;
    document.documentElement.style.setProperty('--color-dark', colors.dark);
    document.documentElement.style.setProperty('--color-mid', colors.mid);
    document.documentElement.style.setProperty('--color-light', colors.light);
    document.documentElement.style.setProperty('--color-accent', colors.accent);
    document.documentElement.style.setProperty('--color-background', colors.background);
    document.documentElement.style.setProperty('--color-warm-accent', colors.warmAccent);
    document.documentElement.style.setProperty('--color-white', colors.white);
  }, [domainData]);

  const setDomainState = (state) => {
    if (state === 'New Mexico') {
      setCurrentDomain('505meds');
    } else if (state === 'Colorado') {
      setCurrentDomain('303meds');
    }
  };

  return (
    <DomainContext.Provider value={{ ...domainData, setDomainState }}>
      {children}
    </DomainContext.Provider>
  );
}; 