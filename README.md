# Taylor Research Lab website

Public website: https://dtaylorlab.org

This site uses GitHub Pages and Jekyll. Shared layouts and styles keep pages consistent; there is no application server or database.

## Edit your profile

1. Open your Markdown file in `people/<your-name>/index.md`.
2. Click the pencil on GitHub. Keep the `---` metadata block at the top and write your biography below it.
3. Add headings, paragraphs, research interests, publication links, and other public information in Markdown.
4. Propose your change on a branch and open a pull request. A repository maintainer can review and merge it.

Profile files:
- Deanne M. Taylor: `people/deanne-taylor/index.md`
- Ben Stear: `people/ben-stear/index.md`
- Erin Reichenberger: `people/erin-reichenberger/index.md`
- Taha Mohseni Ahooyi: `people/taha-mohseni-ahooyi/index.md`
- Yuanchao Zhang: `people/yuanchao-zhang/index.md`
- Kat Beigel: `people/kat-beigel/index.md`
- Aditya Lahiri: `people/aditya-lahiri/index.md`
- James Terry: `people/james-terry/index.md`

New member pages initially contain names only. Add roles, degrees, biographies, photos, and links only when supplied or confirmed by that person. Everything committed here is public. Do not add passwords, unpublished confidential material, or personal details that should remain private.

## Site structure

- `index.html`: homepage overview, short preprints preview, news and contact
- `research/index.html`: research programs and public software/data
- `people/index.html`: lab directory and profile links
- `people/*/index.md`: individual member homepages
- `publications/index.html`: selected papers and preprints
- `_layouts/default.html`: shared page header, navigation and footer
- `_layouts/member.html`: shared individual-profile layout
- `styles.css` and `site.js`: shared styling and mobile navigation
- `CNAME`: the custom domain; keep it as `dtaylorlab.org`

## Publication updates

Use verified titles, years and links. Keep preprints clearly labeled as not peer reviewed. The compact preprint lists on the homepage and Publications page should be updated together. Add real entries only.

Merging into `main` triggers the GitHub Pages build. Check the repository’s Actions tab for a successful `pages build and deployment` run before treating an update as published. For local previews, use a current GitHub Pages/Jekyll development environment; GitHub’s deployment remains the publication check.
