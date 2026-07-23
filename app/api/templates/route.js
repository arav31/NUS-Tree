import { readdir, readFile } from 'fs/promises';
import path from 'path';
import { parseTreeJson } from '../../../lib/treeStorage';

const CUSTOM_TEMPLATES_DIR = path.join(process.cwd(), 'custom-templates');

function titleFromFilename(filename) {
  return filename
    .replace(/\.json$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function GET() {
  let filenames = [];
  try {
    filenames = await readdir(CUSTOM_TEMPLATES_DIR);
  } catch {
    return Response.json({ templates: [] });
  }

  const jsonFiles = filenames.filter((name) => name.toLowerCase().endsWith('.json'));

  const templates = [];
  for (const filename of jsonFiles) {
    try {
      const raw = await readFile(path.join(CUSTOM_TEMPLATES_DIR, filename), 'utf-8');
      const parsed = parseTreeJson(raw);
      templates.push({
        id: `custom-${filename.replace(/\.json$/i, '')}`,
        title: parsed.title || titleFromFilename(filename),
        description: parsed.description || 'Custom template from your local templates folder.',
        tags: parsed.tags || ['Custom'],
        nodes: parsed.nodes,
        edges: parsed.edges,
      });
    } catch {
      // Skip files that aren't valid tree JSON rather than failing the whole listing.
    }
  }

  return Response.json({ templates });
}
