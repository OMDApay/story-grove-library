import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import {
  ArrowLeft, ArrowRight, BookOpen, Bookmark, Check, ChevronDown, Clock3,
  Headphones, Heart, Leaf, Mail, Pause, Play, Search, Sparkles, Square,
  Volume2, X,
} from "lucide-react";
import imageManifest from "@/data/story-images.json";

type Story = { id:number; title:string; summary:string; lesson:string; category:string; ageRange:string; level:number; grammarFocus:string; readingTimeMinutes:number; questions:string[]; sourceTopic?:string; text?:string };
type FullStory = Story & { text:string };
const imageFor = (id: number) => (imageManifest as Record<string, string>)[String(id)] || "";
const assetsBase = import.meta.env.BASE_URL;
const categories = ["All themes", "Kindness", "Courage", "Curiosity", "Friendship", "Patience", "Nature", "Honesty", "Perseverance", "Responsibility", "Learning"];
function storyPassages(text:string) {
  return text.split(/\n\s*\n/).map(block=>block.trim()).filter(Boolean).flatMap(block=>{
    const sentences=block.match(/[^.!?]+[.!?]+["'’”)]?|[^.!?]+$/g)?.map(s=>s.trim()).filter(Boolean)||[block];
    const groups:string[]=[];let current:string[]=[];let words=0;
    for(const sentence of sentences){current.push(sentence);words+=sentence.split(/\s+/).length;if(words>=46){groups.push(current.join(" "));current=[];words=0}}
    if(current.length)groups.push(current.join(" "));return groups;
  });
}

function Meta({ title, description }: { title: string; description: string }) {
  useEffect(() => {
    document.title = title;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement("meta"); meta.setAttribute("name", "description"); document.head.appendChild(meta); }
    meta.setAttribute("content", description.slice(0, 155));
    const ogTitle = document.querySelector('meta[property="og:title"]') || document.head.appendChild(Object.assign(document.createElement("meta"), { property: "og:title" }));
    ogTitle.setAttribute("content", title);
    const ogDesc = document.querySelector('meta[property="og:description"]') || document.head.appendChild(Object.assign(document.createElement("meta"), { property: "og:description" }));
    ogDesc.setAttribute("content", description.slice(0, 200));
  }, [title, description]);
  return null;
}

function Brand({ onNavigate }: { onNavigate: (path: string) => void }) {
  return <button className="brand" onClick={() => onNavigate("/")} aria-label="Story Grove home">
    <span className="brand-mark"><BookOpen size={19} strokeWidth={1.7} /></span>
    <span>story<span className="brand-light">grove</span><small>A LITTLE STORY LIBRARY</small></span>
  </button>;
}

function Header({ onNavigate }: { onNavigate: (path: string) => void }) {
  return <header className="site-header"><div className="header-inner">
    <Brand onNavigate={onNavigate} />
    <nav aria-label="Main navigation"><button onClick={() => onNavigate("/#library")}>The stories</button><button onClick={() => onNavigate("/about")}>Our little grove</button></nav>
    <button className="header-cta" onClick={() => onNavigate("/#library")}>Find a story <ArrowRight size={15}/></button>
  </div></header>;
}

function StoryArt({ story, className = "" }: { story: Story; className?: string }) {
  const [failed, setFailed] = useState(false);
  const src = imageFor(story.id);
  useEffect(() => setFailed(false), [src]);
  return <div className={`story-art ${className}`}>
    {src && !failed ? <img src={src} alt={`Illustration for ${story.title}`} loading="lazy" decoding="async" onError={() => { setFailed(true); if (import.meta.env.DEV) console.warn(`[Story Grove] illustration failed: story ${story.id}`); }} /> :
      <div className="art-unavailable"><Leaf size={25}/><span>Illustration unavailable</span><small>Story {String(story.id).padStart(2, "0")}</small></div>}
    <span className="art-bookmark" aria-hidden="true"/><span className="art-spark" aria-hidden="true">✦</span>
  </div>;
}

function StoryCard({ story, onOpen }: { story: Story; onOpen: () => void }) {
  return <article className="story-card">
    <button className="card-open" onClick={onOpen} aria-label={`Read ${story.title}`}>
      <StoryArt story={story}/>
      <div className="card-copy"><div className="eyebrow">A LITTLE STORY · {String(story.id).padStart(2,"0")} <span>LEVEL {story.level}</span></div>
        <h3>{story.title}</h3><p className="card-summary">{story.summary}</p>
        <div className="grammar-line"><span>GRAMMAR {String(story.id).padStart(2,"0")}</span><small>{story.grammarFocus || `Level ${story.level} English`}</small></div>
        <div className="lesson-chip"><Check size={14}/><span>{story.lesson || "A little lesson to carry with you."}</span></div>
        <span className="read-link"><BookOpen size={16}/> Read this story <ArrowRight size={16}/></span>
      </div>
    </button>
  </article>;
}

function Library({ onOpen, stories, loading }: { onOpen: (id: number) => void; stories: Story[]; loading:boolean }) {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("All levels");
  const [category, setCategory] = useState("All themes");
  const [showAll, setShowAll] = useState(false);
  const visible = useMemo(() => stories.filter(s => {
    const q = query.trim().toLowerCase();
    const matches = !q || `${s.title} ${s.summary} ${s.lesson} ${s.grammarFocus} ${s.category} ${s.sourceTopic||""}`.toLowerCase().includes(q);
    return matches && (level === "All levels" || String(s.level) === level) && (category === "All themes" || s.category === category);
  }), [stories, query, level, category]);
  const shown = showAll || query || level !== "All levels" || category !== "All themes" ? visible : visible.slice(0, 12);
  return <>
    <section className="hero"><div className="hero-paper"><div className="hero-copy">
      <div className="hero-kicker"><span className="tiny-leaf"><Leaf size={13}/></span> STORIES THAT GROW WITH YOU</div>
      <h1>Every story<br/>opens <em>a little world.</em></h1>
      <p>Wander through warm, original tales. Meet brave hearts, curious minds, and the little lessons that stay with us.</p>
      <button className="primary-button" onClick={() => document.getElementById("library")?.scrollIntoView({behavior:"smooth"})}>Find your next story <ArrowRight size={17}/></button>
      <div className="hero-note"><span>100</span> little adventures <i/> Three growing English levels</div>
    </div><div className="hero-art"><img className="hero-image" src="/manus-storage/async-images/KVVnFzxQzBG1lToc8AAE4s/image-1.webp" alt="Two children share a storybook with a rabbit and bear beneath an old oak tree." fetchPriority="high" decoding="async"/><span className="hero-caption">a place for small wonders</span></div></div></section>
    <section className="grove-intro"><div className="section-overline">A GENTLE PATH THROUGH ENGLISH</div><p>Each story brings a new idea to explore — and a little more language to take along.</p><div className="level-pills"><span><i className="level-dot dot-1"/>Level 1 <small>ages 6–7</small></span><span><i className="level-dot dot-2"/>Level 2 <small>ages 7–8</small></span><span><i className="level-dot dot-3"/>Level 3 <small>ages 8–9</small></span></div></section>
    <section className="library-section" id="library"><div className="library-heading"><div><div className="section-overline">THE STORY SHELVES</div><h2>Choose a little adventure</h2><p>One page at a time, one new idea at a time.</p></div><div className="library-count"><Bookmark size={17}/><span>100 stories<br/><small>ready to be discovered</small></span></div></div>
      <div className="filters"><label className="search-box"><Search size={18}/><input value={query} onChange={e=>{setQuery(e.target.value);setShowAll(true)}} placeholder="Find a title, lesson, or grammar topic…" aria-label="Search stories"/>{query&&<button aria-label="Clear search" onClick={()=>setQuery("")}><X size={15}/></button>}</label>
      <label className="select-wrap"><span className="sr-only">Filter by level</span><select value={level} onChange={e=>{setLevel(e.target.value);setShowAll(true)}}><option>All levels</option><option value="1">Level 1 · ages 6–7</option><option value="2">Level 2 · ages 7–8</option><option value="3">Level 3 · ages 8–9</option></select><ChevronDown size={15}/></label>
      <label className="select-wrap theme-select"><span className="sr-only">Filter by theme</span><select value={category} onChange={e=>{setCategory(e.target.value);setShowAll(true)}}>{categories.map(c=><option key={c}>{c}</option>)}</select><ChevronDown size={15}/></label></div>
      <div className="results-label">SHOWING <strong>{shown.length}</strong> OF {visible.length} STORIES <span>·</span> SORTED BY READING JOURNEY</div>
      {loading ? <div className="empty-results"><Leaf/><h3>Warming the story shelves…</h3><p>The little stories will be here in a moment.</p></div> : shown.length ? <div className="story-grid">{shown.map(s=><StoryCard key={s.id} story={s} onOpen={()=>onOpen(s.id)}/>)}</div> : <div className="empty-results"><Leaf/><h3>No stories found just yet.</h3><p>Try another title, theme, or level.</p></div>}
      {!showAll && visible.length>12 && <button className="show-all" onClick={()=>setShowAll(true)}>Show all 100 stories <ArrowRight size={16}/></button>}
    </section>
    <section className="ad-slot" aria-label="Advertising disclosure"><span>ADVERTISEMENT</span><p>A quiet space for future sponsors</p></section>
  </>;
}

function AudioReader({ story, onParagraphChange }: { story: FullStory; onParagraphChange:(index:number)=>void }) {
  const paragraphs = storyPassages(story.text);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceName, setVoiceName] = useState("");
  const [speed, setSpeed] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [index, setIndex] = useState(0);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  useEffect(() => {
    if (!supported) return;
    const load = () => { const v=window.speechSynthesis.getVoices().filter(x=>x.lang.toLowerCase().startsWith("en")); setVoices(v); if(!voiceName&&v.length) setVoiceName(v[0].name); };
    load(); window.speechSynthesis.addEventListener("voiceschanged",load);
    return () => { window.speechSynthesis.removeEventListener("voiceschanged",load); window.speechSynthesis.cancel(); };
  }, [story.id, supported]);
  const speak = (at:number) => {
    if(!supported||!paragraphs.length) return;
    window.speechSynthesis.cancel(); setIndex(at); const u=new SpeechSynthesisUtterance(paragraphs[at]);
    const v=voices.find(x=>x.name===voiceName); if(v) u.voice=v; u.rate=speed;
    u.onstart=()=>{setPlaying(true);setPaused(false);onParagraphChange(at)}; u.onend=()=>{if(at+1<paragraphs.length) speak(at+1); else {setPlaying(false);setPaused(false);setIndex(paragraphs.length);onParagraphChange(-1)}}; u.onerror=()=>{setPlaying(false);setPaused(false);onParagraphChange(-1)};
    window.speechSynthesis.speak(u);
  };
  const stop=()=>{if(supported)window.speechSynthesis.cancel();setPlaying(false);setPaused(false);setIndex(0);onParagraphChange(-1)};
  const changeVoice=(name:string)=>{setVoiceName(name);if(playing&&!paused)speak(Math.min(index,paragraphs.length-1))};
  if(!supported) return <div className="audio-unavailable"><Volume2 size={17}/> Read-aloud isn't supported in this browser.</div>;
  return <div className="audio-panel"><div className="audio-title"><span className="audio-icon"><Headphones size={17}/></span><span><strong>Read it aloud</strong><small>Browser voice · English</small></span></div>
    <div className="audio-actions"><button className="audio-main" onClick={()=>paused?(window.speechSynthesis.resume(),setPaused(false)):playing?(window.speechSynthesis.pause(),setPaused(true)):speak(Math.min(index,paragraphs.length-1))} aria-label={paused?"Resume":"Play or pause narration"}>{playing&&!paused?<Pause size={16} fill="currentColor"/>:<Play size={16} fill="currentColor"/>}</button><button onClick={()=>speak(Math.max(0,Math.min(index-1,paragraphs.length-1)))} aria-label="Previous paragraph"><ArrowLeft size={16}/></button><button onClick={()=>speak(Math.min(index+1,paragraphs.length-1))} aria-label="Next paragraph"><ArrowRight size={16}/></button><button onClick={stop} aria-label="Stop narration"><Square size={14} fill="currentColor"/></button><span className="audio-progress">{Math.min(index+1,paragraphs.length)} / {paragraphs.length} paragraphs</span></div>
    <div className="audio-progress-track"><span style={{width:`${Math.min(100,(index/Math.max(1,paragraphs.length))*100)}%`}}/></div>
    <div className="audio-options"><label>Voice<select value={voiceName} onChange={e=>changeVoice(e.target.value)}>{voices.length?voices.map(v=><option key={v.name} value={v.name}>{v.name}</option>):<option value="">Default browser voice</option>}</select></label><label>Speed<select value={speed} onChange={e=>setSpeed(Number(e.target.value))}>{[0.75,1,1.25,1.5,1.75].map(n=><option key={n} value={n}>{n}×</option>)}</select></label></div>
  </div>;
}

function StoryReader({ story, stories, onNavigate }: { story: FullStory; stories:Story[]; onNavigate: (path:string)=>void }) {
  const [activeParagraph,setActiveParagraph]=useState(-1);
  const at=stories.findIndex(s=>s.id===story.id); const prev=stories[at-1], next=stories[at+1];
  useEffect(()=>{window.scrollTo({top:0,behavior:"instant" as ScrollBehavior});},[story.id]);
  const highlightParagraph=(index:number)=>{setActiveParagraph(index);if(index>=0)requestAnimationFrame(()=>document.getElementById(`story-${story.id}-paragraph-${index}`)?.scrollIntoView({behavior:"smooth",block:"center"}))};
  return <><Meta title={`${story.title} — Story Grove`} description={`${story.summary} Read the story, explore its English grammar focus, and answer a few questions.`}/>
    <main className="reader-page"><div className="reader-top"><button className="back-link" onClick={()=>onNavigate("/#library")}><ArrowLeft size={16}/> All stories</button><div className="reader-crumb">STORY {String(story.id).padStart(2,"0")} <span>·</span> LEVEL {story.level}</div></div>
      <div className="reader-grid"><aside className="reader-art-column"><div className="reader-art-sticky"><StoryArt story={story} className="reader-art"/><div className="art-caption"><span>AN ORIGINAL LITTLE WORLD</span><span>{story.ageRange}</span></div><div className="art-lesson"><Heart size={17}/><p>{story.lesson}</p></div></div></aside>
      <article className="reader-copy"><div className="reader-meta"><span className={`reader-level reader-level-${story.level}`}>LEVEL {story.level}</span><span>{story.ageRange}</span><span><Clock3 size={14}/> {story.readingTimeMinutes} min read</span></div><h1>{story.title}</h1><p className="reader-deck">{story.summary}</p>
        <div className="grammar-card"><span className="grammar-label">A LITTLE ENGLISH</span><p>{story.grammarFocus||`Level ${story.level} English`}</p></div><AudioReader story={story} onParagraphChange={highlightParagraph}/>
        <div className="story-text">{storyPassages(story.text).map((p,i)=><p className={`story-paragraph${activeParagraph===i?" is-speaking":""}`} aria-current={activeParagraph===i?"true":undefined} id={`story-${story.id}-paragraph-${i}`} key={i}>{p}</p>)}</div>
        <div className="the-end"><span>✦</span><strong>THE END</strong><span>✦</span></div>
        <section className="questions"><div className="section-overline">A MOMENT TO WONDER</div><h2>Let the story stay a little longer.</h2><p className="question-intro">There are no wrong ways to think about a story. What do you think?</p>{story.questions.map((q,i)=><div className="question-card" key={i}><span>0{i+1}</span><p>{q}</p></div>)}</section>
        <div className="reader-nav"><button disabled={!prev} onClick={()=>prev&&onNavigate(`/story/${prev.id}`)}><ArrowLeft size={17}/><span><small>PREVIOUS STORY</small>{prev?.title||"Beginning of the grove"}</span></button><button disabled={!next} onClick={()=>next&&onNavigate(`/story/${next.id}`)}><span><small>NEXT STORY</small>{next?.title||"End of this trail"}</span><ArrowRight size={17}/></button></div>
      </article></div><div className="reader-mobile-back"><button className="back-link" onClick={()=>onNavigate("/#library")}><ArrowLeft size={16}/> Back to all stories</button></div>
    </main></>;
}

const legalContent: Record<string,{title:string;eyebrow:string;body:string[]}>={
  "/about":{title:"A little grove for growing minds.",eyebrow:"OUR LITTLE GROVE",body:["Story Grove is a home for original English children's stories, created to make reading feel like an invitation rather than an assignment.","Follow a gentle path through three reading levels, meet characters learning about friendship, courage, honesty, and care, and discover the grammar woven naturally into every tale.","Our stories are for sharing with a parent, teacher, or curious reader. The read-aloud voice is provided by your browser and is not a professional recording."]},
  "/contact":{title:"We'd love to hear from you.",eyebrow:"SAY HELLO",body:["For questions, corrections, or a kind note about the stories, write to us at the address below.","We aim to reply when we can. Please do not send sensitive personal information, especially information about children."]},
  "/privacy":{title:"Your privacy matters here.",eyebrow:"PRIVACY POLICY",body:["Story Grove is designed as a public reading library. It does not ask children to create an account or submit personal details. The browser may store your cookie-preference choice locally on your device.","If advertising is introduced in the future, third-party vendors, including Google, may use cookies or similar technologies to serve and measure ads. This policy will be updated before any advertising technology is activated, with details about the vendors and choices available to visitors.","To ask a privacy question or request a correction, contact emadh5156@gmail.com. Do not include a child's sensitive information in your message."]},
  "/cookies":{title:"Choose what feels right.",eyebrow:"COOKIE PREFERENCES",body:["This reading library does not require optional cookies to work. Your preference is stored in this browser. If advertising or analytics are enabled later, this page and the consent controls will be updated before they are activated."]},
  "/terms":{title:"A few kind ground rules.",eyebrow:"TERMS OF USE",body:["Story Grove is provided for personal, family, and classroom reading. Please use the stories and site respectfully and do not attempt to disrupt the service.","The stories and illustrations are provided for this library. Contact the owner before reproducing or redistributing them. Browser read-aloud depends on the visitor's device and installed voices.","The site is educational and is not a substitute for a teacher's professional judgment. These terms may be updated as the service changes."]},
  "/advertising":{title:"Room for thoughtful sponsors.",eyebrow:"ADVERTISING DISCLOSURE",body:["Story Grove currently reserves clearly labelled space for future advertising. No ad network code is active in this version.","If ads are introduced, they will be identified as advertising and kept visually separate from story text, navigation, and reading controls. We will not ask visitors to click ads.","Google AdSense approval is determined by Google and cannot be promised. Any advertising will be configured only after the publisher account, approved publisher ID, and any required consent-management setup are provided."]}
};

function SiteFooter({ onNavigate }: { onNavigate: (path:string)=>void }) {
  const links=[["About","/about"],["Contact","/contact"],["Privacy","/privacy"],["Cookie preferences","/cookies"],["Terms","/terms"],["Advertising","/advertising"]];
  return <footer className="site-footer"><div className="footer-main"><Brand onNavigate={onNavigate}/><p>Stories to enjoy.<br/>Little English to carry with you.</p><a className="footer-mail" href="mailto:emadh5156@gmail.com"><Mail size={15}/> emadh5156@gmail.com</a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Story Grove · Made for curious readers</span><nav aria-label="Legal and information pages">{links.map(([label,path])=><button key={path} onClick={()=>onNavigate(path)}>{label}</button>)}</nav></div></footer>;
}

function InfoPage({ path, onNavigate }: {path:string;onNavigate:(path:string)=>void}) {
  const content=legalContent[path]; const [analytics,setAnalytics]=useState(false);
  useEffect(()=>{setAnalytics(localStorage.getItem("sg-analytics") === "true")},[]);
  if(!content) return <main className="info-page"><div className="section-overline">NOT FOUND</div><h1>This page wandered off.</h1><button className="primary-button" onClick={()=>onNavigate("/")}>Back to the stories</button></main>;
  return <><Meta title={`${content.eyebrow} — Story Grove`} description={content.body[0]}/><main className="info-page"><button className="back-link" onClick={()=>onNavigate("/")}><ArrowLeft size={16}/> Back to the grove</button><div className="info-paper"><div className="section-overline">{content.eyebrow}</div><h1>{content.title}</h1>{content.body.map((p,i)=><p key={i}>{p}</p>)}{path==="/contact"&&<a className="contact-address" href="mailto:emadh5156@gmail.com"><Mail size={18}/> emadh5156@gmail.com</a>}{path==="/cookies"&&<div className="cookie-choice"><label><span><strong>Optional analytics</strong><small>Remember this choice in this browser.</small></span><input type="checkbox" checked={analytics} onChange={e=>{setAnalytics(e.target.checked);localStorage.setItem("sg-analytics",String(e.target.checked))}}/></label><button className="primary-button" onClick={()=>localStorage.setItem("sg-analytics",String(analytics))}><Check size={16}/> Save preferences</button><p className="tiny-note">No analytics scripts are active. This setting is ready for a future, consent-respecting integration.</p></div>}</div></main></>;
}

export default function StoryGrove() {
  const [location,setLocation]=useLocation();
  const [stories,setStories]=useState<Story[]>([]);
  const [storiesLoaded,setStoriesLoaded]=useState(false);
  const [storyData,setStoryData]=useState<FullStory>();
  const [storyLoadFailed,setStoryLoadFailed]=useState(false);
  const clean=location.split("?")[0].split("#")[0]||"/";
  const storyMatch=clean.match(/^\/story\/(\d+)\/?$/);
  const storyId=storyMatch?Number(storyMatch[1]):undefined;
  const storyMeta=storyId?stories.find(s=>s.id===storyId):undefined;
  const story=storyData?.id===storyId?storyData:undefined;
  const isInfo=clean in legalContent || clean==="/404";
  const isInvalidStory=clean.startsWith("/story/")&&storiesLoaded&&!storyMeta;
  useEffect(()=>{let active=true;fetch(`${assetsBase}stories-index.json`).then(r=>{if(!r.ok)throw new Error("index fetch failed");return r.json() as Promise<Story[]>}).then(data=>{if(active)setStories(data)}).catch(()=>{if(active)setStories([])}).finally(()=>{if(active)setStoriesLoaded(true)});return()=>{active=false}},[]);
  useEffect(()=>{if(!storyId||!storyMeta){setStoryData(undefined);return}let active=true;setStoryLoadFailed(false);fetch(`${assetsBase}stories/${storyId}.json`).then(r=>{if(!r.ok)throw new Error("story fetch failed");return r.json() as Promise<FullStory>}).then(data=>{if(active)setStoryData(data)}).catch(()=>{if(active){setStoryLoadFailed(true);setStoryData(undefined)}});return()=>{active=false}},[storyId,storyMeta]);
  useEffect(()=>{if(location.includes("#")) setTimeout(()=>document.getElementById(location.split("#")[1])?.scrollIntoView(),80)},[location]);
  const loadingStory=Boolean(storyId&&storyMeta&&!story&&!storyLoadFailed);
  return <div className="site-shell"><Header onNavigate={setLocation}/>{story?<StoryReader story={story} stories={stories} onNavigate={setLocation}/>:storyLoadFailed?<InfoPage path="/404" onNavigate={setLocation}/>:loadingStory||storyId&&!storiesLoaded?<main className="info-page"><div className="section-overline">TURNING THE PAGE</div><h1>Gathering this little story…</h1></main>:isInfo||isInvalidStory?<InfoPage path={isInvalidStory?"/404":clean} onNavigate={setLocation}/>:<><Meta title="Story Grove — A Little Story Library" description="Wander through 100 original English children's stories, with gentle grammar steps and little lessons to carry with you."/><Library stories={stories} loading={!storiesLoaded} onOpen={id=>setLocation(`/story/${id}/`)}/></>}<SiteFooter onNavigate={setLocation}/></div>;
}
