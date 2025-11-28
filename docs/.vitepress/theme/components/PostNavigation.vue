<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
type NavPost = {
  title: string
  url: string
  relativePath?: string
  date?: string
}

const props = defineProps<{ posts: NavPost[] }>()

const { page, params } = useData()

const currentIndex = computed(() =>
  props.posts.findIndex(
    (post) => post.relativePath === page.value.relativePath
  )
)

const previousPost = computed(() => {
  const idx = currentIndex.value
  if (idx === -1 || idx >= props.posts.length - 1) return null
  return props.posts[idx + 1]
})

const nextPost = computed(() => {
  const idx = currentIndex.value
  if (idx <= 0) return null
  return props.posts[idx - 1]
})

const isBlogPost = computed(
  () =>
    typeof page.value.relativePath === 'string' &&
    page.value.relativePath.startsWith('blog/') &&
    !page.value.params?.year
)

const years = computed(() => {
  const set = new Set<number>()
  props.posts.forEach((post) => {
    const date = new Date(post.date)
    if (!Number.isNaN(date.getTime())) {
      set.add(date.getFullYear())
    }
  })
  return Array.from(set).sort((a, b) => b - a)
})

const currentYear = computed(() => {
  const paramYear = Number(params.value?.year)
  if (Number.isInteger(paramYear)) return paramYear
  const match = page.value.relativePath?.match(/blog\/year\/(\d{4})/)
  if (match) return Number(match[1])
  return undefined
})

const isYearArchive = computed(
  () =>
    typeof page.value.relativePath === 'string' &&
    page.value.relativePath.startsWith('blog/posts/') &&
    Number.isInteger(currentYear.value)
)

const prevYear = computed(() => {
  if (!isYearArchive.value || currentYear.value === undefined) return null
  const candidate = years.value.find((year) => year < currentYear.value && year >= 2025)
  return candidate ? { title: `${candidate}年のアーカイブ`, url: `/blog/posts/${candidate}/` } : null
})

const nextYearNumber = computed(() =>
  isYearArchive.value && currentYear.value !== undefined ? currentYear.value + 1 : undefined
)

const nextYear = computed(() => {
  const next = nextYearNumber.value
  if (!isYearArchive.value || next === undefined) return null
  return years.value.includes(next)
    ? { title: `${next}年のアーカイブ`, url: `/blog/posts/${next}/` }
    : null
})

const nextYearTitle = computed(() => (nextYearNumber.value ? `${nextYearNumber.value}年のアーカイブ` : ''))

const editLink = computed(() =>
  page.value.relativePath
    ? `https://github.com/zonuexe/zonuexe.github.io/blob/master/docs/${page.value.relativePath}`
    : ''
)
</script>

<template>
  <nav v-if="isBlogPost" class="post-navigation" aria-label="Blog pagination">
    <div class="nav-links">
      <template v-if="isYearArchive">
        <a v-if="prevYear" class="prev-post" rel="prev" :href="prevYear.url">
          <span class="nav-label">前の年のアーカイブ</span>
          <span class="nav-title">{{ prevYear.title }}</span>
        </a>
        <span v-else class="nav-placeholder" />
        <a v-if="nextYear" class="next-post" rel="next" :href="nextYear.url">
          <span class="nav-label">次の年のアーカイブ</span>
          <span class="nav-title">{{ nextYear.title }}</span>
        </a>
        <span v-else class="nav-placeholder nav-disabled" aria-disabled="true">
          <span class="nav-label">次の年のアーカイブ</span>
          <span class="nav-title">{{ nextYearTitle }}</span>
        </span>
      </template>
      <template v-else>
        <a v-if="previousPost" class="prev-post" rel="prev" :href="previousPost.url">
          <span class="nav-label">前の記事</span>
          <span class="nav-title">{{ previousPost.title }}</span>
        </a>
        <span v-else class="nav-placeholder" />
        <a v-if="nextPost" class="next-post" rel="next" :href="nextPost.url">
          <span class="nav-label">次の記事</span>
          <span class="nav-title">{{ nextPost.title }}</span>
        </a>
        <span v-else class="nav-placeholder" />
      </template>
    </div>
    <p v-if="editLink" class="nav-feedback">
      <a :href="editLink" target="_blank">誤字があればGitHubでPull Requestを送ってね</a>
    </p>
  </nav>
</template>
