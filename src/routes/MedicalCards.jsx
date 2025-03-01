import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useDomain } from '../context/DomainContext';

export default function MedicalCards() {
  const domain = useDomain();
  const location = useLocation();
  const [domainParam, setDomainParam] = useState(null);

  // Extract domain parameter from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const domain = searchParams.get('domain');
    setDomainParam(domain);
  }, [location.search]);

  // State-specific content
  const stateContent = domain.stateCode === 'NM'
    ? {
      programName: "Medical Cannabis Program",
      department: "New Mexico Department of Health",
      departmentUrl: "https://www.nmhealth.org/about/mcp/",
      validity: "3 years",
      applicationFee: "$30",
      renewalFee: "$30",
      qualifyingConditions: [
        "Amyotrophic Lateral Sclerosis (ALS)",
        "Alzheimer's Disease",
        "Autism Spectrum Disorder",
        "Cancer",
        "Crohn's Disease",
        "Damage to the nervous tissue of the spinal cord",
        "Epilepsy/Seizure Disorder",
        "Friedreich's Ataxia",
        "Glaucoma",
        "Hepatitis C",
        "HIV/AIDS",
        "Huntington's Disease",
        "Inclusion Body Myositis",
        "Inflammatory autoimmune-mediated arthritis",
        "Intractable Nausea/Vomiting",
        "Lewy Body Disease",
        "Multiple Sclerosis",
        "Obstructive Sleep Apnea",
        "Opioid Use Disorder",
        "Painful Peripheral Neuropathy",
        "Parkinson's Disease",
        "Post-Traumatic Stress Disorder",
        "Severe Anorexia/Cachexia",
        "Severe Chronic Pain",
        "Spasmodic Torticollis (Cervical Dystonia)",
        "Ulcerative Colitis"
      ],
      reciprocity: "New Mexico has reciprocity with other states' medical cannabis programs, allowing out-of-state patients to purchase medical cannabis while visiting."
    }
    : {
      programName: "Medical Marijuana Registry",
      department: "Colorado Department of Public Health and Environment",
      departmentUrl: "https://cdphe.colorado.gov/medical-marijuana",
      validity: "1 year (2 or 3 years available with physician recommendation)",
      applicationFee: "$29.50",
      renewalFee: "$29.50",
      qualifyingConditions: [
        "Autism Spectrum Disorder",
        "Cancer",
        "Chronic Pain",
        "Glaucoma",
        "HIV/AIDS",
        "Cachexia (wasting syndrome)",
        "Persistent Muscle Spasms",
        "Post Traumatic Stress Disorder (PTSD)",
        "Seizures",
        "Severe Nausea",
        "Any condition for which a physician could prescribe an opioid"
      ],
      reciprocity: "Colorado does not have reciprocity with other states' medical marijuana programs. Out-of-state patients must purchase from recreational dispensaries."
    };

  return (
    <Layout>
      <div className="bg-background py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold text-dark mb-2">Medical Cannabis Cards</h1>
          <h2 className="text-xl text-gray-600 mb-8">{domain.state} {stateContent.programName}</h2>

          <div className="bg-white p-6 mb-8">
            <h3 className="text-xl font-semibold text-dark mb-4">Overview</h3>
            <p className="text-gray-700 mb-4">
              The {domain.state} {stateContent.programName} allows patients with qualifying medical conditions to legally access medical cannabis.
              Medical cannabis patients often receive benefits not available to recreational users, such as:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li className="mb-2">Higher possession limits</li>
              <li className="mb-2">Lower taxes on purchases</li>
              <li className="mb-2">Access to higher potency products</li>
              <li className="mb-2">Legal protections for employment and housing</li>
              <li className="mb-2">Ability to grow more plants at home (where applicable)</li>
            </ul>
          </div>

          <div className="bg-white p-6 mb-8">
            <h3 className="text-xl font-semibold text-dark mb-4">Application Process</h3>
            <p className="text-gray-700 mb-4">
              To apply for a medical cannabis card in {domain.state}, follow these steps:
            </p>
            <ol className="list-decimal pl-6 text-gray-700 mb-4">
              <li className="mb-3">
                <span className="font-semibold">Confirm eligibility:</span> Verify that you have one of the qualifying medical conditions listed below.
              </li>
              <li className="mb-3">
                <span className="font-semibold">Consult with a healthcare provider:</span> Schedule an appointment with a licensed physician, nurse practitioner, or other qualified healthcare provider who can certify your qualifying condition.
              </li>
              <li className="mb-3">
                <span className="font-semibold">Obtain medical certification:</span> During your appointment, discuss your condition and how medical cannabis might help. If appropriate, your provider will complete the necessary certification.
              </li>
              <li className="mb-3">
                <span className="font-semibold">Complete application:</span> Submit your application to the {stateContent.department}, including your medical certification, proof of residency, identification, and the application fee ({stateContent.applicationFee}).
              </li>
              <li className="mb-3">
                <span className="font-semibold">Receive your card:</span> Once approved, you'll receive your medical cannabis card, valid for {stateContent.validity}.
              </li>
            </ol>
            <p className="text-gray-700">
              For detailed information and official forms, visit the <a href={stateContent.departmentUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">{stateContent.department} website</a>.
            </p>
          </div>

          <div className="bg-white p-6 mb-8">
            <h3 className="text-xl font-semibold text-dark mb-4">Qualifying Medical Conditions</h3>
            <p className="text-gray-700 mb-4">
              In {domain.state}, the following conditions may qualify you for a medical cannabis card:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {stateContent.qualifyingConditions.map((condition, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded">
                  {condition}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 mb-8">
            <h3 className="text-xl font-semibold text-dark mb-4">Renewal Information</h3>
            <p className="text-gray-700 mb-4">
              Medical cannabis cards in {domain.state} are valid for {stateContent.validity}. To renew your card:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li className="mb-2">Begin the renewal process 30-60 days before your card expires</li>
              <li className="mb-2">Obtain a new certification from your healthcare provider</li>
              <li className="mb-2">Submit a renewal application with the required documentation</li>
              <li className="mb-2">Pay the renewal fee ({stateContent.renewalFee})</li>
            </ul>
          </div>

          <div className="bg-white p-6 mb-8">
            <h3 className="text-xl font-semibold text-dark mb-4">Reciprocity with Other States</h3>
            <p className="text-gray-700">
              {stateContent.reciprocity}
            </p>
          </div>

          <div className="bg-white p-6">
            <h3 className="text-xl font-semibold text-dark mb-4">Need Help?</h3>
            <p className="text-gray-700 mb-4">
              Navigating the medical cannabis application process can be challenging. If you need assistance:
            </p>
            <ul className="list-disc pl-6 text-gray-700">
              <li className="mb-2">Consult with healthcare providers who specialize in cannabis medicine</li>
              <li className="mb-2">Contact the {stateContent.department} for official guidance</li>
              <li className="mb-2">Visit local dispensaries, as many offer assistance with the application process</li>
              <li className="mb-2"><a href="/contact" className="text-accent hover:underline">Contact us</a> with your questions</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
} 