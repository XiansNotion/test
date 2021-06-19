import { getTextContent, getDateValue } from 'notion-utils'
import { NotionAPI } from 'notion-client'
import { ReturnGetAllPostsParams } from './getAllPosts'
import { Post } from '@/types'
import BLOG from '@/blog.config'

const excludeProperties = ['date', 'select', 'multi_select', 'person']

async function getPageProperties(
  id: string,
  block: ReturnGetAllPostsParams['block'],
  schema: ReturnGetAllPostsParams['schema']
): Promise<Post> {
  const authToken = BLOG.notionAccessToken
  const api = new NotionAPI({ authToken })
  const rawProperties = Object.entries(block?.[id]?.value?.properties || [])
  const properties: Record<string, Post[keyof Post]> = {}
  for (let i = 0; i < rawProperties.length; i++) {
    const [key, val] = rawProperties[i]
    properties.id = id
    const currentPostKey = schema[key].name as keyof Post
    if (schema[key]?.type && !excludeProperties.includes(schema[key].type)) {
      properties[currentPostKey] = getTextContent(
        val as Parameters<typeof getTextContent>[0]
      )
    } else {
      switch (schema[key]?.type) {
        case 'date': {
          const dateProperty = getDateValue(
            val as Parameters<typeof getDateValue>[0]
          )
          const tmpDateProperty: Partial<typeof dateProperty> = dateProperty
          if (tmpDateProperty) {
            delete tmpDateProperty.type
            properties[currentPostKey] = tmpDateProperty
          }
          break
        }
        case 'select':
        case 'multi_select': {
          const selects = getTextContent(
            val as Parameters<typeof getTextContent>[0]
          )
          if (selects[0]?.length) {
            properties[currentPostKey] = selects.split(',')
          }
          break
        }
        // NOTE: Not using it?
        case 'person': {
          const rawUsers = (val as string[][]).flat()
          const users = []
          for (let i = 0; i < rawUsers.length; i++) {
            if (rawUsers[i][0][1]) {
              const userId = rawUsers[i][0]
              const res = await api.getUsers([userId])
              const resValue = res?.results?.[0]
              const user = {
                id: resValue?.id,
                first_name: resValue?.given_name,
                last_name: resValue?.family_name,
                profile_photo: resValue?.profile_photo
              }
              users.push(user)
            }
          }
          // properties[schema[key].name] = users
          break
        }
        default:
          break
      }
    }
  }
  return properties as Post
}

export { getPageProperties as default }
