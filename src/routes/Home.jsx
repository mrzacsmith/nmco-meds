import { Link, useLocation } from 'react-router-dom'
import { useDomain } from '../context/DomainContext'
import { SearchBar } from '../components/SearchBar'
import { BusinessCard } from '../components/BusinessCard'
import { useEffect, useState } from 'react'
import { Layout } from '../components/Layout'

export default function Home() {
  const domain = useDomain()
  const location = useLocation()
  const [domainParam, setDomainParam] = useState(null)
  const [featuredBusinesses, setFeaturedBusinesses] = useState([])

  // Get the domain parameter from the URL if it exists (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      setDomainParam(url.searchParams.get('domain'))
    }
  }, [location])

  // Function to create links that preserve the domain parameter
  const getLink = (path) => {
    return domainParam ? `${path}?domain=${domainParam}` : path
  }

  // Mock data for categories
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
  ]

  // Mock data for popular cities
  const popularCities = [
    { id: 1, name: domain.stateCode === 'NM' ? 'Albuquerque' : 'Denver' },
    { id: 2, name: domain.stateCode === 'NM' ? 'Santa Fe' : 'Boulder' },
    { id: 3, name: domain.stateCode === 'NM' ? 'Las Cruces' : 'Colorado Springs' },
    { id: 4, name: domain.stateCode === 'NM' ? 'Rio Rancho' : 'Fort Collins' },
    { id: 5, name: domain.stateCode === 'NM' ? 'Roswell' : 'Aurora' },
    { id: 6, name: domain.stateCode === 'NM' ? 'Farmington' : 'Pueblo' },
  ]

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
    ]

    setFeaturedBusinesses(mockFeaturedBusinesses)
  }, [domain.stateCode])

  return (
    <Layout>
      <div className='min-h-screen bg-gray-50'>
        {/* Hero Section */}
        <section className='bg-primary text-white '>
          <div className=' mx-auto '>
            <SearchBar className='max-w-4xl mx-auto' />
          </div>
        </section>

        {/* Categories Section */}
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

        {/* Featured Businesses Section */}
        {featuredBusinesses.length > 0 && (
          <section className='py-12 bg-gray-100'>
            <div className='container mx-auto px-4'>
              <div className='flex justify-between items-center mb-8'>
                <h2 className='text-2xl font-bold text-primary'>Featured Businesses</h2>
                <Link
                  to={getLink('/featured')}
                  className='text-secondary hover:text-accent font-medium'
                >
                  View All
                </Link>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {featuredBusinesses.map((business) => (
                  <BusinessCard key={business.id} business={business} domainParam={domainParam} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Popular Cities Section */}
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

        {/* CTA Section */}
        <section className='py-16 bg-secondary'>
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
      </div>
    </Layout>
  )
}
