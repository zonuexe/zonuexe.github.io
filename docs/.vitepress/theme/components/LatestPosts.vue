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
</script>

<template>
  <section class="profile-panel">
    <h2 id="latest">最新の書きもの</h2>
    <ul v-if="latest.length" class="blog-list">
      <li v-for="post in latest" :key="post.url">
        <a :href="post.url">{{ post.title }}</a>
        <p class="blog-meta">
          {{ formatDate(post.date) }}
          <span v-if="post.description"> · {{ post.description }}</span>
        </p>
        <div v-if="post.tags?.length" class="tag-list">
          <span v-for="tag in post.tags" :key="tag">{{ tag }}</span>
        </div>
      </li>
    </ul>
    <p v-else class="blog-meta">ブログ記事は準備中です。</p>
  </section>
</template>
