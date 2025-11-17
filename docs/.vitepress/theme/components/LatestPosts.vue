<script setup lang="ts">
import { data as posts } from '../../data/latestPosts.data'

const formatter = new Intl.DateTimeFormat('ja-JP', { dateStyle: 'medium' })
const latest = posts.slice(0, 4)

const formatDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return formatter.format(date)
}

const toISODate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toISOString().split('T')[0]
}
</script>

<template>
  <section class="profile-panel h-feed" aria-labelledby="latest">
    <h2 id="latest">最新の書きもの</h2>
    <ul v-if="latest.length" class="blog-list">
      <li v-for="post in latest" :key="post.url" class="h-entry">
        <article>
          <header>
            <h3 class="p-name">
              <a class="u-url" :href="post.url">{{ post.title }}</a>
            </h3>
            <p class="blog-meta">
              <time class="dt-published" :datetime="toISODate(post.date)">{{ formatDate(post.date) }}</time>
            </p>
          </header>
          <p v-if="post.description" class="blog-description p-summary">
            {{ post.description }}
          </p>
          <ul v-if="post.tags?.length" class="tag-list">
            <li v-for="tag in post.tags" :key="tag" class="p-category">{{ tag }}</li>
          </ul>
        </article>
      </li>
    </ul>
    <p v-else class="blog-meta">ブログ記事は準備中です。</p>
  </section>
</template>
