---
title: ブログアーカイブ
sidebar: true
outline: [2,3]
---

<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

const { params } = useData()
const year = computed(() => Number(params.value?.year))
</script>

# Blog Archive

<YearPosts v-if="Number.isInteger(year)" :year="year" />
<p v-else class="blog-meta">年指定が正しくありません。</p>
