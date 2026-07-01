import MarkdownIt from 'markdown-it'

export function useMarkdown() {
  const md = new MarkdownIt({ html: true, linkify: true, breaks: true })

  function render(text: string): string {
    return md.render(text || '')
  }

  function cleanTitle(title: string): string {
    return title.replace(/^\d+\.\s*/, '')
  }

  return { render, cleanTitle }
}
