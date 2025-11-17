import { Feed } from 'feed'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getAllPosts } from './posts'

export async function generateFeed(outDir: string) {
  const posts = await getAllPosts()
  const entries = posts.map((post) => ({
    ...post,
    date: new Date(post.date)
  }))
  if (!entries.length) {
    return
  }

  const feed = new Feed({
    title: 'zonuexe blog',
    description: 'zonuexe のブログ更新情報',
    id: 'https://zonuexe.github.io/blog/',
    link: 'https://zonuexe.github.io/blog/',
    language: 'ja',
    favicon: 'https://zonuexe.github.io/favicon.ico',
    image: 'https://zonuexe.github.io/zonuexe.png',
    updated: entries[0]?.date ?? new Date()
  })

  for (const entry of entries) {
    feed.addItem({
      title: entry.title,
      id: entry.absoluteUrl,
      link: entry.absoluteUrl,
      description: entry.description ?? undefined,
      date: entry.date,
      content: entry.description ?? ''
    })
  }

  const rssPath = path.join(outDir, 'rss.xml')
  await fs.mkdir(path.dirname(rssPath), { recursive: true })
  await fs.writeFile(rssPath, feed.rss2(), 'utf-8')
}
