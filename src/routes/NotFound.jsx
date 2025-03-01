import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDomain } from '../context/DomainContext';
import { Layout } from '../components/Layout';

export default function NotFound() {
  const domain = useDomain();
  const location = useLocation();
  const [domainParam, setDomainParam] = useState(null);

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

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-lg mx-auto">
            <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Page Not Found</h2>
            <p className="text-lg text-gray-600 mb-8">
              The page you are looking for doesn't exist or has been moved.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to={getLink('/')}
                className="bg-secondary hover:bg-accent text-white hover:text-dark px-6 py-3 rounded-md transition duration-300 font-medium"
              >
                Go to Homepage
              </Link>
              <Link
                to={getLink('/dispensaries')}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-md transition duration-300 font-medium"
              >
                Browse Dispensaries
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 