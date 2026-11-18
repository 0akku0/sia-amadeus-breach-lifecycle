(function () {
  "use strict";

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const srcKeys = Object.keys(SOURCES);

  function cite(keys) {
    return '<span class="cite">Source' + (keys.length > 1 ? "s" : "") + ": " + keys.map((k) => {
      const s = SOURCES[k];
      return '<a href="' + esc(s.url) + '" target="_blank" rel="noopener" title="' + esc(s.label) + '">[' + (srcKeys.indexOf(k) + 1) + "]</a>";
    }).join(" ") + "</span>";
  }
  const pill = (tag) => '<span class="pill ' + tag + '">' + (tag === "confirmed" ? "Confirmed" : "Inferred") + "</span>";
  const delay = (i, step) => ' style="transition-delay:' + Math.min(i * step, 600) + 'ms"';

  /* ---------- Hero stats with count-up ---------- */
  $("#stats").innerHTML = STATS.map((s, i) =>
    '<div class="stat reveal"' + delay(i, 90) + '><b data-count="' + esc(s.value) + '">' + esc(s.value) + "</b><span>" + esc(s.label) + "</span></div>"
  ).join("");

  function countUp(el) {
    const m = el.dataset.count.match(/^(\D*)([\d,]+)(.*)$/);
    if (!m || reduced) return;
    const target = parseInt(m[2].replace(/,/g, ""), 10);
    const t0 = performance.now(), dur = 1400;
    function tick(now) {
      const p = Math.min((now - t0) / dur, 1);
      const v = Math.round(target * (1 - Math.pow(1 - p, 3)));
      el.textContent = m[1] + v.toLocaleString("en-US") + m[3];
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- Timeline ribbon ---------- */
  (function ribbon() {
    const start = Date.parse("2023-07-01"), end = Date.parse("2026-11-20");
    const pct = (iso) => ((Date.parse(iso) - start) / (end - start)) * 100;
    const dL = pct("2023-08-10"), dR = pct("2026-09-23"), bL = pct("2026-10-20"), bR = pct("2026-11-04");
    $("#ribbon").innerHTML =
      '<span class="cap red"><span class="long">Undetected access: </span>~37 months</span>' +
      '<span class="cap green"><span class="long">Disclosures: about </span>2 weeks</span>' +
      '<div class="track"></div>' +
      '<div class="dwell" style="left:' + dL + "%;--w:" + (dR - dL) + '%"></div>' +
      '<div class="burst" style="left:' + bL + "%;width:" + Math.max(bR - bL, 1) + '%"></div>' +
      ["2024", "2025", "2026"].map((y) => '<span class="lbl" style="left:' + pct(y + "-01-01") + '%">' + y + "</span>").join("");
  })();

  /* ---------- Timeline events ---------- */
  $("#events").innerHTML = TIMELINE.map((e) =>
    '<li class="event reveal' + (e.span ? " span" : "") + '">' +
      "<time>" + esc(e.date) + "</time>" +
      "<div><h3>" + esc(e.title) + pill(e.tag) + "</h3>" +
      "<p>" + esc(e.body) + "</p>" + cite(e.src) + "</div>" +
    "</li>"
  ).join("");

  /* ---------- Diagram ---------- */
  const H = 52;
  const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));
  (function diagram() {
    let out = "";
    out += '<rect class="zone" data-part="zone" x="100" y="104" width="240" height="312" rx="18"></rect>';
    out += '<text class="zone-lbl" x="114" y="407">AMADEUS</text>';

    EDGES.forEach(([a, b]) => {
      const s = byId[a], t = byId[b];
      const y1 = s.y + H / 2, y2 = t.y - H / 2, my = (y1 + y2) / 2;
      out += '<path class="edge" data-a="' + a + '" data-b="' + b + '" d="M' + s.x + "," + y1 + " C" + s.x + "," + my + " " + t.x + "," + my + " " + t.x + "," + y2 + '"></path>';
    });
    // Exfiltration loop back to the attacker, only shown at stage 6
    out += '<path class="edge exfil" data-part="exfil" d="M' + (byId.pnr.x + byId.pnr.w / 2) + "," + byId.pnr.y + " C428," + byId.pnr.y + " 428," + byId.attacker.y + " " + (byId.attacker.x + byId.attacker.w / 2) + "," + byId.attacker.y + '"></path>';
    // SIA's own IT: off the attack path
    out += '<path class="edge safe-link" data-a="sia" data-b="siait" d="M' + byId.sia.x + "," + (byId.sia.y + H / 2) + " L" + byId.siait.x + "," + (byId.siait.y - H / 2) + '"></path>';

    NODES.forEach((n) => {
      out += '<g class="node ' + n.kind + '" data-id="' + n.id + '">' +
        '<rect x="' + (n.x - n.w / 2) + '" y="' + (n.y - H / 2) + '" width="' + n.w + '" height="' + H + '" rx="12"></rect>' +
        '<text class="t" x="' + n.x + '" y="' + (n.y - 3) + '" text-anchor="middle">' + esc(n.label) + "</text>" +
        '<text class="s" x="' + n.x + '" y="' + (n.y + 14) + '" text-anchor="middle">' + esc(n.sub) + "</text>" +
      "</g>";
    });
    $("#diagram").innerHTML = out;
  })();

  // On small screens, zoom the diagram to the parts lit for the current stage.
  const svgEl = $("#diagram");
  const mobile = window.matchMedia("(max-width: 900px)");
  const FULL = [0, 0, 440, 640];
  let vb = FULL.slice(), anim = 0;
  function setVB(v) { svgEl.setAttribute("viewBox", v.map((n) => n.toFixed(1)).join(" ")); }
  function zoomTo(on) {
    let target = FULL;
    if (mobile.matches) {
      let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
      svgEl.querySelectorAll(".lit").forEach((el) => {
        const b = el.getBBox();
        x1 = Math.min(x1, b.x); y1 = Math.min(y1, b.y);
        x2 = Math.max(x2, b.x + b.width); y2 = Math.max(y2, b.y + b.height);
      });
      if (isFinite(x1)) {
        const pad = 18;
        x1 -= pad; y1 -= pad; x2 += pad; y2 += pad;
        // keep a landscape-ish frame so labels stay large
        const minW = 260, minH = 170;
        if (x2 - x1 < minW) { const c = (x1 + x2) / 2; x1 = c - minW / 2; x2 = c + minW / 2; }
        if (y2 - y1 < minH) { const c = (y1 + y2) / 2; y1 = c - minH / 2; y2 = c + minH / 2; }
        target = [x1, y1, x2 - x1, y2 - y1];
      }
    }
    const from = vb.slice(), t0 = performance.now(), dur = reduced ? 0 : 650;
    cancelAnimationFrame(anim);
    (function step(now) {
      const p = dur ? Math.min((now - t0) / dur, 1) : 1;
      const e = 1 - Math.pow(1 - p, 3);
      vb = from.map((f, i) => f + (target[i] - f) * e);
      setVB(vb);
      if (p < 1) anim = requestAnimationFrame(step);
    })(t0);
  }
  let currentStage = null;
  mobile.addEventListener("change", () => currentStage && focus(currentStage));

  function focus(stageId) {
    currentStage = stageId;
    const on = new Set(FOCUS[stageId] || []);
    $$("#diagram .node").forEach((g) => {
      const lit = on.has(g.dataset.id);
      g.classList.toggle("lit", lit);
      g.classList.toggle("dim", !lit);
    });
    $$("#diagram .edge").forEach((p) => {
      const lit = p.dataset.part ? on.has(p.dataset.part) : on.has(p.dataset.a) && on.has(p.dataset.b);
      p.classList.toggle("lit", lit);
    });
    $("#diagram .zone").classList.toggle("lit", on.has("zone"));
    zoomTo(on);
    const st = STAGES.find((s) => s.id === stageId);
    $("#diagramCap").textContent = "Stage " + String(st.n).padStart(2, "0") + " / " + st.name;
  }

  /* ---------- Lifecycle steps ---------- */
  $("#steps").innerHTML = STAGES.map((s) =>
    '<article class="step" data-stage="' + s.id + '" id="stage-' + s.id + '"><div class="step-card">' +
      '<span class="num">' + String(s.n).padStart(2, "0") + "</span> " + pill(s.tag) +
      "<h3>" + esc(s.name) + "</h3>" +
      '<p class="tactic">' + esc(s.tactic) + "</p>" +
      '<p class="what">' + esc(s.what) + "</p>" +
      "<dl>" +
        "<div><dt>Confirmed</dt><dd>" + esc(s.confirmed) + "</dd></div>" +
        "<div><dt>Still unknown</dt><dd>" + esc(s.unknown) + "</dd></div>" +
        "<div><dt>Likely (my analysis)</dt><dd>" + esc(s.likely) + "</dd></div>" +
        '<div class="fix"><dt>Control that would have helped</dt><dd>' + esc(s.control) + "</dd></div>" +
      "</dl>" + cite(s.src) +
    "</div></article>"
  ).join("");

  focus(STAGES[0].id);
  $(".step").classList.add("active");

  const stepIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      $$(".step").forEach((s) => s.classList.toggle("active", s === en.target));
      focus(en.target.dataset.stage);
    });
  }, { rootMargin: "-45% 0px -45% 0px" });
  $$(".step").forEach((s) => stepIO.observe(s));

  /* ---------- Controls ---------- */
  $("#controls").innerHTML = CONTROLS.map((o, oi) => {
    const parts = o.owner.match(/^(.*?)\s*\((.*)\)$/) || [null, o.owner, ""];
    return '<div class="owner"><h3 class="reveal"><small>' + esc(parts[2]) + "</small>" + esc(parts[1]) + "</h3>" +
      o.items.map((i, k) =>
        '<div class="item reveal"' + delay(k, 80) + "><h4>" + esc(i.title) + "</h4><p>" + esc(i.body) + '</p><span class="dom">' + esc(i.domain) + "</span></div>"
      ).join("") +
    "</div>";
  }).join("");

  /* ---------- Takeaways and sources ---------- */
  $("#takeawaysList").innerHTML = TAKEAWAYS.map((t, i) => '<li class="reveal"' + delay(i, 70) + ">" + esc(t) + "</li>").join("");
  $("#sourcesList").innerHTML = Object.values(SOURCES).map((s) =>
    '<li><a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.label) + "</a></li>"
  ).join("");

  /* ---------- Scroll reveal ---------- */
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("in");
      en.target.querySelectorAll("[data-count]").forEach(countUp);
      revealIO.unobserve(en.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
  $$(".reveal").forEach((el) => revealIO.observe(el));

  /* ---------- Scroll-linked: progress bar, nav, timeline rail ---------- */
  const progress = $("#progress"), nav = $(".topnav"), railFill = $("#railFill");
  const eventsWrap = $(".events-wrap"), events = $$(".event");
  const links = $$(".links a");
  const sections = links.map((l) => document.querySelector(l.getAttribute("href")));
  let ticking = false;

  function onScroll() {
    ticking = false;
    const y = window.scrollY, vh = window.innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    progress.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
    nav.classList.toggle("scrolled", y > 8);

    const r = eventsWrap.getBoundingClientRect();
    const line = vh * 0.62;
    railFill.style.height = Math.max(0, Math.min(line - r.top, r.height)) + "px";
    events.forEach((ev) => ev.classList.toggle("lit", ev.getBoundingClientRect().top + 12 < line));

    let current = -1;
    sections.forEach((s, i) => { if (s.getBoundingClientRect().top < vh * 0.4) current = i; });
    links.forEach((l, i) => l.classList.toggle("on", i === current));
  }
  window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();
})();
