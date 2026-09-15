// The OAuth code exchange needs to run with no auth check at all, session or
// not, or it can never establish one.
export function isAuthCallbackPath(pathname) {
  return pathname.startsWith("/auth/");
}

// The one public route: a read-only share link, no session needed.
function isPublicSharePath(pathname) {
  return pathname.startsWith("/s/");
}

function isNotInvitedPath(pathname) {
  return pathname === "/not-invited";
}

/**
 * @param {{ pathname: string, email?: string, invited?: boolean }} args
 * @returns {"next" | "login" | "home" | "not-invited"}
 */
export function decideRoute({ pathname, email, invited }) {
  if (isAuthCallbackPath(pathname) || isPublicSharePath(pathname)) return "next";

  if (!email) {
    return pathname === "/login" || isNotInvitedPath(pathname) ? "next" : "login";
  }

  // Fail closed: a signed-in email counts as invited only when the caller
  // actually checked and got true. An invite can be revoked later, so 
  // "we didn't check" must not mean "let them through".
  if (invited !== true) {
    return isNotInvitedPath(pathname) ? "next" : "not-invited";
  }

  return pathname === "/login" || isNotInvitedPath(pathname) ? "home" : "next";
}
