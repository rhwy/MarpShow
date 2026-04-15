/**
 * Seed script — creates sample presentations in the data folder.
 * Run via: npx tsx scripts/seed-data.ts
 */

import { FilesystemPresentationRepository } from "../src/infrastructure/storage";
import { createPresentation } from "../src/core/domain";
import type { Presentation } from "../src/core/domain";

const STORAGE_PATH = process.env.STORAGE_PATH ?? "/data/presentations";

const samples: Presentation[] = [
  {
    ...createPresentation(
      "demo-api-guide",
      "Building Modern APIs",
      "A practical guide to REST and GraphQL",
    ),
    markdown: `---
marp: true
theme: default
paginate: true
---

# Building Modern APIs

A practical guide to REST and GraphQL

---

## What is an API?

- **A**pplication **P**rogramming **I**nterface
- Contract between software systems
- Enables data exchange and integration

---

## REST vs GraphQL

| Feature | REST | GraphQL |
|---------|------|---------|
| Endpoints | Multiple | Single |
| Data fetching | Fixed structure | Flexible queries |
| Versioning | URL-based | Schema evolution |

---

## REST Fundamentals

- Resources identified by URLs
- HTTP verbs: GET, POST, PUT, DELETE
- Stateless communication
- JSON as standard format

---

## GraphQL Fundamentals

- Single endpoint, typed schema
- Client specifies exact data needed
- Subscriptions for real-time updates
- Introspection built-in

---

## Code Examples

\`\`\`javascript
// REST
fetch('/api/users/1')

// GraphQL
query { user(id: 1) { name, email } }
\`\`\`

---

## Summary & Resources

- Choose based on your use case
- REST for simplicity, GraphQL for flexibility
- Both are valid, modern approaches
`,
  },
  {
    ...createPresentation(
      "demo-design-system",
      "Design System v2",
      "Component library updates and migration guidelines",
    ),
    markdown: `---
marp: true
theme: default
paginate: true
---

# Design System v2

Component library updates and migration guidelines

---

## What's New

- Refreshed color palette
- Improved accessibility (WCAG AA)
- New component variants
- Dark mode support

---

## Color Palette

- **Primary:** Purple (#A855F7)
- **Secondary:** Pink (#EC4899)
- **Neutral:** Zinc scale
- **Semantic:** Success, Warning, Error

---

## Migration Guide

1. Update the package to v2
2. Replace deprecated tokens
3. Test dark mode rendering
4. Review accessibility audit

---

## Questions?

Reach out to the Design Systems team.
`,
  },
  {
    ...createPresentation(
      "demo-onboarding",
      "Engineering Onboarding",
      "Welcome guide for new team members",
    ),
    markdown: `---
marp: true
theme: default
paginate: true
---

# Engineering Onboarding

Welcome to the team!

---

## First Week Checklist

- [ ] Set up development environment
- [ ] Read the architecture docs
- [ ] Complete security training
- [ ] Meet your onboarding buddy

---

## Tech Stack Overview

- **Frontend:** React + TypeScript
- **Backend:** Node.js + PostgreSQL
- **Infrastructure:** Docker + Kubernetes
- **CI/CD:** GitHub Actions

---

## Key Contacts

- **Engineering Lead:** Ask about architecture
- **DevOps:** Infrastructure and deployments
- **Product:** Feature priorities and roadmap

---

## Resources

- Internal wiki for documentation
- Slack channels for team communication
- Weekly engineering all-hands on Fridays
`,
  },
];

async function seed() {
  const repo = new FilesystemPresentationRepository(STORAGE_PATH);

  for (const sample of samples) {
    const exists = await repo.exists(sample.metadata.id);
    if (exists) {
      console.log(`  ⏭  Skipping "${sample.metadata.title}" (already exists)`);
      continue;
    }
    await repo.create(sample);
    console.log(`  ✅ Created "${sample.metadata.title}"`);
  }
}

seed()
  .then(() => console.log("Done."))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
