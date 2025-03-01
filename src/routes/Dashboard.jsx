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
  getDoc
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';

export default function Dashboard() {
  const { currentUser, userProfile, logout, hasRole, hasStateAccess } = useAuth();
  const domain = useDomain();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('businesses');
  const [businesses, setBusinesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [domainParam, setDomainParam] = useState(null);
  const selectedState = domain.state || 'NM';
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('operator');
  const [inviteBusinessId, setInviteBusinessId] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');

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

      setIsLoading(true);
      setError('');

      try {
        let businessesData = [];

        // If user is admin, fetch all businesses for the selected state
        if (userProfile.role === 'admin') {
          const businessesRef = collection(db, `businesses-${selectedState.toLowerCase()}`);
          const businessesSnapshot = await getDocs(businessesRef);

          businessesData = businessesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            type: 'Dispensary', // Default type for display
            status: 'active',    // Default status for display
            views: Math.floor(Math.random() * 1000), // Random views for display
            created: new Date(doc.data().createdAt?.toDate()).toISOString().split('T')[0] || 'N/A',
            location: `${doc.data().city || 'Unknown'}, ${selectedState}`
          }));
        }
        // Otherwise, fetch only businesses the user has access to
        else if (userProfile.businesses && userProfile.businesses.length > 0) {
          // Filter businesses by state
          const userBusinessesInState = userProfile.businesses.filter(b => b.state === selectedState);

          // Fetch each business
          for (const business of userBusinessesInState) {
            const businessRef = doc(db, `businesses-${selectedState.toLowerCase()}`, business.businessId);
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
                location: `${data.city || 'Unknown'}, ${selectedState}`
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
  }, [currentUser, userProfile, selectedState, db]);

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

    if (!inviteEmail || !inviteBusinessId) {
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
        state: selectedState,
        role: inviteRole
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
  const canAccessState = hasStateAccess(selectedState);

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
                  Welcome, {userProfile.firstName} {userProfile.lastName} | Role: {userProfile.role} | State: {selectedState}
                </p>
              )}
            </div>

            {/* Dashboard Tabs */}
            <div className="border-b">
              <nav className="flex">
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
                  className={`px-6 py-4 text-sm font-medium ${activeTab === 'settings'
                    ? 'border-b-2 border-accent text-accent'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                  onClick={() => setActiveTab('settings')}
                >
                  Account Settings
                </button>
                {(hasRole('admin') || businesses.some(b => b.userRole === 'owner')) && (
                  <button
                    className={`px-6 py-4 text-sm font-medium ${activeTab === 'invite'
                      ? 'border-b-2 border-accent text-accent'
                      : 'text-gray-500 hover:text-gray-700'
                      }`}
                    onClick={() => setActiveTab('invite')}
                  >
                    Invite Users
                  </button>
                )}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* Businesses Tab */}
              {activeTab === 'businesses' && (
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
                      <p className="text-gray-600">You don't have any businesses in {selectedState} yet.</p>
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

              {/* Activity Tab */}
              {activeTab === 'activity' && (
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

              {/* Settings Tab */}
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
                          <div>
                            <p className="text-sm text-gray-500">Accessible States</p>
                            <p className="font-medium">
                              {userProfile.accessibleStates ? userProfile.accessibleStates.join(', ') : 'None'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Invite Users Tab */}
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
                          <option value="operator">Operator</option>
                          {hasRole('admin') && <option value="admin">Admin</option>}
                        </select>
                      </div>

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