<script setup lang="ts">
import { computed } from 'vue'
import { data as allEvents } from '../../data/schedule.data'
import { eventsInYear, yearsFromEvents } from '../../event-utils'

const groups = computed(() =>
  yearsFromEvents(allEvents).map((year) => ({
    year,
    count: eventsInYear(allEvents, year).length
  }))
)
</script>

<template>
  <div class="page-container">
    <section class="profile-panel blog-archive">
      <div class="blog-archive-header">
        <h1>イベント</h1>
        <p class="blog-meta">参加した・参加予定のイベントを年別にまとめました。</p>
      </div>
      <div v-if="groups.length" class="blog-archive-years">
        <a
          v-for="group in groups"
          :key="group.year"
          class="blog-archive-year-card"
          :href="`/events/${group.year}/`"
        >
          <div class="blog-archive-year-label">{{ group.year }}</div>
          <p class="blog-meta">{{ group.count }}件</p>
        </a>
      </div>
      <p v-else class="blog-meta">イベントは準備中です。</p>
    </section>
  </div>
</template>
