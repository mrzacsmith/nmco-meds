import { useState } from 'react';
import { Form, useSearchParams } from '@remix-run/react';
import { useDomain } from '~/context/DomainContext';
import { BusinessCard } from './BusinessCard';

export function ListingsPage({ businesses = [], totalCount = 0, currentPage = 1, totalPages = 1 }) {
  const domain = useDomain();
  const [searchParams] = useSearchParams();
  const [filterOpen, setFilterOpen] = useState(false);

  // Get search parameters
  const type = searchParams.get('type') || 'dispensary';
  const location = searchParams.get('location') || '';
  const keyword = searchParams.get('keyword') || '';

  // Filter options
  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'reviews', label: 'Most Reviewed' },
    { value: 'name_asc', label: 'Name (A-Z)' },
    { value: 'name_desc', label: 'Name (Z-A)' },
  ];

  const featureFilters = [
    { id: 'delivery', label: 'Delivery Available' },
    { id: 'online_ordering', label: 'Online Ordering' },
    { id: 'medical', label: 'Medical' },
    { id: 'recreational', label: 'Recreational' },
    { id: 'credit_cards', label: 'Accepts Credit Cards' },
    { id: 'open_now', label: 'Open Now' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            {type === 'dispensary' ? 'Dispensaries' :
              type === 'delivery' ? 'Delivery Services' :
                type === 'doctor' ? 'Cannabis Doctors' : 'Cannabis Businesses'}
            {location ? ` in ${location}` : ` in ${domain.state}`}
          </h1>
          <p className="text-gray-600">
            {totalCount} results {keyword ? `for "${keyword}"` : ''}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar - Mobile Toggle */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="w-full bg-white p-3 rounded-md shadow-sm border border-gray-200 flex justify-between items-center"
            >
              <span className="font-medium">Filters</span>
              <svg
                className={`h-5 w-5 transition-transform ${filterOpen ? 'transform rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Filters Sidebar */}
          <div className={`lg:w-1/4 ${filterOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <Form method="get" action="/search" className="space-y-6">
                {/* Preserve the type parameter */}
                <input type="hidden" name="type" value={type} />

                {/* Location Filter */}
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    id="location"
                    defaultValue={location}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent"
                    placeholder={`City or Zip in ${domain.state}`}
                  />
                </div>

                {/* Keyword Filter */}
                <div>
                  <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 mb-1">
                    Keyword
                  </label>
                  <input
                    type="text"
                    name="keyword"
                    id="keyword"
                    defaultValue={keyword}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent"
                    placeholder="Search by name, product, etc."
                  />
                </div>

                {/* Sort By */}
                <div>
                  <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
                    Sort By
                  </label>
                  <select
                    id="sort"
                    name="sort"
                    defaultValue="relevance"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Feature Filters */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Features</h3>
                  <div className="space-y-2">
                    {featureFilters.map((filter) => (
                      <div key={filter.id} className="flex items-center">
                        <input
                          id={filter.id}
                          name="features"
                          value={filter.id}
                          type="checkbox"
                          className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
                        />
                        <label htmlFor={filter.id} className="ml-2 text-sm text-gray-700">
                          {filter.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Apply Filters Button */}
                <button
                  type="submit"
                  className="w-full bg-secondary hover:bg-accent text-white hover:text-dark py-2 px-4 rounded-md transition duration-300"
                >
                  Apply Filters
                </button>
              </Form>
            </div>
          </div>

          {/* Results */}
          <div className="lg:w-3/4">
            {businesses.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {businesses.map((business) => (
                    <BusinessCard key={business.id} business={business} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <nav className="flex items-center space-x-2">
                      <a
                        href={`?page=${Math.max(1, currentPage - 1)}`}
                        className={`px-3 py-2 rounded-md ${currentPage === 1
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-primary hover:bg-gray-200'
                          }`}
                      >
                        Previous
                      </a>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <a
                          key={page}
                          href={`?page=${page}`}
                          className={`px-3 py-2 rounded-md ${currentPage === page
                              ? 'bg-secondary text-white'
                              : 'text-primary hover:bg-gray-200'
                            }`}
                        >
                          {page}
                        </a>
                      ))}

                      <a
                        href={`?page=${Math.min(totalPages, currentPage + 1)}`}
                        className={`px-3 py-2 rounded-md ${currentPage === totalPages
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-primary hover:bg-gray-200'
                          }`}
                      >
                        Next
                      </a>
                    </nav>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <h3 className="text-xl font-medium text-primary mb-2">No results found</h3>
                <p className="text-gray-600 mb-6">
                  We couldn't find any businesses matching your search criteria.
                </p>
                <p className="text-gray-600">
                  Try adjusting your filters or search for a different location.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 