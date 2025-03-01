import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDomain } from '../context/DomainContext';

export default function Subscription() {
  const { user, logout } = useAuth();
  const domain = useDomain();
  const navigate = useNavigate();
  const location = useLocation();

  const [domainParam, setDomainParam] = useState(null);
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

    // Fetch user subscription
    fetchUserSubscription();
  }, [user, location.search, navigate]);

  // Get link with domain parameter preserved
  const getLink = (path) => {
    return domainParam ? `${path}?domain=${domainParam}` : path;
  };

  // Mock function to fetch user subscription
  const fetchUserSubscription = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setActiveSubscription({
        plan: 'Basic',
        status: 'active',
        nextBillingDate: '2023-12-01',
        price: '$19.99',
        features: [
          'Up to 3 business listings',
          'Basic analytics',
          'Standard support'
        ]
      });
      setIsLoading(false);
    }, 1000);
  };

  // Toggle sidebar collapse
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
    navigate(getLink('/login'));
  };

  // Available subscription plans
  const subscriptionPlans = [
    {
      id: 'basic',
      name: 'Basic',
      price: '$19.99',
      period: 'month',
      features: [
        'Up to 3 business listings',
        'Basic analytics',
        'Standard support',
        'Featured in search results'
      ],
      isPopular: false
    },
    {
      id: 'pro',
      name: 'Professional',
      price: '$49.99',
      period: 'month',
      features: [
        'Up to 10 business listings',
        'Advanced analytics',
        'Priority support',
        'Featured in search results',
        'Custom business profile',
        'Promotional offers'
      ],
      isPopular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '$99.99',
      period: 'month',
      features: [
        'Unlimited business listings',
        'Comprehensive analytics',
        'Dedicated support',
        'Featured in search results',
        'Custom business profile',
        'Promotional offers',
        'API access',
        'White-label options'
      ],
      isPopular: false
    }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`bg-gray-900 text-white transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'
          }`}
      >
        <div className="p-4 flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between mb-6">
            {!sidebarCollapsed && (
              <h2 className="text-xl font-bold">Dashboard</h2>
            )}
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-md hover:bg-gray-800"
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {sidebarCollapsed ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                )}
              </svg>
            </button>
          </div>

          {/* User Info */}
          {!sidebarCollapsed && (
            <div className="mb-6">
              <p className="text-gray-400 text-sm">
                {user?.email}
              </p>
            </div>
          )}

          {/* Navigation */}
          <nav className="space-y-2 flex-grow">
            <button
              onClick={() => navigate(getLink('/dashboard'))}
              className={`w-full text-left px-3 py-3 rounded-md flex ${sidebarCollapsed ? 'justify-center' : ''} items-center text-gray-300 hover:bg-gray-800`}
              title="Overview"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
              {!sidebarCollapsed && <span className="ml-3">Overview</span>}
            </button>

            <button
              onClick={() => navigate(getLink('/dashboard'))}
              className={`w-full text-left px-3 py-3 rounded-md flex ${sidebarCollapsed ? 'justify-center' : ''} items-center text-gray-300 hover:bg-gray-800`}
              title="My Businesses"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
              {!sidebarCollapsed && <span className="ml-3">My Businesses</span>}
            </button>

            <button
              onClick={() => navigate(getLink('/dashboard'))}
              className={`w-full text-left px-3 py-3 rounded-md flex ${sidebarCollapsed ? 'justify-center' : ''} items-center text-gray-300 hover:bg-gray-800`}
              title="Settings"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              {!sidebarCollapsed && <span className="ml-3">Settings</span>}
            </button>

            <button
              onClick={() => navigate(getLink('/subscription'))}
              className={`w-full text-left px-3 py-3 rounded-md flex ${sidebarCollapsed ? 'justify-center' : ''} items-center bg-accent text-white`}
              title="Subscription"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
              </svg>
              {!sidebarCollapsed && <span className="ml-3">Subscription</span>}
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Subscription Management</h1>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
          </div>
        ) : (
          <>
            {/* Current Subscription */}
            {activeSubscription && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-8 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Subscription</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-500 mb-1">Plan</p>
                    <p className="font-medium">{activeSubscription.plan}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Status</p>
                    <p className="font-medium">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {activeSubscription.status}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Next Billing Date</p>
                    <p className="font-medium">{activeSubscription.nextBillingDate}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Price</p>
                    <p className="font-medium">{activeSubscription.price}/month</p>
                  </div>
                </div>
                <div className="mt-6">
                  <h3 className="text-md font-medium text-gray-900 mb-2">Features</h3>
                  <ul className="space-y-1">
                    {activeSubscription.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-gray-600">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-6 flex space-x-4">
                  <button className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition duration-300">
                    Upgrade Plan
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition duration-300">
                    Cancel Subscription
                  </button>
                </div>
              </div>
            )}

            {/* Available Plans */}
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Available Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {subscriptionPlans.map((plan) => (
                <div key={plan.id} className={`bg-white rounded-lg shadow-sm border ${plan.isPopular ? 'border-accent' : 'border-gray-100'} overflow-hidden`}>
                  {plan.isPopular && (
                    <div className="bg-accent text-white text-center py-1 text-sm font-medium">
                      Most Popular
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      <span className="text-gray-500">/{plan.period}</span>
                    </div>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      className={`w-full py-2 rounded-md transition duration-300 ${activeSubscription && activeSubscription.plan === plan.name
                        ? 'bg-gray-200 text-gray-700 cursor-not-allowed'
                        : 'bg-dark text-white hover:bg-accent'
                        }`}
                      disabled={activeSubscription && activeSubscription.plan === plan.name}
                    >
                      {activeSubscription && activeSubscription.plan === plan.name
                        ? 'Current Plan'
                        : 'Select Plan'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Billing History */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-8">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Billing History</h2>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Invoice
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          Nov 1, 2023
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          $19.99
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Paid
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <a href="#" className="text-accent hover:underline">
                            Download
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          Oct 1, 2023
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          $19.99
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Paid
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <a href="#" className="text-accent hover:underline">
                            Download
                          </a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 