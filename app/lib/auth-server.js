import { redirect } from '@remix-run/node'
import { verifyIdToken, getUserById } from './firebase-admin'

/**
 * Server-side authentication check for Remix loaders and actions
 *
 * @param {Request} request - The request object
 * @param {Object} options - Options for the authentication check
 * @param {boolean} options.failureRedirect - Where to redirect on auth failure
 * @param {boolean} options.requireAdmin - Whether to require admin role
 * @returns {Promise<{userId: string, user: Object}>} - The authenticated user ID and data
 */
export async function requireAuth(request, options = {}) {
  const { failureRedirect = '/login', requireAdmin = false } = options

  // Get the session cookie or authorization header
  const cookie = request.headers.get('Cookie')
  const authHeader = request.headers.get('Authorization')

  let idToken = null

  // Try to get the token from the cookie
  if (cookie) {
    const match = cookie.match(/firebaseToken=([^;]+)/)
    if (match) {
      idToken = match[1]
    }
  }

  // If no token in cookie, try the Authorization header
  if (!idToken && authHeader) {
    const match = authHeader.match(/Bearer\s+(.+)/i)
    if (match) {
      idToken = match[1]
    }
  }

  // If no token found, redirect to login
  if (!idToken) {
    throw redirect(failureRedirect)
  }

  // Verify the token
  const { uid, error } = await verifyIdToken(idToken)

  if (error || !uid) {
    throw redirect(failureRedirect)
  }

  // Get the user data
  const { user, error: userError } = await getUserById(uid)

  if (userError || !user) {
    throw redirect(failureRedirect)
  }

  // Check for admin role if required
  if (requireAdmin) {
    const customClaims = user.customClaims || {}
    const isAdmin = customClaims.role === 'admin'

    if (!isAdmin) {
      throw redirect('/dashboard') // Redirect non-admins to dashboard
    }
  }

  return { userId: uid, user }
}

/**
 * Get the current user from the request if authenticated
 * Does not redirect if not authenticated
 *
 * @param {Request} request - The request object
 * @returns {Promise<{userId: string|null, user: Object|null}>} - The user ID and data, or null
 */
export async function getCurrentUser(request) {
  try {
    const { userId, user } = await requireAuth(request, { failureRedirect: null })
    return { userId, user }
  } catch (error) {
    return { userId: null, user: null }
  }
}
