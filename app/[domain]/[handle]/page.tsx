import { Metadata } from "next"
import { headers } from "next/headers"
import { agent } from "@/lib/atproto"
import { prisma } from "@/lib/db"
import { Profile } from "@/components/profile"

interface Props {
  params: { handle: string; domain: string }
}

async function getUser(handle: string, domain: string) {
  const domainRecord = await prisma.domain.findFirst({
    where: { name: domain }
  })
  
  if (!domainRecord) {
    console.log('Domain not found:', domain)
    return null
  }

  const user = await prisma.user.findFirst({
    where: { 
      handle,
      domainId: domainRecord.id 
    },
  })
  
  console.log('Query result:', user)
  return user
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const user = await getUser(params.handle, params.domain)
  if (!user) {
    return {
      title: "Profile not found",
      description: ":(",
    }
  }

  const profile = await agent.getProfile({
    actor: user.did,
  })
  return {
    title: `${profile.data.displayName} - @${profile.data.handle}`,
    description: profile.data.description,
  }
}

export default async function HandlePage({ params }: Props) {
  const { domain, handle } = params

  // Get user agent
  const headersList = headers()
  const userAgent = headersList.get('user-agent') || ''
  
  // List of bot patterns to block
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

  // Check if userAgent matches any blocked bot patterns
  const isBlockedBot = blockedBots.some(bot => 
    userAgent.toLowerCase().includes(bot.toLowerCase())
  )

  if (isBlockedBot) {
    console.log('Blocked bot request:', { userAgent, path: `/${domain}/${handle}` })
    return (
      <div className="grid flex-1 place-items-center">
        <p className="text-center">Not Found</p>
      </div>
    )
  }

  try {
    const user = await getUser(handle, domain)
    if (!user) {
      throw new Error("User not found")
    }

    const profile = await agent.getProfile({
      actor: user.did,
    })
    return (
      <div className="grid flex-1 place-items-center">
        <a href={`https://bsky.app/profile/${profile.data.handle}`}>
          <Profile profile={profile.data} />
        </a>
      </div>
    )
  } catch (e) {
    console.error('HandlePage error:', e)
    return (
      <div className="grid flex-1 place-items-center">
        <p className="text-center">Profile not found</p>
      </div>
    )
  }
}