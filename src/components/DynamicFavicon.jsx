import { useEffect } from 'react';
import { useDomain } from '../context/DomainContext';

export const DynamicFavicon = () => {
  const domain = useDomain();

  useEffect(() => {
    console.log('Current domain state:', domain.state); // Debug log

    const favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) {
      const newFavicon = document.createElement('link');
      newFavicon.rel = 'icon';
      document.head.appendChild(newFavicon);
    }

    // Set favicon based on domain
    const faviconPath = domain.state === 'Colorado'
      ? '/favicon-303.ico'  // 303meds favicon
      : '/favicon.ico';     // 505meds favicon

    console.log('Setting favicon path to:', faviconPath); // Debug log

    // Force favicon refresh by removing and re-adding
    const head = document.head;
    const oldFavicon = document.querySelector('link[rel="icon"]');
    if (oldFavicon) {
      head.removeChild(oldFavicon);
    }

    const newFavicon = document.createElement('link');
    newFavicon.rel = 'icon';
    newFavicon.href = faviconPath;
    head.appendChild(newFavicon);

  }, [domain.state]);

  return null;
}; 