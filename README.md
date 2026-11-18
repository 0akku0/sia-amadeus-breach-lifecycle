# Breach Lifecycle: Singapore Airlines x Amadeus (2026)

An interactive case study of the Amadeus booking-platform breach disclosed in October and November 2026, which exposed about **46,000 Singapore Airlines booking records** without SIA's own systems ever being breached.

**Live site:** https://0akku0.github.io/sia-amadeus-breach-lifecycle/

## What it covers

1. **Timeline** from the first known access (August 2023) to SIA's disclosure (4 November 2026), with a proportional view of the 3-year dwell time against the 3-week disclosure window.
2. **Attack path diagram.** Click a node to see what happened at that point, and where SIA sits relative to the breach.
3. **Lifecycle in 8 stages**, mapped to MITRE ATT&CK tactics and techniques (T1078 Valid Accounts, T1190, T1213, T1552). Each stage separates what is **confirmed**, what is **still unknown**, and what is **likely** based on how similar attacks work.
4. **What could have been done differently**, split by owner (Amadeus as the vendor, SIA as the customer) and mapped to CompTIA Security+ SY0-701 domains.
5. **Takeaways** and a full source list.

## Method

- Facts come only from statements by Amadeus and the affected airlines, as reported by The Record, TechRadar, New Straits Times, The Star, Bloomberg and eSecurity Planet.
- Where sources disagree, the more conservative figure is used.
- Anything not stated publicly is tagged **Inferred** and explained. The root cause had not been published at the time of writing, so the analysis says so instead of guessing.
- Accurate as of 18 November 2026. The PDPC investigation is ongoing.

## Tech

Plain HTML, CSS and JavaScript. No framework and no build step. All content lives in `js/data.js`, so the analysis can be updated without touching the layout.

```
index.html      page structure
css/style.css   styles (responsive, respects reduced motion)
js/data.js      timeline, stages, controls and sources
js/app.js       rendering, SVG attack-path diagram, filters
```

Run locally: open `index.html` in a browser.

## Disclaimer

Independent study project. Not affiliated with Singapore Airlines, Amadeus or any airline named.
