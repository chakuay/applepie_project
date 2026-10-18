import { useState } from 'react'
import { createBrowserRouter, Link, NavLink, Outlet, RouterProvider, useOutletContext, useParams } from 'react-router-dom'
import { useQueries, useQuery } from '@tanstack/react-query'
import DOMPurify from 'dompurify'
import type { FormEvent, ReactNode } from 'react'
import { getArticle, getArticles, getArticlesByTag } from './api'
import type { DevArticle, Topic } from './types'
import { useCollectionStore } from './store'

const topics: Topic[] = ['AI', 'React', 'JavaScript', 'Web Development', 'Python']
const topicTags: Record<Topic, string[]> = {
  AI: ['ai', 'machinelearning', 'llm'], React: ['react'], JavaScript: ['javascript'],
  'Web Development': ['webdev'], Python: ['python'],
}
const noComments: never[] = []
const dateLabel = (value: string) => new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value))
const initials = (name: string) => name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()

function AppLayout() {
  const [search, setSearch] = useState('')
  return <div className="app-shell">
    <header className="topbar">
      <Link className="brand" to="/"><span className="brand-mark"/><span>Applepie</span></Link>
      <nav className="main-nav" aria-label="Main navigation">
        <NavLink end to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Home</NavLink>
        <NavLink to="/collection" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>My Collection</NavLink>
        <NavLink to="/topics" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Topics</NavLink>
        <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>About</NavLink>
      </nav>
      <label className="search-box"><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search the community" aria-label="Search the community"/></label>
    </header>
    <main className="main-area"><Outlet context={{ search }}/></main>
  </div>
}

function ArticleQuery({ children }: { children: (articles: DevArticle[]) => ReactNode }) {
  const query = useQuery({ queryKey: ['articles'], queryFn: getArticles, staleTime: 5 * 60 * 1000 })
  if (query.isLoading) return <LoadingState/>
  if (query.isError) return <ErrorState message={query.error.message} retry={() => void query.refetch()}/>
  return <>{children(query.data ?? [])}</>
}

function HomePage() {
  const { search } = useOutletContext<{ search: string }>()
  const [topic, setTopic] = useState<Topic | 'All topics'>('All topics')
  const [sort, setSort] = useState<'Latest' | 'Popular'>('Latest')
  return <div className="content-wrap home-wrap">
    <section className="welcome-hero"><div className="hero-copy"><span className="eyebrow orange">A LITTLE CURIOSITY GOES A LONG WAY</span><h1>Good questions.<br/>Better together.</h1><p>A welcoming space to explore AI and programming ideas from developers around the world.</p><div className="promise"><span>✦</span>Built for learners. Open to everyone.</div></div><div className="hero-art" aria-hidden="true"><span className="sparkle">✦</span><span className="question-bubble">?</span><div className="notebook"><div className="window-dots"><i/><i/><i/></div><code>&lt;Hello, community /&gt;</code><b/><b/></div><span className="sprout-badge">✿</span></div></section>
    <ArticleQuery>{(articles) => {
      const filtered = filterArticles(articles, search, topic)
      const visible = sort === 'Popular' ? [...filtered].sort((a, b) => b.public_reactions_count - a.public_reactions_count) : filtered
      return <div className="home-columns"><section className="feed-column"><div className="section-heading"><h2>Community feed</h2><div className="segmented"><button className={sort === 'Latest' ? 'selected' : ''} onClick={() => setSort('Latest')}>Latest</button><button className={sort === 'Popular' ? 'selected' : ''} onClick={() => setSort('Popular')}>Popular</button></div></div><div className="topic-row"><button className={`chip ${topic === 'All topics' ? 'chosen' : ''}`} onClick={() => setTopic('All topics')}>All topics</button>{topics.map((item) => <button key={item} className={`chip ${topic === item ? 'chosen' : ''}`} onClick={() => setTopic(item)}>{item}</button>)}</div><div className="post-list">{visible.map((article) => <PostCard key={article.id} article={article}/>)}</div>{visible.length ? <p className="sample-note">Showing {visible.length} posts · Loaded from DEV Community</p> : <EmptyState title="No posts found" text="Try another search or topic."/>}</section><aside className="home-sidebar"><section className="side-card welcome-card"><span className="side-icon">✦</span><h3>Find your next idea.</h3><p>Explore real articles, questions, and developer experiences shared by the community.</p><Link className="button primary full" to="/topics">Explore topics</Link></section><section className="side-card guidelines"><h3>Explore by interest</h3>{topics.slice(0, 4).map((item) => <Link className="guideline" key={item} to="/topics"><span>↗</span>{item}</Link>)}</section><p className="sample-note">Source: <a href="https://developers.forem.com/api" target="_blank" rel="noreferrer">Forem API</a></p></aside></div>
    }}</ArticleQuery>
  </div>
}

function filterArticles(articles: DevArticle[], search: string, topic: Topic | 'All topics') {
  const term = search.trim().toLowerCase()
  return articles.filter((article) => {
    const matchesSearch = !term || `${article.title} ${article.description} ${article.tag_list.join(' ')} ${article.user.name}`.toLowerCase().includes(term)
    const tags = article.tag_list.map((tag) => tag.toLowerCase())
    const matchesTopic = topic === 'All topics' || topicTags[topic].some((tag) => tags.includes(tag))
    return matchesSearch && matchesTopic
  })
}

function PostCard({ article }: { article: DevArticle }) {
  const saved = useCollectionStore((state) => state.savedArticleIds.includes(article.id))
  const toggleSaved = useCollectionStore((state) => state.toggleSaved)
  return <article className="post-card"><Link className="post-open" to={`/posts/${article.id}`}><div className="post-labels"><span className="type-pill share">Article</span><span className="chip mini">{article.tag_list[0] ?? 'Development'}</span></div><h3>{article.title}</h3><p className="post-excerpt">{article.description || 'Open this article to explore the full post on DEV Community.'}</p></Link><button className={`card-bookmark ${saved ? 'saved' : ''}`} onClick={() => toggleSaved(article.id)} aria-label={saved ? 'Remove from collection' : 'Save post'} aria-pressed={saved}><span>{saved ? '✓' : '♧'}</span></button><div className="post-meta"><img className="avatar-img" src={article.user.profile_image} alt=""/><span className="author-name">{article.user.name}</span><span className="post-date">{dateLabel(article.published_at)}</span><span className="comment-count">♡ {article.public_reactions_count}</span></div></article>
}

function DetailPage() {
  const { id } = useParams()
  const [commentDraft, setCommentDraft] = useState('')
  const query = useQuery({ queryKey: ['article', id], queryFn: () => getArticle(id ?? ''), enabled: Boolean(id), staleTime: 10 * 60 * 1000 })
  const saved = useCollectionStore((state) => query.data ? state.savedArticleIds.includes(query.data.id) : false)
  const toggleSaved = useCollectionStore((state) => state.toggleSaved)
  const comments = useCollectionStore((state) => query.data ? state.commentsByArticle[query.data.id] ?? noComments : noComments)
  const addComment = useCollectionStore((state) => state.addComment)
  if (query.isLoading) return <div className="content-wrap"><LoadingState/></div>
  if (query.isError || !query.data) return <div className="content-wrap"><ErrorState message={query.error?.message ?? 'Article not found'} retry={() => void query.refetch()}/></div>
  const article = query.data
  const submitComment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!commentDraft.trim()) return
    addComment(article.id, commentDraft)
    setCommentDraft('')
  }

  return <div className="content-wrap detail-wrap"><Link className="text-button back-button" to="/">← Back to feed</Link><div className="detail-columns"><div className="detail-main"><article className="detail-card"><div className="post-labels"><span className="type-pill share">DEV Community article</span><span className="chip mini">{article.tag_list[0] ?? 'Development'}</span></div><h1>{article.title}</h1><div className="detail-author"><img className="avatar-img" src={article.user.profile_image} alt=""/><span><b>{article.user.name}</b><small>{dateLabel(article.published_at)} · {article.reading_time_minutes} min read</small></span><button className={`button outline save-button ${saved ? 'is-saved' : ''}`} onClick={() => toggleSaved(article.id)} aria-pressed={saved}><span>{saved ? '✓' : '♧'}</span>{saved ? 'Saved' : 'Save Post'}</button></div><div className="tag-row">{article.tag_list.map((tag) => <span key={tag} className="chip mini">{tag}</span>)}</div>{saved && <div className="saved-confirmation">✓ Saved to My Collection. Keep this article handy for later.</div>}<div className="post-body"><p className="article-summary">{article.description}</p>{article.body_html ? <div className="article-content" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.body_html) }}/> : <p>The full article content is not available from the API for this post.</p>}<a className="button primary original-article-link" href={article.url} target="_blank" rel="noreferrer">Open original on DEV.to ↗</a></div></article><section className="comments-card"><h2>Discussion <span className="count-badge">{comments.length}</span></h2>{comments.length ? <div className="comment-list">{comments.map((comment) => <article className="comment" key={comment.id}><span className="avatar">Y</span><div><b>{comment.author}</b><small>{new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(comment.createdAt))}</small><p>{comment.body}</p></div></article>)}</div> : <p className="post-excerpt">No comments yet. Start the conversation.</p>}<form className="comment-form" onSubmit={submitComment}><label htmlFor="comment-draft">Add a comment</label><textarea id="comment-draft" value={commentDraft} onChange={(event) => setCommentDraft(event.target.value)} placeholder="Share your thoughts about this post…" maxLength={1000} required/><div className="form-footer"><small>{commentDraft.length}/1000 · Saved in this browser</small><button className="button primary" type="submit" disabled={!commentDraft.trim()}>Post comment</button></div></form></section></div><aside className="detail-sidebar"><section className="side-card detail-tip"><span className="round-icon">✦</span><h3>Every idea is a starting point.</h3><p>Discover more community posts tagged {article.tag_list.slice(0, 2).join(' and ') || 'development'}.</p><Link className="text-button" to="/topics">Explore topics →</Link></section><section className="side-card related-card"><span className="eyebrow orange">SOURCE</span><b>DEV Community</b><small>Public article API</small><a className="text-button" href={article.url} target="_blank" rel="noreferrer">Open original ↗</a></section></aside></div></div>
}

function CollectionPage() {
  const { search } = useOutletContext<{ search: string }>()
  const savedIds = useCollectionStore((state) => state.savedArticleIds)
  const savedQueries = useQueries({ queries: savedIds.map((id) => ({ queryKey: ['article', String(id)], queryFn: () => getArticle(String(id)), staleTime: 10 * 60 * 1000 })) })
  const saved = filterArticles(savedQueries.flatMap((query) => query.data ? [query.data] : []), search, 'All topics')
  const pending = savedQueries.some((query) => query.isLoading)
  const failed = savedQueries.some((query) => query.isError)
  return <div className="content-wrap collection-wrap"><span className="eyebrow orange">YOUR PERSONAL BOOKSHELF</span><h1>My Collection</h1><p className="page-subtitle">Keep the ideas and articles you want to return to.</p><div className="collection-columns"><div className="collection-main"><b className="saved-count">♧ {savedIds.length} saved posts</b>{pending ? <LoadingState/> : failed ? <p className="sample-note">Some saved posts could not be loaded. Please try again later.</p> : saved.length ? <div className="post-list collection-list">{saved.map((article) => <PostCard key={article.id} article={article}/>)}</div> : <EmptyState title={savedIds.length ? 'No saved posts match your search' : 'Your collection is empty'} text={savedIds.length ? 'Try another search.' : 'Open a post and choose Save Post. It will stay saved in this browser.'}/>}</div><aside className="collection-sidebar"><section className="side-card saved-tip"><span>♧</span><h3>A good idea is worth keeping.</h3><p>Your collection is saved in this browser and survives page reloads.</p></section></aside></div></div>
}

function TopicsPage() {
  const { search } = useOutletContext<{ search: string }>()
  const [topic, setTopic] = useState<Topic>('AI')
  const query = useQuery({ queryKey: ['articles', 'topic', topic], queryFn: () => getArticlesByTag(topicTags[topic][0]), staleTime: 5 * 60 * 1000 })
  const filtered = filterArticles(query.data ?? [], search, 'All topics')
  return <div className="content-wrap resources-wrap"><span className="eyebrow orange">FIND YOUR NEXT RABBIT HOLE</span><h1>Explore topics</h1><p className="page-subtitle">Browse recent community articles by the technologies you care about.</p><div className="topic-row resources-topics">{topics.map((item) => <button key={item} className={`chip ${topic === item ? 'chosen' : ''}`} onClick={() => setTopic(item)}>{item}</button>)}</div>{query.isLoading ? <LoadingState/> : query.isError ? <ErrorState message={query.error.message} retry={() => void query.refetch()}/> : <><div className="section-heading"><h2>{topic}</h2><span>{filtered.length} articles in this feed</span></div>{filtered.length ? <div className="post-list">{filtered.map((article) => <PostCard key={article.id} article={article}/>)}</div> : <EmptyState title="No recent posts for this topic" text="Choose another topic or try again later."/>}</>}</div>
}

function AboutPage() {
  return <div className="content-wrap about-wrap"><section className="about-hero"><div><span className="eyebrow orange">ABOUT APPLEPIE</span><h1>Knowledge grows when we share it.</h1><p>Applepie brings a welcoming discovery experience to AI and programming articles from the developer community.</p><span className="tag-pill">A student Mini Project</span></div><div className="hero-art about-art" aria-hidden="true"><span className="sparkle">✦</span><span className="question-bubble">?</span><div className="notebook"><div className="window-dots"><i/><i/><i/></div><code>&lt;Hello, community /&gt;</code><b/><b/></div></div></section><section className="problem-card"><div><span className="eyebrow orange">WHY WE’RE BUILDING IT</span><h2>Learning shouldn’t feel scattered.</h2></div><p>Applepie makes it easier to discover helpful explanations, browse by topic, and keep useful articles close for later.</p></section><h2 className="goals-title">Project goals</h2><div className="goal-grid"><article className="goal-card"><h3>Explore ideas</h3><p>Find developer articles about AI, React, JavaScript, Python, and web development.</p></article><article className="goal-card"><h3>Save useful posts</h3><p>Keep a personal collection that persists in this browser.</p></article><article className="goal-card"><h3>Join the discussion</h3><p>Share comments on each post in Applepie. Comments are saved in this browser.</p></article></div><h2 className="team-title">Project team</h2><p className="team-subtitle">Replace these placeholders with your team’s full names, student IDs, university, and roles before submission.</p><div className="team-grid">{[['Member 1','UI/UX & Project Lead'],['Member 2','Frontend & API Integration'],['Member 3','QA & Documentation']].map(([name, role]) => <article className="team-card" key={name}><div className="team-head"><span className="team-avatar">{initials(name)}</span><div><b>{name}</b><small>{role}</small></div></div><p>Student ID: add before submission</p></article>)}</div><section className="scope-note">Data source: <a href="https://developers.forem.com/api" target="_blank" rel="noreferrer">Forem / DEV.to Public REST API documentation</a></section><section className="scope-note">Architecture: React 19 + Vite + TypeScript · React Router v7 · TanStack Query v5 · Zustand persist · Tailwind CSS + DaisyUI</section></div>
}

function LoadingState() { return <div className="loading-state" role="status" aria-live="polite"><span className="loading loading-spinner loading-md"/><span>Loading community posts…</span></div> }
function ErrorState({ message, retry }: { message: string; retry: () => void }) { return <section className="empty-state error-state" role="alert"><span className="empty-icon">!</span><h3>We couldn’t load the community feed</h3><p>{message}</p><button className="button primary" onClick={retry}>Try again</button></section> }
function EmptyState({ title, text }: { title: string; text: string }) { return <section className="empty-state"><span className="empty-icon">⌑</span><h3>{title}</h3><p>{text}</p></section> }
const router = createBrowserRouter([{ element: <AppLayout/>, children: [
  { path: '/', element: <HomePage/> }, { path: '/posts/:id', element: <DetailPage/> },
  { path: '/collection', element: <CollectionPage/> }, { path: '/topics', element: <TopicsPage/> },
  { path: '/about', element: <AboutPage/> },
] }])

export default function App() { return <RouterProvider router={router}/> }
