import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDomain } from '../context/DomainContext';

export function PopularCities() {
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

  // Popular cities data based on state
  const popularCities = [
    { id: 1, name: domain.stateCode === 'NM' ? 'Albuquerque' : 'Denver' },
    { id: 2, name: domain.stateCode === 'NM' ? 'Santa Fe' : 'Boulder' },
    { id: 3, name: domain.stateCode === 'NM' ? 'Las Cruces' : 'Colorado Springs' },
    { id: 4, name: domain.stateCode === 'NM' ? 'Rio Rancho' : 'Fort Collins' },
    { id: 5, name: domain.stateCode === 'NM' ? 'Roswell' : 'Aurora' },
    { id: 6, name: domain.stateCode === 'NM' ? 'Farmington' : 'Pueblo' },
  ];

  return (
    <section className='py-12'>
      <div className='container mx-auto px-4'>
        <h2 className='text-2xl font-bold text-primary mb-8 text-center'>
          Popular Cities in {domain.state}
        </h2>

        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4'>
          {popularCities.map((city) => (
            <Link
              key={city.id}
              to={getLink(`/search?location=${city.name}`)}
              className='bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 text-center'
            >
              <span className='font-medium text-primary'>{city.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
} 