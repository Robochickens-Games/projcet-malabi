---
name: gazette-publishing-paused
description: The Malabi Daily is paused as of 2026-07-22 (Gidi) — no new editions publish on commit; the build-wiki workflow is manual-dispatch only until further notice
owner: gidi
scope: shared
created: 2026-07-22
tags: [gazette, process, publishing, paused]
---

# The Malabi Daily is paused (2026-07-22)

**Gidi's call, 2026-07-22:** stop posting new updates to the Malabi Daily until
further notice. Work continues as normal — this only changes *publishing*, not
capture. Memories, ADRs and commits still land in the brain the usual way.

**How it's paused:** the `push:` trigger in `.github/workflows/build-wiki.yml` is
commented out (not deleted), so no edition prints on commit. `workflow_dispatch`
still works — Actions → build-wiki → Run workflow, or `gh workflow run build-wiki`.

**Side effect worth knowing:** that same workflow bundles the playable prototype to
`<pages-url>/prototype/`, so **the GitHub Pages copy of the prototype also stops
refreshing** while this is paused. The Vercel deploys
([[prototype-parallax-first-slice]]) are separate and unaffected — use those, or
dispatch the workflow manually, if you need a fresh hosted build.

**To resume:** uncomment the `push:` block in the workflow. Nothing else to undo.

Related: [[project-gazette]], [[daily-notes]].
