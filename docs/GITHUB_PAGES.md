# Temporary owner preview on GitHub Pages

The preview is built separately from the VPS release. Source stays on `redesign/perfect-springs`; only the compiled static website is published on `gh-pages`.

## Build

```sh
npm ci
npm run build:pages
```

Publish the contents of `dist/pages/`, including `.nojekyll`, to the root of `gh-pages`. Default destination: https://tenprojects.github.io/perfectsprings/. For another repository, set `PAGES_URL` before building.

## One-time owner setting

A repository administrator, maintainer, or a member with permission to manage Pages must open:

https://github.com/TENProjects/perfectsprings/settings/pages

Under **Build and deployment**, choose **Deploy from a branch**, select **gh-pages**, choose **/(root)**, and save. Wait for the Pages build to succeed, then open the preview URL. Source-code push permission alone does not grant access to this setting.

Do not add a CNAME or change production-domain DNS for this temporary preview. To end the preview, use the repository's Pages settings to unpublish it after the owner finishes reviewing.

## Preview behavior

All 29 pages, product exploration, brand artwork, theme switching and the water preloader are included. Relative URLs support the `/perfectsprings/` project subpath. The preview sends no enquiry data: forms show “Preview only” with direct contact alternatives, because the Node API is hosted separately. Production/VPS enquiries remain unchanged.

The preview requests no search indexing through robots metadata and `robots.txt`; GitHub Pages remains a public website.

[GitHub publishing-source documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
