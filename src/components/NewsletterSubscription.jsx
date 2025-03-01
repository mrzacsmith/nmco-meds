import { useDomain } from '../context/DomainContext';

export function NewsletterSubscription() {
  const domain = useDomain();

  return (
    <section className="bg-white py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">
            Stay Updated
          </h2>
          <p className="text-gray-700 mb-6">
            Subscribe to our newsletter for the latest cannabis news and deals in {domain.state}.
          </p>
          <form className="flex flex-col sm:flex-row justify-center gap-3">
            <input
              type="email"
              placeholder="Your email address"
              className="px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent flex-grow max-w-md"
              required
            />
            <button
              type="submit"
              className="bg-dark hover:bg-mid text-white px-6 py-3 rounded-md transition duration-300 font-medium"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </section>
  );
} 