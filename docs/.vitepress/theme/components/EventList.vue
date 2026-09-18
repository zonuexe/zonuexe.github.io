<script setup lang="ts">
import type { ScheduleItem } from '../../event-utils'

const props = defineProps<{
  events: ScheduleItem[]
}>()

const fullFormatter = new Intl.DateTimeFormat('ja-JP', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})

const dayFormatter = new Intl.DateTimeFormat('ja-JP', { day: 'numeric' })

const formatFullDate = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : fullFormatter.format(date)
}

const formatEndDate = (start: string, end: string) => {
  const startDate = new Date(start)
  const endDate = new Date(end)
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return end
  }
  if (
    startDate.getFullYear() === endDate.getFullYear() &&
    startDate.getMonth() === endDate.getMonth()
  ) {
    return dayFormatter.format(endDate)
  }
  return fullFormatter.format(endDate)
}

const toISODate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toISOString().split('T')[0]
}

const roleLabel = (roles: string[] = []) => roles.join(' / ')
const hasRoles = (roles?: string[]) => Boolean(roles && roles.length > 0)
const tokyoDay = (value: Date) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo' }).format(value)

const isPastEvent = (dates: string[]) => {
  if (!dates.length) return false
  const lastDate = dates[dates.length - 1]
  const parsed = new Date(lastDate)
  if (Number.isNaN(parsed.getTime())) return false
  return tokyoDay(parsed) < tokyoDay(new Date())
}
const heldPhrase = (dates: string[]) =>
  isPastEvent(dates) ? 'で開催された' : 'で開催される'
const participationVerb = (dates: string[]) =>
  isPastEvent(dates) ? '参加しました' : '参加します'
</script>

<template>
  <ol class="event-list">
    <li v-for="event in props.events" :key="`${event.name}-${event.url}`" class="h-event" itemscope itemtype="https://schema.org/Event">
      <p class="event-copy">
        <time class="dt-start" itemprop="startDate" :datetime="toISODate(event.dates[0])">
          {{ formatFullDate(event.dates[0]) }}
        </time><!--
     --><template v-if="event.dates.length > 1">から<!--
       --><time
            class="dt-end"
            itemprop="endDate"
            :datetime="toISODate(event.dates[event.dates.length - 1])"
          >
            {{ formatEndDate(event.dates[0], event.dates[event.dates.length - 1]) }}
          </time><!--
     -->に</template><!--
     --><template v-else>に</template><!--
     --><span class="p-location h-adr" itemprop="location" itemscope itemtype="https://schema.org/Place"><!--
          --><span class="p-locality" itemprop="address">{{ event.location }}</span><!--
          -->{{ event.place ? 'の' : '' }}<!--
          --><span v-if="event.place" class="p-name" itemprop="name">{{ event.place }}</span><!--
        --></span><!--
     -->{{ heldPhrase(event.dates) }}<!--
     --><a
          class="u-url p-name"
          itemprop="url"
          rel="noopener noreferrer"
          target="_blank"
          :href="event.url"
        >
          {{ event.name }}
        </a><!--
     -->に<!--
     --><template v-if="hasRoles(event.roles)"><!--
       --><span class="p-role" itemprop="performer">
            {{ roleLabel(event.roles) }}として<!--
          --></span><!--
    --></template><!--
     --><template v-if="event.correction"><!--
       --><del>{{ participationVerb(event.dates) }}</del> <ins>{{ event.correction }}</ins>。<!--
     --></template><!--
     --><template v-else><!--
       -->{{ participationVerb(event.dates) }}。<!--
     --></template><!--
     --><span v-if="event.hashtags?.length" class="event-tags">
          <a
            v-for="tag in event.hashtags"
            :key="tag"
            class="hashtag"
            rel="noopener noreferrer"
            target="_blank"
            :href="`https://twitter.com/hashtag/${tag}`"
          >
            #{{ tag }}
          </a>
        </span>
      </p>
    </li>
  </ol>
</template>
