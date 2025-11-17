import fg from 'fast-glob'
import fs from 'node:fs/promises'
import path from 'node:path'
import { Feed } from 'feed'
import matter from 'gray-matter'
import { fileURLToPath } from 'node:url'

const SITE_URL = 'https://zonuexe.github.io'
const BLOG_BASE = '/blog/posts/'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const postsDir = path.resolve(__dirname, '../blog/posts')

type PostEntry = {
  title: string
  description?: string
  date: Date
  url: string
  content: string
}

export async function generateFeed(outDir: string) {
  const entries = await collectPosts()
  if (!entries.length) {
    return
  }

  const feed = new Feed({
    title: 'zonuexe blog',
    description: 'zonuexe のブログ更新情報',
    id: `${SITE_URL}/blog/`,
    link: `${SITE_URL}/blog/`,
    language: 'ja',
    favicon: `${SITE_URL}/favicon.ico`,
    image: `${SITE_URL}/zonuexe.png`,
    updated: entries[0]?.date ?? new Date()
  })

  for (const entry of entries) {
    feed.addItem({
      title: entry.title,
      id: entry.url,
      link: entry.url,
      description: entry.description,
      date: entry.date,
      content: entry.content
    })
  }

  const rssPath = path.join(outDir, 'rss.xml')
  await fs.mkdir(path.dirname(rssPath), { recursive: true })
  await fs.writeFile(rssPath, feed.rss2(), 'utf-8')
}

async function collectPosts(): Promise<PostEntry[]> {
  const files = await fg('**/*.md', { cwd: postsDir, absolute: true })
  const posts: PostEntry[] = []

  for (const file of files) {
    const raw = await fs.readFile(file, 'utf-8')
    const { data, content } = matter(raw)
    if (!data?.title || !data?.date) continue

    const slug = `${path.basename(file, '.md')}`
    const url = `${SITE_URL}${BLOG_BASE}${slug}`
    const date = new Date(data.date)

    posts.push({
      title: data.title as string,
      description: data.description as string | undefined,
      date,
      url,
      content: buildExcerpt(content)
    })
  }

  return posts.sort((a, b) => b.date.getTime() - a.date.getTime())
}

function buildExcerpt(markdown: string): string {
  const stripped = markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[#>*_`]/g, '')
    .replace(/\n{2,}/g, '\n')
    .trim()

  return stripped.split('\n').slice(0, 4).join(' ')
}
