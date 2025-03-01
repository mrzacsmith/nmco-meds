import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDomain } from '../context/DomainContext';

export function RegisterYourBusiness() {
  const domain = useDomain();
  const location = useLocation();
  const [domainParam, setDomainParam] = useState(null);

  // Get the domain parameter from the URL if it exists
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
    <section style={{
      background: 'linear-gradient(135deg, #172A3A 0%, #508991 100%)',
      padding: '4rem 0'
    }}>
      <div className='container mx-auto px-4 text-center'>
        <h2 className='text-2xl md:text-3xl font-bold text-white mb-4'>
          Are You a Cannabis Business Owner?
        </h2>
        <p className='text-white opacity-90 max-w-2xl mx-auto mb-8'>
          Join {domain.name} to reach more customers and grow your business. List your business
          for free or upgrade to premium for enhanced visibility.
        </p>
        <div className='flex flex-col sm:flex-row justify-center gap-4'>
          <Link
            to={getLink('/register')}
            className='bg-accent hover:bg-white text-dark font-medium px-6 py-3 rounded-md transition duration-300'
          >
            Register Your Business
          </Link>
          <Link
            to={getLink('/pricing')}
            className='bg-transparent hover:bg-white text-white hover:text-dark border border-white font-medium px-6 py-3 rounded-md transition duration-300'
          >
            View Pricing Plans
          </Link>
        </div>
      </div>
    </section>
  );
} 