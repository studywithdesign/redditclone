import { useSession } from 'next-auth/react'
import React, { useState } from 'react'
import Avatar from './Avatar'
import { LinkIcon, PhotographIcon } from '@heroicons/react/outline'
import { useForm } from 'react-hook-form'
import { useMutation } from '@apollo/client'
import { ADD_POST, ADD_SUBREDDIT } from '../graphql/mutations'
import client from '../apollo-client'
import { GET_ALL_POSTS, GET_SUBREDDIT_BY_TOPIC } from '../graphql/queries'
import toast from 'react-hot-toast'

type FormData = {
  postTitle: string
  postBody: string
  postImage: string
  subreddit: string
}

type Props = {
  subreddit?: string
}

function PostBox({ subreddit }: Props) {
  const { data: session } = useSession()
  const [addPost] = useMutation(ADD_POST, {
    refetchQueries: [GET_ALL_POSTS, 'getPostList'],
  })
  const [addSubreddit, { error: errorData }] = useMutation(ADD_SUBREDDIT)

  const [imageBoxOpen, setImageBoxOpen] = useState<Boolean>(false)
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>()

  const onSubmit = handleSubmit(async (formData) => {
    const notification = toast.loading('Creating new post...')
    try {
      // query for the subreddit topic...
      console.log('logged')

      const {
        data: { getSubredditListByTopic },
        error,
      } = await client.query({
        query: GET_SUBREDDIT_BY_TOPIC,
        variables: {
          topic: subreddit || formData.subreddit,
        },
      })

      console.log(getSubredditListByTopic)

      console.log('Checking subreddit: ', error)

      const subredditExists = getSubredditListByTopic.length > 0

      if (!subredditExists) {
        // create subreddit ...

        console.log('IN IF')

        console.log(formData.subreddit)

        const {
          data: { insertSubreddit: newSubreddit },
        } = await addSubreddit({
          variables: {
            topic: formData.subreddit,
          },
        })

        console.log('Creating subreddit...', formData)

        const image = formData.postImage || ''

        console.log(newSubreddit)

        const {
          data: { insertPost: newPost },
        } = await addPost({
          variables: {
            body: formData.postBody,
            image: image,
            subreddit_id: newSubreddit.id,
            title: formData.postTitle,
            username: session?.user?.name,
          },
        })

        console.log(`New post added: ${newPost}`)
      } else {
        // use exisiting subreddit ...
        const image = formData.postImage || ''

        const {
          data: { insertPost: newPost },
        } = await addPost({
          variables: {
            body: formData.postBody,
            image: image,
            subreddit_id: getSubredditListByTopic[0].id,
            title: formData.postTitle,
            username: session?.user?.name,
          },
        })

        console.log('New post added')

        setValue('postBody', '')
        setValue('postTitle', '')
        setValue('postImage', '')
        setValue('subreddit', '')
      }

      toast.success('New Post Created', {
        id: notification,
      })
    } catch (error) {
      console.log(errorData)

      console.log(`Error: `)
      toast.error('Whoops Something wrong happened', {
        id: notification,
      })
    }
  })

  return (
    <form
      className="sticky top-16 z-50 rounded-md border border-gray-300 bg-white p-2"
      onSubmit={onSubmit}
    >
      <div className="flex items-center space-x-3">
        {/* Avatar */}
        <Avatar />

        <input
          {...register('postTitle', { required: true })}
          type="text"
          disabled={!session}
          className="flex-1 rounded-md bg-gray-50 p-2 pl-5 outline-none"
          placeholder={
            session
              ? subreddit
                ? `Create a post in r/${subreddit}`
                : 'Create a post by entering a title'
              : 'Sign in to post'
          }
        />

        <PhotographIcon
          onClick={() => setImageBoxOpen(!imageBoxOpen)}
          className={`h-6 cursor-pointer text-gray-300 ${
            imageBoxOpen && 'text-blue-300'
          }`}
        />
        <LinkIcon className="h-6 text-gray-300" />
      </div>

      {watch('postTitle') && (
        <div className="flex flex-col py-2">
          {/* body */}
          <div className="flex items-center px-2">
            <p className="min-x-[90px]">Body:</p>
            <input
              {...register('postBody', { required: false })}
              type="text"
              placeholder="Text (optional)"
              className="flex-1 bg-blue-50 p-2 outline-none"
            />
          </div>

          {!subreddit && (
            <>
              {/* Subbreddit */}
              <div className="flex items-center px-2">
                <p className="min-x-[90px]">Body:</p>
                <input
                  {...register('subreddit', { required: true })}
                  type="text"
                  placeholder="i.e. reactjs"
                  className="flex-1 bg-blue-50 p-2 outline-none"
                />
              </div>
            </>
          )}

          {/* Image */}
          {imageBoxOpen && (
            <div className="flex items-center px-2">
              <p className="min-x-[90px]">Image:</p>
              <input
                {...register('postImage')}
                type="text"
                placeholder="i.e. reactjs"
                className="flex-1 bg-blue-50 p-2 outline-none"
              />
            </div>
          )}

          {/* Errors */}
          {Object.keys(errors).length > 0 && (
            <div className="space-y-2 p-2  text-red-500">
              {errors?.postTitle?.type === 'required' && (
                <p>A Post title is required</p>
              )}

              {errors?.subreddit?.type === 'required' && (
                <p>A Subreddit is required</p>
              )}
            </div>
          )}

          {watch('postTitle') && (
            <button
              type="submit"
              className="w-full rounded-full bg-blue-100 p-2 text-white"
            >
              Create Post
            </button>
          )}
        </div>
      )}
    </form>
  )
}

export default PostBox
