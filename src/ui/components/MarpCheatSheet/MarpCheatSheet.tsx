"use client";

/**
 * MarpCheatSheet — quick reference for Marp markdown syntax.
 *
 * 3-column layout: Structure, Formatting, Directives & Advanced.
 * Always available as the last tab in the editor.
 */
export function MarpCheatSheet() {
  return (
    <div
      className="flex-1 overflow-auto p-5"
      style={{ backgroundColor: "var(--surface-primary)" }}
      data-testid="marp-cheatsheet"
    >
      <div
        className="grid gap-6"
        style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
      >
        {/* Column 1: Structure */}
        <div className="flex flex-col gap-4">
          <SectionTitle>Structure</SectionTitle>

          <CheatItem title="Frontmatter" code={`---
marp: true
theme: default
paginate: true
---`} />

          <CheatItem title="Slide separator" code={`---`} note="On its own line between slides" />

          <CheatItem title="Headings" code={`# H1 Title
## H2 Section
### H3 Subsection`} />

          <CheatItem title="Lists" code={`- Bullet item
- Another item
  - Nested

1. Numbered
2. Items`} />

          <CheatItem title="Images" code={`![Alt text](./image.png)`} note="Upload via Media tab" />

          <CheatItem title="Links" code={`[Link text](https://url.com)`} />

          <CheatItem title="Tables" code={`| Col A | Col B |
|-------|-------|
| val 1 | val 2 |`} />
        </div>

        {/* Column 2: Formatting */}
        <div className="flex flex-col gap-4">
          <SectionTitle>Formatting</SectionTitle>

          <CheatItem title="Bold / Italic" code={`**bold** *italic* ***both***`} />

          <CheatItem title="Code inline" code={"`inline code`"} />

          <CheatItem title="Code block" code={`\`\`\`javascript
const x = 42;
\`\`\``} />

          <CheatItem title="Blockquote" code={`> Important note here`} />

          <CheatItem title="Horizontal rule" code={`---`} note="Also acts as slide separator" />

          <CheatItem title="Strikethrough" code={`~~deleted text~~`} />

          <CheatItem title="Math (KaTeX)" code={`$E = mc^2$

$$
\\sum_{i=1}^{n} x_i
$$`} />

          <CheatItem title="Mermaid diagram" code={`\`\`\`mermaid
graph TD
  A --> B
\`\`\``} />

          <CheatItem title="Chart" code={`\`\`\`chart
{
  "type": "bar",
  "data": { ... }
}
\`\`\``} />
        </div>

        {/* Column 3: Directives & Advanced */}
        <div className="flex flex-col gap-4">
          <SectionTitle>Directives</SectionTitle>

          <CheatItem title="Page background" code={`<!-- backgroundColor: #1a1a2e -->
<!-- color: white -->`} note="Applies to current slide" />

          <CheatItem title="Background image" code={`<!-- _backgroundImage: url('./bg.jpg') -->
<!-- _backgroundSize: cover -->`} />

          <CheatItem title="Class" code={`<!-- _class: lead -->`} note="lead = centered content (gaia theme)" />

          <CheatItem title="Scoped directive" code={`<!-- _header: Page Title -->
<!-- _footer: Company Name -->`} note="Underscore = this slide only" />

          <CheatItem title="Global directive" code={`<!-- header: All Pages -->
<!-- footer: © 2026 -->`} note="No underscore = all slides" />

          <CheatItem title="Pagination" code={`---
paginate: true
---`} note="In frontmatter. Shows slide numbers" />

          <CheatItem title="Theme" code={`---
theme: gaia
---`} note="Built-in: default, gaia, uncover. Custom: see Settings" />

          <CheatItem title="Speaker notes" code={`<!-- This is a speaker note.
Not visible in the presentation. -->`} />

          <CheatItem title="Split background" code={`<!-- _backgroundImage: url('./a.png') -->
<!-- _backgroundPosition: left -->
<!-- _backgroundSize: 50% -->`} />
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="text-sm font-semibold pb-1"
      style={{
        fontFamily: "var(--font-heading)",
        color: "var(--accent-primary)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      {children}
    </h3>
  );
}

function CheatItem({
  title,
  code,
  note,
}: {
  title: string;
  code: string;
  note?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span
        className="text-xs font-medium"
        style={{
          fontFamily: "var(--font-body)",
          color: "var(--fg-primary)",
        }}
      >
        {title}
      </span>
      <pre
        className="text-[11px] leading-relaxed px-2 py-1.5 rounded overflow-x-auto"
        style={{
          fontFamily: "var(--font-mono)",
          color: "var(--fg-secondary)",
          backgroundColor: "var(--surface-card)",
          whiteSpace: "pre-wrap",
          margin: 0,
        }}
      >
        {code}
      </pre>
      {note && (
        <span
          className="text-[10px]"
          style={{
            fontFamily: "var(--font-caption)",
            color: "var(--fg-muted)",
          }}
        >
          {note}
        </span>
      )}
    </div>
  );
}
