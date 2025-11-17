import type { MarkdownEnv } from 'vitepress'
import type { PluginSimple } from 'markdown-it'
import Token from 'markdown-it/lib/token.mjs'

interface Options {
  include?: (env: MarkdownEnv) => boolean
}

export const faviconLinkPlugin: PluginSimple = (md, options: Options = {}) => {
  const defaultRender =
    md.renderer.rules.link_open ??
    ((tokens, idx, _options, _env, self) => self.renderToken(tokens, idx, _options))

  md.renderer.rules.link_open = (tokens, idx, ruleOptions, env, self) => {
    const token = tokens[idx]
    const href = token?.attrs?.find(([name]) => name === 'href')?.[1] ?? ''
    const shouldInclude = options.include ? options.include(env as MarkdownEnv) : true
    if (shouldInclude && isExternalLink(href)) {
      const hostname = extractHostname(href)
      if (hostname) {
        const iconToken = new Token('html_inline', '', 0)
        iconToken.content = `<img class="link-favicon" src="https://www.google.com/s2/favicons?domain=${hostname}" alt="" loading="lazy" width="16" height="16">`
        tokens.splice(idx + 1, 0, iconToken)
      }
    }

    return defaultRender(tokens, idx, ruleOptions, env, self)
  }
}

function isExternalLink(href: string) {
  return /^https?:\/\//i.test(href)
}

function extractHostname(href: string) {
  try {
    const url = new URL(href)
    return url.hostname
  } catch {
    return ''
  }
}
