<script setup lang="ts">
import { computed } from 'vue'
import { data as posts } from '../../data/latestPosts.data'

const props = defineProps<{
  year: number
}>()

const formatter = new Intl.DateTimeFormat('ja-JP', { dateStyle: 'medium' })

const toISODate = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0]
}

const formatDate = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : formatter.format(date)
}

const items = computed(() =>
  posts
    .filter((post) => {
      const date = new Date(post.date)
      return !Number.isNaN(date.getTime()) && date.getFullYear() === props.year
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
)
</script>

<template>
  <div class="page-container blog-page">
    <section class="profile-panel">
      <h1>{{ year }}年の記事</h1>
      <p class="blog-meta">公開日順（新しい順）で並べています。</p>
    </section>

    <section v-if="items.length" class="profile-panel">
      <ul class="blog-list">
        <li v-for="post in items" :key="post.url" class="h-entry">
          <a class="p-name u-url" :href="post.url">{{ post.title }}</a>
          <p class="blog-meta">
            <time class="dt-published" :datetime="toISODate(post.date)">{{ formatDate(post.date) }}</time>
          </p>
          <p v-if="post.description" class="blog-description p-summary">{{ post.description }}</p>
          <p v-else-if="post.excerpt" class="blog-description p-summary">{{ post.excerpt }}</p>
          <ul v-if="post.tags?.length" class="tag-list">
            <li v-for="tag in post.tags" :key="tag" class="tag-item p-category">{{ tag }}</li>
          </ul>
        </li>
      </ul>
    </section>
    <section v-else class="profile-panel">
      <p class="blog-meta">{{ year }}年の投稿はありません。</p>
    </section>
  </div>
</template>
