# Custom templates

Drop any JSON file exported from the Tree page's **Export JSON** button
into this folder. It'll automatically show up as a template card on the
Explore page next time you load it - no restart needed in dev.

The filename (minus `.json`) becomes the template's title by default.
To customize it, add these optional fields to the top of the JSON file:

```json
{
  "title": "My Custom Plan",
  "description": "A short description shown on the card.",
  "tags": ["Custom"],
  "nodes": [...],
  "edges": [...]
}
```
