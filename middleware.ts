import { NextResponse, type NextRequest } from "next/server"
import { getDomain } from "./lib/utils"

// List of bot patterns to block
const blockedBots = [
  'lemmy',
  'mastodon', 
  'pleroma',
  'misskey',
  'gotsocial',
  'peertube',
  'pixelfed',
  'writefreely',
  'bookwyrm',
  'funkwhale',
  'aoderelay',  
  'ap-relay'    
].map(bot => bot.toLowerCase())

export function middleware(request: NextRequest) {
  const url = new URL(request.url)

  // First check if it's a bot we want to block
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || ''
  const isBlockedBot = blockedBots.some(bot => userAgent.includes(bot))

  if (isBlockedBot) {
    console.log('Blocked bot request:', { 
      userAgent, 
      path: url.pathname 
    })
    return new NextResponse(null, { status: 404 })
  }

  // If not a bot, proceed with domain handling
  const { domain, subdomain } = getDomain(url.hostname)

  if (domain) {
    if (subdomain && subdomain !== process.env.LANDING_SUBDOMAIN) {
      return NextResponse.rewrite(
        new URL(`/${domain}/${subdomain}${url.pathname}${url.search}`, url)
      )
    } else {
      return NextResponse.rewrite(
        new URL(`/${domain}${url.pathname}${url.search}`, url)
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. all root files inside /public (e.g. /favicon.ico)
     * 4. opengraph images (e.g. /[a-z0-9-_.]/[a-z0-9-_]/opengraph-image)
     * 5. Plausible analytics script
     */
    "/((?!api/|_next/|_static/|js/|proxy/|[\\w-]+\\.\\w+|[a-zA-Z0-9-_.]+/[a-zA-Z0-9-_]+/opengraph-image).*)",
  ],
}