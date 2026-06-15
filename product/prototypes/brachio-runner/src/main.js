import { mountBrachioRunner } from './runner.js'

// Standalone bootstrap: mount the runner full-screen into #app. The reusable engine
// lives in runner.js (also embedded by the museum prototype's brachioGame overlay).
mountBrachioRunner(document.getElementById('app'))
