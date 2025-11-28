import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import LatestPosts from './components/LatestPosts.vue'
import UpcomingEvents from './components/UpcomingEvents.vue'
import PostMeta from './components/PostMeta.vue'
import PostNavigation from './components/PostNavigation.vue'
import BlogIndex from './components/BlogIndex.vue'
import YearPosts from './components/YearPosts.vue'
import { data as posts } from '../data/latestPosts.data'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'doc-before': () => h(PostMeta),
      'doc-bottom': () => h(PostNavigation, { posts })
    })
  },
  enhanceApp({ app }) {
    app.component('LatestPosts', LatestPosts)
    app.component('UpcomingEvents', UpcomingEvents)
    app.component('BlogIndex', BlogIndex)
    app.component('YearPosts', YearPosts)
  }
}
