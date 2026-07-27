import { NextResponse, type NextRequest } from 'next/server';

/**
 * Serve the comics data as JSON to a client that does not ask for a web page.
 * A browser sends `Accept: text/html`, so a browser still gets the page.
 * `curl` sends `Accept: * / *`, so `curl /comics` returns the raw data.
 *
 * A URL fragment such as `/comics#dc` never reaches the server, so the filter
 * uses a query, for example `/comics?universe=dc`.
 */
export function middleware(request: NextRequest) {
  const accept = request.headers.get('accept') || '';
  const wantsJson = request.nextUrl.searchParams.get('format') === 'json';

  // Next.js requests the route again for client navigation and for prefetch.
  // Those requests must still receive the page.
  const isAppRequest = accept.includes('text/x-component')
    || request.headers.has('rsc')
    || request.headers.has('next-router-prefetch');

  if (!wantsJson && (isAppRequest || accept.includes('text/html'))) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = '/api/comics';
  return NextResponse.rewrite(url);
}

export const config = { matcher: '/comics' };
