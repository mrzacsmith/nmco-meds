import { useState, useEffect } from 'react';
import { Form, useActionData, useNavigate, Link, useLocation } from '@remix-run/react';
import { json } from '@remix-run/node';
import { Layout } from '~/components/Layout';
import { useDomain } from '~/context/DomainContext';
import { useAuth } from '~/context/AuthContext';
import { registerWithEmail, loginWithGoogle } from '~/lib/firebase';

export function meta({ matches }) {
  const domain = matches.find(match => match.id === 'root')?.data?.domain || '505meds';
  const domainName = domain === '303meds' ? '303 Meds' : '505 Meds';
  const state = domain === '303meds' ? 'Colorado' : 'New Mexico';

  return [
    { title: `Register Your Business - ${domainName} | Cannabis Directory in ${state}` },
    { name: "description", content: `Register your cannabis business with ${domainName} to reach more customers in ${state}.` },
  ];
}

export async function action({ request }) {
  const formData = await request.formData();
  const email = formData.get('email');
  const password = formData.get('password');
  const confirmPassword = formData.get('confirmPassword');
  const displayName = formData.get('displayName');
  const companyName = formData.get('companyName');
  const phone = formData.get('phone');
  const states = formData.getAll('states');

  // Basic validation
  const errors = {};

  if (!email) errors.email = 'Email is required';
  if (!password) errors.password = 'Password is required';
  if (password && password.length < 8) errors.password = 'Password must be at least 8 characters';
  if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
  if (!displayName) errors.displayName = 'Name is required';
  if (!companyName) errors.companyName = 'Company name is required';
  if (!phone) errors.phone = 'Phone number is required';
  if (states.length === 0) errors.states = 'Please select at least one state';

  if (Object.keys(errors).length > 0) {
    return json({ success: false, errors });
  }

  // Note: In a real implementation, we would handle registration server-side
  // For now, we'll return a message that client-side auth will be used
  return json({
    success: true,
    email,
    message: 'Please use client-side registration'
  });
}

export default function Register() {
  const domain = useDomain();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const actionData = useActionData();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [domainParam, setDomainParam] = useState(null);
  const [selectedStates, setSelectedStates] = useState([]);
  const [isMultiState, setIsMultiState] = useState(false);

  // Get the domain parameter from the URL if it exists (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      setDomainParam(url.searchParams.get('domain'));

      // Set default selected state based on domain
      const defaultState = domain.stateCode;
      setSelectedStates([defaultState]);
    }
  }, [location, domain.stateCode]);

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

  // Handle state selection
  const handleStateChange = (e) => {
    const state = e.target.value;
    const isChecked = e.target.checked;

    if (isChecked) {
      setSelectedStates(prev => [...prev, state]);
    } else {
      setSelectedStates(prev => prev.filter(s => s !== state));
    }

    // Update multi-state flag
    setIsMultiState(selectedStates.length > 1 || (selectedStates.length === 1 && isChecked && selectedStates[0] !== state));
  };

  // Handle email registration
  const handleEmailRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    const displayName = formData.get('displayName');
    const companyName = formData.get('companyName');
    const phone = formData.get('phone');

    // Basic validation
    if (!email || !password || !confirmPassword || !displayName || !companyName || !phone) {
      setError('All fields are required');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (selectedStates.length === 0) {
      setError('Please select at least one state');
      setIsLoading(false);
      return;
    }

    try {
      const userData = {
        displayName,
        companyName,
        phone,
        states: selectedStates,
        isMultiState: selectedStates.length > 1
      };

      const { user, error: registerError } = await registerWithEmail(email, password, userData);
      if (registerError) {
        setError(registerError);
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

  // Handle Google registration
  const handleGoogleRegister = async () => {
    if (selectedStates.length === 0) {
      setError('Please select at least one state before continuing with Google');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { user, error: loginError } = await loginWithGoogle();
      if (loginError) {
        setError(loginError);
      } else {
        // We'll need to update the user profile with business info
        // This would typically be done in a follow-up step
        navigate(getLink('/complete-profile'));
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-sm p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-primary">
              Register Your Business with {domain.name}
            </h1>
            <p className="text-gray-600 mt-1">
              Create an account to manage your cannabis business listing
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded">
              {error}
            </div>
          )}

          <Form method="post" onSubmit={handleEmailRegister} className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-4">
              <h2 className="text-lg font-medium text-primary mb-3">Business Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name
                  </label>
                  <input
                    id="displayName"
                    name="displayName"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                    placeholder="John Doe"
                  />
                  {actionData?.errors?.displayName && (
                    <p className="mt-1 text-sm text-red-600">{actionData.errors.displayName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name
                  </label>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                    placeholder="Green Leaf Dispensary"
                  />
                  {actionData?.errors?.companyName && (
                    <p className="mt-1 text-sm text-red-600">{actionData.errors.companyName}</p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Business Phone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                  placeholder="(555) 123-4567"
                />
                {actionData?.errors?.phone && (
                  <p className="mt-1 text-sm text-red-600">{actionData.errors.phone}</p>
                )}
              </div>

              <div className="mt-4">
                <span className="block text-sm font-medium text-gray-700 mb-2">
                  States of Operation
                </span>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center">
                    <input
                      id="state-co"
                      name="states"
                      type="checkbox"
                      value="CO"
                      checked={selectedStates.includes('CO')}
                      onChange={handleStateChange}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="state-co" className="ml-2 block text-sm text-gray-700">
                      Colorado
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="state-nm"
                      name="states"
                      type="checkbox"
                      value="NM"
                      checked={selectedStates.includes('NM')}
                      onChange={handleStateChange}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="state-nm" className="ml-2 block text-sm text-gray-700">
                      New Mexico
                    </label>
                  </div>
                </div>
                {actionData?.errors?.states && (
                  <p className="mt-1 text-sm text-red-600">{actionData.errors.states}</p>
                )}

                {isMultiState && (
                  <p className="mt-2 text-sm text-secondary">
                    You've selected multiple states. You'll be able to manage listings in both states from a single account.
                  </p>
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <h2 className="text-lg font-medium text-primary mb-3">Account Information</h2>

              <div className="space-y-4">
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
                  {actionData?.errors?.email && (
                    <p className="mt-1 text-sm text-red-600">{actionData.errors.email}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                      placeholder="••••••••"
                    />
                    {actionData?.errors?.password && (
                      <p className="mt-1 text-sm text-red-600">{actionData.errors.password}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                      placeholder="••••••••"
                    />
                    {actionData?.errors?.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{actionData.errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition duration-150 ease-in-out"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </Form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to={getLink('/login')} className="font-medium text-secondary hover:text-accent">
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-4 text-xs text-gray-500 text-center">
            By creating an account, you agree to our{' '}
            <Link to={getLink('/terms-of-service')} className="text-secondary hover:text-accent">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to={getLink('/privacy-policy')} className="text-secondary hover:text-accent">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
} 