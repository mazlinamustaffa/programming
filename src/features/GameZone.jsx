import { useMemo, useState } from 'react'
import { ArrowUpRight, Gamepad2, Play, Search, ShieldCheck, Sparkles } from 'lucide-react'
import { topics } from '../data/topics.js'
import { validateExternalURL } from '../lib/content.js'
import './libraries.css'

const EMPTY = []
const COLOURS = ['#9b79ff', '#53b8ff', '#ed82c2', '#48d8bd', '#ffc269']
const topicNumber = topic => Number(topic.number ?? topic.id)
const matchesTopic = (topic, id) => String(topic.id) === String(id) || topicNumber(topic) === Number(id)

export default function GameZone({ catalog, topicId, notify, navigate }) {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const records = catalog?.published?.games || EMPTY
  const activeTopic = topicId ?? filter
  const checked = useMemo(() => records.map(game => {
    try { return { ...game, safeURL: validateExternalURL(game.url) } } catch { return { ...game, safeURL: '' } }
  }), [records])
  const games = checked.filter(game => game.safeURL && topics.some(topic => matchesTopic(topic, game.topicId)))
  const invalidCount = checked.filter(game => !game.safeURL).length
  const term = search.trim().toLowerCase()
  const filtered = games.filter(game => `${game.title} ${game.platform} ${game.description || ''} ${game.difficulty || ''}`.toLowerCase().includes(term))
  const visibleTopics = topics.filter(topic => activeTopic === 'all' || matchesTopic(topic, activeTopic))

  return <div className="gz-page">
    <header className="gz-hero"><div className="gz-hero-content"><span className="rl-eyebrow"><Sparkles size={14} /> PLAY WITH PURPOSE</span><h1>Quiz &amp; Game Zone</h1><p>A little challenge. A lot of learning. Explore activities selected and published by your lecturer.</p><div className="gz-platform-list">{['Wayground', 'Wordwall', 'Kahoot', 'Blooket', 'Gimkit', 'Google Forms'].map(platform => <span key={platform}>{platform}</span>)}</div></div><div className="gz-hero-art" aria-hidden="true"><span className="gz-orbit gz-orbit-one" /><span className="gz-orbit gz-orbit-two" /><Gamepad2 size={96} strokeWidth={1.5} /><span className="gz-star gz-star-one">✦</span><span className="gz-star gz-star-two">✦</span></div></header>
    <div className="gz-info-bar"><div><ShieldCheck size={20} /><span>Games open on external platforms in a new tab. Review their privacy rules before sharing personal information.</span></div><button className="rl-small-button" onClick={() => navigate?.('manager')}>Manage game links <ArrowUpRight size={16} /></button></div>
    <div className="rl-library-controls">{!topicId && <div className="rl-topic-filters" role="group" aria-label="Filter games by topic"><button className={activeTopic === 'all' ? 'rl-filter active' : 'rl-filter'} onClick={() => setFilter('all')}>All topics</button>{topics.map(topic => <button key={topic.id} className={matchesTopic(topic, activeTopic) ? 'rl-filter active' : 'rl-filter'} onClick={() => setFilter(topic.id)}>Topic {topicNumber(topic)}</button>)}</div>}<label className="rl-search"><Search size={17} aria-hidden="true" /><input aria-label="Search published games" placeholder="Search games, platforms…" value={search} onChange={event => setSearch(event.target.value)} /></label></div>
    {catalog?.loading && <div className="rl-status-message" role="status">Loading published game links…</div>}
    {catalog?.error && <div className="rl-status-message rl-error-message" role="alert">Published game links could not be loaded. {String(catalog.error.message || catalog.error)}</div>}
    {invalidCount > 0 && <div className="rl-status-message rl-error-message" role="status">{invalidCount} published {invalidCount === 1 ? 'link needs' : 'links need'} a valid secure URL before students can open {invalidCount === 1 ? 'it' : 'them'}.</div>}
    <div className="rl-topic-sections">{visibleTopics.map(topic => {
      const topicGames = filtered.filter(game => matchesTopic(topic, game.topicId))
      const count = games.filter(game => matchesTopic(topic, game.topicId)).length
      return <section key={topic.id} className="rl-topic-section" style={{ '--rl-accent': COLOURS[(topicNumber(topic) - 1) % COLOURS.length] }} aria-labelledby={`gz-topic-${topic.id}`}>
        <div className="rl-topic-heading"><span className="rl-topic-number">0{topicNumber(topic)}</span><div><span className="rl-eyebrow">TOPIC {topicNumber(topic)}</span><h2 id={`gz-topic-${topic.id}`}>{topic.title}</h2></div><button className="rl-topic-link" aria-label={`Back to Topic ${topicNumber(topic)}`} onClick={() => navigate?.(`topic/${topic.id}`)}><ArrowUpRight size={20} /></button></div>
        {topicGames.length ? <div className="gz-game-grid">{topicGames.map(game => <article className="gz-game-card" key={game.id}><div className="gz-card-top"><span className="gz-game-icon"><Gamepad2 size={24} /></span><span className="gz-difficulty">{game.difficulty || 'All levels'}</span></div><span className="gz-platform">{game.platform || 'Educational platform'}</span><h3>{game.title}</h3><p>{game.description || `A lecturer-selected activity for Topic ${topicNumber(topic)}.`}</p><a className="gz-play-button" href={game.safeURL} target="_blank" rel="noopener noreferrer" onClick={() => notify?.('Opening the activity on an external platform in a new tab.')} aria-label={`Play ${game.title} (opens in a new tab)`}><Play size={16} fill="currentColor" /> PLAY NOW <ArrowUpRight size={17} /></a></article>)}</div> : <div className="rl-empty-topic gz-empty-topic"><div className="rl-empty-art"><span /><Gamepad2 size={40} aria-hidden="true" /></div><div><h3>{count && term ? 'No matching games' : 'The next challenge is coming'}</h3><p>{count && term ? 'Try another search to find a published activity.' : `Your lecturer has not published game links for Topic ${topicNumber(topic)} yet. Check back for real activities selected for your learning.`}</p></div><span className="rl-empty-label">{count && term ? 'SEARCH RESULTS' : 'NO PUBLISHED LINKS YET'}</span></div>}
      </section>
    })}</div>
    <p className="gz-storage-note">Only published links appear here. Links saved in Content Manager are local drafts until exported and published through GitHub.</p>
  </div>
}
