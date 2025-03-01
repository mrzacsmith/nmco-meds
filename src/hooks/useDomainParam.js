import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Custom hook to extract and manage the domain parameter from the URL
 * @returns {Object} An object containing the domain parameter and utility functions
 */
export function useDomainParam() {
  const location = useLocation()
  const [domainParam, setDomainParam] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const domain = params.get('domain')
    setDomainParam(domain)
  }, [location.search])

  /**
   * Generate a link that preserves the domain parameter if it exists
   * @param {string} to - The target path
   * @returns {string} The path with domain parameter if it exists
   */
  const getLink = (to) => {
    if (!domainParam) return to

    // If the target path already has query parameters
    if (to.includes('?')) {
      return `${to}&domain=${domainParam}`
    }

    // If the target path doesn't have query parameters
    return `${to}?domain=${domainParam}`
  }

  return {
    domainParam,
    getLink,
  }
}
