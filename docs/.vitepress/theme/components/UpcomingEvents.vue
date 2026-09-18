<script setup lang="ts">
import { computed } from 'vue'
import { data as allEvents } from '../../data/schedule.data'
import { yearsFromEvents } from '../../event-utils'
import EventList from './EventList.vue'

const events = computed(() => allEvents.slice(0, 10))
const years = computed(() => yearsFromEvents(allEvents))
</script>

<template>
  <section class="profile-panel">
    <h2 id="events">Schedule</h2>
    <p v-if="years.length" class="blog-meta event-year-nav">
      年別一覧:
      <a v-for="year in years" :key="year" :href="`/events/${year}/`">{{ year }}年</a>
    </p>
    <EventList :events="events" />
  </section>
</template>
