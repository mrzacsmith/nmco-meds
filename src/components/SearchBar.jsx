import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDomain } from '../context/DomainContext';

export function SearchBar({ className = '' }) {
  const domain = useDomain();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState('dispensary');
  const [domainParam, setDomainParam] = useState(null);
  const [formData, setFormData] = useState({
    location: '',
    keyword: ''
  });
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const scriptRef = useRef(null);

  // Get the domain parameter from the URL if it exists (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      setDomainParam(url.searchParams.get('domain'));
    }
  }, [location]);

  // Get center coordinates for each state
  const getStateCenter = useCallback((stateCode) => {
    const centers = {
      'NM': { lat: 34.5199, lng: -105.8701 }, // New Mexico
      'CO': { lat: 39.5501, lng: -105.7821 }, // Colorado
      // Add more states as needed
    };
    return centers[stateCode] || { lat: 39.8283, lng: -98.5795 }; // Default to center of US
  }, []);

  // Initialize map when Google Maps is loaded
  const initMap = useCallback(() => {
    if (!window.google?.maps || !mapRef.current || googleMapRef.current) return;

    try {
      // Center map on the state
      const center = getStateCenter(domain.stateCode);

      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: 7,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
      });

      googleMapRef.current = mapInstance;
    } catch (error) {
      console.error("Error initializing Google Map:", error);
    }
  }, [domain.stateCode, getStateCenter]);

  // Load Google Maps script
  useEffect(() => {
    // Check if script already exists or Google Maps is already loaded
    if (window.google?.maps) {
      setMapLoaded(true);
      initMap();
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      // If script is loading but not ready, wait for it
      existingScript.addEventListener('load', () => {
        setMapLoaded(true);
        initMap();
      });
      return;
    }

    // Create and load the script
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY'}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setMapLoaded(true);
      initMap();
    };

    document.head.appendChild(script);
    scriptRef.current = script;

    // Cleanup function
    return () => {
      // Clean up map instance if it exists
      if (googleMapRef.current) {
        // Just nullify the reference, don't try to destroy the map
        googleMapRef.current = null;
      }

      // We don't remove the script tag to avoid issues with other components that might use it
    };
  }, [initMap]);

  // Re-initialize map when state code changes
  useEffect(() => {
    if (window.google?.maps && mapRef.current) {
      // Clean up previous map instance
      googleMapRef.current = null;

      // Initialize new map with updated center
      initMap();
    }
  }, [domain.stateCode, initMap]);

  // Function to create links that preserve the domain parameter
  const getLink = (path) => {
    return domainParam ? `${path}?domain=${domainParam}` : path;
  };

  const searchTypes = [
    { id: 'dispensary', label: 'Dispensaries' },
    { id: 'doctor', label: 'Doctors' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Build the search URL
    let searchUrl = '/search';
    const params = new URLSearchParams();

    if (formData.location) params.append('location', formData.location);
    if (formData.keyword) params.append('keyword', formData.keyword);
    params.append('type', searchType);
    if (domainParam) params.append('domain', domainParam);

    // Navigate to search page with parameters
    navigate(`${searchUrl}?${params.toString()}`);
  };

  return (
    <div className="w-full" style={{
      position: 'relative',
      marginTop: 0
    }}>
      {/* Single container with Prussian Blue Gradient Background - Full Width */}
      <div style={{
        background: 'linear-gradient(135deg, #172A3A 0%, #508991 100%)',
        width: '100%',
        position: 'relative',
        paddingTop: '2rem',
        paddingBottom: '2rem'
      }}>
        <div className="container mx-auto px-4">
          {/* Heading Section */}
          <div className="text-center text-white mb-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Find Cannabis in {domain.state}
            </h1>
            <p className="text-xl">
              Discover the best dispensaries and products in {domain.state}
            </p>
          </div>

          {/* Container for search - 80% width up to 1440px */}
          <div className="mx-auto w-full max-w-[1440px] px-4" style={{ width: '80%' }}>
            {/* Combined Search and Map Container */}
            <div className="bg-white p-4 rounded-md shadow-md">
              <h3 className="text-xl font-semibold mb-3">Search Cannabis Locations in {domain.state}</h3>

              <div className="flex flex-col gap-4">
                {/* Search Form Section */}
                <div className="w-full">
                  <form onSubmit={handleSubmit} className="w-full">
                    {/* Search Type Tabs */}
                    <div className="flex mb-3 border-b border-gray-200">
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
                            value={formData.location}
                            onChange={handleChange}
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
                            value={formData.keyword}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      {/* Search Button */}
                      <div className="flex items-end">
                        <button
                          type="submit"
                          className="w-full md:w-auto px-6 py-2 bg-mid hover:bg-accent text-white rounded-md transition duration-300 font-medium"
                        >
                          Search
                        </button>
                      </div>
                    </div>
                  </form>
                </div>

                {/* Google Map Section */}
                <div className="w-full mt-3">
                  <h4 className="text-lg font-medium mb-2">Cannabis Locations in {domain.state}</h4>
                  <div className="w-full h-[450px] rounded-md border border-gray-300" style={{ background: '#f0f0f0' }}>
                    {!mapLoaded ? (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">Loading map...</p>
                      </div>
                    ) : (
                      <div ref={mapRef} className="w-full h-full"></div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 