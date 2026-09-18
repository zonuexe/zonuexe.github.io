<script setup lang="ts">
import { computed } from 'vue'
import { data as allEvents } from '../../data/schedule.data'
import { eventsInYear, yearsFromEvents } from '../../event-utils'
import EventList from './EventList.vue'

const props = defineProps<{
  year: number
}>()

const years = computed(() => yearsFromEvents(allEvents))
const items = computed(() => eventsInYear(allEvents, props.year))
const yearIndex = computed(() => years.value.indexOf(props.year))
const newerYear = computed(() => (yearIndex.value > 0 ? years.value[yearIndex.value - 1] : undefined))
const olderYear = computed(() =>
  yearIndex.value >= 0 && yearIndex.value < years.value.length - 1
    ? years.value[yearIndex.value + 1]
    : undefined
)
</script>

<template>
  <div class="page-container">
    <section class="profile-panel">
      <h1>{{ year }}年のイベント</h1>
      <p class="blog-meta">参加した・参加予定のイベントです。</p>
      <p class="blog-meta event-year-nav">
        <a href="/events/">年別一覧</a>
        <a v-if="newerYear" :href="`/events/${newerYear}/`">{{ newerYear }}年</a>
        <a v-if="olderYear" :href="`/events/${olderYear}/`">{{ olderYear }}年</a>
      </p>
    </section>

    <section v-if="items.length" class="profile-panel">
      <EventList :events="items" />
    </section>
    <section v-else class="profile-panel">
      <p class="blog-meta">{{ year }}年の参加イベントはありません。</p>
    </section>
  </div>
</template>
