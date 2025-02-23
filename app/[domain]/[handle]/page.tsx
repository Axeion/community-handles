import { Metadata } from "next"

import { agent } from "@/lib/atproto"
import { prisma } from "@/lib/db"
import { Profile } from "@/components/profile"

interface Props {
  params: { handle: string; domain: string }
}

async function getUser(handle: string, domain: string) {
  console.log('Attempting to find user with:', { handle, domain })
  const user = await prisma.user.findFirst({
    where: { handle, domain: { name: domain } },
  })
  console.log('Query result:', user)
  return user
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const user = await getUser(params.handle, params.domain)
  if (!user) {
    console.log('No user found in generateMetadata')
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

  try {
    console.log('HandlePage params:', { domain, handle })
    const user = await getUser(handle, domain)
    if (!user) {
      console.log('No user found in HandlePage')
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