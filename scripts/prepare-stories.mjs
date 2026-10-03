import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
const data = JSON.parse(await readFile("client/src/data/stories.json", "utf8"));
const publicDir = path.resolve("client/public");
const index = data.map(({ text, imagePrompt, sourceFile, ...summary }) => summary);
await writeFile(path.join(publicDir, "stories-index.json"), JSON.stringify(index));
const storyDir = path.join(publicDir, "stories");
await mkdir(storyDir, { recursive: true });
for (const story of data) {
  const { imagePrompt, sourceFile, ...publicStory } = story;
  await writeFile(path.join(storyDir, `${story.id}.json`), JSON.stringify(publicStory));
}
console.log(`Prepared ${index.length} compact story summaries and ${data.length} on-demand story texts.`);
