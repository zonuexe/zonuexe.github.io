import { defineConfig } from 'vitepress'
import { generateFeed } from './rss'

export default defineConfig({
  title: 'tadsan',
  description: 'zonuexeのプロフィールとブログ。スライドやブログのアーカイブをまとめています。',
  lang: 'ja-JP',
  srcDir: '.',
  base: '/',
  cleanUrls: true,
  appearance: 'auto',
  head: [
    ['meta', { name: 'theme-color', content: '#2c49ff' }],
    ['meta', { name: 'description', content: 'zonuexeのプロフィール、ブログ、スライドをまとめたサイト。' }]
  ],
  buildEnd: async (siteConfig) => {
    await generateFeed(siteConfig.outDir)
  },
  themeConfig: {
    logo: '/zonuexe.png',
    nav: [
      { text: 'ホーム', link: '/' },
      { text: 'ブログ', link: '/blog/' },
      { text: 'スライド', link: 'https://zonuexe.github.io/slides/' }
    ],
    search: { provider: 'local' },
    sidebar: {
      '/blog/': [
        {
          text: '最新の投稿',
          items: [
            { text: 'コミュニティメンタリングのメモ（2025）', link: '/blog/posts/2025-community-mentoring' },
            { text: 'スライドの裏側: zonuexe.slides の構成', link: '/blog/posts/2024-slide-architecture' }
          ]
        }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/zonuexe' },
      { icon: 'x', link: 'https://x.com/zonuexe' }
    ],
    footer: {
      message: 'すべての文章は特記がない限り zonuexe によるものです。',
      copyright: `\u00a9 ${new Date().getFullYear()} zonuexe`
    }
  }
})
