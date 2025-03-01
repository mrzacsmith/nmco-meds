import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link, redirect } from '@remix-run/react';
import { json } from '@remix-run/node';
import { Layout } from '~/components/Layout';
import { useDomain } from '~/context/DomainContext';
import { useAuth } from '~/context/AuthContext';
import { getUserBusinesses } from '~/lib/firebase';

export function meta({ matches }) {
  const domain = matches.find(match => match.id === 'root')?.data?.domain || '505meds';
  const domainName = domain === '303meds' ? '303 Meds' : '505 Meds';
  const state = domain === '303meds' ? 'Colorado' : 'New Mexico';

  return [
    { title: `Dashboard - ${domainName} | Manage Your Cannabis Business` },
    { name: "description", content: `Manage your cannabis business listing on ${domainName} in ${state}.` },
  ];
}

// Server-side authentication check
export async function loader({ request }) {
  try {
    // Import the requireAuth function
    const { requireAuth } = await import('~/lib/auth-server');

    // Check if the user is authenticated
    const { userId, user } = await requireAuth(request, {
      failureRedirect: '/login',
    });

    // Return the user data
    return json({
      userId,
      userData: user,
    });
  } catch (error) {
    // If there's an error with the server-side auth, fall back to client-side
    console.error('Server-side auth error:', error);
    return json({});
  }
}

export default function Dashboard() {
  const domain = useDomain();
  const { user, userProfile, isAuthenticated, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [domainParam, setDomainParam] = useState(null);
  const [businesses, setBusinesses] = useState({ co: [], nm: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('businesses');

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

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate(getLink('/login'));
    }
  }, [isAuthenticated, loading, navigate]);

  // Fetch user's businesses
  useEffect(() => {
    const fetchBusinesses = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        const { businesses: userBusinesses, error: fetchError } = await getUserBusinesses(user.uid);
        if (fetchError) {
          setError(fetchError);
        } else {
          setBusinesses(userBusinesses);
        }
      } catch (err) {
        setError('Failed to load your businesses. Please try again.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusinesses();
  }, [user]);

  // If still loading auth state, show loading indicator
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <p className="text-lg text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Get businesses for the current domain's state
  const currentStateBusinesses = domain.stateCode === 'CO' ? businesses.co : businesses.nm;
  const otherStateBusinesses = domain.stateCode === 'CO' ? businesses.nm : businesses.co;
  const otherStateName = domain.stateCode === 'CO' ? 'New Mexico' : 'Colorado';

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Dashboard Header */}
            <div className="bg-primary text-white px-6 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold">Business Dashboard</h1>
                  <p className="text-sm opacity-80">
                    Welcome back, {userProfile?.displayName || user?.email}
                  </p>
                </div>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="px-4 py-2 bg-white text-primary rounded-md hover:bg-gray-100 transition duration-150 ease-in-out"
                  >
                    Admin Dashboard
                  </Link>
                )}
              </div>
            </div>

            {/* Dashboard Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('businesses')}
                  className={`px-6 py-3 border-b-2 font-medium text-sm ${activeTab === 'businesses'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  My Businesses
                </button>
                <button
                  onClick={() => setActiveTab('account')}
                  className={`px-6 py-3 border-b-2 font-medium text-sm ${activeTab === 'account'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  Account Settings
                </button>
                <button
                  onClick={() => setActiveTab('billing')}
                  className={`px-6 py-3 border-b-2 font-medium text-sm ${activeTab === 'billing'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  Subscription & Billing
                </button>
              </nav>
            </div>

            {/* Dashboard Content */}
            <div className="p-6">
              {error && (
                <div className="mb-6 p-3 bg-red-100 border border-red-200 text-red-700 rounded">
                  {error}
                </div>
              )}

              {activeTab === 'businesses' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">
                      My Businesses in {domain.stateName}
                    </h2>
                    <Link
                      to={getLink('/add-business')}
                      className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary-dark transition duration-150 ease-in-out"
                    >
                      Add New Business
                    </Link>
                  </div>

                  {isLoading ? (
                    <p className="text-gray-600">Loading your businesses...</p>
                  ) : currentStateBusinesses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentStateBusinesses.map((business) => (
                        <div
                          key={business.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-150 ease-in-out"
                        >
                          <div className="flex items-start">
                            <div className="w-16 h-16 bg-gray-200 rounded-md mr-4 overflow-hidden">
                              {business.images && business.images[0] ? (
                                <img
                                  src={business.images[0]}
                                  alt={business.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-300">
                                  <span className="text-gray-500 text-xs">No image</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{business.name}</h3>
                              <p className="text-sm text-gray-600">
                                {business.city}, {business.state}
                              </p>
                              <div className="mt-1">
                                <span className={`inline-block px-2 py-1 text-xs rounded-full ${business.planLevel === 'elite'
                                  ? 'bg-purple-100 text-purple-800'
                                  : business.planLevel === 'featured'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                                  }`}>
                                  {business.planLevel === 'elite'
                                    ? 'Elite'
                                    : business.planLevel === 'featured'
                                      ? 'Featured'
                                      : 'Free'}
                                </span>
                              </div>
                            </div>
                            <div>
                              <Link
                                to={getLink(`/business/${business.id}/edit`)}
                                className="text-primary hover:text-primary-dark text-sm"
                              >
                                Edit
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                      <p className="text-gray-600 mb-4">
                        You don't have any businesses listed in {domain.stateName} yet.
                      </p>
                      <Link
                        to={getLink('/add-business')}
                        className="inline-block px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition duration-150 ease-in-out"
                      >
                        Add Your First Business
                      </Link>
                    </div>
                  )}

                  {/* Other state businesses if user has multi-state operations */}
                  {userProfile?.isMultiState && otherStateBusinesses.length > 0 && (
                    <div className="mt-8">
                      <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        My Businesses in {otherStateName}
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {otherStateBusinesses.map((business) => (
                          <div
                            key={business.id}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-150 ease-in-out"
                          >
                            <div className="flex items-start">
                              <div className="w-16 h-16 bg-gray-200 rounded-md mr-4 overflow-hidden">
                                {business.images && business.images[0] ? (
                                  <img
                                    src={business.images[0]}
                                    alt={business.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gray-300">
                                    <span className="text-gray-500 text-xs">No image</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg">{business.name}</h3>
                                <p className="text-sm text-gray-600">
                                  {business.city}, {business.state}
                                </p>
                                <div className="mt-1">
                                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${business.planLevel === 'elite'
                                    ? 'bg-purple-100 text-purple-800'
                                    : business.planLevel === 'featured'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {business.planLevel === 'elite'
                                      ? 'Elite'
                                      : business.planLevel === 'featured'
                                        ? 'Featured'
                                        : 'Free'}
                                  </span>
                                </div>
                              </div>
                              <div>
                                <Link
                                  to={`/${domain.stateCode === 'CO' ? '505meds' : '303meds'}?redirect=/business/${business.id}/edit`}
                                  className="text-primary hover:text-primary-dark text-sm"
                                >
                                  Edit
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'account' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">Account Settings</h2>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Profile Information</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Name
                            </label>
                            <div className="bg-white border border-gray-300 rounded-md px-3 py-2">
                              {userProfile?.displayName || 'Not set'}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email
                            </label>
                            <div className="bg-white border border-gray-300 rounded-md px-3 py-2">
                              {user?.email}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Company Name
                            </label>
                            <div className="bg-white border border-gray-300 rounded-md px-3 py-2">
                              {userProfile?.companyName || 'Not set'}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Phone
                            </label>
                            <div className="bg-white border border-gray-300 rounded-md px-3 py-2">
                              {userProfile?.phone || 'Not set'}
                            </div>
                          </div>
                        </div>

                        <div className="mt-6">
                          <Link
                            to={getLink('/account/edit')}
                            className="inline-block px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition duration-150 ease-in-out"
                          >
                            Edit Profile
                          </Link>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Account Details</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Account Type
                            </label>
                            <div className="bg-white border border-gray-300 rounded-md px-3 py-2">
                              {userProfile?.role === 'admin' ? 'Administrator' : 'Business Operator'}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              States of Operation
                            </label>
                            <div className="bg-white border border-gray-300 rounded-md px-3 py-2">
                              {userProfile?.states?.length > 0
                                ? userProfile.states.map(state =>
                                  state === 'CO' ? 'Colorado' : 'New Mexico'
                                ).join(', ')
                                : 'None selected'}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Account Created
                            </label>
                            <div className="bg-white border border-gray-300 rounded-md px-3 py-2">
                              {userProfile?.createdAt
                                ? new Date(userProfile.createdAt.seconds * 1000).toLocaleDateString()
                                : 'Unknown'}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Last Login
                            </label>
                            <div className="bg-white border border-gray-300 rounded-md px-3 py-2">
                              {userProfile?.lastLogin
                                ? new Date(userProfile.lastLogin.seconds * 1000).toLocaleDateString()
                                : 'Unknown'}
                            </div>
                          </div>
                        </div>

                        <div className="mt-6">
                          <button
                            className="inline-block px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-150 ease-in-out"
                          >
                            Change Password
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'billing' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">Subscription & Billing</h2>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Current Subscription Plans</h3>

                    {currentStateBusinesses.length > 0 ? (
                      <div className="space-y-4">
                        {currentStateBusinesses.map((business) => (
                          <div key={business.id} className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{business.name}</h4>
                                <p className="text-sm text-gray-600">
                                  {business.city}, {business.state}
                                </p>
                                <div className="mt-2">
                                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${business.planLevel === 'elite'
                                    ? 'bg-purple-100 text-purple-800'
                                    : business.planLevel === 'featured'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {business.planLevel === 'elite'
                                      ? 'Elite Plan'
                                      : business.planLevel === 'featured'
                                        ? 'Featured Plan'
                                        : 'Free Listing'}
                                  </span>
                                  {business.planBilling && (
                                    <span className="ml-2 text-xs text-gray-600">
                                      ({business.planBilling === 'annual' ? 'Annual' : 'Monthly'})
                                    </span>
                                  )}
                                </div>
                                {business.planExpiry && (
                                  <p className="text-xs text-gray-600 mt-1">
                                    Expires: {new Date(business.planExpiry.seconds * 1000).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                              <div>
                                {business.planLevel === 'free' ? (
                                  <Link
                                    to={getLink(`/upgrade/${business.id}`)}
                                    className="inline-block px-3 py-1 bg-secondary text-white text-sm rounded hover:bg-secondary-dark transition duration-150 ease-in-out"
                                  >
                                    Upgrade
                                  </Link>
                                ) : (
                                  <Link
                                    to={getLink(`/manage-subscription/${business.id}`)}
                                    className="inline-block px-3 py-1 bg-primary text-white text-sm rounded hover:bg-primary-dark transition duration-150 ease-in-out"
                                  >
                                    Manage
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-600 mb-4">
                          You don't have any businesses in {domain.stateName} yet.
                        </p>
                        <Link
                          to={getLink('/add-business')}
                          className="inline-block px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition duration-150 ease-in-out"
                        >
                          Add Your First Business
                        </Link>
                      </div>
                    )}

                    <div className="mt-8">
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Corporate Plans</h3>

                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <div className="flex-1">
                            <h4 className="font-medium">Corporate Subscription</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              Manage up to 25 locations in {domain.stateName} with premium features and priority support.
                            </p>
                            <div className="mt-2">
                              <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                                Not Subscribed
                              </span>
                            </div>
                          </div>
                          <div>
                            <Link
                              to={getLink('/corporate-plans')}
                              className="inline-block px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition duration-150 ease-in-out"
                            >
                              View Plans
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8">
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Payment Methods</h3>

                      <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                        <p className="text-gray-600 mb-4">
                          No payment methods on file.
                        </p>
                        <button
                          className="inline-block px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition duration-150 ease-in-out"
                        >
                          Add Payment Method
                        </button>
                      </div>
                    </div>

                    <div className="mt-8">
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Billing History</h3>

                      <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                        <p className="text-gray-600">
                          No billing history available.
                        </p>
                      </div>
                    </div>
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