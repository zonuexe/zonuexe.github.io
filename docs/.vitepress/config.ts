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
const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': `${siteUrl}/#person`,
  name: 'USAMI Kenta',
  alternateName: 'tadsan',
  url: `${siteUrl}/`,
  image: `${siteUrl}/zonuexe.png`,
  jobTitle: 'Web Programmer',
  worksFor: {
    '@type': 'Organization',
    name: 'pixiv Inc.'
  },
  homeLocation: {
    '@type': 'Place',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Tokyo',
      addressCountry: 'JP'
    }
  },
  sameAs: [
    'https://twitter.com/zonuexe',
    'https://github.com/zonuexe',
    'https://www.hatena.ne.jp/zonu_exe'
  ]
}
const blogJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  '@id': `${siteUrl}/blog/#blog`,
  name: 'tadsan&! blog',
  description: 'tadsanのブログ更新情報',
  url: `${siteUrl}/blog/`,
  inLanguage: 'ja',
  author: { '@id': personJsonLd['@id'] },
  publisher: { '@id': personJsonLd['@id'] }
}

const toRoutePath = (page: string, cleanUrls: boolean) => {
  let route = page.replace(/(^|\/)index\.md$/, '$1')
  route = route.replace(/\.md$/, cleanUrls ? '' : '.html')
  return route.startsWith('/') ? route : `/${route}`
}

const toIsoString = (value: unknown) => {
  if (!value) return undefined
  const date = typeof value === 'number' ? new Date(value) : new Date(String(value))
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

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
  const allPosts = await getAllPosts()
  const postDateMap = new Map(allPosts.map((post) => [post.url, post.date]))
  const yearsAsc = Array.from(
    new Set(
      allPosts
        .map((post) => {
          const d = new Date(post.date)
          return Number.isNaN(d.getTime()) ? undefined : d.getFullYear()
        })
        .filter((year): year is number => typeof year === 'number')
    )
  ).sort((a, b) => a - b)
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
    transformPageData: (pageData) => {
      const yearParam = Number(pageData.params?.year)
      const isYearArchive =
        Number.isInteger(yearParam) &&
        typeof pageData.relativePath === 'string' &&
        pageData.relativePath.startsWith('blog/posts/')
      if (!isYearArchive) return

      if (!yearsAsc.includes(yearParam)) {
        pageData.prev = null
        pageData.next = null
        return
      }

      const idx = yearsAsc.indexOf(yearParam)
      const older = idx > 0 ? yearsAsc[idx - 1] : undefined
      const newer = idx < yearsAsc.length - 1 ? yearsAsc[idx + 1] : undefined
      pageData.prev = older ? { text: `${older}年のアーカイブ`, link: `/blog/posts/${older}/` } : null
      pageData.next = newer ? { text: `${newer}年のアーカイブ`, link: `/blog/posts/${newer}/` } : null
    },
    transformHead: ({ page, siteConfig, pageData }) => {
      const route = toRoutePath(page, Boolean(siteConfig.cleanUrls))
      const head: [string, Record<string, string>, string?][] = []

      if (route === '/blog/') {
        head.push(['script', { type: 'application/ld+json' }, JSON.stringify(blogJsonLd)])
      }

      if (route.startsWith('/blog/posts/')) {
        const frontmatter = pageData?.frontmatter ?? {}
        const published = frontmatter.date ?? pageData?.lastUpdated
        const modified = pageData?.lastUpdated ?? frontmatter.date
        const keywords = Array.isArray(frontmatter.tags) ? frontmatter.tags : undefined
        const canonical = `${siteUrl}${route}`
        const blogPosting = {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          '@id': `${canonical}#post`,
          mainEntityOfPage: canonical,
          headline: pageData?.title ?? frontmatter.title ?? '',
          description: frontmatter.description ?? pageData?.description ?? '',
          url: canonical,
          inLanguage: 'ja',
          datePublished: toIsoString(published),
          dateModified: toIsoString(modified),
          author: { '@id': personJsonLd['@id'] },
          publisher: { '@id': personJsonLd['@id'] },
          keywords
        }
        head.push(['script', { type: 'application/ld+json' }, JSON.stringify(blogPosting)])
      }

      return head
    },
    head: [
      ['meta', { name: 'theme-color', content: '#2c49ff' }],
      ['meta', { name: 'description', content: '出た！ たっどさんがおくる、ゆかいブログ。すごーく おもしろいんだ！ すごーく ゆかいなんだ！' }],
      ['link', { rel: 'author', href: 'https://www.hatena.ne.jp/zonu_exe' }],
      ['script', { type: 'application/ld+json' }, JSON.stringify(personJsonLd)]
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
