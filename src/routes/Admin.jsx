import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDomain } from '../context/DomainContext';
import { Layout } from '../components/Layout';

export default function Admin() {
  const { user, isAuthenticated, hasRole } = useAuth();
  const domain = useDomain();
  const navigate = useNavigate();
  const location = useLocation();
  const [domainParam, setDomainParam] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Extract domain parameter from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const domain = searchParams.get('domain');
    setDomainParam(domain);

    // Redirect to login if not authenticated or not an admin
    if (!isAuthenticated() || !hasRole('admin')) {
      navigate(getLink('/login'));
    }
  }, [location.search, isAuthenticated, hasRole, navigate]);

  // Get link with domain parameter preserved
  const getLink = (path) => {
    return domainParam ? `${path}?domain=${domainParam}` : path;
  };

  // Mock data for businesses
  const businesses = [
    {
      id: 1,
      name: "Green Harvest Dispensary",
      owner: "John Smith",
      type: "Dispensary",
      status: "Active",
      created: "2023-08-15",
    },
    {
      id: 2,
      name: "Healing Leaf Collective",
      owner: "Sarah Johnson",
      type: "Dispensary",
      status: "Pending Review",
      created: "2023-09-10",
    },
    {
      id: 3,
      name: "Mountain High",
      owner: "Michael Brown",
      type: "Delivery",
      status: "Active",
      created: "2023-07-22",
    }
  ];

  // Mock data for users
  const users = [
    {
      id: 1,
      name: "John Smith",
      email: "john@example.com",
      role: "Business Owner",
      status: "Active",
      joined: "2023-08-10",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah@example.com",
      role: "Business Owner",
      status: "Active",
      joined: "2023-09-05",
    },
    {
      id: 3,
      name: "Michael Brown",
      email: "michael@example.com",
      role: "Business Owner",
      status: "Active",
      joined: "2023-07-15",
    },
    {
      id: 4,
      name: "Admin User",
      email: "admin@example.com",
      role: "Admin",
      status: "Active",
      joined: "2023-01-01",
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-1/4">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-center mb-6">
                  <div className="h-20 w-20 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    {user?.name?.charAt(0) || 'A'}
                  </div>
                  <h2 className="text-xl font-bold text-primary">{user?.name || 'Admin'}</h2>
                  <p className="text-gray-600">{user?.email}</p>
                  <div className="mt-2 inline-block px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                    Administrator
                  </div>
                </div>

                <nav className="mt-8">
                  <ul className="space-y-2">
                    <li>
                      <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`w-full text-left px-4 py-2 rounded-md transition duration-300 ${activeTab === 'dashboard'
                          ? 'bg-primary text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                          }`}
                      >
                        Dashboard
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveTab('businesses')}
                        className={`w-full text-left px-4 py-2 rounded-md transition duration-300 ${activeTab === 'businesses'
                          ? 'bg-primary text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                          }`}
                      >
                        Manage Businesses
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveTab('users')}
                        className={`w-full text-left px-4 py-2 rounded-md transition duration-300 ${activeTab === 'users'
                          ? 'bg-primary text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                          }`}
                      >
                        Manage Users
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveTab('settings')}
                        className={`w-full text-left px-4 py-2 rounded-md transition duration-300 ${activeTab === 'settings'
                          ? 'bg-primary text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                          }`}
                      >
                        Site Settings
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4">
              {/* Dashboard Tab */}
              {activeTab === 'dashboard' && (
                <div>
                  <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <h2 className="text-2xl font-bold text-primary mb-6">Admin Dashboard</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-700 mb-2">Total Businesses</h3>
                        <p className="text-3xl font-bold text-primary">{businesses.length}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-700 mb-2">Total Users</h3>
                        <p className="text-3xl font-bold text-primary">{users.length}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-700 mb-2">Pending Reviews</h3>
                        <p className="text-3xl font-bold text-yellow-500">
                          {businesses.filter(b => b.status === 'Pending Review').length}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-2xl font-bold text-primary mb-6">Recent Activity</h2>
                    <div className="space-y-4">
                      <div className="border-b border-gray-200 pb-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-800">New Business Registration</h3>
                            <p className="text-gray-600">Healing Leaf Collective by Sarah Johnson</p>
                          </div>
                          <span className="text-sm text-gray-500">2023-09-10</span>
                        </div>
                      </div>
                      <div className="border-b border-gray-200 pb-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-800">New User Registration</h3>
                            <p className="text-gray-600">Sarah Johnson (sarah@example.com)</p>
                          </div>
                          <span className="text-sm text-gray-500">2023-09-05</span>
                        </div>
                      </div>
                      <div className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-800">Business Status Update</h3>
                            <p className="text-gray-600">Green Harvest Dispensary marked as Active</p>
                          </div>
                          <span className="text-sm text-gray-500">2023-08-20</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Businesses Tab */}
              {activeTab === 'businesses' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-primary">Manage Businesses</h2>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Search businesses..."
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent"
                      />
                      <button className="bg-secondary hover:bg-accent text-white hover:text-dark px-4 py-2 rounded-md transition duration-300">
                        Search
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Business Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Owner
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {businesses.map(business => (
                          <tr key={business.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">{business.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-gray-600">{business.owner}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-gray-600">{business.type}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${business.status === 'Active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                {business.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                              {business.created}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button className="text-secondary hover:text-accent mr-3">
                                Edit
                              </button>
                              <button className="text-red-600 hover:text-red-800">
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Users Tab */}
              {activeTab === 'users' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-primary">Manage Users</h2>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Search users..."
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent"
                      />
                      <button className="bg-secondary hover:bg-accent text-white hover:text-dark px-4 py-2 rounded-md transition duration-300">
                        Search
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Joined
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map(user => (
                          <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">{user.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-gray-600">{user.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${user.role === 'Admin'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                                }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                {user.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                              {user.joined}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button className="text-secondary hover:text-accent mr-3">
                                Edit
                              </button>
                              <button className="text-red-600 hover:text-red-800">
                                Delete
                              </button>
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
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-2xl font-bold text-primary mb-6">Site Settings</h2>

                  <form className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-4">General Settings</h3>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 mb-1">
                            Site Name
                          </label>
                          <input
                            id="siteName"
                            name="siteName"
                            type="text"
                            defaultValue={domain.name}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent"
                          />
                        </div>

                        <div>
                          <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700 mb-1">
                            Site Description
                          </label>
                          <textarea
                            id="siteDescription"
                            name="siteDescription"
                            rows={3}
                            defaultValue={`Find the best cannabis dispensaries in ${domain.state}`}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Business Approval Settings</h3>
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <input
                            id="autoApprove"
                            name="autoApprove"
                            type="checkbox"
                            className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
                          />
                          <label htmlFor="autoApprove" className="ml-2 block text-sm text-gray-700">
                            Auto-approve new business listings
                          </label>
                        </div>

                        <div className="flex items-center">
                          <input
                            id="emailNotifications"
                            name="emailNotifications"
                            type="checkbox"
                            defaultChecked
                            className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
                          />
                          <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-700">
                            Send email notifications for new business registrations
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="bg-secondary hover:bg-accent text-white hover:text-dark px-4 py-2 rounded-md transition duration-300"
                      >
                        Save Settings
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 