import React, { useEffect, useState } from 'react'
import { LinkIcon } from '@heroicons/react/outline'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BookmarkIcon,
  ChatAltIcon,
  DotsHorizontalIcon,
  GiftIcon,
  ShareIcon,
} from '@heroicons/react/solid'
import Avatar from './Avatar'
import TimeAgo from 'react-timeago'
import Link from 'next/link'
import { Jelly } from '@uiball/loaders'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import { useMutation, useQuery } from '@apollo/client'
import { GET_ALL_VOTES_BY_POST_ID } from '../graphql/queries'
import { ADD_VOTE } from '../graphql/mutations'

type Props = {
  post: Post
}

function Post({ post }: Props) {
  const [vote, setVote] = useState<boolean>()
  const { data: session } = useSession()

  const { data, loading } = useQuery(GET_ALL_VOTES_BY_POST_ID, {
    variables: {
      post_id: post?.id,
    },
  })

  const [addVote] = useMutation(ADD_VOTE, {
    refetchQueries: [GET_ALL_VOTES_BY_POST_ID, 'getVotesById'],
  })

  const upVote = async (isUpVote: boolean) => {
    if (!session) {
      toast('Plesae sign in')
      return
    }

    if (vote && isUpVote) return

    if (vote === false && !isUpVote) return

    console.log('voting...')

    await addVote({
      variables: {
        post_id: post.id,
        username: session.user?.name,
        upVote: isUpVote,
      },
    })
  }

  useEffect(() => {
    const votes: Vote[] = data?.getVotesById

    const vote = votes?.find(
      (vote) => vote.username == session?.user?.name
    )?.upvote

    setVote(vote)
  }, [data])

  if (!post)
    return (
      <div className="flex w-full items-center justify-center p-10 text-xl">
        <Jelly size={50} color="#ff4501" />
      </div>
    )

  return (
    <Link href={`/post/${post.id}`}>
      <div className="flex cursor-pointer rounded-md border border-gray-300 bg-white shadow-md hover:border hover:border-gray-600 ">
        {/* votes */}
        <div className="flex flex-col items-center justify-start space-y-1 rounded-l-md bg-gray-50 p-4 text-gray-400">
          <ArrowUpIcon
            onClick={() => upVote(true)}
            className="customButtons hover:text-red-400"
          />
          <p className="text-xs font-bold text-black">0</p>
          <ArrowDownIcon
            onClick={() => upVote(false)}
            className="customButtons hover:text-blue-400"
          />
        </div>

        {/* body */}
        <div className="w-full p-3 pb-1">
          {/* header */}
          <div>
            <Avatar seed={post.subreddit[0]?.topic} />
            <p className="text-xs text-gray-400">
              <Link href={`/subreddit/${post.subreddit[0]?.topic}`}>
                <span className="font-bold text-black hover:text-blue-400 hover:underline">
                  r/{post.subreddit[0]?.topic}
                </span>
              </Link>{' '}
              • Posted by u/
              {post.username} <TimeAgo date={post.created_at} />
            </p>
          </div>

          {/* body */}
          <div className="py-4">
            <h3 className="text-xl font-semibold">{post.title}</h3>
            <p className="mt-2 text-xs font-light">{post.body}</p>
          </div>

          {/* Image */}
          <img className="w-full" src={post.image} alt="" />

          {/* footer */}
          <div className="flex space-x-4 text-gray-400">
            <div className="postButtons">
              <ChatAltIcon className="h-6 w-6" />
              <p className="">{post.comments.length} Comments</p>
            </div>
            <div className="postButtons">
              <GiftIcon className="h-6 w-6" />
              <p className="hidden sm:inline">Award</p>
            </div>
            <div className="postButtons">
              <ShareIcon className="h-6 w-6" />
              <p className="hidden sm:inline">Share</p>
            </div>
            <div className="postButtons">
              <BookmarkIcon className="h-6 w-6" />
              <p className="hidden sm:inline">Save</p>
            </div>
            <div className="postButtons">
              <DotsHorizontalIcon className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default Post
