/**
 * Utility functions for parsing and managing URL parameters
 * Works with both hash-based and browser-based routing
 */

/**
 * Extracts a URL parameter from the current URL
 * Works with both query strings (?param=value) and hash-based routing (#/?param=value)
 *
 * @param paramName - The name of the parameter to extract
 * @returns The parameter value if found, null otherwise
 */
export function getUrlParameter(paramName: string): string | null {
  // Try to get from regular query string first
  const urlParams = new URLSearchParams(window.location.search);
  const regularParam = urlParams.get(paramName);

  if (regularParam !== null) {
    return regularParam;
  }

  // If not found, try to extract from hash (for hash-based routing)
  const hash = window.location.hash;
  const queryStartIndex = hash.indexOf("?");

  if (queryStartIndex !== -1) {
    const hashQuery = hash.substring(queryStartIndex + 1);
    const hashParams = new URLSearchParams(hashQuery);
    return hashParams.get(paramName);
  }

  return null;
}

/**
 * Stores a parameter in sessionStorage for persistence across navigation
 */
export function storeSessionParameter(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value);
  } catch (error) {
    console.warn(`Failed to store session parameter ${key}:`, error);
  }
}

/**
 * Retrieves a parameter from sessionStorage
 */
export function getSessionParameter(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch (error) {
    console.warn(`Failed to retrieve session parameter ${key}:`, error);
    return null;
  }
}

/**
 * Gets a parameter from URL or sessionStorage (URL takes precedence)
 */
export function getPersistedUrlParameter(
  paramName: string,
  storageKey?: string,
): string | null {
  const key = storageKey || paramName;

  const urlValue = getUrlParameter(paramName);
  if (urlValue !== null) {
    storeSessionParameter(key, urlValue);
    return urlValue;
  }

  return getSessionParameter(key);
}

/**
 * Removes a specific parameter from the URL hash without reloading the page
 */
function clearParamFromHash(paramName: string): void {
  if (!window.history.replaceState) return;

  const hash = window.location.hash;
  if (!hash || hash.length <= 1) return;

  const hashContent = hash.substring(1);
  const queryStartIndex = hashContent.indexOf("?");

  if (queryStartIndex === -1) return;

  const routePath = hashContent.substring(0, queryStartIndex);
  const queryString = hashContent.substring(queryStartIndex + 1);

  const params = new URLSearchParams(queryString);
  params.delete(paramName);

  const newQueryString = params.toString();
  let newHash = routePath;
  if (newQueryString) newHash += `?${newQueryString}`;

  const newUrl =
    window.location.pathname +
    window.location.search +
    (newHash ? `#${newHash}` : "");
  window.history.replaceState(null, "", newUrl);
}

/**
 * Gets a secret parameter from the URL (hash fragment or query string) with
 * sessionStorage persistence. Supports both plain hash fragments and
 * hash-based routing (e.g. #/?caffeineAdminToken=xxx or #caffeineAdminToken=xxx).
 *
 * The parameter is cleared from the URL after extraction to prevent history leakage.
 */
export function getSecretParameter(paramName: string): string | null {
  // Check session first
  const existing = getSessionParameter(paramName);
  if (existing !== null) return existing;

  // Try regular query string
  const urlParams = new URLSearchParams(window.location.search);
  const fromQuery = urlParams.get(paramName);
  if (fromQuery !== null) {
    storeSessionParameter(paramName, fromQuery);
    return fromQuery;
  }

  // Try hash - handles both #paramName=value and #/route?paramName=value
  const hash = window.location.hash;
  if (!hash || hash.length <= 1) return null;

  const hashContent = hash.substring(1); // remove leading #
  const queryStartIndex = hashContent.indexOf("?");

  let secret: string | null = null;

  if (queryStartIndex !== -1) {
    // Hash-based routing: #/route?param=value
    const hashQuery = hashContent.substring(queryStartIndex + 1);
    secret = new URLSearchParams(hashQuery).get(paramName);
  } else {
    // Plain hash: #param=value
    secret = new URLSearchParams(hashContent).get(paramName);
  }

  if (secret) {
    storeSessionParameter(paramName, secret);
    clearParamFromHash(paramName);
    return secret;
  }

  return null;
}

/**
 * Removes a parameter from sessionStorage
 */
export function clearSessionParameter(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.warn(`Failed to clear session parameter ${key}:`, error);
  }
}
