import { getAllPosts } from '../../../.vitepress/posts'

export default {
  async paths() {
    const posts = await getAllPosts()
    const years = new Set<number>()
    posts.forEach((post) => {
      const date = new Date(post.date)
      if (!Number.isNaN(date.getTime())) {
        years.add(date.getFullYear())
      }
    })

    return Array.from(years)
      .sort((a, b) => b - a)
      .map((year) => ({
        params: { year: String(year) }
      }))
  }
}
