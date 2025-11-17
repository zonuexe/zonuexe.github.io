<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

const { page } = useData()

const isoDate = computed(() => {
  const value = page.value.frontmatter?.date
  if (!value) return ''
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString().split('T')[0]
})

const formattedDate = computed(() => {
  if (!isoDate.value) return ''
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  }).format(new Date(isoDate.value))
})

const shouldDisplay = computed(() => {
  const relativePath = page.value.relativePath || ''
  return relativePath.startsWith('blog/') && Boolean(formattedDate.value)
})
</script>

<template>
  <div v-if="shouldDisplay" class="post-meta">
    <time :datetime="isoDate">{{ formattedDate }}</time>
  </div>
</template>
