import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useDomain } from '../context/DomainContext';
import {
  collection,
  getDocs,
  query,
  where,
  getFirestore,
  doc,
  getDoc,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { FaMapMarkerAlt, FaBuilding, FaMapMarked, FaCity, FaMountain, FaTree } from 'react-icons/fa';
import { NM, CO } from '@state-icons/react';

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

export default function Dashboard() {
  const { currentUser, userProfile, logout, hasRole, hasStateAccess } = useAuth();
  const domain = useDomain();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = userProfile && userProfile.role === 'admin';

  // Set different default tabs for admin vs regular users
  const [activeTab, setActiveTab] = useState(isAdmin ? 'users' : 'businesses');
  const [businesses, setBusinesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [domainParam, setDomainParam] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('operator');
  const [inviteBusinessId, setInviteBusinessId] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');

  // Add new state for location form
  const [selectedState, setSelectedState] = useState('New Mexico');
  const [isMultiLocation, setIsMultiLocation] = useState(false);
  const [locationFormData, setLocationFormData] = useState({
    companyName: '',
    street: '',
    suite: '',
    city: '',
    zipCode: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    locationPhone: '',
    websiteUrl: ''
  });
  const [existingBusinesses, setExistingBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);

  const db = getFirestore();
  const functions = getFunctions();

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

  // Fetch businesses based on user role and state
  useEffect(() => {
    const fetchBusinesses = async () => {
      if (!currentUser || !userProfile) return;

      // Skip fetching businesses for admin users
      if (isAdmin) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        let businessesData = [];

        // If user is admin, fetch all businesses for the selected state
        if (userProfile.role === 'admin') {
          const businessesRef = collection(db, `businesses-${domain.state.toLowerCase()}`);
          const businessesSnapshot = await getDocs(businessesRef);

          businessesData = businessesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            type: 'Dispensary', // Default type for display
            status: 'active',    // Default status for display
            views: Math.floor(Math.random() * 1000), // Random views for display
            created: new Date(doc.data().createdAt?.toDate()).toISOString().split('T')[0] || 'N/A',
            location: `${doc.data().city || 'Unknown'}, ${domain.state}`
          }));
        }
        // Otherwise, fetch only businesses the user has access to
        else if (userProfile.businesses && userProfile.businesses.length > 0) {
          // Filter businesses by state
          const userBusinessesInState = userProfile.businesses.filter(b => b.state === domain.state);

          // Fetch each business
          for (const business of userBusinessesInState) {
            const businessRef = doc(db, `businesses-${domain.state.toLowerCase()}`, business.businessId);
            const businessDoc = await getDoc(businessRef);

            if (businessDoc.exists()) {
              const data = businessDoc.data();
              businessesData.push({
                id: businessDoc.id,
                ...data,
                userRole: business.role,
                type: 'Dispensary', // Default type for display
                status: 'active',    // Default status for display
                views: Math.floor(Math.random() * 1000), // Random views for display
                created: new Date(data.createdAt?.toDate()).toISOString().split('T')[0] || 'N/A',
                location: `${data.city || 'Unknown'}, ${domain.state}`
              });
            }
          }
        }

        setBusinesses(businessesData);
      } catch (err) {
        console.error('Error fetching businesses:', err);
        setError('Failed to load businesses. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusinesses();
  }, [currentUser, userProfile, domain.state, db, isAdmin]);

  // Load existing businesses when state changes and is multi-location
  useEffect(() => {
    const loadExistingBusinesses = async () => {
      if (!domain.state || !isMultiLocation) {
        setExistingBusinesses([]);
        return;
      }

      try {
        const businessesRef = collection(db, `businesses-${domain.state.toLowerCase().replace(' ', '-')}`);
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
  }, [domain.state, isMultiLocation, db]);

  // Filter businesses based on input
  useEffect(() => {
    if (!isMultiLocation || !locationFormData.companyName) {
      setFilteredBusinesses([]);
      return;
    }

    const filtered = existingBusinesses.filter(business =>
      business.name.toLowerCase().includes(locationFormData.companyName.toLowerCase())
    );
    setFilteredBusinesses(filtered);
  }, [locationFormData.companyName, existingBusinesses, isMultiLocation]);

  const handleLocationInputChange = (e) => {
    const { name, value } = e.target;
    setLocationFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Mock recent activity data
  const recentActivity = [
    { id: 1, type: 'view', business: 'Green Leaf Dispensary', date: '2023-10-15', count: 45 },
    { id: 2, type: 'search', term: 'dispensary near me', date: '2023-10-14', count: 12 },
    { id: 3, type: 'view', business: 'Healing Buds', date: '2023-10-13', count: 28 },
    { id: 4, type: 'click', business: 'Green Leaf Dispensary', date: '2023-10-12', count: 8 },
    { id: 5, type: 'search', term: 'cannabis delivery', date: '2023-10-11', count: 17 }
  ];

  // Handle inviting a user to a business
  const handleInviteUser = async (e) => {
    e.preventDefault();

    if (!inviteEmail || (!inviteBusinessId && !isAdmin)) {
      setInviteError('Please fill in all required fields');
      return;
    }

    setInviteLoading(true);
    setInviteError('');
    setInviteSuccess('');

    try {
      const inviteUserToBusiness = httpsCallable(functions, 'inviteUserToBusiness');
      const result = await inviteUserToBusiness({
        email: inviteEmail,
        businessId: inviteBusinessId,
        state: domain.state,
        role: inviteRole,
        isAdminInvite: isAdmin
      });

      setInviteSuccess(result.data.message || 'User successfully invited');
      setInviteEmail('');
      setInviteRole('operator');
      setInviteBusinessId('');
    } catch (err) {
      console.error('Error inviting user:', err);
      setInviteError(err.message || 'Failed to invite user. Please try again.');
    } finally {
      setInviteLoading(false);
    }
  };

  // Check if user has access to the selected state
  const canAccessState = hasStateAccess(domain.state);

  // Add location handler
  const handleAddLocation = async (e) => {
    e.preventDefault();
    setError('');
    setInviteSuccess('');
    setIsLoading(true);

    try {
      if (!selectedState) {
        throw new Error('Please select a state');
      }

      const locationData = {
        ...locationFormData,
        state: selectedState,
        isMultiLocation,
        createdAt: serverTimestamp(),
        createdBy: currentUser.uid,
        updatedAt: serverTimestamp(),
        updatedBy: currentUser.uid,
        address: {
          street: locationFormData.street,
          suite: locationFormData.suite || '',
          city: locationFormData.city,
          state: selectedState,
          zipCode: locationFormData.zipCode
        },
        contact: {
          name: locationFormData.contactName,
          email: locationFormData.contactEmail,
          phone: locationFormData.contactPhone
        },
        locationPhone: locationFormData.locationPhone,
        websiteUrl: locationFormData.websiteUrl
      };

      // Remove individual fields that are now in nested objects
      delete locationData.street;
      delete locationData.suite;
      delete locationData.city;
      delete locationData.zipCode;
      delete locationData.contactName;
      delete locationData.contactEmail;
      delete locationData.contactPhone;
      delete locationData.locationPhone;
      delete locationData.websiteUrl;

      const businessesCollection = `businesses-${selectedState.toLowerCase().replace(' ', '-')}`;

      if (isMultiLocation && locationFormData.existingBusinessId) {
        // Add location to existing business
        const businessRef = doc(db, businessesCollection, locationFormData.existingBusinessId);
        const locationsRef = collection(businessRef, 'locations');
        await addDoc(locationsRef, locationData);
      } else {
        // Create new business record
        const businessRef = await addDoc(collection(db, businessesCollection), locationData);

        if (isMultiLocation) {
          // If it's a new multi-location business, create a locations subcollection
          // and add the first location
          const locationsRef = collection(businessRef, 'locations');
          await addDoc(locationsRef, {
            ...locationData,
            isMainLocation: true
          });
        }
      }

      setLocationFormData({
        companyName: '',
        street: '',
        suite: '',
        city: '',
        zipCode: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        locationPhone: '',
        websiteUrl: ''
      });
      setInviteSuccess('Location added successfully');
    } catch (err) {
      console.error('Error adding location:', err);
      setError(err.message || 'Failed to add location');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Dashboard Header */}
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-dark">Dashboard</h1>
              </div>
              {userProfile && (
                <p className="text-gray-600 mt-2">
                  Welcome, {userProfile.firstName} {userProfile.lastName} | Role: {userProfile.role}
                  {!isAdmin && ` | State: ${domain.state}`}
                </p>
              )}
            </div>

            {/* Dashboard Tabs */}
            <div className="border-b">
              <nav className="flex">
                {/* Regular user tabs */}
                {!isAdmin && (
                  <>
                    <button
                      className={`px-6 py-4 text-sm font-medium ${activeTab === 'businesses'
                        ? 'border-b-2 border-accent text-accent'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                      onClick={() => setActiveTab('businesses')}
                    >
                      Your Businesses
                    </button>
                    <button
                      className={`px-6 py-4 text-sm font-medium ${activeTab === 'activity'
                        ? 'border-b-2 border-accent text-accent'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                      onClick={() => setActiveTab('activity')}
                    >
                      Recent Activity
                    </button>
                    <button
                      className={`px-6 py-4 text-sm font-medium ${activeTab === 'subscription'
                        ? 'border-b-2 border-accent text-accent'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                      onClick={() => setActiveTab('subscription')}
                    >
                      Subscription
                    </button>
                  </>
                )}

                {/* Admin-specific tabs */}
                {isAdmin && (
                  <>
                    <button
                      className={`px-6 py-4 text-sm font-medium ${activeTab === 'users'
                        ? 'border-b-2 border-accent text-accent'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                      onClick={() => setActiveTab('users')}
                    >
                      Manage Users
                    </button>
                    <button
                      className={`px-6 py-4 text-sm font-medium ${activeTab === 'analytics'
                        ? 'border-b-2 border-accent text-accent'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                      onClick={() => setActiveTab('analytics')}
                    >
                      Analytics
                    </button>
                    <button
                      className={`px-6 py-4 text-sm font-medium ${activeTab === 'addLocation'
                        ? 'border-b-2 border-accent text-accent'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                      onClick={() => setActiveTab('addLocation')}
                    >
                      Add Location
                    </button>
                  </>
                )}

                {/* Common tabs for all users */}
                <button
                  className={`px-6 py-4 text-sm font-medium ${activeTab === 'settings'
                    ? 'border-b-2 border-accent text-accent'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                  onClick={() => setActiveTab('settings')}
                >
                  Account Settings
                </button>
                <button
                  className={`px-6 py-4 text-sm font-medium ${activeTab === 'invite'
                    ? 'border-b-2 border-accent text-accent'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                  onClick={() => setActiveTab('invite')}
                >
                  Invite Users
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* Businesses Tab - Only for regular users */}
              {activeTab === 'businesses' && !isAdmin && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-dark">Your Businesses</h2>
                    <button
                      onClick={() => navigate(getLink('/subscription'))}
                      className="px-4 py-2 bg-dark text-white rounded-md hover:bg-accent transition duration-300"
                    >
                      Add New Business
                    </button>
                  </div>

                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                      <p>{error}</p>
                    </div>
                  )}

                  {isLoading ? (
                    <div className="text-center py-8">
                      <p>Loading your businesses...</p>
                    </div>
                  ) : businesses.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-600">You don't have any businesses in {domain.state} yet.</p>
                      <button
                        onClick={() => navigate(getLink('/subscription'))}
                        className="mt-4 px-4 py-2 bg-dark text-white rounded-md hover:bg-accent transition duration-300"
                      >
                        Add Your First Business
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Business
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Views
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Created
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Location
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Users
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {businesses.map((business) => (
                            <tr key={business.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{business.name}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{business.type}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${business.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                  {business.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {business.views}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {business.created}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {business.location}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {business.users ? business.users.length : 0}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button className="text-accent hover:text-dark mr-3">
                                  Edit
                                </button>
                                <button className="text-red-600 hover:text-red-900">
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Activity Tab - Only for regular users */}
              {activeTab === 'activity' && !isAdmin && (
                <div>
                  <h2 className="text-xl font-semibold text-dark mb-6">Recent Activity</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Details
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Count
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {recentActivity.map((activity) => (
                          <tr key={activity.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 capitalize">{activity.type}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {activity.business || activity.term}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {activity.date}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {activity.count}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Subscription Tab - Only for regular users */}
              {activeTab === 'subscription' && !isAdmin && (
                <div>
                  <h2 className="text-xl font-semibold text-dark mb-6">Manage Subscription</h2>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="max-w-2xl">
                      <h3 className="text-lg font-medium mb-4">Current Plan</h3>
                      {/* Add subscription management UI here */}
                      <button
                        onClick={() => navigate(getLink('/subscription'))}
                        className="px-4 py-2 bg-dark text-white rounded-md hover:bg-accent transition duration-300"
                      >
                        Manage Plan
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Admin-specific Users Tab */}
              {activeTab === 'users' && isAdmin && (
                <div>
                  <h2 className="text-xl font-semibold text-dark mb-6">Manage Users</h2>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <p className="text-gray-600">This section allows you to manage all users across both NM and CO states.</p>
                    <div className="mt-4">
                      <button className="px-4 py-2 bg-dark text-white rounded-md hover:bg-accent transition duration-300">
                        View All Users
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Analytics Tab - Single container */}
              {activeTab === 'analytics' && isAdmin && (
                <div>
                  <h2 className="text-xl font-semibold text-dark mb-6">Analytics Dashboard</h2>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <p className="text-gray-600 mb-4">Platform Analytics Overview</p>
                    <div className="bg-white p-4 rounded shadow">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-medium text-lg mb-2">New Mexico</h3>
                          <p>Total Businesses: 24</p>
                          <p>Active Users: 56</p>
                          <p>Monthly Views: 12,450</p>
                        </div>
                        <div>
                          <h3 className="font-medium text-lg mb-2">Colorado</h3>
                          <p>Total Businesses: 36</p>
                          <p>Active Users: 78</p>
                          <p>Monthly Views: 18,320</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Add Location Tab */}
              {activeTab === 'addLocation' && isAdmin && (
                <div>
                  <h2 className="text-xl font-semibold text-dark mb-6">Add New Location</h2>

                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                      <p>{error}</p>
                    </div>
                  )}

                  {inviteSuccess && (
                    <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
                      <p>{inviteSuccess}</p>
                    </div>
                  )}

                  <div className="max-w-4xl bg-gray-50 p-6 rounded-lg">
                    <form onSubmit={handleAddLocation} className="space-y-6">
                      {/* State and Location Type Selection - Combined Row */}
                      <div className="flex items-center gap-8">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select State
                          </label>
                          <div className="flex gap-4">
                            <button
                              type="button"
                              onClick={() => setSelectedState('New Mexico')}
                              className={`group relative p-2 rounded-lg border transition-all hover:scale-110 ${selectedState === 'New Mexico'
                                ? 'bg-accent text-white border-accent'
                                : 'border-gray-300 hover:border-accent'
                                }`}
                            >
                              <NM className="w-8 h-8" />
                              <span className="tooltip invisible group-hover:visible absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap">
                                New Mexico
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedState('Colorado')}
                              className={`group relative p-2 rounded-lg border transition-all hover:scale-110 ${selectedState === 'Colorado'
                                ? 'bg-accent text-white border-accent'
                                : 'border-gray-300 hover:border-accent'
                                }`}
                            >
                              <CO className="w-8 h-8" />
                              <span className="tooltip invisible group-hover:visible absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap">
                                Colorado
                              </span>
                            </button>
                          </div>
                        </div>

                        <div className="border-l border-gray-300 h-16 mx-4" />

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location Type
                          </label>
                          <div className="flex gap-4">
                            <button
                              type="button"
                              onClick={() => setIsMultiLocation(false)}
                              className={`group relative p-2 rounded-lg border transition-all hover:scale-110 ${!isMultiLocation
                                ? 'bg-accent text-white border-accent'
                                : 'border-gray-300 hover:border-accent'
                                }`}
                            >
                              <FaMapMarkerAlt className="w-8 h-8" />
                              <span className="tooltip invisible group-hover:visible absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap">
                                Single Location
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsMultiLocation(true)}
                              className={`group relative p-2 rounded-lg border transition-all hover:scale-110 ${isMultiLocation
                                ? 'bg-accent text-white border-accent'
                                : 'border-gray-300 hover:border-accent'
                                }`}
                            >
                              <FaBuilding className="w-8 h-8" />
                              <span className="tooltip invisible group-hover:visible absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap">
                                Multi-Location Business
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Company Name with Autocomplete for Multi-Location */}
                      <div className="relative">
                        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                          Company Name
                        </label>
                        <input
                          type="text"
                          id="companyName"
                          name="companyName"
                          value={locationFormData.companyName}
                          onChange={handleLocationInputChange}
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
                                  setLocationFormData(prev => ({
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

                      {/* Physical Address Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-2">
                            Street Address
                          </label>
                          <input
                            type="text"
                            id="street"
                            name="street"
                            value={locationFormData.street}
                            onChange={handleLocationInputChange}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="suite" className="block text-sm font-medium text-gray-700 mb-2">
                            Suite/Unit (Optional)
                          </label>
                          <input
                            type="text"
                            id="suite"
                            name="suite"
                            value={locationFormData.suite}
                            onChange={handleLocationInputChange}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent"
                          />
                        </div>

                        <div>
                          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                            City
                          </label>
                          <select
                            id="city"
                            name="city"
                            value={locationFormData.city}
                            onChange={handleLocationInputChange}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent"
                            required
                          >
                            <option value="">Select a city</option>
                            {selectedState && CITIES[selectedState].map(city => (
                              <option key={city} value={city}>{city}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                            ZIP Code
                          </label>
                          <input
                            type="text"
                            id="zipCode"
                            name="zipCode"
                            value={locationFormData.zipCode}
                            onChange={handleLocationInputChange}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent"
                            required
                            pattern="[0-9]{5}"
                            maxLength="5"
                          />
                        </div>
                      </div>

                      {/* Location Phone and Website */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="locationPhone" className="block text-sm font-medium text-gray-700 mb-2">
                            Location Phone
                          </label>
                          <input
                            type="tel"
                            id="locationPhone"
                            name="locationPhone"
                            value={locationFormData.locationPhone}
                            onChange={handleLocationInputChange}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent"
                            required
                            pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                            placeholder="123-456-7890"
                          />
                        </div>

                        <div>
                          <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700 mb-2">
                            Website URL
                          </label>
                          <input
                            type="url"
                            id="websiteUrl"
                            name="websiteUrl"
                            value={locationFormData.websiteUrl}
                            onChange={handleLocationInputChange}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent"
                            placeholder="https://example.com"
                          />
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-2">
                            Contact Name
                          </label>
                          <input
                            type="text"
                            id="contactName"
                            name="contactName"
                            value={locationFormData.contactName}
                            onChange={handleLocationInputChange}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
                            Contact Email
                          </label>
                          <input
                            type="email"
                            id="contactEmail"
                            name="contactEmail"
                            value={locationFormData.contactEmail}
                            onChange={handleLocationInputChange}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-2">
                            Contact Phone
                          </label>
                          <input
                            type="tel"
                            id="contactPhone"
                            name="contactPhone"
                            value={locationFormData.contactPhone}
                            onChange={handleLocationInputChange}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent"
                            required
                            pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                            placeholder="123-456-7890"
                          />
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div>
                        <button
                          type="submit"
                          onClick={handleAddLocation}
                          disabled={isLoading}
                          className="w-full py-2 bg-accent text-white rounded-md hover:bg-accent-dark transition duration-300 disabled:opacity-50"
                        >
                          {isLoading ? 'Adding Location...' : 'Add Location'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Settings Tab - For all users */}
              {activeTab === 'settings' && (
                <div>
                  <h2 className="text-xl font-semibold text-dark mb-6">Account Settings</h2>
                  <div className="max-w-2xl">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
                      {userProfile && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">First Name</p>
                            <p className="font-medium">{userProfile.firstName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Last Name</p>
                            <p className="font-medium">{userProfile.lastName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium">{userProfile.email}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Role</p>
                            <p className="font-medium capitalize">{userProfile.role}</p>
                          </div>
                          {!isAdmin && (
                            <div>
                              <p className="text-sm text-gray-500">Accessible States</p>
                              <p className="font-medium">
                                {userProfile.accessibleStates ? userProfile.accessibleStates.join(', ') : 'None'}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Invite Users Tab - For all users but with different forms */}
              {activeTab === 'invite' && (
                <div>
                  <h2 className="text-xl font-semibold text-dark mb-6">Invite Users</h2>

                  {inviteError && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                      <p>{inviteError}</p>
                    </div>
                  )}

                  {inviteSuccess && (
                    <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
                      <p>{inviteSuccess}</p>
                    </div>
                  )}

                  <div className="max-w-2xl bg-gray-50 p-6 rounded-lg">
                    <form onSubmit={handleInviteUser} className="space-y-4">
                      <div>
                        <label htmlFor="inviteEmail" className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <input
                          id="inviteEmail"
                          type="email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          className="block w-full px-3 py-2 bg-gray-900 text-white border-0 rounded-md shadow-sm focus:ring-accent focus:border-accent"
                          placeholder="user@example.com"
                          required
                        />
                      </div>

                      {/* Business selection - Only for regular users */}
                      {!isAdmin && (
                        <div>
                          <label htmlFor="inviteBusinessId" className="block text-sm font-medium text-gray-700 mb-1">
                            Business
                          </label>
                          <select
                            id="inviteBusinessId"
                            value={inviteBusinessId}
                            onChange={(e) => setInviteBusinessId(e.target.value)}
                            className="block w-full px-3 py-2 bg-gray-900 text-white border-0 rounded-md shadow-sm focus:ring-accent focus:border-accent"
                            required
                          >
                            <option value="">Select a business</option>
                            {businesses
                              .filter(b => hasRole('admin') || b.userRole === 'owner')
                              .map(business => (
                                <option key={business.id} value={business.id}>
                                  {business.name}
                                </option>
                              ))
                            }
                          </select>
                        </div>
                      )}

                      {/* Role selection - Different options for admin */}
                      <div>
                        <label htmlFor="inviteRole" className="block text-sm font-medium text-gray-700 mb-1">
                          Role
                        </label>
                        <select
                          id="inviteRole"
                          value={inviteRole}
                          onChange={(e) => setInviteRole(e.target.value)}
                          className="block w-full px-3 py-2 bg-gray-900 text-white border-0 rounded-md shadow-sm focus:ring-accent focus:border-accent"
                        >
                          {isAdmin ? (
                            <>
                              <option value="operator">Operator</option>
                              <option value="admin">Admin</option>
                            </>
                          ) : (
                            <option value="operator">Operator</option>
                          )}
                        </select>
                      </div>

                      {/* State selection - Only for admin users */}
                      {isAdmin && (
                        <div>
                          <label htmlFor="inviteState" className="block text-sm font-medium text-gray-700 mb-1">
                            State Access
                          </label>
                          <select
                            id="inviteState"
                            className="block w-full px-3 py-2 bg-gray-900 text-white border-0 rounded-md shadow-sm focus:ring-accent focus:border-accent"
                          >
                            <option value="NM">New Mexico</option>
                            <option value="CO">Colorado</option>
                            <option value="both">Both States</option>
                          </select>
                        </div>
                      )}

                      <div>
                        <button
                          type="submit"
                          disabled={inviteLoading}
                          className="w-full py-2 bg-dark text-white rounded-md hover:bg-accent transition duration-300"
                        >
                          {inviteLoading ? 'Sending Invitation...' : 'Invite User'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 