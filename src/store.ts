import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface LocalComment {
  id: string
  author: string
  body: string
  createdAt: string
}

interface CollectionState {
  savedArticleIds: number[]
  commentsByArticle: Record<number, LocalComment[]>
  toggleSaved: (id: number) => void
  isSaved: (id: number) => boolean
  addComment: (articleId: number, body: string) => void
}

export const useCollectionStore = create<CollectionState>()(persist((set, get) => ({
  savedArticleIds: [],
  commentsByArticle: {},
  toggleSaved: (id) => set((state) => ({
    savedArticleIds: state.savedArticleIds.includes(id)
      ? state.savedArticleIds.filter((savedId) => savedId !== id)
      : [...state.savedArticleIds, id],
  })),
  isSaved: (id) => get().savedArticleIds.includes(id),
  addComment: (articleId, body) => {
    const text = body.trim()
    if (!text) return
    const comment: LocalComment = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      author: 'You',
      body: text,
      createdAt: new Date().toISOString(),
    }
    set((state) => ({
      commentsByArticle: {
        ...state.commentsByArticle,
        [articleId]: [...(state.commentsByArticle[articleId] ?? []), comment],
      },
    }))
  },
}), { name: 'applepie-collection' }))
