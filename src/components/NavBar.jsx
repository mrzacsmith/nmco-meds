import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDomain } from '../context/DomainContext';

export function NavBar() {
  const domain = useDomain();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [domainParam, setDomainParam] = useState(null);

  // Extract domain parameter from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const domain = searchParams.get('domain');
    setDomainParam(domain);
  }, [location.search]);

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close mobile menu
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Get link with domain parameter preserved
  const getLink = (path) => {
    return domainParam ? `${path}?domain=${domainParam}` : path;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 py-4" style={{
      backgroundColor: '#172A3A',
      color: 'white',
      borderBottom: 'none',
      marginBottom: 0,
      width: '100%'
    }}>
      <div className="container mx-auto px-4">
        <div className="flex items-center">
          {/* Logo - Takes 1/4 of the space */}
          <div className="w-1/4">
            <Link
              to={getLink('/')}
              className="flex items-center"
              onClick={closeMenu}
            >
              <span className="text-xl font-bold text-white">
                {domain.name}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - Takes 1/2 of the space and centers content */}
          <div className="hidden md:flex w-1/2 justify-center">
            <div className="flex items-center space-x-8">
              <Link
                to={getLink('/')}
                className="text-white hover:text-light transition duration-300"
              >
                Home
              </Link>
              <Link
                to={getLink('/dispensaries')}
                className="text-white hover:text-light transition duration-300"
              >
                Dispensaries
              </Link>
            </div>
          </div>

          {/* Login Button - Takes 1/4 of the space and aligns content to the right */}
          <div className="hidden md:flex w-1/4 justify-end">
            <Link
              to={getLink('/login')}
              className="border border-white text-white hover:bg-mid px-4 py-2 rounded transition duration-300"
            >
              Login
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden ml-auto">
            <button
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 rounded-lg p-4" style={{ backgroundColor: '#172A3A' }}>
            <div className="flex flex-col space-y-4">
              <Link
                to={getLink('/')}
                className="text-white hover:text-light transition duration-300"
                onClick={closeMenu}
              >
                Home
              </Link>
              <Link
                to={getLink('/dispensaries')}
                className="text-white hover:text-light transition duration-300"
                onClick={closeMenu}
              >
                Dispensaries
              </Link>
              <Link
                to={getLink('/login')}
                className="border border-white text-white hover:bg-mid px-4 py-2 rounded transition duration-300 inline-block"
                onClick={closeMenu}
              >
                Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 