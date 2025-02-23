export async function GET() {
    const robotsTxt = `# Fediverse/ActivityPub Crawlers
  User-agent: Lemmy
  Disallow: /*/inbox
  Disallow: /*/outbox
  
  User-agent: Mastodon
  Disallow: /*/inbox
  Disallow: /*/outbox
  
  User-agent: Pleroma
  Disallow: /*/inbox
  Disallow: /*/outbox
  
  # Social Media Crawlers
  User-agent: Twitterbot
  Allow: /
  
  User-agent: facebookexternalhit
  Allow: /
  
  # Common Bots
  User-agent: Googlebot
  Allow: /
  
  User-agent: bingbot
  Allow: /
  
  User-agent: DuckDuckBot
  Allow: /
  
  # Archive Bots
  User-agent: ia_archiver
  Allow: /
  
  User-agent: archive.org_bot
  Allow: /
  
  # Default for all other bots
  User-agent: *
  Allow: /
  Disallow: /*/inbox
  Disallow: /*/outbox`
  
    return new Response(robotsTxt, {
      headers: {
        'Content-Type': 'text/plain',
      },
    })
  }