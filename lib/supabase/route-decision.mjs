// The OAuth code exchange needs to run with no auth check at all, session or
// not, or it can never establish one.
export function isAuthCallbackPath(pathname) {
  return pathname.startsWith("/auth/");
}

// The one public route: a read-only share link, no session needed.
function isPublicSharePath(pathname) {
  return pathname.startsWith("/s/");
}

/**
 * @param {{ pathname: string, email?: string }} args
 * @returns {"next" | "login" | "home"}
 */
export function decideRoute({ pathname, email }) {
  if (isAuthCallbackPath(pathname) || isPublicSharePath(pathname)) return "next";

  if (!email) {
    return pathname === "/login" ? "next" : "login";
  }

  return pathname === "/login" ? "home" : "next";
}
