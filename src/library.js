// The library is the content in content/, built into the Worker. Texts are not stored
// in KV: a new or changed text is a Markdown file committed to the repository.
import { TOPICS as REPO_TOPICS } from './content.generated.js';

function byOrderThenTitle(a, b) {
  return a.order - b.order || a.title.localeCompare(b.title);
}

export function loadLibrary() {
  const topics = REPO_TOPICS.map((topic) => ({ ...topic, docs: [...topic.docs] }));
  for (const topic of topics) topic.docs.sort(byOrderThenTitle);
  return topics.sort(byOrderThenTitle);
}
