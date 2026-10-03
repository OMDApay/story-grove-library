import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("dist/public");
const stories = JSON.parse(await readFile("client/src/data/stories.json", "utf8"));
const images = JSON.parse(await readFile("client/src/data/story-images.json", "utf8"));
const origin = (process.env.VITE_PUBLIC_ORIGIN || "").replace(/\/$/, "");
const template = await readFile(path.join(root, "index.html"), "utf8");
const esc = (value = "") => String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const setMeta = (html, selector, tag, attr, value) => {
  const safe = esc(value);
  const pattern = new RegExp(`<meta\\s+${selector}=["'][^"']*["'][^>]*>`, "i");
  const replacement = `<meta ${selector}="${tag}" content="${safe}" />`;
  return pattern.test(html) ? html.replace(pattern, replacement) : html.replace("</head>", `  ${replacement}\n  </head>`);
};
function documentFor({ title, description, route, body, image = "" }) {
  let html = template.replace(/<title>.*?<\/title>/is, `<title>${esc(title)}</title>`);
  html = setMeta(html, "name", "description", "content", description);
  html = setMeta(html, "property", "og:title", "content", title);
  html = setMeta(html, "property", "og:description", "content", description);
  if (image) html = setMeta(html, "property", "og:image", "content", image.startsWith("http") ? image : origin + image);
  if (origin) {
    const canonical = `${origin}${route}`;
    if (/<link\\s+rel=["']canonical["'][^>]*>/i.test(html)) html = html.replace(/<link\\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${esc(canonical)}" />`);
    else html = html.replace("</head>", `  <link rel="canonical" href="${esc(canonical)}" />\n    <meta property="og:url" content="${esc(canonical)}" />\n  </head>`);
  }
  return html.replace('<div id="root"></div>', `<div id="root">${body}</div>`);
}
const storyLinks = stories.map(s => `<li><a href="/story/${s.id}/">${esc(s.title)}</a><span>Level ${s.level} · ${esc(s.category)}</span></li>`).join("\n");
const homeBody = `<main><header><p>STORIES THAT GROW WITH YOU</p><h1>Every story opens a little world.</h1><p>Wander through 100 original English children's stories, with gentle grammar steps and little lessons to carry with you.</p></header><section><h2>The story shelves</h2><ol>${storyLinks}</ol></section><nav><a href="/about/">About</a> · <a href="/contact/">Contact</a> · <a href="/privacy/">Privacy</a></nav></main>`;
const home = documentFor({ title: "Story Grove — A Little Story Library", description: "Wander through 100 original English children's stories, with gentle grammar steps and little lessons to carry with you.", route: "/", body: homeBody });
await writeFile(path.join(root, "index.html"), home);
for (const story of stories) {
  const storyText = story.text.split(/\n\s*\n/).map(p => `<p>${esc(p)}</p>`).join("\n");
  const questions = story.questions.map((q, i) => `<li><strong>${i + 1}.</strong> ${esc(q)}</li>`).join("\n");
  const image = images[String(story.id)] || "";
  const art = image ? `<figure><img src="${esc(image)}" alt="Illustration for ${esc(story.title)}" width="1200" height="800"><figcaption>Story illustration</figcaption></figure>` : "";
  const body = `<main><nav><a href="/">All stories</a></nav><article>${art}<p>LEVEL ${story.level} · ${esc(story.ageRange)} · ${story.readingTimeMinutes} MIN READ</p><h1>${esc(story.title)}</h1><p>${esc(story.summary)}</p><aside><strong>A little English</strong><p>${esc(story.grammarFocus || `Level ${story.level} English`)}</p></aside>${storyText}<p><strong>THE END</strong></p><section><h2>A moment to wonder</h2><ol>${questions}</ol></section><p>${esc(story.lesson)}</p></article></main>`;
  const file = path.join(root, "story", String(story.id), "index.html");
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, documentFor({ title: `${story.title} — Story Grove`, description: `${story.summary} Read the story and explore its English grammar focus.`, route: `/story/${story.id}/`, body, image }));
}
const pages = {
  about: ["A little grove for growing minds.", "Story Grove is a home for original English children's stories, created to make reading feel like an invitation rather than an assignment."],
  contact: ["We'd love to hear from you.", "For questions, corrections, or a kind note about the stories, write to emadh5156@gmail.com. Please do not send sensitive personal information."],
  privacy: ["Your privacy matters here.", "Story Grove is a public reading library and does not ask children to create accounts. If advertising is introduced, third-party vendors including Google may use cookies or similar technologies. This policy will be updated before advertising tools are activated. Contact emadh5156@gmail.com for privacy questions."],
  cookies: ["Choose what feels right.", "This reading library does not require optional cookies to work. Advertising and analytics are not active in this version."],
  terms: ["A few kind ground rules.", "Story Grove is provided for personal, family, and classroom reading. Stories and illustrations are provided for this library; contact the owner before reproducing them."],
  advertising: ["Room for thoughtful sponsors.", "No ad network code is active in this version. Any future advertisements will be identified and separated from story text, navigation, and reading controls. AdSense approval cannot be promised."],
};
for (const [slug, [title, description]] of Object.entries(pages)) {
  const file = path.join(root, slug, "index.html"); await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, documentFor({ title: `${title} — Story Grove`, description, route: `/${slug}/`, body: `<main><a href="/">Back to the grove</a><article><h1>${esc(title)}</h1><p>${esc(description)}</p>${slug === "contact" ? '<p><a href="mailto:emadh5156@gmail.com">emadh5156@gmail.com</a></p>' : ""}</article></main>` }));
}
if (origin) {
  const urls = ["", ...stories.map(s => `story/${s.id}/`), ...Object.keys(pages).map(p => `${p}/`)];
  await writeFile(path.join(root, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(p => `<url><loc>${esc(origin)}/${p}</loc></url>`).join("")}</urlset>`);
  await writeFile(path.join(root, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /api/*\nSitemap: ${origin}/sitemap.xml\n`);
}
console.log(`Prerendered ${stories.length} story pages and ${Object.keys(pages).length} information pages${origin ? " with canonical metadata and sitemap" : " (set VITE_PUBLIC_ORIGIN after a real domain is known for canonical URLs and sitemap)"}.`);
