import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useDomain } from '../context/DomainContext';

export default function TermsOfService() {
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
          <h1 className="text-3xl font-bold text-dark mb-8">Terms of Service</h1>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 mb-6">
              Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>

            <h2 className="text-2xl font-semibold text-dark mt-8 mb-4">1. Introduction</h2>
            <p className="mb-4">
              Welcome to {domain.name}. These Terms of Service ("Terms") govern your use of our website located at {domain.domain} (together or individually "Service") operated by {domain.name}.
            </p>
            <p className="mb-4">
              Our Privacy Policy also governs your use of our Service and explains how we collect, safeguard and disclose information that results from your use of our web pages.
            </p>
            <p className="mb-4">
              Your agreement with us includes these Terms and our Privacy Policy ("Agreements"). You acknowledge that you have read and understood Agreements, and agree to be bound by them.
            </p>
            <p className="mb-4">
              If you do not agree with (or cannot comply with) Agreements, then you may not use the Service, but please let us know by emailing at support@{domain.domain} so we can try to find a solution. These Terms apply to all visitors, users and others who wish to access or use Service.
            </p>

            <h2 className="text-2xl font-semibold text-dark mt-8 mb-4">2. Age Restrictions</h2>
            <p className="mb-4">
              By using our Service, you represent and warrant that you are at least 21 years of age. We do not permit those under 21 to use our Service.
            </p>

            <h2 className="text-2xl font-semibold text-dark mt-8 mb-4">3. Communications</h2>
            <p className="mb-4">
              By using our Service, you agree to subscribe to newsletters, marketing or promotional materials and other information we may send. However, you may opt out of receiving any, or all, of these communications from us by following the unsubscribe link or by emailing at support@{domain.domain}.
            </p>

            <h2 className="text-2xl font-semibold text-dark mt-8 mb-4">4. Business Listings</h2>
            <p className="mb-4">
              If you register a business with our Service, you are responsible for maintaining the security of your account and business information, and you are fully responsible for all activities that occur under the account and any other actions taken in connection with the business listing.
            </p>
            <p className="mb-4">
              You must not describe or assign keywords to your business in a misleading or unlawful manner, including in a manner intended to trade on the name or reputation of others, and we may change or remove any description or keyword that it considers inappropriate or unlawful, or otherwise likely to cause liability.
            </p>
            <p className="mb-4">
              You must immediately notify us of any unauthorized uses of your business listing, your account, or any other breaches of security. We will not be liable for any acts or omissions by you, including any damages of any kind incurred as a result of such acts or omissions.
            </p>

            <h2 className="text-2xl font-semibold text-dark mt-8 mb-4">5. Intellectual Property</h2>
            <p className="mb-4">
              Service and its original content (excluding Content provided by users), features and functionality are and will remain the exclusive property of {domain.name} and its licensors. Service is protected by copyright, trademark, and other laws of the United States. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of {domain.name}.
            </p>

            <h2 className="text-2xl font-semibold text-dark mt-8 mb-4">6. Content Restrictions</h2>
            <p className="mb-4">
              We reserve the right, but not the obligation, to:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Monitor the Service for violations of these Terms;</li>
              <li>Take appropriate legal action against anyone who, in our sole discretion, violates the law or these Terms, including without limitation, reporting such user to law enforcement authorities;</li>
              <li>In our sole discretion and without limitation, refuse, restrict access to, limit the availability of, or disable (to the extent technologically feasible) any of your Contributions or any portion thereof;</li>
              <li>In our sole discretion and without limitation, notice, or liability, to remove from the Service or otherwise disable all files and content that are excessive in size or are in any way burdensome to our systems;</li>
              <li>Otherwise manage the Service in a manner designed to protect our rights and property and to facilitate the proper functioning of the Service.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-dark mt-8 mb-4">7. Limitation of Liability</h2>
            <p className="mb-4">
              In no event shall {domain.name}, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage, and even if a remedy set forth herein is found to have failed of its essential purpose.
            </p>

            <h2 className="text-2xl font-semibold text-dark mt-8 mb-4">8. Disclaimer</h2>
            <p className="mb-4">
              Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement or course of performance.
            </p>
            <p className="mb-4">
              {domain.name}, its subsidiaries, affiliates, and its licensors do not warrant that a) the Service will function uninterrupted, secure or available at any particular time or location; b) any errors or defects will be corrected; c) the Service is free of viruses or other harmful components; or d) the results of using the Service will meet your requirements.
            </p>

            <h2 className="text-2xl font-semibold text-dark mt-8 mb-4">9. Governing Law</h2>
            <p className="mb-4">
              These Terms shall be governed and construed in accordance with the laws of {domain.state}, United States, without regard to its conflict of law provisions.
            </p>
            <p className="mb-4">
              Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect. These Terms constitute the entire agreement between us regarding our Service, and supersede and replace any prior agreements we might have between us regarding the Service.
            </p>

            <h2 className="text-2xl font-semibold text-dark mt-8 mb-4">10. Changes to Terms</h2>
            <p className="mb-4">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
            </p>
            <p className="mb-4">
              By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, please stop using the Service.
            </p>

            <h2 className="text-2xl font-semibold text-dark mt-8 mb-4">11. Contact Us</h2>
            <p className="mb-4">
              If you have any questions about these Terms, please contact us at support@{domain.domain}.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
} 