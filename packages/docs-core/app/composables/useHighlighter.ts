import { createHighlighter, type Highlighter } from 'shiki'

let highlighter: Highlighter | null = null

export async function useHighlighter(): Promise<Highlighter> {
  if (!highlighter) {
    highlighter = await createHighlighter({
      themes: ['tokyo-night', 'github-light'],
      langs: [
        'bash',
        'shell',
        'json',
        'javascript',
        'typescript',
        'python',
        'php',
        'go',
        'ruby',
        'html',
        'css',
        'markdown',
      ],
    })
  }
  return highlighter
}
