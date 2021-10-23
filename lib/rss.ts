import BLOG from '~/blog.config';
import { Post } from '~/types';
import { Feed } from 'feed';

export function generateRss(posts: Post[]) {
  const year = new Date().getFullYear();
  const feed = new Feed({
    title: BLOG.title,
    description: BLOG.description,
    id: `${BLOG.link}/${BLOG.path}`,
    link: `${BLOG.link}/${BLOG.path}`,
    language: BLOG.lang,
    favicon: `${BLOG.link}/favicon.svg`,
    copyright: `All rights reserved ${year}, ${BLOG.author}`,
    author: {
      name: BLOG.author,
      email: BLOG.email,
      link: BLOG.link,
    },
  });
  posts.forEach((post) => {
    feed.addItem({
      title: post?.title ?? '',
      id: `${BLOG.link}/${post.slug}`,
      link: `${BLOG.link}/${post.slug}`,
      description: post.summary,
      date: new Date(post?.date?.start_date || post.createdTime),
    });
  });
  return feed.rss2();
}
