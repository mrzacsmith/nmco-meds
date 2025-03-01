import { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaBuilding } from 'react-icons/fa';
import { SiNewmexico, SiColorado } from 'react-icons/si';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  getFirestore
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

// Common cities in NM and CO
const CITIES = {
  'New Mexico': [
    'Albuquerque',
    'Santa Fe',
    'Las Cruces',
    'Rio Rancho',
    'Roswell',
    'Farmington',
    'Las Vegas',
    'Alamogordo',
    'Carlsbad',
    'Hobbs'
  ].sort(),
  'Colorado': [
    'Denver',
    'Colorado Springs',
    'Aurora',
    'Fort Collins',
    'Lakewood',
    'Thornton',
    'Arvada',
    'Westminster',
    'Pueblo',
    'Boulder'
  ].sort()
};

export const AddLocationForm = () => {
  const { currentUser } = useAuth();
  const db = getFirestore();

  // Form state
  const [selectedState, setSelectedState] = useState('');
  const [isMultiLocation, setIsMultiLocation] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    street: '',
    suite: '',
    city: '',
    zipCode: '',
    contactName: '',
    contactEmail: '',
    contactPhone: ''
  });
  const [existingBusinesses, setExistingBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load existing businesses when state changes and is multi-location
  useEffect(() => {
    const loadExistingBusinesses = async () => {
      if (!selectedState || !isMultiLocation) {
        setExistingBusinesses([]);
        return;
      }

      try {
        const businessesRef = collection(db, `businesses-${selectedState.toLowerCase().replace(' ', '-')}`);
        const q = query(businessesRef, where('isMultiLocation', '==', true));
        const snapshot = await getDocs(q);

        const businesses = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setExistingBusinesses(businesses);
      } catch (err) {
        console.error('Error loading businesses:', err);
        setError('Failed to load existing businesses');
      }
    };

    loadExistingBusinesses();
  }, [selectedState, isMultiLocation, db]);

  // Filter businesses based on input
  useEffect(() => {
    if (!isMultiLocation || !formData.companyName) {
      setFilteredBusinesses([]);
      return;
    }

    const filtered = existingBusinesses.filter(business =>
      business.name.toLowerCase().includes(formData.companyName.toLowerCase())
    );
    setFilteredBusinesses(filtered);
  }, [formData.companyName, existingBusinesses, isMultiLocation]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Add New Location</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
          {success}
        </div>
      )}

      <form className="space-y-6">
        {/* State Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select State
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setSelectedState('New Mexico')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${selectedState === 'New Mexico'
                ? 'bg-accent text-white border-accent'
                : 'border-gray-300 hover:border-accent'
                }`}
            >
              <SiNewmexico className="text-xl" />
              <span>New Mexico</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedState('Colorado')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${selectedState === 'Colorado'
                ? 'bg-accent text-white border-accent'
                : 'border-gray-300 hover:border-accent'
                }`}
            >
              <SiColorado className="text-xl" />
              <span>Colorado</span>
            </button>
          </div>
        </div>

        {/* Location Type Selection */}
        {selectedState && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location Type
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setIsMultiLocation(false)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${!isMultiLocation
                  ? 'bg-accent text-white border-accent'
                  : 'border-gray-300 hover:border-accent'
                  }`}
              >
                <FaMapMarkerAlt className="text-xl" />
                <span>Single Location</span>
              </button>
              <button
                type="button"
                onClick={() => setIsMultiLocation(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${isMultiLocation
                  ? 'bg-accent text-white border-accent'
                  : 'border-gray-300 hover:border-accent'
                  }`}
              >
                <FaBuilding className="text-xl" />
                <span>Multi-Location Business</span>
              </button>
            </div>
          </div>
        )}

        {/* Company Name with Autocomplete for Multi-Location */}
        {selectedState && (
          <div className="relative">
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
              Company Name
            </label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent"
              required
            />
            {isMultiLocation && filteredBusinesses.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                {filteredBusinesses.map(business => (
                  <div
                    key={business.id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        companyName: business.name,
                        existingBusinessId: business.id
                      }));
                      setFilteredBusinesses([]);
                    }}
                  >
                    {business.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* We'll add the rest of the form fields in the next step */}
      </form>
    </div>
  );
}; 