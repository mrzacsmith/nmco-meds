import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDomain } from '../context/DomainContext';
import { BusinessCard } from './BusinessCard';

export function FeaturedBusinesses() {
  const domain = useDomain();
  const location = useLocation();
  const [domainParam, setDomainParam] = useState(null);
  const [featuredBusinesses, setFeaturedBusinesses] = useState([]);

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

  // Mock data for featured businesses
  useEffect(() => {
    // Simulate fetching featured businesses
    const mockFeaturedBusinesses = [
      {
        id: 1,
        name: 'Green Leaf Dispensary',
        type: 'Dispensary',
        imageUrl: 'https://via.placeholder.com/300x200',
        rating: 4.8,
        reviewCount: 124,
        address: '123 Main St',
        city: domain.stateCode === 'NM' ? 'Albuquerque' : 'Denver',
        state: domain.stateCode,
        isPremium: true,
        tags: ['Recreational', 'Medical', 'Edibles'],
        description:
          'A premium dispensary offering a wide range of cannabis products for both medical and recreational use.',
      },
      {
        id: 2,
        name: 'Herbal Remedies',
        type: 'Dispensary',
        imageUrl: 'https://via.placeholder.com/300x200',
        rating: 4.6,
        reviewCount: 98,
        address: '456 Oak Ave',
        city: domain.stateCode === 'NM' ? 'Santa Fe' : 'Boulder',
        state: domain.stateCode,
        isPremium: false,
        tags: ['Medical', 'CBD', 'Tinctures'],
        description:
          'Specializing in medical cannabis and CBD products with knowledgeable staff to help with your needs.',
      },
      {
        id: 3,
        name: 'Cannabis Care',
        type: 'Dispensary & Delivery',
        imageUrl: 'https://via.placeholder.com/300x200',
        rating: 4.9,
        reviewCount: 156,
        address: '789 Pine Rd',
        city: domain.stateCode === 'NM' ? 'Las Cruces' : 'Colorado Springs',
        state: domain.stateCode,
        isPremium: true,
        tags: ['Recreational', 'Delivery', 'Concentrates'],
        description:
          'Premium cannabis dispensary with delivery service available throughout the area.',
      },
    ];

    setFeaturedBusinesses(mockFeaturedBusinesses);
  }, [domain.stateCode]);

  // Return null if no featured businesses
  if (featuredBusinesses.length === 0) {
    return null;
  }

  return (
    <section className="py-12" style={{
      background: 'linear-gradient(135deg, #172A3A 0%, #508991 100%)'
    }}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white">Featured Businesses</h2>
          <Link
            to={getLink('/featured')}
            className="text-white hover:text-light font-medium"
          >
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredBusinesses.map((business) => (
            <BusinessCard key={business.id} business={business} domainParam={domainParam} />
          ))}
        </div>
      </div>
    </section>
  );
} 