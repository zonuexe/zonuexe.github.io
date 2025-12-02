<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useData } from 'vitepress'

const { page } = useData()

const loadTwitter = () => {
  if (typeof window === 'undefined') return
  const hasScript = document.querySelector('script[src="https://platform.twitter.com/widgets.js"]')
  if (!hasScript) {
    const script = document.createElement('script')
    script.async = true
    script.src = 'https://platform.twitter.com/widgets.js'
    script.charset = 'utf-8'
    document.head.appendChild(script)
  } else if (window.twttr?.widgets?.load) {
    window.twttr.widgets.load()
  }
}

onMounted(() => {
  loadTwitter()
  watch(
    () => page.value.relativePath,
    () => {
      loadTwitter()
    }
  )
})
</script>
