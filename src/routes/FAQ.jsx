import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useDomain } from '../context/DomainContext';

export default function FAQ() {
  const domain = useDomain();
  const location = useLocation();
  const [domainParam, setDomainParam] = useState(null);
  const [openItem, setOpenItem] = useState(null);

  // Extract domain parameter from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const domain = searchParams.get('domain');
    setDomainParam(domain);
  }, [location.search]);

  // Toggle accordion item
  const toggleItem = (index) => {
    if (openItem === index) {
      setOpenItem(null);
    } else {
      setOpenItem(index);
    }
  };

  // State-specific FAQs
  const faqs = domain.stateCode === 'NM'
    ? [
      {
        question: "What are the legal requirements to purchase cannabis in New Mexico?",
        answer: "In New Mexico, adults 21 and older can legally purchase cannabis for recreational use. You'll need a valid government-issued ID to prove your age. For medical cannabis, patients must have a valid medical cannabis card issued by the New Mexico Department of Health."
      },
      {
        question: "How much cannabis can I legally possess in New Mexico?",
        answer: "Adults 21 and older can legally possess up to 2 ounces of cannabis, 16 grams of cannabis extract, and 800 milligrams of edible cannabis. Medical cannabis patients can possess up to 8 ounces over a 90-day period."
      },
      {
        question: "Can I grow cannabis at home in New Mexico?",
        answer: "Yes, adults 21 and older can grow up to six mature and six immature plants per person, with a maximum of 12 mature plants per household. Plants must not be visible from public spaces."
      },
      {
        question: "Where can I legally consume cannabis in New Mexico?",
        answer: "Cannabis consumption is legal in private residences or on private property with the owner's permission. Public consumption remains illegal, including in parks, streets, and most businesses."
      },
      {
        question: "How do I get a medical cannabis card in New Mexico?",
        answer: "To obtain a medical cannabis card in New Mexico, you must be diagnosed with a qualifying condition by a licensed healthcare provider, complete the application process through the New Mexico Department of Health, and pay the required fee. The card is valid for three years."
      },
      {
        question: "What are the qualifying conditions for medical cannabis in New Mexico?",
        answer: "Qualifying conditions include cancer, glaucoma, multiple sclerosis, epilepsy, spinal cord damage, HIV/AIDS, painful peripheral neuropathy, intractable nausea/vomiting, severe anorexia/wasting syndrome, Hepatitis C, Crohn's disease, PTSD, ALS, Parkinson's disease, Huntington's disease, inclusion body myositis, spasmodic torticollis, ulcerative colitis, and severe chronic pain."
      },
      {
        question: "Can I use my out-of-state medical cannabis card in New Mexico?",
        answer: "Yes, New Mexico recognizes valid medical cannabis cards from other states, allowing non-residents to purchase from dispensaries while visiting."
      },
      {
        question: "Are there limits on THC content in New Mexico?",
        answer: "New Mexico does not currently impose limits on THC potency for cannabis products sold in licensed dispensaries."
      }
    ]
    : [
      {
        question: "What are the legal requirements to purchase cannabis in Colorado?",
        answer: "In Colorado, adults 21 and older can legally purchase cannabis for recreational use with a valid government-issued ID. For medical cannabis, patients must have a valid medical marijuana card issued by the Colorado Department of Public Health and Environment."
      },
      {
        question: "How much cannabis can I legally possess in Colorado?",
        answer: "Adults 21 and older can legally possess up to 1 ounce (28 grams) of cannabis or its equivalent. Medical patients may possess up to 2 ounces."
      },
      {
        question: "Can I grow cannabis at home in Colorado?",
        answer: "Yes, adults 21 and older can grow up to 6 plants per person, with a maximum of 12 plants per household, regardless of the number of adults living there. Only 3 plants can be in the flowering stage at any time. Plants must be in an enclosed, locked space."
      },
      {
        question: "Where can I legally consume cannabis in Colorado?",
        answer: "Cannabis consumption is legal in private residences with the owner's permission. Public consumption remains illegal, though some localities have licensed consumption lounges. It's illegal to consume in parks, on streets, in hotels, or in vehicles (even as a passenger)."
      },
      {
        question: "How do I get a medical marijuana card in Colorado?",
        answer: "To obtain a medical marijuana card in Colorado, you must be a Colorado resident with a qualifying condition, get a physician certification, register with the state's medical marijuana registry, and pay the application fee. Cards are typically valid for one year."
      },
      {
        question: "What are the qualifying conditions for medical marijuana in Colorado?",
        answer: "Qualifying conditions include cancer, glaucoma, HIV/AIDS, PTSD, autism spectrum disorder, cachexia, persistent muscle spasms, seizures, severe nausea, severe pain, and any condition for which a physician could prescribe an opioid."
      },
      {
        question: "Does Colorado accept out-of-state medical marijuana cards?",
        answer: "No, Colorado does not recognize medical marijuana cards from other states. Non-residents must purchase from recreational dispensaries."
      },
      {
        question: "Are there limits on THC content in Colorado?",
        answer: "Colorado does not impose limits on THC potency for most cannabis products, but edibles are limited to 100mg of THC per package, with each serving limited to 10mg."
      }
    ];

  return (
    <Layout>
      <div className="bg-background py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold text-dark mb-2">Frequently Asked Questions</h1>
          <h2 className="text-xl text-gray-600 mb-8">Cannabis in {domain.state}</h2>

          <div className="mb-8">
            <p className="text-gray-700">
              Find answers to common questions about cannabis laws, regulations, and usage in {domain.state}.
              If you don't see your question answered here, please feel free to <a href="/contact" className="text-accent hover:underline">contact us</a>.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white">
                <button
                  className="w-full text-left p-6 focus:outline-none flex justify-between items-center"
                  onClick={() => toggleItem(index)}
                  aria-expanded={openItem === index}
                >
                  <h3 className="text-lg font-semibold text-dark">{faq.question}</h3>
                  <svg
                    className={`w-5 h-5 transition-transform ${openItem === index ? 'transform rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${openItem === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="p-6 pt-0 text-gray-700">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-white p-6">
            <h2 className="text-2xl font-semibold text-dark mb-4">Still Have Questions?</h2>
            <p className="text-gray-700 mb-4">
              Cannabis laws and regulations can be complex and are subject to change. If you have specific questions that aren't answered here, we recommend:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li className="mb-2">Consulting with a legal professional familiar with cannabis laws in {domain.state}</li>
              <li className="mb-2">Visiting official state government websites for the most up-to-date information</li>
              <li className="mb-2">Speaking with staff at licensed dispensaries who are trained on current regulations</li>
            </ul>
            <p className="text-gray-700">
              You can also <a href="/contact" className="text-accent hover:underline">contact us</a> with your questions, and we'll do our best to provide accurate information or direct you to appropriate resources.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
} 