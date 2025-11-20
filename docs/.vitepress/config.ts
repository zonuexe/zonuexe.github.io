import { defineConfig } from 'vitepress'
import { generateFeed } from './rss'
import { getRecentPosts } from './posts'
import { createHighlighter } from 'shiki'
import type { LinkToCardPluginOptions, UrlMetadata } from 'vitepress-linkcard'
import { faviconLinkPlugin } from './plugins/faviconLinks'
import fg from 'fast-glob'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const getHostname = (href: string) => {
  try {
    const { hostname } = new URL(href)
    return escapeHtml(hostname)
  } catch {
    return escapeHtml(href)
  }
}

const repoBase = 'https://github.com/zonuexe/zonuexe.github.io'
const docsDir = path.resolve(process.cwd(), 'docs')
const gitHistoryPath = path.resolve(docsDir, '.vitepress/data/git-history.json')

async function generateGitHistory() {
  const files = await fg('blog/**/*.md', { cwd: docsDir })
  const histories: Record<
    string,
    { historyUrl: string; commits: { hash: string; date: string; rev: number; url: string }[] }
  > = {}

  for (const file of files) {
    const abs = path.join(docsDir, file)
    let log = ''
    try {
      log = execFileSync(
        'git',
        ['log', '--follow', '--pretty=format:%H|%cI', '--', abs],
        {
          cwd: process.cwd(),
          stdio: ['ignore', 'pipe', 'ignore']
        }
      )
        .toString()
        .trim()
    } catch {
      continue
    }
    if (!log) continue
    const commits = log
      .split('\n')
      .filter(Boolean)
      .reverse()
      .map((line, idx) => {
        const [hash, date] = line.split('|')
        return {
          hash,
          date,
          rev: idx + 1,
          url: `${repoBase}/commit/${hash}`
        }
      })
    histories[file.replace(/\\/g, '/')] = {
      historyUrl: `${repoBase}/commits/master/docs/${file}`,
      commits
    }
  }
  await fs.mkdir(path.dirname(gitHistoryPath), { recursive: true })
  await fs.writeFile(gitHistoryPath, JSON.stringify(histories, null, 2))
}

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

  await generateGitHistory()

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
          classPrefix: 'vp-linkcard',
          render: (metadata: UrlMetadata, options) => {
            const title = escapeHtml(metadata.title || options.linkTitle)
            const description = metadata.description ? escapeHtml(metadata.description) : ''
            const site = getHostname(options.href)
            const logo = typeof metadata.logo === 'string' ? metadata.logo : ''

            return `
              <a class="vp-linkcard" href="${escapeHtml(options.href)}" target="${options.target}" rel="noopener noreferrer">
                <span class="vp-linkcard__inner">
                  <span class="vp-linkcard__text">
                    <span class="vp-linkcard__site">${site}</span>
                    <span class="vp-linkcard__title">${title}</span>
                    ${description ? `<span class="vp-linkcard__desc">${description}</span>` : ''}
                  </span>
                  ${
                    logo
                      ? `<span class="vp-linkcard__media"><img src="${escapeHtml(logo)}" alt="" loading="lazy"></span>`
                      : ''
                  }
                </span>
              </a>
            `
          }
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
