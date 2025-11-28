<script setup lang="ts">
import { computed } from 'vue'
import { data as posts } from '../../data/latestPosts.data'

const formatter = new Intl.DateTimeFormat('ja-JP', { dateStyle: 'medium' })

const toISODate = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0]
}

const formatDate = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : formatter.format(date)
}

const featuredPosts = computed(() => posts.slice(0, 3))

const archiveGroups = computed(() => {
  const buckets = new Map<number | 'unknown', typeof posts>()
  posts.forEach((post) => {
    const date = new Date(post.date)
    const year = Number.isNaN(date.getTime()) ? 'unknown' : date.getFullYear()
    if (!buckets.has(year)) buckets.set(year, [])
    buckets.get(year)!.push(post)
  })

  return Array.from(buckets.entries())
    .sort(([a], [b]) => {
      if (a === 'unknown') return 1
      if (b === 'unknown') return -1
      return Number(b) - Number(a)
    })
    .map(([year, items]) => ({
      year,
      items: items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }))
})
</script>

<template>
  <div class="blog-page page-container">
    <h1>tadsan&amp;! Blog</h1>
    <section v-if="featuredPosts.length" class="blog-featured">
      <h2 id="featured">Latest posts</h2>
      <div class="blog-grid">
        <article v-for="post in featuredPosts" :key="post.url" class="blog-card h-entry">
          <header>
            <p class="blog-meta">
              <time class="dt-published" :datetime="toISODate(post.date)">{{ formatDate(post.date) }}</time>
            </p>
            <h3 class="p-name">
              <a class="u-url" :href="post.url">{{ post.title }}</a>
            </h3>
          </header>
          <p v-if="post.description" class="blog-description p-summary">
            {{ post.description }}
          </p>
          <p v-else-if="post.excerpt" class="blog-description p-summary">{{ post.excerpt }}</p>
          <ul v-if="post.tags?.length" class="tag-list">
            <li v-for="tag in post.tags" :key="tag" class="tag-item p-category">{{ tag }}</li>
          </ul>
        </article>
      </div>
    </section>

    <section class="profile-panel blog-archive">
      <div class="blog-archive-header">
        <h2 id="recent">アーカイブ</h2>
        <p class="blog-meta">これまでの投稿を年別にまとめました。</p>
      </div>
      <div v-if="archiveGroups.length" class="blog-archive-groups">
        <div v-for="group in archiveGroups" :key="group.year" class="blog-archive-group">
          <h3 class="blog-archive-year">
            <span>{{ group.year === 'unknown' ? 'Other' : group.year }}</span>
          </h3>
          <div class="blog-archive-list">
            <article v-for="post in group.items" :key="post.url" class="blog-archive-item h-entry">
              <header>
                <p class="blog-meta">
                  <time class="dt-published" :datetime="toISODate(post.date)">{{ formatDate(post.date) }}</time>
                </p>
                <h4 class="p-name">
                  <a class="u-url" :href="post.url">{{ post.title }}</a>
                </h4>
              </header>
              <p v-if="post.description" class="blog-description p-summary">
                {{ post.description }}
              </p>
              <ul v-if="post.tags?.length" class="tag-list">
                <li v-for="tag in post.tags" :key="tag" class="tag-item p-category">{{ tag }}</li>
              </ul>
            </article>
          </div>
        </div>
      </div>
      <p v-else class="blog-meta">ブログ記事は準備中です。</p>
    </section>
  </div>
</template>
