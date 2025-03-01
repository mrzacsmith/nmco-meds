import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDomain } from '../context/DomainContext';
import { Layout } from '../components/Layout';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const domain = useDomain();
  const navigate = useNavigate();
  const location = useLocation();

  const [domainParam, setDomainParam] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [businesses, setBusinesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Extract domain parameter from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const domain = searchParams.get('domain');
    setDomainParam(domain);

    // Redirect to login if not authenticated
    if (!user) {
      navigate(domain ? `/login?domain=${domain}` : '/login');
      return;
    }

    // Fetch user businesses
    fetchUserBusinesses();
  }, [user, location.search, navigate]);

  // Get link with domain parameter preserved
  const getLink = (path) => {
    return domainParam ? `${path}?domain=${domainParam}` : path;
  };

  // Mock function to fetch user businesses
  const fetchUserBusinesses = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setBusinesses([
        {
          id: 'b1',
          name: 'Green Leaf Dispensary',
          type: 'Dispensary',
          status: 'active',
          views: 1243,
          created: '2023-05-15',
          location: 'Albuquerque, NM'
        },
        {
          id: 'b2',
          name: 'Healing Buds',
          type: 'Delivery',
          status: 'pending',
          views: 568,
          created: '2023-08-22',
          location: 'Santa Fe, NM'
        }
      ]);
      setIsLoading(false);
    }, 1000);
  };

  // Mock recent activity data
  const recentActivity = [
    { id: 1, type: 'view', business: 'Green Leaf Dispensary', date: '2 hours ago', count: 45 },
    { id: 2, type: 'review', business: 'Green Leaf Dispensary', date: '1 day ago', rating: 4.5 },
    { id: 3, type: 'view', business: 'Healing Buds', date: '3 days ago', count: 120 },
  ];

  // Handle logout
  const handleLogout = async () => {
    await logout();
    navigate(getLink('/login'));
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {/* Sidebar */}
              <div className="w-full md:w-64 bg-gray-900 text-white p-6">
                <div className="mb-8">
                  <h2 className="text-xl font-bold">Business Dashboard</h2>
                  <p className="text-gray-400 text-sm mt-1">
                    {user?.email}
                  </p>
                </div>

                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`w-full text-left px-4 py-3 rounded-md flex items-center ${activeTab === 'overview' ? 'bg-accent text-white' : 'text-gray-300 hover:bg-gray-800'
                      }`}
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                    </svg>
                    Overview
                  </button>

                  <button
                    onClick={() => setActiveTab('businesses')}
                    className={`w-full text-left px-4 py-3 rounded-md flex items-center ${activeTab === 'businesses' ? 'bg-accent text-white' : 'text-gray-300 hover:bg-gray-800'
                      }`}
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                    My Businesses
                  </button>

                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`w-full text-left px-4 py-3 rounded-md flex items-center ${activeTab === 'settings' ? 'bg-accent text-white' : 'text-gray-300 hover:bg-gray-800'
                      }`}
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    Settings
                  </button>
                </nav>

                <div className="mt-auto pt-8">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 rounded-md flex items-center text-gray-300 hover:bg-gray-800"
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                    </svg>
                    Logout
                  </button>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>

                    {isLoading ? (
                      <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
                      </div>
                    ) : (
                      <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                            <div className="flex items-center">
                              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                </svg>
                              </div>
                              <div>
                                <p className="text-gray-500 text-sm">Total Businesses</p>
                                <h3 className="text-2xl font-bold">{businesses.length}</h3>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                            <div className="flex items-center">
                              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                </svg>
                              </div>
                              <div>
                                <p className="text-gray-500 text-sm">Total Views</p>
                                <h3 className="text-2xl font-bold">{businesses.reduce((sum, b) => sum + b.views, 0)}</h3>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                            <div className="flex items-center">
                              <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                              </div>
                              <div>
                                <p className="text-gray-500 text-sm">Active Listings</p>
                                <h3 className="text-2xl font-bold">
                                  {businesses.filter(b => b.status === 'active').length}
                                </h3>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                          <div className="px-6 py-4 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-900">Recent Activity</h3>
                          </div>
                          <div className="divide-y divide-gray-100">
                            {recentActivity.map(activity => (
                              <div key={activity.id} className="px-6 py-4">
                                <div className="flex items-center">
                                  <div className={`p-2 rounded-full mr-4 ${activity.type === 'view' ? 'bg-blue-100 text-blue-600' : 'bg-yellow-100 text-yellow-600'
                                    }`}>
                                    {activity.type === 'view' ? (
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                      </svg>
                                    ) : (
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                                      </svg>
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {activity.business}
                                      {activity.type === 'view' ? ` received ${activity.count} views` : ` received a ${activity.rating} star review`}
                                    </p>
                                    <p className="text-sm text-gray-500">{activity.date}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Businesses Tab */}
                {activeTab === 'businesses' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h1 className="text-2xl font-bold text-gray-900">My Businesses</h1>
                      <button className="bg-accent hover:bg-dark text-white px-4 py-2 rounded-md transition duration-300">
                        Add New Business
                      </button>
                    </div>

                    {isLoading ? (
                      <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
                      </div>
                    ) : (
                      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
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
                                Location
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Views
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
                                  <div className="font-medium text-gray-900">{business.name}</div>
                                  <div className="text-sm text-gray-500">Created {business.created}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {business.type}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {business.location}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${business.status === 'active'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {business.status === 'active' ? 'Active' : 'Pending'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {business.views}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <button className="text-accent hover:text-dark mr-3">Edit</button>
                                  <button className="text-red-600 hover:text-red-900">Delete</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h1>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                      <form className="space-y-6">
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                          </label>
                          <input
                            id="email"
                            name="email"
                            type="email"
                            defaultValue={user?.email}
                            className="block w-full px-3 py-3 bg-gray-900 text-white border-0 rounded-md shadow-sm focus:ring-accent focus:border-accent"
                          />
                        </div>

                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                          </label>
                          <input
                            id="name"
                            name="name"
                            type="text"
                            defaultValue={user?.displayName || ''}
                            className="block w-full px-3 py-3 bg-gray-900 text-white border-0 rounded-md shadow-sm focus:ring-accent focus:border-accent"
                          />
                        </div>

                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                          </label>
                          <input
                            id="phone"
                            name="phone"
                            type="tel"
                            defaultValue={user?.phoneNumber || ''}
                            className="block w-full px-3 py-3 bg-gray-900 text-white border-0 rounded-md shadow-sm focus:ring-accent focus:border-accent"
                          />
                        </div>

                        <div className="pt-4">
                          <button
                            type="submit"
                            className="w-full py-3 bg-dark text-white rounded-md hover:bg-accent transition duration-300"
                          >
                            Save Changes
                          </button>
                        </div>
                      </form>
                    </div>

                    <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-4">Change Password</h2>
                      <form className="space-y-6">
                        <div>
                          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Current Password
                          </label>
                          <input
                            id="currentPassword"
                            name="currentPassword"
                            type="password"
                            className="block w-full px-3 py-3 bg-gray-900 text-white border-0 rounded-md shadow-sm focus:ring-accent focus:border-accent"
                            placeholder="••••••••"
                          />
                        </div>

                        <div>
                          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            New Password
                          </label>
                          <input
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            className="block w-full px-3 py-3 bg-gray-900 text-white border-0 rounded-md shadow-sm focus:ring-accent focus:border-accent"
                            placeholder="••••••••"
                          />
                        </div>

                        <div>
                          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm New Password
                          </label>
                          <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            className="block w-full px-3 py-3 bg-gray-900 text-white border-0 rounded-md shadow-sm focus:ring-accent focus:border-accent"
                            placeholder="••••••••"
                          />
                        </div>

                        <div className="pt-4">
                          <button
                            type="submit"
                            className="w-full py-3 bg-dark text-white rounded-md hover:bg-accent transition duration-300"
                          >
                            Update Password
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
      </div>
    </Layout>
  );
} 