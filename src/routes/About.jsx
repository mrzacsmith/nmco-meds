import { useDomain } from '../context/DomainContext';
import { Layout } from '../components/Layout';

export default function About() {
  const domain = useDomain();

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="max-w-3xl mx-auto mb-12 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              About {domain.name}
            </h1>
            <p className="text-lg text-gray-600">
              Your trusted guide to cannabis in {domain.state}
            </p>
          </div>

          {/* Main Content */}
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 md:p-8">
              <h2 className="text-2xl font-bold text-primary mb-4">Our Mission</h2>
              <p className="text-gray-700 mb-6">
                At {domain.name}, we're dedicated to connecting cannabis consumers with the best dispensaries,
                delivery services, and doctors across {domain.state}. Our mission is to provide accurate,
                up-to-date information to help you make informed decisions about your cannabis needs.
              </p>

              <h2 className="text-2xl font-bold text-primary mb-4">What We Offer</h2>
              <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
                <li>Comprehensive listings of licensed cannabis businesses in {domain.state}</li>
                <li>Verified reviews from real customers</li>
                <li>Detailed information about products, services, and business hours</li>
                <li>Easy search functionality to find exactly what you're looking for</li>
                <li>Educational resources about cannabis products and regulations</li>
              </ul>

              <h2 className="text-2xl font-bold text-primary mb-4">For Business Owners</h2>
              <p className="text-gray-700 mb-6">
                If you own a cannabis business in {domain.state}, {domain.name} offers you a platform to
                reach more customers and grow your business. List your business for free or upgrade to
                premium for enhanced visibility and features.
              </p>

              <h2 className="text-2xl font-bold text-primary mb-4">Our Story</h2>
              <p className="text-gray-700 mb-6">
                {domain.name} was founded in 2023 by a team of cannabis enthusiasts who saw the need for a
                reliable, user-friendly directory of cannabis businesses in {domain.state}. What started as
                a simple listing service has grown into a comprehensive platform serving thousands of users
                across the state.
              </p>

              <h2 className="text-2xl font-bold text-primary mb-4">Our Values</h2>
              <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
                <li><span className="font-medium">Accuracy:</span> We verify all business information to ensure you get reliable data.</li>
                <li><span className="font-medium">Inclusivity:</span> We welcome all legal cannabis businesses, from small independents to larger operations.</li>
                <li><span className="font-medium">Education:</span> We believe in informing users about cannabis products, benefits, and regulations.</li>
                <li><span className="font-medium">Community:</span> We support the growth of the cannabis community in {domain.state}.</li>
              </ul>

              <h2 className="text-2xl font-bold text-primary mb-4">Contact Us</h2>
              <p className="text-gray-700">
                Have questions, suggestions, or feedback? We'd love to hear from you! Reach out to us at{' '}
                <a
                  href={`mailto:info@${domain.name.toLowerCase().replace(' ', '')}.com`}
                  className="text-secondary hover:text-accent"
                >
                  info@{domain.name.toLowerCase().replace(' ', '')}.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 