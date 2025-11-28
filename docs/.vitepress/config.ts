import { defineConfig } from 'vitepress'
import { generateFeed } from './rss'
import { getAllPosts, getRecentPosts } from './posts'
import { createHighlighter } from 'shiki'
import type { LinkToCardPluginOptions, UrlMetadata } from 'vitepress-linkcard'
import { faviconLinkPlugin } from './plugins/faviconLinks'
import fg from 'fast-glob'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'

const siteUrl = 'https://zonuexe.github.io'
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
const publicDir = path.join(docsDir, 'public')
const slidesSitemapUrl = `${siteUrl}/slides/sitemap.xml`
const pagesSitemapFile = 'sitemap-pages.xml'

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

async function generateSitemapIndex(outDir: string) {
  const generatedSitemapPath = path.join(outDir, 'sitemap.xml')
  const exists = await fs.stat(generatedSitemapPath).catch(() => null)
  if (!exists) return

  const pagesSitemapPath = path.join(outDir, pagesSitemapFile)
  await fs.rename(generatedSitemapPath, pagesSitemapPath)

  const lastmod = new Date().toISOString()
  const indexPath = path.join(outDir, 'sitemap.xml')
  const indexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${siteUrl}/${pagesSitemapFile}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${slidesSitemapUrl}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
</sitemapindex>
`
  await fs.mkdir(publicDir, { recursive: true })
  await Promise.all([
    fs.writeFile(indexPath, indexXml, 'utf-8'),
    fs.writeFile(path.join(publicDir, 'sitemap.xml'), indexXml, 'utf-8'),
    fs.copyFile(pagesSitemapPath, path.join(publicDir, pagesSitemapFile))
  ])
}

export default defineConfig(async () => {
  const { linkToCardPlugin } = await import('vitepress-linkcard')
  const recentPosts = await getRecentPosts(10)
  const postDateMap = new Map((await getAllPosts()).map((post) => [post.url, post.date]))
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
    lastUpdated: true,
    sitemap: {
      hostname: siteUrl,
      transformItems: (items) =>
        items.map((item) => {
          const postDate = postDateMap.get(item.url)
          if (!postDate || item.lastmod) return item
          return { ...item, lastmod: new Date(postDate).toISOString() }
        })
    },
    head: [
      ['meta', { name: 'theme-color', content: '#2c49ff' }],
      ['meta', { name: 'description', content: '出た！ たっどさんがおくる、ゆかいブログ。すごーく おもしろいんだ！ すごーく ゆかいなんだ！' }],
      ['link', { rel: 'author', href: 'https://www.hatena.ne.jp/zonu_exe' }]
    ],
    buildEnd: async (siteConfig) => {
      await generateFeed(siteConfig.outDir)
      await generateSitemapIndex(siteConfig.outDir)
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
                <span class="vp-linkcard-inner">
                  <span class="vp-linkcard-text">
                    <span class="vp-linkcard-title">${title}</span>
                    <span class="vp-linkcard-domain">${site}</span>
                    ${description ? `<span class="vp-linkcard-desc">${description}</span>` : ''}
                  </span>
                  ${
                    logo
                      ? `<span class="vp-linkcard-media"><img src="${escapeHtml(logo)}" alt="" loading="lazy"></span>`
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
