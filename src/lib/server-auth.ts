/**
 * Extract user ID from request headers
 * Returns undefined if no valid token found
 * 
 * Note: This is a simplified implementation for development.
 * In production, you would verify Firebase ID tokens properly using firebase-admin.
 */
export async function getCurrentUserIdOptional(request: Request): Promise<string | undefined> {
  try {
    // For development/testing, allow x-user-id header
    const devUserId = request.headers.get('x-user-id');
    if (devUserId) {
      return devUserId;
    }

    // Check for Authorization header with Bearer token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return undefined;
    }

    // In a real implementation, you would verify the Firebase ID token here
    // For now, we'll extract a mock user ID from the token for development
    const idToken = authHeader.slice(7); // Remove 'Bearer ' prefix
    
    // Simple fallback: generate a deterministic user ID from token hash
    // This is NOT secure and should only be used for development
    if (idToken && idToken.length > 10) {
      return `user_${idToken.slice(0, 8)}`;
    }

    return undefined;
  } catch (error) {
    // Silently fail - this is optional authentication
    return undefined;
  }
}

/**
 * Extract user ID from request, throw error if not authenticated
 */
export async function getCurrentUserId(request: Request): Promise<string> {
  const userId = await getCurrentUserIdOptional(request);
  if (!userId) {
    throw new Error('Authentication required');
  }
  return userId;
}