import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function BrowseByCategory() {
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

  // Categories data
  const categories = [
    {
      id: 'dispensaries',
      name: 'Dispensaries',
      icon: (
        <svg className='h-8 w-8' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
          />
        </svg>
      ),
    },
    {
      id: 'doctors',
      name: 'Doctors',
      icon: (
        <svg className='h-8 w-8' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
          />
        </svg>
      ),
    },
    {
      id: 'products',
      name: 'Products',
      icon: (
        <svg className='h-8 w-8' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
          />
        </svg>
      ),
    },
  ];

  return (
    <section className='py-12'>
      <div className='container mx-auto px-4'>
        <h2 className='text-2xl font-bold text-primary mb-8 text-center'>Browse by Category</h2>

        <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
          {categories.map((category) => (
            <Link
              key={category.id}
              to={getLink(`/${category.id}`)}
              className='flex flex-col items-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300'
            >
              <div className='text-secondary mb-3'>{category.icon}</div>
              <span className='font-medium text-primary'>{category.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
} 