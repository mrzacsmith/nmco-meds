import { useState, useEffect } from 'react';
import { Form, useActionData, useNavigate, Link, useLocation } from '@remix-run/react';
import { json, redirect } from '@remix-run/node';
import { Layout } from '~/components/Layout';
import { useDomain } from '~/context/DomainContext';
import { useAuth } from '~/context/AuthContext';
import { loginWithEmail, loginWithGoogle } from '~/lib/firebase';

export function meta({ matches }) {
  const domain = matches.find(match => match.id === 'root')?.data?.domain || '505meds';
  const domainName = domain === '303meds' ? '303 Meds' : '505 Meds';
  const state = domain === '303meds' ? 'Colorado' : 'New Mexico';

  return [
    { title: `Login - ${domainName} | Cannabis Directory in ${state}` },
    { name: "description", content: `Login to your ${domainName} business account to manage your cannabis business listing in ${state}.` },
  ];
}

export async function action({ request }) {
  const formData = await request.formData();
  const email = formData.get('email');
  const password = formData.get('password');

  // Basic validation
  if (!email || !password) {
    return json({ success: false, error: 'Email and password are required' });
  }

  // Note: In a real implementation, we would handle authentication server-side
  // For now, we'll return a message that client-side auth will be used
  return json({
    success: true,
    email,
    message: 'Please use client-side authentication'
  });
}

export default function Login() {
  const domain = useDomain();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const actionData = useActionData();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [domainParam, setDomainParam] = useState(null);

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

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(getLink('/dashboard'));
    }
  }, [isAuthenticated, navigate]);

  // Handle email login
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      const { user, error: loginError } = await loginWithEmail(email, password);
      if (loginError) {
        setError(loginError);
      } else {
        navigate(getLink('/dashboard'));
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google login
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      const { user, error: loginError } = await loginWithGoogle();
      if (loginError) {
        setError(loginError);
      } else {
        navigate(getLink('/dashboard'));
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-6 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-primary">
              Login to {domain.name}
            </h1>
            <p className="text-gray-600 mt-1">
              Access your business dashboard
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded">
              {error}
            </div>
          )}

          {actionData?.error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded">
              {actionData.error}
            </div>
          )}

          <Form method="post" onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link to={getLink('/forgot-password')} className="text-sm text-secondary hover:text-accent">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                placeholder="••••••••"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition duration-150 ease-in-out"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </Form>

          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-3">
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition duration-150 ease-in-out"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                    <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                    <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                    <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                    <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                  </g>
                </svg>
                Sign in with Google
              </button>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to={getLink('/register')} className="font-medium text-secondary hover:text-accent">
                Register your business
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
} 