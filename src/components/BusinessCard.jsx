import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

export function BusinessCard({ business, domainParam }) {
  const {
    id,
    name,
    type,
    imageUrl,
    rating,
    reviewCount,
    address,
    city,
    state,
    isPremium,
    tags,
    description
  } = business;

  const location = useLocation();
  const [localDomainParam, setLocalDomainParam] = useState(domainParam);

  // Get the domain parameter from the URL if it exists (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined' && !localDomainParam) {
      const url = new URL(window.location.href);
      setLocalDomainParam(url.searchParams.get('domain'));
    }
  }, [location, localDomainParam]);

  // Function to create links that preserve the domain parameter
  const getLink = (path) => {
    return localDomainParam ? `${path}?domain=${localDomainParam}` : path;
  };

  return (
    <div className={`rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 bg-white ${isPremium ? 'border-2 border-warmAccent' : ''}`}>
      {/* Business Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageUrl || '/images/default-business.jpg'}
          alt={name}
          className="w-full h-full object-cover"
        />
        {isPremium && (
          <div className="absolute top-2 right-2 bg-warmAccent text-dark px-2 py-1 rounded-md text-xs font-semibold">
            Premium
          </div>
        )}
      </div>

      {/* Business Info */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-primary truncate">{name}</h3>
          <div className="flex items-center">
            <span className="text-warmAccent mr-1">★</span>
            <span className="text-sm font-medium">{rating}</span>
            <span className="text-xs text-gray-500 ml-1">({reviewCount})</span>
          </div>
        </div>

        <div className="mb-2 text-sm text-gray-600">
          <p>{type}</p>
          <p className="truncate">{address}, {city}, {state}</p>
        </div>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="bg-secondary bg-opacity-20 text-secondary px-2 py-1 rounded-full text-xs"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-xs text-gray-500 flex items-center">
                +{tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Description */}
        <p className="text-sm text-gray-700 mb-4 line-clamp-2">{description}</p>

        {/* Action Button */}
        <Link
          to={getLink(`/business/${id}`)}
          className="block w-full text-center bg-secondary hover:bg-accent text-white hover:text-dark py-2 rounded-md transition duration-300"
        >
          View Details
        </Link>
      </div>
    </div>
  );
} 