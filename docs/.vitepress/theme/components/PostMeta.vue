<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

import gitHistory from '../../data/git-history.json'

type GitHistoryEntry = {
  historyUrl: string
  commits: { hash: string; date: string; rev: number; url: string }[]
}

const normalizeCommitDate = (value: string) => value.replace(/([+-]\d{2}):(\d{2})$/, '$1$2')

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

const historyInfo = computed<GitHistoryEntry | undefined>(() => {
  const relativePath = page.value.relativePath || ''
  return (gitHistory as Record<string, GitHistoryEntry>)[relativePath]
})

const latestCommit = computed(() => {
  const commits = historyInfo.value?.commits
  if (!commits?.length) return undefined
  return commits[commits.length - 1]
})

const latestCommitDateText = computed(() => {
  const date = latestCommit.value?.date
  if (!date) return ''
  return normalizeCommitDate(date)
})

const latestCommitRevLabel = computed(() => {
  const rev = latestCommit.value?.rev
  if (typeof rev !== 'number') return ''
  return `rev.${rev}`
})

const shouldDisplay = computed(() => {
  const relativePath = page.value.relativePath || ''
  return relativePath.startsWith('blog/')
})
</script>

<template>
  <div v-if="shouldDisplay" class="post-meta">
    <p v-if="isoDate || latestCommit" class="post-meta-inline">
      <template v-if="isoDate">
        <time :datetime="isoDate">{{ formattedDate }}</time>
      </template>
      <span v-if="latestCommit" class="post-meta-inline-updated">
        {{ isoDate ? ' ' : '' }}(Last updated at:
        <time :datetime="latestCommit.date">{{ latestCommitDateText }}</time>;
        <a :href="latestCommit.url" target="_blank" rel="noopener noreferrer">
          {{ latestCommitRevLabel }}
        </a>
        )
      </span>
      <span v-if="historyInfo?.historyUrl" class="history-link">
        ·
        <a :href="historyInfo.historyUrl" target="_blank" rel="noopener noreferrer">history</a>
      </span>
    </p>
  </div>
</template>
