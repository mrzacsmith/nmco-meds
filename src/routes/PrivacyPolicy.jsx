import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useDomain } from '../context/DomainContext';

export default function PrivacyPolicy() {
  const domain = useDomain();
  const location = useLocation();
  const [domainParam, setDomainParam] = useState(null);

  // Extract domain parameter from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const domain = searchParams.get('domain');
    setDomainParam(domain);
  }, [location.search]);

  return (
    <Layout>
      <div className="bg-background py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold text-dark mb-8">Privacy Policy</h1>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 mb-6">
              Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>

            <h2 className="text-2xl font-semibold text-dark mt-8 mb-4">1. Introduction</h2>
            <p className="mb-4">
              {domain.name} ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how your personal information is collected, used, and disclosed by {domain.name}.
            </p>
            <p className="mb-4">
              This Privacy Policy applies to our website, and its associated subdomains (collectively, our "Service"). By accessing or using our Service, you signify that you have read, understood, and agree to our collection, storage, use, and disclosure of your personal information as described in this Privacy Policy and our Terms of Service.
            </p>

            <h2 className="text-2xl font-semibold text-dark mt-8 mb-4">2. Information We Collect</h2>
            <p className="mb-4">
              We collect information from you when you visit our website, register on our site, place an order, subscribe to our newsletter, respond to a survey, fill out a form, or otherwise contact us.
            </p>
            <h3 className="text-xl font-semibold text-dark mt-6 mb-3">2.1 Personal Information</h3>
            <p className="mb-4">
              When you visit the Site, we automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device. Additionally, as you browse the Site, we collect information about the individual web pages or products that you view, what websites or search terms referred you to the Site, and information about how you interact with the Site.
            </p>
            <h3 className="text-xl font-semibold text-dark mt-6 mb-3">2.2 Business Information</h3>
            <p className="mb-4">
              If you register a business with us, we collect your business name, address, phone number, email, website, business hours, and other information relevant to listing your business in our directory.
            </p>

            <h2 className="text-2xl font-semibold text-dark mt-8 mb-4">3. How We Use Your Information</h2>
            <p className="mb-4">
              We use the information we collect in various ways, including to:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Provide, operate, and maintain our website</li>
              <li>Improve, personalize, and expand our website</li>
              <li>Understand and analyze how you use our website</li>
              <li>Develop new products, services, features, and functionality</li>
              <li>Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the website, and for marketing and promotional purposes</li>
              <li>Send you emails</li>
              <li>Find and prevent fraud</li>
            </ul>

            <h2 className="text-2xl font-semibold text-dark mt-8 mb-4">4. Cookies and Tracking Technologies</h2>
            <p className="mb-4">
              We use cookies and similar tracking technologies to track the activity on our Service and hold certain information.
            </p>
            <p className="mb-4">
              Cookies are files with a small amount of data which may include an anonymous unique identifier. Cookies are sent to your browser from a website and stored on your device. Tracking technologies also used are beacons, tags, and scripts to collect and track information and to improve and analyze our Service.
            </p>
            <p className="mb-4">
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.
            </p>

            <h2 className="text-2xl font-semibold text-dark mt-8 mb-4">5. Third-Party Services</h2>
            <p className="mb-4">
              We may employ third-party companies and individuals due to the following reasons:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>To facilitate our Service;</li>
              <li>To provide the Service on our behalf;</li>
              <li>To perform Service-related services; or</li>
              <li>To assist us in analyzing how our Service is used.</li>
            </ul>
            <p className="mb-4">
              We want to inform users of this Service that these third parties have access to your Personal Information. The reason is to perform the tasks assigned to them on our behalf. However, they are obligated not to disclose or use the information for any other purpose.
            </p>

            <h2 className="text-2xl font-semibold text-dark mt-8 mb-4">6. Security</h2>
            <p className="mb-4">
              We value your trust in providing us your Personal Information, thus we are striving to use commercially acceptable means of protecting it. But remember that no method of transmission over the internet, or method of electronic storage is 100% secure and reliable, and we cannot guarantee its absolute security.
            </p>

            <h2 className="text-2xl font-semibold text-dark mt-8 mb-4">7. Children's Privacy</h2>
            <p className="mb-4">
              Our Service does not address anyone under the age of 21. We do not knowingly collect personally identifiable information from anyone under the age of 21. If you are a parent or guardian and you are aware that your child has provided us with Personal Data, please contact us. If we become aware that we have collected Personal Data from anyone under the age of 21 without verification of parental consent, we take steps to remove that information from our servers.
            </p>

            <h2 className="text-2xl font-semibold text-dark mt-8 mb-4">8. Changes to This Privacy Policy</h2>
            <p className="mb-4">
              We may update our Privacy Policy from time to time. Thus, you are advised to review this page periodically for any changes. We will notify you of any changes by posting the new Privacy Policy on this page. These changes are effective immediately after they are posted on this page.
            </p>

            <h2 className="text-2xl font-semibold text-dark mt-8 mb-4">9. Contact Us</h2>
            <p className="mb-4">
              If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us at support@{domain.domain}.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
} 