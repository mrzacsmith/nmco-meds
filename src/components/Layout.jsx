import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDomain } from '../context/DomainContext';
import { useAuth } from '../context/AuthContext';

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
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link to={getLink('/')} className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl mr-2">
                {domain.name.charAt(0)}
              </div>
              <span className="text-xl font-bold text-primary">{domain.name}</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link to={getLink('/')} className="text-gray-700 hover:text-primary transition duration-300">
                Home
              </Link>
              <Link to={getLink('/dispensaries')} className="text-gray-700 hover:text-primary transition duration-300">
                Dispensaries
              </Link>
              <Link to={getLink('/about')} className="text-gray-700 hover:text-primary transition duration-300">
                About
              </Link>
              <Link to={getLink('/contact')} className="text-gray-700 hover:text-primary transition duration-300">
                Contact
              </Link>

              {isAuthenticated() ? (
                <div className="relative group">
                  <button className="flex items-center text-gray-700 hover:text-primary transition duration-300">
                    <span className="mr-1">{user?.name || 'Account'}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                    <Link to={getLink('/dashboard')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Dashboard
                    </Link>
                    {user?.role === 'admin' && (
                      <Link to={getLink('/admin')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to={getLink('/login')}
                    className="px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-white rounded-md transition duration-300"
                  >
                    Login
                  </Link>
                  <Link
                    to={getLink('/register')}
                    className="px-4 py-2 bg-secondary hover:bg-accent text-white hover:text-dark rounded-md transition duration-300"
                  >
                    Register
                  </Link>
                </div>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden text-gray-700 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-2">
            <div className="container mx-auto px-4">
              <nav className="flex flex-col space-y-3 py-3">
                <Link
                  to={getLink('/')}
                  className="text-gray-700 hover:text-primary transition duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to={getLink('/dispensaries')}
                  className="text-gray-700 hover:text-primary transition duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dispensaries
                </Link>
                <Link
                  to={getLink('/about')}
                  className="text-gray-700 hover:text-primary transition duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  to={getLink('/contact')}
                  className="text-gray-700 hover:text-primary transition duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </Link>

                {isAuthenticated() ? (
                  <>
                    <Link
                      to={getLink('/dashboard')}
                      className="text-gray-700 hover:text-primary transition duration-300"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    {user?.role === 'admin' && (
                      <Link
                        to={getLink('/admin')}
                        className="text-gray-700 hover:text-primary transition duration-300"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="text-left text-gray-700 hover:text-primary transition duration-300"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col space-y-2 pt-2">
                    <Link
                      to={getLink('/login')}
                      className="px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-white rounded-md transition duration-300 text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to={getLink('/register')}
                      className="px-4 py-2 bg-secondary hover:bg-accent text-white hover:text-dark rounded-md transition duration-300 text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Register
                    </Link>
                  </div>
                )}
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and Description */}
            <div className="md:col-span-1">
              <Link to={getLink('/')} className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-primary font-bold text-xl mr-2">
                  {domain.name.charAt(0)}
                </div>
                <span className="text-xl font-bold text-white">{domain.name}</span>
              </Link>
              <p className="mt-4 text-gray-400">
                Your trusted source for finding cannabis dispensaries in {domain.state}.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-medium mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to={getLink('/')} className="text-gray-400 hover:text-white transition duration-300">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to={getLink('/dispensaries')} className="text-gray-400 hover:text-white transition duration-300">
                    Dispensaries
                  </Link>
                </li>
                <li>
                  <Link to={getLink('/about')} className="text-gray-400 hover:text-white transition duration-300">
                    About
                  </Link>
                </li>
                <li>
                  <Link to={getLink('/contact')} className="text-gray-400 hover:text-white transition duration-300">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* For Businesses */}
            <div>
              <h3 className="text-lg font-medium mb-4">For Businesses</h3>
              <ul className="space-y-2">
                <li>
                  <Link to={getLink('/register')} className="text-gray-400 hover:text-white transition duration-300">
                    Register Your Dispensary
                  </Link>
                </li>
                <li>
                  <Link to={getLink('/contact')} className="text-gray-400 hover:text-white transition duration-300">
                    Advertising Options
                  </Link>
                </li>
                <li>
                  <Link to={getLink('/dashboard')} className="text-gray-400 hover:text-white transition duration-300">
                    Business Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-medium mb-4">Contact Us</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href={`mailto:info@${domain.name.toLowerCase().replace(/\s+/g, '')}.com`} className="text-gray-400 hover:text-white transition duration-300">
                    info@{domain.name.toLowerCase().replace(/\s+/g, '')}.com
                  </a>
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-400">{domain.state}, USA</span>
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-400">Mon-Fri: 9am - 5pm</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} {domain.name}. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition duration-300">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition duration-300">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition duration-300">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 