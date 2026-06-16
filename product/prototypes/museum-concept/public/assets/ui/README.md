# ui/ — HUD / interface art (optional)

Buttons, frames, the collection-bag icon, cursors, panels — anything chrome.
Reference these from [`src/style.css`](../../../src/style.css), e.g.

```css
.hud-btn{ background-image:url('/assets/ui/btn.png'); }
#bag{ background-image:url('/assets/ui/bag.png'); }
```

The HUD ships styled with CSS so it works with zero art; drop images here and
skin it when you want a more finished look.
