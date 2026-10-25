# Rudra Chakraborty — Portfolio

Public portfolio containing the author's finalized 10 projects and 21 supporting files.

The website preserves the authored project titles, descriptions, tags, thumbnails, portrait, resume and attachments. Editing and upload controls are available in the separately retained local admin portfolio; the public website provides browsing, filtering, media previews, downloads and inquiries.

## Source

- `index.html`: the portfolio layout and project cards.
- `portfolio-data.json`: the finalized project content and attachment references.
- `portfolio.js`: visitor interactions, media viewing and inquiry handling.
- `assets/`: original asset bytes, deduplicated by SHA-256.
- `preservation-manifest.json`: original asset checksums, sizes and project file names.

The large Mira demonstration video uses Git LFS. Clone with Git LFS installed, or run `git lfs pull` after cloning. The publication workflow retrieves the original video before uploading the website.

## Publish

GitHub Pages is configured to use GitHub Actions. Pushing to `main` or running **Publish portfolio** manually verifies every asset checksum and deploys the visitor website.

For a local build, run `python scripts/build_site.py`, then serve `dist/` with an HTTP server. The inquiry form uses FormSubmit and may require recipient inbox activation; no mail-service credentials are stored in the repository.
