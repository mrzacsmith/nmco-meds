import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useDomain } from '../context/DomainContext';

export default function StrainGuide() {
  const domain = useDomain();
  const location = useLocation();
  const [domainParam, setDomainParam] = useState(null);

  // Extract domain parameter from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const domain = searchParams.get('domain');
    setDomainParam(domain);
  }, [location.search]);

  // State-specific strain recommendations
  const stateSpecificStrains = domain.stateCode === 'NM'
    ? [
      { name: 'Hatch Chile Kush', type: 'Hybrid', thc: '18-24%', cbd: '0.1%', effects: 'Relaxed, Creative, Uplifted', flavors: 'Earthy, Spicy, Citrus', description: 'A New Mexico favorite, this strain combines the spicy notes reminiscent of the famous Hatch green chiles with a balanced hybrid effect perfect for the desert climate.' },
      { name: 'Desert Sunrise', type: 'Sativa', thc: '20-25%', cbd: '<0.1%', effects: 'Energetic, Focused, Creative', flavors: 'Sweet, Citrus, Pine', description: 'Named after the beautiful New Mexico sunrise, this sativa provides an energetic start to your day with bright citrus notes and creative energy.' },
      { name: 'Rio Grande Glue', type: 'Hybrid', thc: '22-27%', cbd: '0.2%', effects: 'Relaxed, Happy, Euphoric', flavors: 'Earthy, Pine, Chemical', description: 'A potent hybrid with strong adhesive properties like its parent strain, adapted to thrive in New Mexico\'s climate.' },
      { name: 'Sandia Sunset', type: 'Indica', thc: '19-23%', cbd: '0.5%', effects: 'Relaxed, Sleepy, Hungry', flavors: 'Sweet, Berry, Earthy', description: 'Named after the Sandia Mountains at sunset, this indica provides deep relaxation with sweet berry notes, perfect for evening use.' },
      { name: 'Turquoise Dream', type: 'Hybrid', thc: '17-22%', cbd: '1-2%', effects: 'Relaxed, Creative, Euphoric', flavors: 'Sweet, Floral, Earthy', description: 'Inspired by New Mexico\'s state gem, this balanced hybrid offers a smooth experience with a higher CBD content for balanced effects.' }
    ]
    : [
      { name: 'Rocky Mountain High', type: 'Sativa', thc: '22-28%', cbd: '<0.1%', effects: 'Energetic, Euphoric, Creative', flavors: 'Pine, Earthy, Citrus', description: 'A Colorado classic, this high-altitude sativa thrives in the mountain climate and provides an energetic, euphoric experience perfect for outdoor activities.' },
      { name: 'Aspen Frost', type: 'Indica', thc: '20-25%', cbd: '0.3%', effects: 'Relaxed, Sleepy, Pain Relief', flavors: 'Sweet, Vanilla, Woody', description: 'Named after Colorado\'s famous aspen trees in winter, this indica provides deep relaxation and is excellent for evening use after a day on the slopes.' },
      { name: 'Boulder Breath', type: 'Hybrid', thc: '19-24%', cbd: '0.5-1%', effects: 'Balanced, Relaxed, Uplifted', flavors: 'Earthy, Herbal, Sweet', description: 'A balanced hybrid developed in Boulder, offering the perfect combination of mental clarity and physical relaxation for Colorado\'s active lifestyle.' },
      { name: 'Mile High Haze', type: 'Sativa', thc: '18-23%', cbd: '<0.1%', effects: 'Focused, Creative, Energetic', flavors: 'Citrus, Sweet, Tropical', description: 'A Denver favorite, this sativa-dominant strain helps with focus and creativity while providing a smooth, enjoyable experience.' },
      { name: 'Alpine Glow', type: 'Hybrid', thc: '21-26%', cbd: '0.2%', effects: 'Euphoric, Relaxed, Social', flavors: 'Berry, Pine, Floral', description: 'Inspired by the alpenglow on Colorado mountains, this hybrid offers a beautiful balance of euphoria and relaxation, perfect for social settings.' }
    ];

  return (
    <Layout>
      <div className="bg-background py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold text-dark mb-2">Cannabis Strain Guide</h1>
          <h2 className="text-xl text-gray-600 mb-8">Popular Strains in {domain.state}</h2>

          <div className="mb-8">
            <p className="text-gray-700">
              This guide highlights some of the most popular and effective cannabis strains available in {domain.state}.
              Whether you're looking for relief from specific symptoms or seeking particular effects,
              understanding the different strains can help you make informed choices about your cannabis consumption.
            </p>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-dark mb-6">Understanding Cannabis Types</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6">
                <h3 className="text-xl font-semibold text-accent mb-3">Indica</h3>
                <p className="text-gray-700">
                  Indica strains typically provide a deep body relaxation and are often used in the evening.
                  They can help with insomnia, pain relief, and reducing anxiety.
                </p>
              </div>

              <div className="bg-white p-6">
                <h3 className="text-xl font-semibold text-accent mb-3">Sativa</h3>
                <p className="text-gray-700">
                  Sativa strains are known for their energizing, uplifting effects.
                  They're often used during the day to enhance creativity, focus, and mood.
                </p>
              </div>

              <div className="bg-white p-6">
                <h3 className="text-xl font-semibold text-accent mb-3">Hybrid</h3>
                <p className="text-gray-700">
                  Hybrid strains combine characteristics of both indica and sativa,
                  offering balanced effects that can be tailored to specific needs and preferences.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 mb-8">
              <h3 className="text-xl font-semibold text-dark mb-3">Cannabinoids: THC and CBD</h3>
              <p className="text-gray-700 mb-4">
                The two primary cannabinoids in cannabis are THC (tetrahydrocannabinol) and CBD (cannabidiol):
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li className="mb-2"><strong>THC</strong> is psychoactive and responsible for the "high" feeling. It can help with pain, nausea, and appetite stimulation.</li>
                <li className="mb-2"><strong>CBD</strong> is non-psychoactive and won't produce a high. It's associated with anti-inflammatory, anti-anxiety, and anti-seizure properties.</li>
              </ul>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-dark mb-6">Popular Strains in {domain.state}</h2>

          <div className="space-y-6 mb-12">
            {stateSpecificStrains.map((strain, index) => (
              <div key={index} className="bg-white p-6">
                <h3 className="text-xl font-semibold text-accent mb-2">{strain.name}</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`px-3 py-1 text-sm rounded-full ${strain.type === 'Indica' ? 'bg-purple-100 text-purple-800' :
                      strain.type === 'Sativa' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                    }`}>
                    {strain.type}
                  </span>
                  <span className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-800">
                    THC: {strain.thc}
                  </span>
                  <span className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-800">
                    CBD: {strain.cbd}
                  </span>
                </div>
                <p className="text-gray-700 mb-3">{strain.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Effects:</h4>
                    <p className="text-gray-700">{strain.effects}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Flavors:</h4>
                    <p className="text-gray-700">{strain.flavors}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white p-6">
            <h2 className="text-2xl font-semibold text-dark mb-4">Finding the Right Strain</h2>
            <p className="text-gray-700 mb-4">
              Finding the right cannabis strain is a personal journey. What works for one person may not work for another due to differences in body chemistry, tolerance, and desired effects.
            </p>
            <p className="text-gray-700 mb-4">
              We recommend starting with low doses, especially if you're new to cannabis or trying a new strain. Pay attention to how different strains affect you and keep a journal to track your experiences.
            </p>
            <p className="text-gray-700">
              Consult with knowledgeable budtenders at your local dispensary who can provide personalized recommendations based on your needs and preferences.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
} 