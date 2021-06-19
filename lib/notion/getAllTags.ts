import { getAllPosts } from './getAllPosts'
import { TagObj } from '@/types'
import nonNullable from '@/lib/nonNullable'

export async function getAllTags(): Promise<TagObj> {
  const response = await getAllPosts()
  const posts = (response ?? []).filter(
    post =>
      post?.status?.[0] === 'Published' &&
      post?.type?.[0] === 'Post' &&
      post.tags
  )
  const tags = [...posts.map(p => p?.tags).flat()].filter(nonNullable)
  const tagObj: TagObj = {}
  tags.forEach(tag => {
    if (tag in tagObj) {
      tagObj[tag]++
    } else {
      tagObj[tag] = 1
    }
  })
  return tagObj
}
