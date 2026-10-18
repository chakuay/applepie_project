import type { DevArticle } from './types'

const API = 'https://dev.to/api'
type DevArticleResponse = Omit<DevArticle, 'tag_list'> & { tag_list: string[] | string }

function normalizeArticle(article: DevArticleResponse): DevArticle {
  const tags = typeof article.tag_list === 'string'
    ? article.tag_list.split(',').map((tag) => tag.trim()).filter(Boolean)
    : article.tag_list
  return { ...article, tag_list: tags }
}

async function request<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error(`DEV.to API returned ${response.status}. Please try again.`)
  return response.json() as Promise<T>
}

export function getArticles(): Promise<DevArticle[]> {
  const tags = ['ai', 'react', 'javascript', 'webdev', 'python']
  return Promise.all(tags.map((tag) => getArticlesByTag(tag)))
    .then((feeds) => [...new Map(feeds.flat().map((article) => [article.id, normalizeArticle(article)])).values()]
      .sort((a, b) => Date.parse(b.published_at) - Date.parse(a.published_at))
      .slice(0, 30))
}

export function getArticlesByTag(tag: string): Promise<DevArticle[]> {
  const params = new URLSearchParams({ per_page: '30', tag })
  return request<DevArticleResponse[]>(`${API}/articles?${params.toString()}`).then((articles) => articles.map(normalizeArticle))
}

export function getArticle(id: string): Promise<DevArticle> {
  return request<DevArticleResponse>(`${API}/articles/${encodeURIComponent(id)}`).then(normalizeArticle)
}
