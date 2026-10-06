import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("dist/public");
const stories = JSON.parse(await readFile("client/src/data/stories.json", "utf8"));
const images = JSON.parse(await readFile("client/src/data/story-images.json", "utf8"));
const origin = (process.env.VITE_PUBLIC_ORIGIN || "").replace(/\/$/, "");
const base = process.env.VITE_BASE || "/";
const basePrefix = base.endsWith("/") ? base : `${base}/`;
const withBase = route => `${basePrefix}${String(route).replace(/^\/+/, "")}`;
const githubPages = process.env.VITE_GITHUB_PAGES === "1";
const template = await readFile(path.join(root, "index.html"), "utf8");
const esc = (value = "") => String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const setMeta = (html, selector, tag, attr, value) => {
  const safe = esc(value);
  const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`<meta\\s+${selector}=["']${escapedTag}["'][^>]*>`, "i");
  const replacement = `<meta ${selector}="${tag}" content="${safe}" />`;
  return pattern.test(html) ? html.replace(pattern, replacement) : html.replace("</head>", `  ${replacement}\n  </head>`);
};
const shortDescription = value => {
  const text = String(value).replace(/\s+/g, " ").trim();
  if (text.length <= 155) return text;
  const cut = text.slice(0, 154);
  const boundary = cut.lastIndexOf(" ");
  return `${(boundary > 110 ? cut.slice(0, boundary) : cut).trimEnd()}…`;
};
const searchTitle = value => {
  const brand = " — Story Grove";
  let text = String(value).replace(/\s+/g, " ").trim();
  const suffix = text.endsWith(brand) ? brand : "";
  let base = suffix ? text.slice(0, -suffix.length).trimEnd() : text;
  if (base.length + suffix.length > 60) base = `${base.slice(0, 59 - suffix.length).trimEnd()}…`;
  if (base.length + suffix.length < 30) base = `${base} — English`;
  return `${base}${suffix}`;
};
function documentFor({ title, description, route, body, image = "" }) {
  const metaTitle = searchTitle(title);
  let html = template.replace(/<title>.*?<\/title>/is, `<title>${esc(metaTitle)}</title>`);
  const metaDescription = shortDescription(description);
  html = setMeta(html, "name", "description", "content", metaDescription);
  html = setMeta(html, "property", "og:title", "content", metaTitle);
  html = setMeta(html, "property", "og:description", "content", metaDescription);
  html = setMeta(html, "name", "twitter:title", "content", metaTitle);
  html = setMeta(html, "name", "twitter:description", "content", metaDescription);
  const absoluteImage = image ? (/^https?:\/\//i.test(image) ? image : origin ? `${origin}${image}` : "") : "";
  if (absoluteImage) {
    html = setMeta(html, "property", "og:image", "content", absoluteImage);
    html = setMeta(html, "name", "twitter:image", "content", absoluteImage);
  }
  if (origin) {
    const canonical = `${origin}${route}`;
    const canonicalPattern = /<link\s+rel=["']canonical["'][^>]*>/i;
    if (canonicalPattern.test(html)) html = html.replace(canonicalPattern, `<link rel="canonical" href="${esc(canonical)}" />`);
    else html = html.replace("</head>", `  <link rel="canonical" href="${esc(canonical)}" />\n  </head>`);
    html = setMeta(html, "property", "og:url", "content", canonical);
  }
  return html.replace('<div id="root"></div>', `<div id="root">${body}</div>`);
}
const storyLinks = stories.map(s => `<li><a href="${withBase(`story/${s.id}/`)}">${esc(s.title)}</a><span>Level ${s.level} · ${esc(s.category)}</span></li>`).join("\n");
const heroStoragePath = "/manus-storage/async-images/KVVnFzxQzBG1lToc8AAE4s/image-1.webp";
const heroImage = githubPages ? "/images/hero.webp" : heroStoragePath;
const heroSrc = githubPages ? withBase("images/hero.webp") : heroStoragePath;
const homeBody = `<main><header><p>STORIES THAT GROW WITH YOU</p><h1>Every story opens a little world.</h1><p>Wander through 100 original English children's stories, with gentle grammar steps and little lessons to carry with you.</p><figure><img src="${esc(heroSrc)}" alt="Two children share a storybook with a rabbit and bear beneath an old oak tree." width="1200" height="800"></figure></header><section><h2>The story shelves</h2><ol>${storyLinks}</ol></section><nav><a href="${withBase("about/")}">About</a> · <a href="${withBase("contact/")}">Contact</a> · <a href="${withBase("privacy/")}">Privacy</a></nav></main>`;
const home = documentFor({ title: "Story Grove — A Little Story Library", description: "Wander through 100 original English children's stories, with gentle grammar steps and little lessons to carry with you.", route: "/", body: homeBody, image: heroImage });
await writeFile(path.join(root, "index.html"), home);
for (const story of stories) {
  const storyText = story.text.split(/\n\s*\n/).map(p => `<p>${esc(p)}</p>`).join("\n");
  const questions = story.questions.map((q, i) => `<li><strong>${i + 1}.</strong> ${esc(q)}</li>`).join("\n");
  const image = githubPages ? `/images/stories/${String(story.id).padStart(3, "0")}.webp` : images[String(story.id)] || "";
  const imageSrc = githubPages ? withBase(image) : image;
  const art = imageSrc ? `<figure><img src="${esc(imageSrc)}" alt="Illustration for ${esc(story.title)}" width="1200" height="800"><figcaption>Story illustration</figcaption></figure>` : "";
  const body = `<main><nav><a href="${withBase("")}">All stories</a></nav><article>${art}<p>LEVEL ${story.level} · ${esc(story.ageRange)} · ${story.readingTimeMinutes} MIN READ</p><h1>${esc(story.title)}</h1><p>${esc(story.summary)}</p><aside><strong>A little English</strong><p>${esc(story.grammarFocus || `Level ${story.level} English`)}</p></aside>${storyText}<p><strong>THE END</strong></p><section><h2>A moment to wonder</h2><ol>${questions}</ol></section><p>${esc(story.lesson)}</p></article></main>`;
  const file = path.join(root, "story", String(story.id), "index.html");
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, documentFor({ title: `${story.title} — Story Grove`, description: `${story.summary} Read the story and explore its English grammar focus.`, route: `/story/${story.id}/`, body, image }));
}
const pages = {
  about: ["A little grove for growing minds.", "Story Grove is a home for original English children's stories, created to make reading feel like an invitation rather than an assignment."],
  contact: ["We'd love to hear from you.", "For questions, corrections, or a kind note about the stories, write to emadh5156@gmail.com. Please do not send sensitive personal information."],
  privacy: ["Your privacy matters here.", "Story Grove is designed as a public reading library and does not ask children to create an account or submit personal details. Google Analytics 4 (measurement ID G-LW6QVNN11Z) is optional and is not requested until you enable Optional analytics in Cookie Preferences. It measures site visits and page views. You can withdraw consent there; this stops future measurement and clears accessible Google Analytics cookies. Google may process data under its own privacy terms. Advertising is not active. Contact emadh5156@gmail.com for privacy questions."],
  cookies: ["Choose what feels right.", "Optional analytics is off by default. If you enable it, Google Analytics 4 is loaded to measure visits and page views; your choice is stored in this browser. Turn it off here to stop future measurement and clear accessible Google Analytics cookies. No advertising cookies or ad network code are active."],
  terms: ["A few kind ground rules.", "Story Grove is provided for personal, family, and classroom reading. Stories and illustrations are provided for this library; contact the owner before reproducing them."],
  advertising: ["Room for thoughtful sponsors.", "No ad network code is active in this version. Any future advertisements will be identified and separated from story text, navigation, and reading controls. AdSense approval cannot be promised."],
};
for (const [slug, [title, description]] of Object.entries(pages)) {
  const file = path.join(root, slug, "index.html"); await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, documentFor({ title: `${title} — Story Grove`, description, route: `/${slug}/`, body: `<main><a href="${withBase("")}">Back to the grove</a><article><h1>${esc(title)}</h1><p>${esc(description)}</p>${slug === "contact" ? '<p><a href="mailto:emadh5156@gmail.com">emadh5156@gmail.com</a></p>' : ""}</article></main>` }));
}
if (origin) {
  const urls = ["", ...stories.map(s => `story/${s.id}/`), ...Object.keys(pages).map(p => `${p}/`)];
  await writeFile(path.join(root, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(p => `<url><loc>${esc(origin)}/${p}</loc></url>`).join("")}</urlset>`);
  await writeFile(path.join(root, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /api/*\nSitemap: ${origin}/sitemap.xml\n`);
}
console.log(`Prerendered ${stories.length} story pages and ${Object.keys(pages).length} information pages${origin ? " with canonical metadata and sitemap" : " (set VITE_PUBLIC_ORIGIN after a real domain is known for canonical URLs and sitemap)"}.`);
