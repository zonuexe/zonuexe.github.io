import fg from 'fast-glob'
import fs from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'

const siteUrl = 'https://zonuexe.github.io'
const blogBase = '/blog/posts/'
const postsDir = path.resolve(__dirname, '../blog/posts')

export type PostMeta = {
  title: string
  description?: string
  date: string
  url: string
  absoluteUrl: string
}

export async function getAllPosts(): Promise<PostMeta[]> {
  const files = await fg('**/*.md', { cwd: postsDir, absolute: true })
  const posts: PostMeta[] = []

  for (const file of files) {
    const raw = await fs.readFile(file, 'utf-8')
    const { data } = matter(raw)
    if (!data?.title || !data?.date) continue

    const relativePath = path.relative(postsDir, file)
    const normalized = relativePath.replace(/\\/g, '/')
    const slug = normalized.replace(/\.md$/, '')
    const url = `${blogBase}${slug}`
    posts.push({
      title: data.title as string,
      description: data.description as string | undefined,
      date: data.date as string,
      url,
      absoluteUrl: `${siteUrl}${url}`
    })
  }

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export async function getRecentPosts(limit: number): Promise<PostMeta[]> {
  const all = await getAllPosts()
  return all.slice(0, limit)
}
