import { useState, useEffect } from 'react';
import { useLoaderData, Link } from '@remix-run/react';
import { json, redirect } from '@remix-run/node';
import { Layout } from '~/components/Layout';
import { useDomain } from '~/context/DomainContext';
import { useAuth } from '~/context/AuthContext';

export function meta({ matches }) {
  const domain = matches.find(match => match.id === 'root')?.data?.domain || '505meds';
  const domainName = domain === '303meds' ? '303 Meds' : '505 Meds';

  return [
    { title: `Admin Dashboard - ${domainName}` },
    { name: "description", content: `Admin dashboard for ${domainName}.` },
  ];
}

// Server-side authentication check with admin role requirement
export async function loader({ request }) {
  try {
    // Import the requireAuth function
    const { requireAuth } = await import('~/lib/auth-server');

    // Check if the user is authenticated and has admin role
    const { userId, user } = await requireAuth(request, {
      failureRedirect: '/login',
      requireAdmin: true,
    });

    // Return the user data
    return json({
      userId,
      userData: user,
    });
  } catch (error) {
    // If there's an error or user is not admin, redirect to dashboard
    return redirect('/dashboard');
  }
}

export default function Admin() {
  const domain = useDomain();
  const { user, userProfile, isAuthenticated, isAdmin, loading } = useAuth();
  const loaderData = useLoaderData();
  const [activeTab, setActiveTab] = useState('users');

  // Client-side admin check as a fallback
  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) {
      window.location.href = '/dashboard';
    }
  }, [isAuthenticated, isAdmin, loading]);

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

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Admin Dashboard Header */}
            <div className="bg-purple-700 text-white px-6 py-4">
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm opacity-80">
                Welcome, {userProfile?.displayName || user?.email}
              </p>
            </div>

            {/* Admin Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('users')}
                  className={`px-6 py-3 border-b-2 font-medium text-sm ${activeTab === 'users'
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  Users
                </button>
                <button
                  onClick={() => setActiveTab('businesses')}
                  className={`px-6 py-3 border-b-2 font-medium text-sm ${activeTab === 'businesses'
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  Businesses
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-6 py-3 border-b-2 font-medium text-sm ${activeTab === 'settings'
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  Settings
                </button>
              </nav>
            </div>

            {/* Admin Content */}
            <div className="p-6">
              {activeTab === 'users' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">User Management</h2>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition duration-150 ease-in-out">
                      Add New User
                    </button>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-4">
                    <p className="text-gray-600">
                      This is a placeholder for the user management interface. In a real implementation,
                      you would see a list of users with options to edit roles, reset passwords, etc.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'businesses' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">Business Management</h2>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition duration-150 ease-in-out">
                      Add New Business
                    </button>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-4">
                    <p className="text-gray-600">
                      This is a placeholder for the business management interface. In a real implementation,
                      you would see a list of businesses with options to approve, edit, or delete listings.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">System Settings</h2>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition duration-150 ease-in-out">
                      Save Changes
                    </button>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-4">
                    <p className="text-gray-600">
                      This is a placeholder for the system settings interface. In a real implementation,
                      you would see options to configure the application, manage domains, etc.
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-6">
                <Link
                  to="/dashboard"
                  className="text-purple-600 hover:text-purple-800 font-medium"
                >
                  ← Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 