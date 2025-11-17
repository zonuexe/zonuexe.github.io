import { createContentLoader } from 'vitepress'

export interface BlogPostItem {
  title: string
  description?: string
  date: string
  url: string
  tags: string[]
  excerpt: string
}

declare const data: BlogPostItem[]
export { data }

export default createContentLoader('blog/posts/**/*.md', {
  excerpt: true,
  transform(items) {
    return items
      .map((item) => ({
        title: item.frontmatter.title as string,
        description: item.frontmatter.description as string | undefined,
        date: item.frontmatter.date as string,
        url: item.url,
        relativePath: item.relativePath,
        tags: (item.frontmatter.tags as string[]) ?? [],
        excerpt: item.excerpt ?? ''
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }
})
