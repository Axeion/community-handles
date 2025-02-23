export async function GET() {
    const blockedBots = [
      'Lemmy',
      'Mastodon',
      'Pleroma',
      'Misskey',
      'GotSocial',
      'peertube',
      'pixelfed',
      'writefreely',
      'bookwyrm',
      'funkwhale'
    ]
  
    // Generate rules for each bot
    const federationRules = blockedBots
      .map(bot => `
  User-agent: ${bot}
  Disallow: /*/inbox
  Disallow: /*/outbox
  Disallow: /*/.well-known/*
  `)
      .join('\n')
  
    const robotsTxt = `# Federation/ActivityPub Bots
  ${federationRules}
  
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
  Disallow: /*/outbox
  Disallow: /*/.well-known/*`
  
    return new Response(robotsTxt, {
      headers: {
        'Content-Type': 'text/plain',
      },
    })
  }