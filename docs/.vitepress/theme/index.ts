import DefaultTheme from 'vitepress/theme'
import LatestPosts from './components/LatestPosts.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('LatestPosts', LatestPosts)
  }
}
