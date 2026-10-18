export interface DevArticle {
  id: number
  title: string
  description: string
  url: string
  published_at: string
  reading_time_minutes: number
  comments_count: number
  public_reactions_count: number
  tag_list: string[]
  cover_image: string | null
  social_image: string
  user: { name: string; username: string; profile_image: string }
  body_markdown?: string
  body_html?: string
}

export type Topic = 'AI' | 'React' | 'JavaScript' | 'Web Development' | 'Python'
