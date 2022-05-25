import { useSession } from 'next-auth/react'
import Image from 'next/image'
import React from 'react'

type Props = {
  seed?: string
  large?: boolean
}

function Avatar({ seed, large }: Props) {
  const { data: session } = useSession()

  return (
    <div
      className={`relative  rounded-full border-gray-300 bg-white ${
        large ? 'h-20 w-20' : 'h-10 w-10'
      }`}
    >
      <Image
        src={`https://avatars.dicebear.com/api/open-peeps/${
          session?.user?.name || 'placeholder'
        }.svg`}
        layout="fill"
      />
    </div>
  )
}

export default Avatar
