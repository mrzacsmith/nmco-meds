import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDomain } from '../context/DomainContext';
import { Layout } from '../components/Layout';

export default function Contact() {
  const domain = useDomain();
  const location = useLocation();
  const [domainParam, setDomainParam] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState({
    submitted: false,
    error: null,
    loading: false
  });

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

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setFormStatus({ submitted: false, error: null, loading: true });

    // Simulate API call
    setTimeout(() => {
      // Check if all fields are filled
      if (!formData.name || !formData.email || !formData.subject || !formData.message) {
        setFormStatus({
          submitted: false,
          error: 'Please fill out all fields',
          loading: false
        });
        return;
      }

      // Simulate successful submission
      setFormStatus({
        submitted: true,
        error: null,
        loading: false
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    }, 1500);
  };

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Page Header */}
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                Contact {domain.name}
              </h1>
              <p className="text-lg text-gray-600">
                Have questions or feedback? We'd love to hear from you!
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="md:flex">
                {/* Contact Information */}
                <div className="bg-primary text-white p-8 md:w-1/3">
                  <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Email</h3>
                      <p className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <a href={`mailto:info@${domain.name.toLowerCase().replace(/\s+/g, '')}.com`} className="hover:underline">
                          info@{domain.name.toLowerCase().replace(/\s+/g, '')}.com
                        </a>
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Follow Us</h3>
                      <div className="flex space-x-4">
                        <a href="#" className="hover:text-accent transition duration-300">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                          </svg>
                        </a>
                        <a href="#" className="hover:text-accent transition duration-300">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                          </svg>
                        </a>
                        <a href="#" className="hover:text-accent transition duration-300">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                          </svg>
                        </a>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Hours</h3>
                      <p className="mb-1">Monday - Friday: 9am - 5pm</p>
                      <p>Saturday - Sunday: Closed</p>
                    </div>
                  </div>
                </div>

                {/* Contact Form */}
                <div className="p-8 md:w-2/3">
                  <h2 className="text-2xl font-bold text-primary mb-6">Send Us a Message</h2>

                  {formStatus.submitted ? (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
                      <p className="font-medium">Thank you for your message!</p>
                      <p>We'll get back to you as soon as possible.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {formStatus.error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                          {formStatus.error}
                        </div>
                      )}

                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          Your Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent"
                          placeholder="John Doe"
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Your Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent"
                          placeholder="john@example.com"
                        />
                      </div>

                      <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                          Subject
                        </label>
                        <input
                          type="text"
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent"
                          placeholder="How can we help you?"
                        />
                      </div>

                      <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                          Message
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          rows={5}
                          value={formData.message}
                          onChange={handleChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent"
                          placeholder="Your message here..."
                        />
                      </div>

                      <div>
                        <button
                          type="submit"
                          disabled={formStatus.loading}
                          className={`w-full bg-secondary hover:bg-accent text-white hover:text-dark px-4 py-2 rounded-md transition duration-300 ${formStatus.loading ? 'opacity-75 cursor-not-allowed' : ''
                            }`}
                        >
                          {formStatus.loading ? (
                            <span className="flex items-center justify-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Sending...
                            </span>
                          ) : (
                            'Send Message'
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-primary mb-8 text-center">Frequently Asked Questions</h2>

              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">How do I list my dispensary on {domain.name}?</h3>
                  <p className="text-gray-600">
                    To list your dispensary, you'll need to create a business account and submit your business information for review. Once approved, your dispensary will be visible to all users.
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Is {domain.name} available in other states?</h3>
                  <p className="text-gray-600">
                    Currently, {domain.name} is focused on serving the {domain.state} cannabis community. We have plans to expand to other states in the future.
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">How can I advertise on {domain.name}?</h3>
                  <p className="text-gray-600">
                    We offer various advertising options for cannabis businesses. Please contact our sales team at sales@{domain.name.toLowerCase().replace(/\s+/g, '')}.com for more information.
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">How do I report inaccurate information?</h3>
                  <p className="text-gray-600">
                    If you find any inaccurate information on our platform, please use the contact form above to let us know. We strive to provide the most accurate and up-to-date information.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 