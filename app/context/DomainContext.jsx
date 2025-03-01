import { createContext, useContext } from 'react';

const DomainContext = createContext(null);

export function useDomain() {
  return useContext(DomainContext);
}

export function DomainProvider({ domain, children }) {
  const domainConfig = {
    '505meds': {
      name: '505 Meds',
      state: 'New Mexico',
      stateCode: 'NM',
      content: {
        tagline: 'New Mexico\'s Premier Cannabis Directory',
        welcome: 'Find the best cannabis services across New Mexico',
        description: 'Discover top-rated dispensaries, delivery services, and more throughout New Mexico.',
      },
      colors: {
        primary: '#172A3A',    // Prussian blue
        secondary: '#508991',  // Blue Munsell
        accent: '#75DDDD',     // Tiffany Blue
        dark: '#004346',       // Midnight green
        light: '#FFFFFF',      // White
        warmAccent: '#E5C687', // Ecru
      }
    },
    '303meds': {
      name: '303 Meds',
      state: 'Colorado',
      stateCode: 'CO',
      content: {
        tagline: 'Colorado\'s Comprehensive Cannabis Resource',
        welcome: 'Discover top cannabis providers throughout Colorado',
        description: 'Your go-to directory for finding quality dispensaries, delivery services, and more in Colorado.',
      },
      colors: {
        primary: '#172A3A',    // Prussian blue
        secondary: '#508991',  // Blue Munsell
        accent: '#75DDDD',     // Tiffany Blue
        dark: '#004346',       // Midnight green
        light: '#FFFFFF',      // White
        warmAccent: '#E5C687', // Ecru
      }
    }
  };

  // Default to 505meds if domain is not recognized
  const config = domainConfig[domain] || domainConfig['505meds'];

  return (
    <DomainContext.Provider value={config}>
      {children}
    </DomainContext.Provider>
  );
} 