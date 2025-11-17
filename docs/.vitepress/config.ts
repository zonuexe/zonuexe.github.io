import { defineConfig } from 'vitepress'
import { generateFeed } from './rss'
import { getRecentPosts } from './posts'

export default defineConfig(async () => {
  const recentPosts = await getRecentPosts(10)

  return {
    title: 'tadsan&!',
    description: ' ヾ(〃＞＜)ﾉﾞ',
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
    markdown: {
      config: (md) => {
        md.use<LinkToCardPluginOptions>(linkToCardPlugin, {
          target: '_blank',
          borderColor: '#90a4ff',
          bgColor: '#ffffff'
        })
      }
    },
    themeConfig: {
      logo: '/zonuexe.png',
      nav: [
        { text: 'Home', link: '/' },
        { text: 'Blog', link: '/blog/' },
        { text: 'Slides', link: 'https://zonuexe.github.io/slides/' }
      ],
      search: { provider: 'local' },
      sidebar: {
        '/blog/': [
          {
            text: 'Latest posts',
            items: recentPosts.map((post) => ({
              text: post.title,
              link: post.url
            }))
          }
        ]
      },
      socialLinks: [
        { icon: 'github', link: 'https://github.com/zonuexe' },
        { icon: 'twitter', link: 'https://twitter.com/zonuexe' }
      ],
      footer: {
        message: 'すべての文章は特記がない限り zonuexe によるものです。',
        copyright: `\u00a9 ${new Date().getFullYear()} zonuexe`
      }
    }
  }
})
