import type { NextPage } from 'next'
import Header from '../components/Header'
import PostBox from '../components/PostBox'
import client from '../apollo-client'
import { GET_SUBREDDIT_BY_TOPIC } from '../graphql/queries'
import { useEffect } from 'react'
import Feed from '../components/Feed'

const Home: NextPage = () => {
  return (
    <div className="my-7 mx-auto max-w-5xl">
      {/* PostBox */}
      <PostBox />
      <div>
        <Feed />
      </div>
    </div>
  )
}

export default Home
