import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDomain } from '../context/DomainContext';
import { useAuth } from '../context/AuthContext';
import { NavBar } from './NavBar';

export function Layout({ children }) {
  const domain = useDomain();
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const [domainParam, setDomainParam] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Extract domain parameter from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const domain = searchParams.get('domain');
    setDomainParam(domain);
  }, [location.search]);

  // Get link with domain parameter preserved
  const getLink = (path) => {
    return domainParam ? `${path}?domain=${domainParam}` : path;
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Use the NavBar component instead of the inline header */}
      <NavBar />

      {/* Main Content */}
      <main className="flex-grow" style={{ margin: 0, padding: 0, paddingTop: '4rem' }}>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-dark text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <h3 className="text-xl font-bold mb-4">{domain.name}</h3>
              <p className="text-gray-300 mb-4">
                Your trusted source for cannabis information in {domain.state}.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-white hover:text-light transition duration-300">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-light transition duration-300">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10zm4.957 7.571l-.012.168c0 3.498-2.662 7.527-7.527 7.527a7.495 7.495 0 01-4.05-1.186c.207.024.416.036.627.036a5.3 5.3 0 003.281-1.129 2.64 2.64 0 01-2.465-1.833 2.66 2.66 0 001.192-.045 2.638 2.638 0 01-2.118-2.585v-.033c.356.198.763.317 1.196.331a2.635 2.635 0 01-.816-3.519 7.476 7.476 0 005.435 2.758 2.637 2.637 0 014.495-2.405 5.28 5.28 0 001.676-.64 2.646 2.646 0 01-1.159 1.458 5.25 5.25 0 001.516-.416 5.356 5.356 0 01-1.315 1.367z" />
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-light transition duration-300">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10zm-1.834 15.17H8.232v-5.935h1.934v5.935zM9.166 10.09a.97.97 0 01-.967-.967c0-.535.432-.967.967-.967s.967.432.967.967a.97.97 0 01-.967.967zm7.834 7.08h-1.935v-3.297c0-1.654-1.935-1.512-1.935 0v3.297h-1.935v-5.935h1.935v1.137c.846-1.562 3.87-1.677 3.87 1.497v3.301z" />
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-light transition duration-300">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10zm3.8 7.5c.4 0 .7.3.7.7s-.3.7-.7.7-.7-.3-.7-.7.3-.7.7-.7zM12 7.5c-2.5 0-4.5 2-4.5 4.5s2 4.5 4.5 4.5 4.5-2 4.5-4.5-2-4.5-4.5-4.5zm0 7.5c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to={getLink('/')} className="text-gray-300 hover:text-white transition duration-300">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to={getLink('/dispensaries')} className="text-gray-300 hover:text-white transition duration-300">
                    Dispensaries
                  </Link>
                </li>
                <li>
                  <Link to={getLink('/about')} className="text-gray-300 hover:text-white transition duration-300">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to={getLink('/contact')} className="text-gray-300 hover:text-white transition duration-300">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-xl font-bold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition duration-300">
                    Cannabis Laws
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition duration-300">
                    Medical Cards
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition duration-300">
                    Strain Guide
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition duration-300">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="text-xl font-bold mb-4">Stay Updated</h3>
              <p className="text-gray-300 mb-4">
                Subscribe to our newsletter for the latest cannabis news and deals.
              </p>
              <form className="flex flex-col space-y-2">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <button
                  type="submit"
                  className="bg-accent hover:bg-mid text-white px-4 py-2 rounded-md transition duration-300"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} {domain.name}. All rights reserved.</p>
            <div className="flex justify-center space-x-4 mt-4">
              <Link to={getLink('/privacy')} className="hover:text-white transition duration-300">
                Privacy Policy
              </Link>
              <Link to={getLink('/terms')} className="hover:text-white transition duration-300">
                Terms of Service
              </Link>
              <Link to={getLink('/cookies')} className="hover:text-white transition duration-300">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 