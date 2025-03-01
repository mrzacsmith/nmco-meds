import { SearchBar } from '../components/SearchBar'
import { Layout } from '../components/Layout'
import { BrowseByCategory } from '../components/BrowseByCategory'
import { FeaturedBusinesses } from '../components/FeaturedBusinesses'
import { PopularCities } from '../components/PopularCities'
import { RegisterYourBusiness } from '../components/RegisterYourBusiness'
import { NewsletterSubscription } from '../components/NewsletterSubscription'

export default function Home() {
  return (
    <Layout>
      <div className='min-h-screen bg-gray-50'>
        {/* SearchBar Component */}
        <SearchBar className='max-w-4xl mx-auto' />

        {/* Browse by Category Component */}
        <BrowseByCategory />

        {/* Featured Businesses Component */}
        <FeaturedBusinesses />

        {/* Popular Cities Component */}
        <PopularCities />

        {/* Register Your Business CTA Component */}
        <RegisterYourBusiness />

        {/* Newsletter Subscription Component */}
        <NewsletterSubscription />
      </div>
    </Layout>
  )
}
