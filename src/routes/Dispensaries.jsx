import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDomain } from '../context/DomainContext';
import { Layout } from '../components/Layout';
import { BusinessCard } from '../components/BusinessCard';
import { SearchBar } from '../components/SearchBar';

export default function Dispensaries() {
  const domain = useDomain();
  const location = useLocation();
  const navigate = useNavigate();
  const [domainParam, setDomainParam] = useState(null);
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    location: '',
  });
  const [activeFilter, setActiveFilter] = useState('all');
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Extract domain parameter and search params from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const domain = urlParams.get('domain');
    const keyword = urlParams.get('keyword') || '';
    const locationParam = urlParams.get('location') || '';

    setDomainParam(domain);
    setSearchParams({
      keyword,
      location: locationParam,
    });

    // In a real app, this would be an API call with the search parameters
    fetchDispensaries(keyword, locationParam);
  }, [location.search]);

  // Get link with domain parameter preserved
  const getLink = (path) => {
    return domainParam ? `${path}?domain=${domainParam}` : path;
  };

  // Mock function to fetch dispensaries
  const fetchDispensaries = (keyword, locationParam) => {
    setLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      // Mock data for dispensaries
      const mockDispensaries = [
        {
          id: 1,
          name: "Green Harvest Dispensary",
          type: "Recreational & Medical",
          imageUrl: "https://images.unsplash.com/photo-1589579234096-07infd9e6d6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          rating: 4.8,
          reviewCount: 124,
          address: "123 Main St",
          city: "Albuquerque",
          state: "NM",
          isPremium: true,
          tags: ["Recreational", "Medical", "Edibles", "Concentrates"],
          description: "A premier cannabis dispensary offering a wide selection of high-quality products for both recreational and medical users."
        },
        {
          id: 2,
          name: "Healing Leaf Collective",
          type: "Medical Only",
          imageUrl: "https://images.unsplash.com/photo-1603909071637-22c6a0a5cf9d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          rating: 4.5,
          reviewCount: 89,
          address: "456 Oak Ave",
          city: "Santa Fe",
          state: "NM",
          isPremium: false,
          tags: ["Medical", "CBD", "Tinctures"],
          description: "Specializing in medical cannabis with a focus on CBD products and personalized patient care."
        },
        {
          id: 3,
          name: "Mountain High",
          type: "Recreational & Medical",
          imageUrl: "https://images.unsplash.com/photo-1589579234264-7a84d36d6df9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          rating: 4.2,
          reviewCount: 56,
          address: "789 Pine Rd",
          city: "Las Cruces",
          state: "NM",
          isPremium: true,
          tags: ["Recreational", "Medical", "Flower", "Pre-rolls"],
          description: "Locally owned dispensary with a friendly atmosphere and knowledgeable staff to help you find the perfect product."
        },
        {
          id: 4,
          name: "Evergreen Cannabis",
          type: "Recreational",
          imageUrl: "https://images.unsplash.com/photo-1603909071651-44be5f7e7d97?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          rating: 4.0,
          reviewCount: 42,
          address: "101 Cedar Blvd",
          city: "Roswell",
          state: "NM",
          isPremium: false,
          tags: ["Recreational", "Edibles", "Vapes"],
          description: "A recreational dispensary with a focus on edibles and vape products for the discerning cannabis consumer."
        },
        {
          id: 5,
          name: "Nature's Remedy",
          type: "Medical Only",
          imageUrl: "https://images.unsplash.com/photo-1589579234278-7e3a2a5eaaf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          rating: 4.7,
          reviewCount: 103,
          address: "202 Maple St",
          city: "Albuquerque",
          state: "NM",
          isPremium: true,
          tags: ["Medical", "Organic", "Tinctures", "Topicals"],
          description: "Providing organic, high-quality medical cannabis products with a focus on patient education and wellness."
        },
        {
          id: 6,
          name: "Canna Bliss",
          type: "Recreational & Medical",
          imageUrl: "https://images.unsplash.com/photo-1603909071733-57f6a1d4c5f3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          rating: 4.3,
          reviewCount: 67,
          address: "303 Birch Ave",
          city: "Santa Fe",
          state: "NM",
          isPremium: false,
          tags: ["Recreational", "Medical", "Concentrates", "Accessories"],
          description: "A welcoming dispensary offering a variety of cannabis products for both recreational and medical customers."
        }
      ];

      // Filter based on search parameters
      let filteredResults = [...mockDispensaries];

      if (keyword) {
        filteredResults = filteredResults.filter(business =>
          business.name.toLowerCase().includes(keyword.toLowerCase()) ||
          business.description.toLowerCase().includes(keyword.toLowerCase()) ||
          business.tags.some(tag => tag.toLowerCase().includes(keyword.toLowerCase()))
        );
      }

      if (locationParam) {
        filteredResults = filteredResults.filter(business =>
          business.city.toLowerCase().includes(locationParam.toLowerCase()) ||
          business.state.toLowerCase().includes(locationParam.toLowerCase()) ||
          business.address.toLowerCase().includes(locationParam.toLowerCase())
        );
      }

      setBusinesses(filteredResults);
      setLoading(false);
    }, 1000);
  };

  // Handle filter change
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  // Filter businesses based on active filter
  const filteredBusinesses = businesses.filter(business => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'recreational') return business.type.includes('Recreational');
    if (activeFilter === 'medical') return business.type.includes('Medical');
    if (activeFilter === 'premium') return business.isPremium;
    return true;
  });

  // Handle search submission
  const handleSearch = (formData) => {
    const { keyword, location } = formData;
    const params = new URLSearchParams();

    if (domainParam) params.append('domain', domainParam);
    if (keyword) params.append('keyword', keyword);
    if (location) params.append('location', location);

    navigate(`/dispensaries?${params.toString()}`);
  };

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen">
        {/* Hero Section with Search */}
        <div className="bg-primary text-white py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Find Cannabis Dispensaries in {domain.state}
              </h1>
              <p className="text-xl mb-8">
                Browse the top-rated dispensaries and find the perfect products for your needs
              </p>
              <div className="bg-white p-4 rounded-lg shadow-md">
                <SearchBar
                  initialValues={searchParams}
                  onSearch={handleSearch}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          {/* Filters */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h2 className="text-2xl font-bold text-gray-800">
                  {filteredBusinesses.length} Dispensaries Found
                </h2>
                {searchParams.keyword || searchParams.location ? (
                  <p className="text-gray-600">
                    Search results for {searchParams.keyword && <span>"{searchParams.keyword}"</span>}
                    {searchParams.keyword && searchParams.location && <span> in </span>}
                    {searchParams.location && <span>"{searchParams.location}"</span>}
                  </p>
                ) : null}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleFilterChange('all')}
                  className={`px-4 py-2 rounded-md transition duration-300 ${activeFilter === 'all'
                      ? 'bg-secondary text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  All
                </button>
                <button
                  onClick={() => handleFilterChange('recreational')}
                  className={`px-4 py-2 rounded-md transition duration-300 ${activeFilter === 'recreational'
                      ? 'bg-secondary text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  Recreational
                </button>
                <button
                  onClick={() => handleFilterChange('medical')}
                  className={`px-4 py-2 rounded-md transition duration-300 ${activeFilter === 'medical'
                      ? 'bg-secondary text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  Medical
                </button>
                <button
                  onClick={() => handleFilterChange('premium')}
                  className={`px-4 py-2 rounded-md transition duration-300 ${activeFilter === 'premium'
                      ? 'bg-secondary text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  Premium
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredBusinesses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBusinesses.map(business => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium text-gray-800 mb-2">No dispensaries found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search criteria or filters</p>
              <button
                onClick={() => {
                  navigate(getLink('/dispensaries'));
                }}
                className="bg-secondary hover:bg-accent text-white hover:text-dark px-6 py-2 rounded-md transition duration-300"
              >
                Clear Search
              </button>
            </div>
          )}

          {/* Pagination */}
          {filteredBusinesses.length > 0 && (
            <div className="mt-12 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button className="px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100">
                  Previous
                </button>
                <button className="px-3 py-1 rounded-md bg-secondary text-white">
                  1
                </button>
                <button className="px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100">
                  2
                </button>
                <button className="px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100">
                  3
                </button>
                <button className="px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100">
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
} 