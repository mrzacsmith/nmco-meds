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
  updateDoc,
  serverTimestamp,
  deleteDoc,
  onSnapshot,
  increment,
  arrayUnion
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { FaMapMarkerAlt, FaBuilding, FaMapMarked, FaCity, FaMountain, FaTree, FaPencilAlt, FaTrashAlt, FaCopy, FaUsers, FaBan, FaLock, FaLockOpen } from 'react-icons/fa';
import { NM, CO } from '@state-icons/react';
import { ConfirmationModal } from '../components/ConfirmationModal';

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
  const [activeTab, setActiveTab] = useState(isAdmin ? 'analytics' : 'businesses');
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
  const [existingBusinesses, setExistingBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
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

  // Add state for Update Location feature
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Add new state for editing
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Add these state variables after other useState declarations
  const [stats, setStats] = useState({
    NM: { locations: 0, operators: 0 },
    CO: { locations: 0, operators: 0 }
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    confirmText: '',
    type: 'danger',
    onConfirm: () => { }
  });
  const [selectedUser, setSelectedUser] = useState(null);

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

  // Replace the fetch stats effect with real-time listener
  useEffect(() => {
    if (!isAdmin) return;

    const statsRef = doc(db, 'stats', 'platform-stats');
    const unsubscribe = onSnapshot(statsRef, (doc) => {
      if (doc.exists()) {
        setStats(doc.data());
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [isAdmin, db]);

  // Update handleAddLocation to include stats update
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

      // Update stats when adding a new location
      if (!isEditing) {
        const stateKey = selectedState === 'New Mexico' ? 'NM' : 'CO';
        const statsRef = doc(db, 'stats', 'platform-stats');
        await updateDoc(statsRef, {
          [`${stateKey}.locations`]: increment(1)
        });
      }

      if (isEditing && editingId) {
        // Update existing record
        const businessRef = doc(db, businessesCollection, editingId);
        await updateDoc(businessRef, locationData);
        setInviteSuccess('Location updated successfully');
      } else {
        // Create new record
        await addDoc(collection(db, businessesCollection), {
          ...locationData,
          createdAt: serverTimestamp(),
          createdBy: currentUser.uid,
        });
        setInviteSuccess('Location added successfully');
      }

      // Reset form
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
      setIsEditing(false);
      setEditingId(null);
    } catch (err) {
      console.error('Error managing location:', err);
      setError(err.message || 'Failed to manage location');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSearch = async (searchTerm) => {
    if (!selectedState || searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    setSearchError('');

    try {
      const businessesRef = collection(db, `businesses-${selectedState.toLowerCase().replace(' ', '-')}`);
      const searchTermLower = searchTerm.toLowerCase();

      // Get all businesses and filter client-side for better search experience
      const snapshot = await getDocs(businessesRef);

      const results = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(business => {
          // Search in company name
          const nameMatch = business.companyName?.toLowerCase().includes(searchTermLower);

          // Search in city
          const cityMatch = business.address?.city?.toLowerCase().includes(searchTermLower);

          // Search in contact info
          const contactMatch =
            business.contact?.name?.toLowerCase().includes(searchTermLower) ||
            business.contact?.email?.toLowerCase().includes(searchTermLower) ||
            business.contact?.phone?.includes(searchTerm) ||
            business.locationPhone?.includes(searchTerm);

          return nameMatch || cityMatch || contactMatch;
        });

      setSearchResults(results);
    } catch (err) {
      console.error('Error searching locations:', err);
      setSearchError('Failed to search locations');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleEditLocation = (business) => {
    // Set form data for editing
    setLocationFormData({
      companyName: business.companyName || '',
      street: business.address?.street || '',
      suite: business.address?.suite || '',
      city: business.address?.city || '',
      zipCode: business.address?.zipCode || '',
      contactName: business.contact?.name || '',
      contactEmail: business.contact?.email || '',
      contactPhone: business.contact?.phone || '',
      locationPhone: business.locationPhone || '',
      websiteUrl: business.websiteUrl || ''
    });
    setIsEditing(true);
    setEditingId(business.id);
    setActiveTab('addLocation');
  };

  const handleDuplicateLocation = (business) => {
    // Set form data but don't set editing state
    setLocationFormData({
      companyName: business.companyName || '',
      street: business.address?.street || '',
      suite: business.address?.suite || '',
      city: business.address?.city || '',
      zipCode: business.address?.zipCode || '',
      contactName: business.contact?.name || '',
      contactEmail: business.contact?.email || '',
      contactPhone: business.contact?.phone || '',
      locationPhone: business.locationPhone || '',
      websiteUrl: business.websiteUrl || ''
    });
    setIsEditing(false);
    setEditingId(null);
    setActiveTab('addLocation');
  };

  // Update handleDeleteLocation to include stats update
  const handleDeleteLocation = async (businessId) => {
    if (!selectedState || !businessId) return;

    const business = searchResults.find(b => b.id === businessId);
    if (!business) return;

    setModalConfig({
      title: 'Delete Location',
      message: `Are you sure you want to delete ${business.companyName}? This action cannot be undone.`,
      confirmText: 'Delete Location',
      type: 'danger',
      onConfirm: () => confirmDeleteLocation(businessId)
    });
    setModalOpen(true);
  };

  const confirmDeleteLocation = async (businessId) => {
    setModalOpen(false);
    setSearchLoading(true);
    setSearchError('');

    try {
      const businessRef = doc(db, `businesses-${selectedState.toLowerCase().replace(' ', '-')}`, businessId);
      await deleteDoc(businessRef);

      // Update stats when deleting a location
      const stateKey = selectedState === 'New Mexico' ? 'NM' : 'CO';
      const statsRef = doc(db, 'stats', 'platform-stats');
      await updateDoc(statsRef, {
        [`${stateKey}.locations`]: increment(-1)
      });

      // Remove from search results
      setSearchResults(prev => prev.filter(b => b.id !== businessId));
      setInviteSuccess('Location deleted successfully');
    } catch (err) {
      console.error('Error deleting location:', err);
      setSearchError('Failed to delete location');
    } finally {
      setSearchLoading(false);
    }
  };

  // Manage Users Tab - For admins
  const handleUserSearch = async (searchTerm, showAllUsers = false) => {
    if (!selectedState && !showAllUsers) {
      setSearchResults([]);
      return;
    }

    if (!showAllUsers && searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    setSearchError('');

    try {
      const usersRef = collection(db, 'users');
      let q = usersRef;

      if (!showAllUsers) {
        // If not showing all users, filter by state and search term
        q = query(usersRef, where('accessibleStates', 'array-contains', selectedState));
      }

      const snapshot = await getDocs(q);
      const searchTermLower = searchTerm.toLowerCase();

      const results = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(user => {
          if (!showAllUsers && searchTerm) {
            // Filter by search term if provided
            const nameMatch =
              (user.firstName?.toLowerCase().includes(searchTermLower)) ||
              (user.lastName?.toLowerCase().includes(searchTermLower));
            const emailMatch = user.email?.toLowerCase().includes(searchTermLower);
            const roleMatch = user.role?.toLowerCase().includes(searchTermLower);

            return nameMatch || emailMatch || roleMatch;
          }
          return true; // Include all users when showing all or no search term
        });

      setSearchResults(results);
    } catch (err) {
      console.error('Error searching users:', err);
      setSearchError('Failed to search users');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleBanUser = async (user) => {
    if (!user.id) return;

    setSelectedUser(user);
    setModalConfig({
      title: 'Ban User',
      message: `Are you sure you want to ban ${user.firstName} ${user.lastName}? They will no longer be able to log in.`,
      confirmText: 'Ban User',
      type: 'warning',
      onConfirm: () => confirmBanUser(user)
    });
    setModalOpen(true);
  };

  const confirmBanUser = async (user) => {
    setModalOpen(false);
    setSearchLoading(true);
    setSearchError('');

    try {
      const userRef = doc(db, 'users', user.id);
      const banInfo = {
        adminId: currentUser.uid,
        adminName: `${userProfile.firstName} ${userProfile.lastName}`,
        timestamp: serverTimestamp(),
        reason: 'Administrative action' // Default reason
      };

      await updateDoc(userRef, {
        isBanned: true,
        bannedBy: banInfo,
        // Add to ban history array with a regular Date instead of serverTimestamp
        banHistory: arrayUnion({
          action: 'banned',
          adminId: currentUser.uid,
          adminName: `${userProfile.firstName} ${userProfile.lastName}`,
          timestamp: new Date(),
          reason: 'Administrative action'
        })
      });

      // Update the user in search results
      setSearchResults(prev => prev.map(u =>
        u.id === user.id
          ? {
            ...u,
            isBanned: true,
            bannedBy: {
              ...banInfo,
              timestamp: new Date()
            }
          }
          : u
      ));
      setInviteSuccess('User banned successfully');
    } catch (err) {
      console.error('Error banning user:', err);
      setSearchError('Failed to ban user');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleUnbanUser = async (user) => {
    if (!user.id) return;

    setSelectedUser(user);
    setModalConfig({
      title: 'Unban User',
      message: `Are you sure you want to unban ${user.firstName} ${user.lastName}? They will be able to log in again.`,
      confirmText: 'Unban User',
      type: 'success',
      onConfirm: () => confirmUnbanUser(user)
    });
    setModalOpen(true);
  };

  const confirmUnbanUser = async (user) => {
    setModalOpen(false);
    setSearchLoading(true);
    setSearchError('');

    try {
      const userRef = doc(db, 'users', user.id);
      const unbanInfo = {
        adminId: currentUser.uid,
        adminName: `${userProfile.firstName} ${userProfile.lastName}`,
        timestamp: serverTimestamp(),
        reason: 'Administrative action' // Default reason
      };

      await updateDoc(userRef, {
        isBanned: false,
        unbannedBy: unbanInfo,
        // Add to ban history array with a regular Date instead of serverTimestamp
        banHistory: arrayUnion({
          action: 'unbanned',
          adminId: currentUser.uid,
          adminName: `${userProfile.firstName} ${userProfile.lastName}`,
          timestamp: new Date(),
          reason: 'Administrative action'
        })
      });

      // Update the user in search results
      setSearchResults(prev => prev.map(u =>
        u.id === user.id
          ? {
            ...u,
            isBanned: false,
            unbannedBy: {
              ...unbanInfo,
              timestamp: new Date()
            }
          }
          : u
      ));
      setInviteSuccess('User unbanned successfully');
    } catch (err) {
      console.error('Error unbanning user:', err);
      setSearchError('Failed to unban user');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!user.id) return;

    setSelectedUser(user);
    setModalConfig({
      title: 'Delete User',
      message: `Are you sure you want to permanently delete ${user.firstName} ${user.lastName}? This action cannot be undone.`,
      confirmText: 'Delete User',
      type: 'danger',
      onConfirm: () => confirmDeleteUser(user)
    });
    setModalOpen(true);
  };

  const confirmDeleteUser = async (user) => {
    setModalOpen(false);
    setSearchLoading(true);
    setSearchError('');

    try {
      const userRef = doc(db, 'users', user.id);
      await deleteDoc(userRef);

      // Remove from search results
      setSearchResults(prev => prev.filter(u => u.id !== user.id));
      setInviteSuccess('User deleted successfully');
    } catch (err) {
      console.error('Error deleting user:', err);
      setSearchError('Failed to delete user');
    } finally {
      setSearchLoading(false);
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
                    <button
                      className={`px-6 py-4 text-sm font-medium ${activeTab === 'updateLocation'
                        ? 'border-b-2 border-accent text-accent'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                      onClick={() => setActiveTab('updateLocation')}
                    >
                      Search
                    </button>
                    <button
                      className={`px-6 py-4 text-sm font-medium ${activeTab === 'users'
                        ? 'border-b-2 border-accent text-accent'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                      onClick={() => setActiveTab('users')}
                    >
                      Manage Users
                    </button>
                  </>
                )}

                {/* Common tab for all users */}
                <button
                  className={`px-6 py-4 text-sm font-medium ${activeTab === 'settings'
                    ? 'border-b-2 border-accent text-accent'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                  onClick={() => setActiveTab('settings')}
                >
                  Account Settings
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

              {/* Admin Analytics Tab */}
              {activeTab === 'analytics' && isAdmin && (
                <div>
                  <div className="grid grid-cols-2 gap-8">
                    {/* New Mexico Column */}
                    <div className="bg-white p-6 rounded shadow space-y-6" style={{ border: '3px solid #e5e7eb', borderLeft: '3px solid #FFD700' }}>
                      <div className="space-y-4">
                        <h3 className="font-medium text-lg">New Mexico</h3>
                        <div className="space-y-2">
                          <p>Locations: {stats.NM.locations}</p>
                          <p>Operators: {stats.NM.operators}</p>
                          <p>Monthly Views: 12,450</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded">
                          <p className="font-medium mb-2">Basic</p>
                          <p>Monthly: $X</p>
                          <p>Annual: $Y (Save Z%)</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded">
                          <p className="font-medium mb-2">Elite</p>
                          <p>Monthly: $X</p>
                          <p>Annual: $Y (Save Z%)</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded">
                          <p className="font-medium mb-2">Enterprise</p>
                          <p>Monthly: $X</p>
                          <p>Annual: $Y (Save Z%)</p>
                        </div>
                      </div>

                      <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                        Graph Placeholder
                      </div>
                    </div>

                    {/* Colorado Column */}
                    <div className="bg-white p-6 rounded shadow space-y-6" style={{ border: '3px solid #e5e7eb', borderLeft: '3px solid #002868' }}>
                      <div className="space-y-4">
                        <h3 className="font-medium text-lg">Colorado</h3>
                        <div className="space-y-2">
                          <p>Locations: {stats.CO.locations}</p>
                          <p>Operators: {stats.CO.operators}</p>
                          <p>Monthly Views: 18,320</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded">
                          <p className="font-medium mb-2">Basic</p>
                          <p>Monthly: $X</p>
                          <p>Annual: $Y (Save Z%)</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded">
                          <p className="font-medium mb-2">Elite</p>
                          <p>Monthly: $X</p>
                          <p>Annual: $Y (Save Z%)</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded">
                          <p className="font-medium mb-2">Enterprise</p>
                          <p>Monthly: $X</p>
                          <p>Annual: $Y (Save Z%)</p>
                        </div>
                      </div>

                      <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                        Graph Placeholder
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Add Location Tab */}
              {activeTab === 'addLocation' && isAdmin && (
                <div>
                  <h2 className="text-xl font-semibold text-dark mb-6">
                    {isEditing ? 'Update Location' : 'Add New Location'}
                  </h2>

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
                          {isLoading ? (isEditing ? 'Updating Location...' : 'Adding Location...') : (isEditing ? 'Update Location' : 'Add Location')}
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
                  <div className="max-w-2xl space-y-8">
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

                    {/* Invite Users Section - Now part of Account Settings */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Invite Users</h3>
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
                            className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent"
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
                              className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent"
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
                            className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent"
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
                              className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent"
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
                            className="w-full py-2 bg-accent text-white rounded-md hover:bg-accent-dark transition duration-300 disabled:opacity-50"
                          >
                            {inviteLoading ? 'Sending Invitation...' : 'Invite User'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {/* Update Location Tab - For admins */}
              {activeTab === 'updateLocation' && isAdmin && (
                <div>
                  <div className="max-w-4xl bg-gray-50 p-6 rounded-lg">
                    {/* Search Box */}
                    <div className="mb-6">
                      <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700 mb-2">
                        Search Locations
                      </label>
                      <div className="flex items-center gap-4 mb-4">
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
                      <div className="relative">
                        <input
                          type="text"
                          id="searchTerm"
                          className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent pr-10"
                          placeholder="Search by company name, city, contact info..."
                          onChange={(e) => handleLocationSearch(e.target.value)}
                        />
                        <button
                          onClick={() => {
                            document.getElementById('searchTerm').value = '';
                            handleLocationSearch('');
                          }}
                          className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      {searchError && (
                        <p className="mt-2 text-sm text-red-600">{searchError}</p>
                      )}
                    </div>

                    {/* Search Results */}
                    <div className="overflow-x-auto">
                      {searchLoading ? (
                        <div className="text-center py-4">
                          <p className="text-gray-600">Loading results...</p>
                        </div>
                      ) : searchResults.length === 0 ? (
                        <div className="text-center py-4">
                          <p className="text-gray-600">No locations found. Try a different search term.</p>
                        </div>
                      ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                                Business Information
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                                Contact Details
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                                Contact Person
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {searchResults.map((business) => (
                              <tr key={business.id}>
                                <td className="px-6 py-4">
                                  <div className="space-y-1">
                                    <div className="text-sm font-medium text-gray-900">
                                      {business.websiteUrl ? (
                                        <a
                                          href={business.websiteUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="hover:text-accent"
                                        >
                                          {business.companyName}
                                        </a>
                                      ) : (
                                        business.companyName
                                      )}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {business.address?.street} {business.address?.suite}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {business.address?.city}, {business.address?.zipCode}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="space-y-1">
                                    <div className="text-sm text-gray-500">{business.locationPhone}</div>
                                    <div className="text-sm text-gray-500">{business.websiteUrl}</div>
                                    <div className="text-sm text-gray-500">
                                      {business.locations ? `${business.locations.length} locations` : '1 location'}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="space-y-1">
                                    <div className="text-sm text-gray-900">{business.contact?.name}</div>
                                    <div className="text-sm text-gray-500">{business.contact?.email}</div>
                                    <div className="text-sm text-gray-500">{business.contact?.phone}</div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <div className="flex space-x-4">
                                    <button
                                      onClick={() => handleEditLocation(business)}
                                      className="text-accent hover:text-accent-dark"
                                      title="Edit"
                                    >
                                      <FaPencilAlt className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDuplicateLocation(business)}
                                      className="text-accent hover:text-accent-dark"
                                      title="Duplicate"
                                    >
                                      <FaCopy className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteLocation(business.id)}
                                      className="text-red-600 hover:text-red-900"
                                      title="Delete"
                                    >
                                      <FaTrashAlt className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Manage Users Tab - For admins */}
              {activeTab === 'users' && isAdmin && (
                <div>
                  <div className="max-w-4xl bg-gray-50 p-6 rounded-lg">
                    {/* Search Box */}
                    <div className="mb-6">
                      <label htmlFor="userSearchTerm" className="block text-sm font-medium text-gray-700 mb-2">
                        Search Users
                      </label>
                      <div className="flex items-center gap-4 mb-4">
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
                        <button
                          type="button"
                          onClick={() => handleUserSearch('', true)}
                          className="group relative p-2 rounded-lg border transition-all hover:scale-110 border-gray-300 hover:border-accent"
                          title="Show All Users"
                        >
                          <FaUsers className="w-8 h-8" />
                          <span className="tooltip invisible group-hover:visible absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap">
                            Show All Users
                          </span>
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          id="userSearchTerm"
                          className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent pr-10"
                          placeholder="Search by name, email, or role..."
                          onChange={(e) => handleUserSearch(e.target.value)}
                        />
                        <button
                          onClick={() => {
                            document.getElementById('userSearchTerm').value = '';
                            handleUserSearch('');
                          }}
                          className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* User Results */}
                    <div className="overflow-x-auto">
                      {searchLoading ? (
                        <div className="text-center py-4">
                          <p className="text-gray-600">Loading users...</p>
                        </div>
                      ) : searchResults.length === 0 ? (
                        <div className="text-center py-4">
                          <p className="text-gray-600">No users found. Try a different search term.</p>
                        </div>
                      ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                User
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Role & Access
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Businesses
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {searchResults.map((user) => (
                              <tr key={user.id}>
                                <td className="px-6 py-4">
                                  <div className="flex items-center space-x-2">
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">
                                        {user.firstName} {user.lastName}
                                        {user.role === 'admin' && (
                                          <span className="ml-2 text-yellow-500" title="Admin">★</span>
                                        )}
                                      </div>
                                      <div className="text-sm text-gray-500">{user.email}</div>
                                      {user.isBanned && (
                                        <div className="text-xs text-red-600 mt-1">
                                          Banned by {user.bannedBy?.adminName} on {user.bannedBy?.timestamp instanceof Date
                                            ? user.bannedBy.timestamp.toLocaleDateString()
                                            : user.bannedBy?.timestamp?.toDate?.()?.toLocaleDateString() || 'Unknown date'}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-900 capitalize">{user.role}</div>
                                  <div className="text-sm text-gray-500">
                                    {user.accessibleStates ? user.accessibleStates.join(', ') : 'No state access'}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-500">
                                    {user.businesses ? user.businesses.length : 0} businesses
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center space-x-3">
                                    {user.role !== 'admin' ? (
                                      <>
                                        {user.isBanned ? (
                                          <FaLockOpen
                                            className="w-5 h-5 text-green-600 hover:text-green-900 cursor-pointer"
                                            onClick={() => handleUnbanUser(user)}
                                            title="Unban User"
                                          />
                                        ) : (
                                          <FaLock
                                            className="w-5 h-5 text-yellow-600 hover:text-yellow-900 cursor-pointer"
                                            onClick={() => handleBanUser(user)}
                                            title="Ban User"
                                          />
                                        )}
                                        <FaTrashAlt
                                          className="w-5 h-5 text-red-600 hover:text-red-900 cursor-pointer"
                                          onClick={() => handleDeleteUser(user)}
                                          title="Delete User"
                                        />
                                      </>
                                    ) : null}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        type={modalConfig.type}
      />
    </Layout>
  );
} 