import { Link, useLocation } from '@remix-run/react';
import { useDomain } from '~/context/DomainContext';
import { useEffect, useState } from 'react';

export function Header() {
  const domain = useDomain();
  const location = useLocation();
  const [domainParam, setDomainParam] = useState(null);

  // Get the domain parameter from the URL if it exists (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      setDomainParam(url.searchParams.get('domain'));
    }
  }, [location]);

  // Function to create links that preserve the domain parameter
  const getLink = (path) => {
    return domainParam ? `${path}?domain=${domainParam}` : path;
  };

  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Site Name */}
          <Link to={getLink('/')} className="flex items-center space-x-2">
            <span className="text-accent font-bold text-2xl">{domain.name}</span>
          </Link>

          {/* Main Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link to={getLink('/')} className="py-2 hover:text-accent transition duration-300">
              Home
            </Link>
            <Link to={getLink('/dispensaries')} className="py-2 hover:text-accent transition duration-300">
              Dispensaries
            </Link>
            <Link to={getLink('/about')} className="py-2 hover:text-accent transition duration-300">
              About
            </Link>
            <Link to={getLink('/contact')} className="py-2 hover:text-accent transition duration-300">
              Contact
            </Link>
          </nav>

          {/* Admin/Business Login Button */}
          <div className="flex items-center space-x-4">
            <Link
              to={getLink('/login')}
              className="bg-secondary hover:bg-accent text-white hover:text-dark px-4 py-2 rounded-md transition duration-300"
            >
              Business Login
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="text-white focus:outline-none">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu (hidden by default) */}
      <div className="md:hidden hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link to={getLink('/')} className="block px-3 py-2 hover:bg-secondary rounded-md">
            Home
          </Link>
          <Link to={getLink('/dispensaries')} className="block px-3 py-2 hover:bg-secondary rounded-md">
            Dispensaries
          </Link>
          <Link to={getLink('/about')} className="block px-3 py-2 hover:bg-secondary rounded-md">
            About
          </Link>
          <Link to={getLink('/contact')} className="block px-3 py-2 hover:bg-secondary rounded-md">
            Contact
          </Link>
        </div>
      </div>
    </header>
  );
} 