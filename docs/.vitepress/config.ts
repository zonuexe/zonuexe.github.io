import { defineConfig } from 'vitepress'
import { generateFeed } from './rss'
import { getRecentPosts } from './posts'
import { createHighlighter } from 'shiki'
import type { LinkToCardPluginOptions } from 'vitepress-linkcard'
import { faviconLinkPlugin } from './plugins/faviconLinks'

export default defineConfig(async () => {
  const { linkToCardPlugin } = await import('vitepress-linkcard')
  const recentPosts = await getRecentPosts(10)
  const shikiHighlighter = await createHighlighter({
    themes: ['github-dark', 'github-light'],
      langs: [
          'ts', 'js', 'bash', 'json', 'yaml', 'markdown', 'vue', 'css', 'html', 'vim',
          'php', 'lisp', 'emacs-lisp', 'scheme', 'fsharp', 'haskell', 'c', 'cpp', 'xsl',
          'rust', 'go', 'python', 'ruby', 'perl', 'awk', 'clojure', 'mermaid', 'typescript',
      ]
  })

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
      ['meta', { name: 'description', content: '出た！ たっどさんがおくる、ゆかいブログ。すごーく おもしろいんだ！ すごーく ゆかいなんだ！' }],
      ['link', { rel: 'author', href: 'https://www.hatena.ne.jp/zonu_exe' }]
    ],
    buildEnd: async (siteConfig) => {
      await generateFeed(siteConfig.outDir)
    },
    markdown: {
      theme: {
        light: 'github-light',
        dark: 'github-dark'
      },
      highlight: (code, lang) => {
        const cleanLang = (lang || 'text').split(/\s+/)[0]
        const available = shikiHighlighter.getLoadedLanguages()
        const safeLang = available.includes(cleanLang as any) ? cleanLang : 'text'
        return shikiHighlighter.codeToHtml(code, {
          lang: safeLang as any,
          themes: {
            light: 'github-light',
            dark: 'github-dark'
          }
        })
      },
      config: (md) => {
        md.use<LinkToCardPluginOptions>(linkToCardPlugin, {
          target: '_blank',
          borderColor: '#90a4ff',
          bgColor: '#ffffff'
        })
        md.use(faviconLinkPlugin, {
          include: (env) => typeof env.relativePath === 'string' && env.relativePath.startsWith('blog/')
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
