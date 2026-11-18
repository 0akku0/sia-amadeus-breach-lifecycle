(function () {
  "use strict";

  const $ = (sel) => document.querySelector(sel);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const stageById = Object.fromEntries(STAGES.map((s) => [s.id, s]));

  function cite(keys) {
    return '<span class="cite">Source: ' + keys.map((k, i) => {
      const s = SOURCES[k];
      return '<a href="' + esc(s.url) + '" target="_blank" rel="noopener" title="' + esc(s.label) + '">[' + (Object.keys(SOURCES).indexOf(k) + 1) + "]</a>";
    }).join(" ") + "</span>";
  }

  function pill(tag) {
    return '<span class="pill ' + tag + '">' + (tag === "confirmed" ? "Confirmed" : "Inferred") + "</span>";
  }

  /* Stats */
  $("#stats").innerHTML = STATS.map((s) =>
    '<div class="stat"><b>' + esc(s.value) + "</b><span>" + esc(s.label) + "</span></div>"
  ).join("");

  /* Timeline ribbon: proportional view of Aug 2023 to Nov 2026 */
  (function ribbon() {
    const start = Date.parse("2023-08-01");
    const end = Date.parse("2026-11-15");
    const pct = (iso) => ((Date.parse(iso) - start) / (end - start)) * 100;
    const dwellL = pct("2023-08-10");
    const dwellR = pct("2026-09-23");
    const burstL = pct("2026-10-20");
    const burstR = pct("2026-11-04");
    const years = ["2024-01-01", "2025-01-01", "2026-01-01"];
    $("#ribbon").innerHTML =
      '<div class="dwell" style="left:' + dwellL + "%;width:" + (dwellR - dwellL) + '%"></div>' +
      '<span class="lbl dwell-lbl" style="left:calc(' + dwellL + '% + 10px)">Undetected access, ~37 months</span>' +
      '<div class="burst" style="left:' + burstL + "%;width:" + Math.max(burstR - burstL, 0.8) + '%" title="Disclosures: 20 Oct to 4 Nov 2026"></div>' +
      years.map((y) => '<span class="lbl" style="left:' + pct(y) + '%">' + y.slice(0, 4) + "</span>").join("");
  })();

  /* Timeline events */
  $("#events").innerHTML = TIMELINE.map((e) =>
    '<li class="event' + (e.span ? " span" : "") + (e.cluster ? " cluster" : "") + '">' +
      "<time>" + esc(e.date) + "</time> " + pill(e.tag) +
      "<h3>" + esc(e.title) + "</h3>" +
      "<p>" + esc(e.body) + "</p>" + cite(e.src) +
    "</li>"
  ).join("");

  /* Attack path diagram */
  (function diagram() {
    const svg = $("#diagram");
    const W = 150, H = 56;
    const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));
    let out = "";

    // Amadeus zone
    out += '<rect class="zone" x="168" y="140" width="508" height="140" rx="14"></rect>';
    out += '<text class="zone-lbl" x="182" y="162">AMADEUS PLATFORM</text>';

    // Edges: curved from right side of source to left side of target
    EDGES.forEach(([a, b], i) => {
      const s = byId[a], t = byId[b];
      const x1 = s.x + W / 2, y1 = s.y, x2 = t.x - W / 2, y2 = t.y;
      const mx = (x1 + x2) / 2;
      out += '<path class="edge flow" d="M' + x1 + "," + y1 + " C" + mx + "," + y1 + " " + mx + "," + y2 + " " + x2 + "," + y2 + '"></path>';
    });

    // SIA's own IT: shown off the path, with a dashed link to SIA to say "untouched"
    const sia = byId.sia, siait = byId.siait;
    out += '<path class="edge blocked" d="M' + (siait.x + W / 2) + "," + siait.y + " L" + (sia.x - W / 2) + "," + sia.y + '"></path>';

    NODES.forEach((n) => {
      out += '<g class="node ' + n.kind + '" tabindex="0" role="button" data-id="' + n.id + '" aria-label="' + esc(n.label + ", " + n.sub) + '">' +
        '<rect x="' + (n.x - W / 2) + '" y="' + (n.y - H / 2) + '" width="' + W + '" height="' + H + '" rx="10"></rect>' +
        '<text class="t" x="' + n.x + '" y="' + (n.y - 4) + '" text-anchor="middle">' + esc(n.label) + "</text>" +
        '<text class="s" x="' + n.x + '" y="' + (n.y + 14) + '" text-anchor="middle">' + esc(n.sub) + "</text>" +
      "</g>";
    });
    svg.innerHTML = out;

    const panel = $("#nodePanel");
    function select(id) {
      svg.querySelectorAll(".node").forEach((g) => g.classList.toggle("sel", g.dataset.id === id));
      const n = byId[id];
      const st = stageById[n.stage];
      let extra = "";
      if (id === "siait") {
        extra = "<p>Singapore Airlines confirmed its own IT systems were not breached. The data was exposed on the vendor's side. This is the core lesson of a supply-chain breach: your data's security depends on systems you do not run.</p>";
      } else if (n.kind === "victim") {
        extra = "<p>" + esc(n.label) + ": " + esc(n.sub) + ". Each airline's data sat on the same shared Amadeus platform, so one weakness reached all of them.</p>";
      }
      panel.innerHTML =
        "<h3>" + esc(n.label) + " " + pill(st.tag) + "</h3>" +
        extra +
        "<p>" + esc(st.what) + "</p>" +
        '<p class="jump"><a href="#stage-' + st.id + '" data-open="' + st.id + '">Stage ' + st.n + ": " + esc(st.name) + " &rarr;</a></p>";
    }
    svg.addEventListener("click", (e) => {
      const g = e.target.closest(".node");
      if (g) select(g.dataset.id);
    });
    svg.addEventListener("keydown", (e) => {
      if ((e.key === "Enter" || e.key === " ") && e.target.closest(".node")) {
        e.preventDefault();
        select(e.target.closest(".node").dataset.id);
      }
    });
    select("account");
  })();

  /* Lifecycle stages */
  $("#stages").innerHTML = STAGES.map((s) =>
    '<article class="stage" id="stage-' + s.id + '" data-tag="' + s.tag + '">' +
      '<button aria-expanded="false"><span class="n">' + String(s.n).padStart(2, "0") + "</span>" +
        "<span><span class=\"nm\">" + esc(s.name) + " " + pill(s.tag) + '</span><span class="tc">' + esc(s.tactic) + "</span></span>" +
        '<span class="chev" aria-hidden="true">&#9656;</span></button>' +
      '<div class="body">' +
        "<p>" + esc(s.what) + "</p>" +
        "<dl>" +
          "<div><dt>Confirmed</dt><dd>" + esc(s.confirmed) + "</dd></div>" +
          "<div><dt>Still unknown</dt><dd>" + esc(s.unknown) + "</dd></div>" +
          "<div><dt>Likely (my analysis)</dt><dd>" + esc(s.likely) + "</dd></div>" +
          "<div><dt>Control that would have helped</dt><dd class=\"fix\">" + esc(s.control) + "</dd></div>" +
        "</dl>" + cite(s.src) +
      "</div>" +
    "</article>"
  ).join("");

  function toggleStage(el, force) {
    const open = force === undefined ? !el.classList.contains("open") : force;
    el.classList.toggle("open", open);
    el.querySelector("button").setAttribute("aria-expanded", String(open));
  }
  $("#stages").addEventListener("click", (e) => {
    const b = e.target.closest(".stage > button");
    if (b) toggleStage(b.parentElement);
  });
  toggleStage($("#stage-creds"), true);

  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-open]");
    if (!a) return;
    e.preventDefault();
    const el = document.getElementById("stage-" + a.dataset.open);
    el.classList.remove("hidden");
    toggleStage(el, true);
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    el.classList.add("flash");
    setTimeout(() => el.classList.remove("flash"), 1400);
  });

  document.querySelectorAll(".chip").forEach((c) => c.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach((x) => x.classList.toggle("active", x === c));
    const f = c.dataset.filter;
    document.querySelectorAll(".stage").forEach((s) => s.classList.toggle("hidden", f !== "all" && s.dataset.tag !== f));
  }));

  /* Controls */
  $("#controls").innerHTML = CONTROLS.map((o) =>
    '<div class="owner"><h3>' + esc(o.owner) + "</h3>" +
      o.items.map((i) => '<div class="item"><h4>' + esc(i.title) + "</h4><p>" + esc(i.body) + '</p><span class="dom">' + esc(i.domain) + "</span></div>").join("") +
    "</div>"
  ).join("");

  /* Takeaways */
  $("#takeawaysList").innerHTML = TAKEAWAYS.map((t) => "<li>" + esc(t) + "</li>").join("");

  /* Sources */
  $("#sourcesList").innerHTML = Object.values(SOURCES).map((s, i) =>
    "<li>[" + (i + 1) + '] <a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.label) + "</a></li>"
  ).join("");

  /* Highlight current section in nav */
  const links = [...document.querySelectorAll(".toc a")];
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) links.forEach((l) => l.classList.toggle("on", l.getAttribute("href") === "#" + en.target.id));
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  document.querySelectorAll("main section").forEach((s) => io.observe(s));
})();
