import { useState, useEffect } from 'react';
import { Form, useLocation } from '@remix-run/react';
import { useDomain } from '~/context/DomainContext';

export function SearchBar({ className = '' }) {
  const domain = useDomain();
  const location = useLocation();
  const [searchType, setSearchType] = useState('dispensary');
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

  const searchTypes = [
    { id: 'dispensary', label: 'Dispensaries' },
    { id: 'doctor', label: 'Doctors' },
  ];

  return (
    <div className={`w-full ${className}`}>
      <Form method="get" action={getLink('/search')} className="w-full">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-primary mb-2">
              Find Cannabis Services in {domain.state}
            </h2>
            <p className="text-gray-600">
              Search for dispensaries and more
            </p>
          </div>

          {/* Search Type Tabs */}
          <div className="flex mb-4 border-b border-gray-200">
            {searchTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                className={`py-2 px-4 font-medium text-sm focus:outline-none ${searchType === type.id
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-gray-500 hover:text-primary'
                  }`}
                onClick={() => setSearchType(type.id)}
              >
                {type.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            {/* Location Input */}
            <div className="flex-grow">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="location"
                  id="location"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent"
                  placeholder={`City or Zip in ${domain.state}`}
                />
              </div>
            </div>

            {/* Keyword Input */}
            <div className="flex-grow">
              <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 mb-1">
                Keyword (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="keyword"
                  id="keyword"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent"
                  placeholder="Search by name, product, etc."
                />
              </div>
            </div>

            {/* Hidden input for search type */}
            <input type="hidden" name="type" value={searchType} />

            {/* Hidden input for domain parameter */}
            {domainParam && <input type="hidden" name="domain" value={domainParam} />}

            {/* Search Button */}
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full md:w-auto px-6 py-2 bg-secondary hover:bg-accent text-white hover:text-dark rounded-md transition duration-300 font-medium"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
} 