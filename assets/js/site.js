/* HIGenNTO project page — pill-switcher modules + lazy video loading.
   Data below is the single wiring point between page and media files
   (populated by scratch/site_assets/build_assets.sh).
   Metrics come from paper_ready_metrics/summary.md — the SAME eval run the
   rollout renders come from (job 9581913), the one lineage where numbers may
   sit next to videos. */

const PALETTE = {
  slalom: "#255CDE", pickupbox: "#F16F1D", ppt: "#EDA81F", climbup: "#53B03C",
  climbdown: "#0AA199", stepupdown: "#784AE6", chairsit: "#E0383B",
  chairstand: "#D9409E", pushbox: "#14BD6E", crawlunder: "#A3CC1A",
  duckunder: "#17A3F5", sidegap: "#AB2BF0",
};

const LABELS = {
  slalom: "Slalom Walking", pickupbox: "Pick and Place Box",
  ppt: "Pick and Place on Table", climbup: "Climbing Stairs",
  climbdown: "Descending Stairs", stepupdown: "Step Up/Down",
  chairsit: "Sit on a Chair", chairstand: "Standing Up",
  pushbox: "Push a Box", crawlunder: "Crawl Under",
  duckunder: "Duck Under", sidegap: "Squeeze Through Gap",
};

/* ------- kinematic gallery: 8 evaluated + 4 agent-authored ------- */
const KINEMATIC = [
  { key: "slalom",     caption: "Slalom Walking: generated motion sequence among obstacles." },
  { key: "pickupbox",  caption: "Pick and Place Box: grasp, carry, and set down a box." },
  { key: "ppt",        caption: "Pick and Place on Table: a four-stage long-horizon sequence composed window by window." },
  { key: "climbup",    caption: "Climbing Stairs: contact-consistent stair ascent." },
  { key: "climbdown",  caption: "Descending Stairs: stable support on the way down." },
  { key: "stepupdown", caption: "Step Up/Down: one decisive rise, a dwell, one decisive drop." },
  { key: "chairsit",   caption: "Sit on a Chair: approach, turn, and lower onto the seat." },
  { key: "chairstand", caption: "Standing Up: lean, push up, rise, and walk off." },
  { key: "crawlunder", caption: "Crawl Under: agent-authored task program.", agent: true },
  { key: "duckunder",  caption: "Duck Under: agent-authored task program.", agent: true },
  { key: "sidegap",    caption: "Squeeze Through Gap: agent-authored task program.", agent: true },
  { key: "pushbox",    caption: "Push a Box: agent-authored task program.", agent: true },
];

/* ------- rollout module: availability mirrors what the eval produced -------
   (an absent cell is honest: e.g. no teacher failure exists where the teacher
   is ~100%, no SONIC success exists where it never succeeded) */
const ROLLOUTS = {
  slalom:     { metrics: [97.4, 62.4, 2.7],  teacher: ["succ", "fail"], student: ["succ", "fail"], sonic: ["succ", "fail"] },
  pickupbox:  { metrics: [99.5, 81.0, 8.0],  teacher: ["succ", "fail"], student: ["succ", "fail"], sonic: ["fail"] },
  ppt:        { metrics: [71.2, 56.8, 0.0],  teacher: ["succ", "fail"], student: ["succ", "fail"], sonic: ["fail"] },
  climbup:    { metrics: [99.7, 96.6, 0.2],  teacher: ["succ"],         student: ["succ", "fail"], sonic: ["fail"] },
  climbdown:  { metrics: [99.5, 96.2, 67.5], teacher: ["succ"], student: ["succ", "fail"], sonic: ["succ", "fail"] },
  stepupdown: { metrics: [100.0, 98.3, 0.2], teacher: ["succ"],         student: ["succ", "fail"], sonic: ["fail"] },
  chairsit:   { metrics: [99.9, 88.2, 18.3], teacher: ["succ"],         student: ["succ", "fail"], sonic: ["succ", "fail"] },
  chairstand: { metrics: [97.6, 96.7, 35.4], teacher: ["succ", "fail"], student: ["succ", "fail"], sonic: ["succ", "fail"] },
};
const ARM_LABEL = {
  teacher: "Privileged teacher",
  student: "Depth student",
  sonic: "SONIC (zero-shot)",
};
const ARM_CAPTION = {
  teacher: "Privileged teacher: observes privileged scene state and tracks the generated reference.",
  student: "Depth-conditioned student: onboard depth (inset, top right) and proprioception only; no motion reference, no privileged state.",
  sonic: "SONIC: general-purpose scene-blind motion tracker, zero-shot from released weights. Context baseline, not part of the method.",
};

/* ------- real deployment ------- */
const REAL = [
  { key: "chairsit",   file: "chairsit.mp4" },
  { key: "chairstand", file: "chairstand.mp4" },
  { key: "pickupbox",  file: "pickupbox.mp4" },
  { key: "ppt",        file: "ppt.mp4" },
];

/* ==================== wiring ==================== */

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
}

function setVideo(video, src, poster) {
  if (video.dataset.current === src) return;
  video.dataset.current = src;
  if (poster) video.poster = poster;
  video.innerHTML = "";
  const s = document.createElement("source");
  s.src = src;
  s.type = "video/mp4";
  video.appendChild(s);
  video.load();
  video.play().catch(() => {});
}

function makePill(label, color, opts = {}) {
  const li = el("li", "pill");
  if (color) {
    li.style.setProperty("--taskcolor", color);
    li.appendChild(el("span", "dot"));
  }
  li.appendChild(el("span", null, label));
  if (opts.agent) li.appendChild(el("span", "chip", "agent"));
  return li;
}

/* ---- kinematic gallery ---- */
(function initKinematic() {
  const pills = document.getElementById("kinematic-pills");
  const video = document.getElementById("kinematic-video");
  const caption = document.getElementById("kinematic-caption");
  if (!pills) return;
  KINEMATIC.forEach((t, i) => {
    const pill = makePill(LABELS[t.key], PALETTE[t.key], { agent: t.agent });
    pill.addEventListener("click", () => {
      pills.querySelectorAll(".pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      caption.textContent = t.caption;
      setVideo(video, `assets/media/kinematic/${t.key}.mp4`, `assets/media/kinematic/${t.key}_poster.jpg`);
    });
    pills.appendChild(pill);
    if (i === 0) pill.click();
  });
})();

/* ---- rollout module ---- */
(function initRollouts() {
  const taskPills = document.getElementById("rollout-task-pills");
  const armPills = document.getElementById("rollout-arm-pills");
  const video = document.getElementById("rollout-video");
  const caption = document.getElementById("rollout-caption");
  const metrics = document.getElementById("rollout-metrics");
  const failToggle = document.getElementById("rollout-fail-toggle");
  if (!taskPills) return;

  let task = "climbup", arm = "student", kind = "succ";

  function update() {
    const rec = ROLLOUTS[task];
    const kinds = rec[arm] || [];
    if (!kinds.includes(kind)) kind = kinds[0];
    if (!kind) { caption.textContent = "No rollout was produced for this arm."; return; }
    setVideo(video,
      `assets/media/rollouts/${task}_${arm}_${kind}.mp4`,
      `assets/media/rollouts/${task}_${arm}_${kind}_poster.jpg`);
    caption.textContent = ARM_CAPTION[arm] + (kind === "fail" ? " (failure case)" : "");
    const [t, s, so] = rec.metrics;
    metrics.textContent =
      `${LABELS[task]} task success: teacher ${t}%, student ${s}%, SONIC ${so}%`;
    metrics.title = "";
    const hasFail = kinds.includes("fail") && kinds.includes("succ");
    failToggle.hidden = !hasFail;
    failToggle.textContent = kind === "fail" ? "back to a success case" : "see a failure case";
  }

  Object.keys(ROLLOUTS).forEach((key, i) => {
    const pill = makePill(LABELS[key], PALETTE[key]);
    pill.addEventListener("click", () => {
      taskPills.querySelectorAll(".pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      task = key; kind = "succ"; update();
    });
    taskPills.appendChild(pill);
    if (key === task) pill.classList.add("active");
  });

  ["teacher", "student", "sonic"].forEach(a => {
    const pill = makePill(ARM_LABEL[a], null);
    if (a === arm) pill.classList.add("active");
    pill.addEventListener("click", () => {
      armPills.querySelectorAll(".pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      arm = a; kind = "succ"; update();
    });
    armPills.appendChild(pill);
  });

  failToggle.addEventListener("click", e => {
    e.preventDefault();
    kind = kind === "fail" ? "succ" : "fail";
    update();
  });

  update();
})();

/* ---- real deployment ---- */
(function initReal() {
  const pills = document.getElementById("real-pills");
  const video = document.getElementById("real-video");
  const caption = document.getElementById("real-caption");
  if (!pills) return;
  REAL.forEach((t, i) => {
    const pill = makePill(LABELS[t.key], PALETTE[t.key]);
    pill.addEventListener("click", () => {
      pills.querySelectorAll(".pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      caption.textContent = LABELS[t.key] + ": Unitree G1, onboard depth and proprioception.";
      setVideo(video, `assets/media/real/${t.file}`, `assets/media/real/${t.key}_poster.jpg`);
    });
    pills.appendChild(pill);
    if (i === 0) pill.click();
  });
})();

/* ---- top bar: highlight the section in view ---- */
(function scrollSpy() {
  const bar = document.querySelector(".topbar");
  const list = document.getElementById("topbar-links");
  if (!bar || !list) return;
  const links = Array.from(list.querySelectorAll("a[href^='#']"));
  const sections = links
    .map(a => document.getElementById(a.getAttribute("href").slice(1)))
    .filter(Boolean);
  const linkFor = {};
  links.forEach(a => { linkFor[a.getAttribute("href").slice(1)] = a; });

  function update() {
    const probe = window.scrollY + bar.offsetHeight + 80;
    let current = null;
    sections.forEach(s => { if (s.offsetTop <= probe) current = s; });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
      current = sections[sections.length - 1];
    }
    links.forEach(a => a.classList.toggle("active", current && a === linkFor[current.id]));
    if (current) {
      const a = linkFor[current.id];
      if (a.offsetLeft < bar.scrollLeft || a.offsetLeft + a.offsetWidth > bar.scrollLeft + bar.clientWidth) {
        bar.scrollTo({ left: a.offsetLeft - 24, behavior: "smooth" });
      }
    }
  }
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update, { passive: true });
  update();
})();

/* ---- pause offscreen autoplaying videos ---- */
(function lazyPause() {
  if (!("IntersectionObserver" in window)) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(en => {
      const v = en.target;
      if (en.isIntersecting) { v.play().catch(() => {}); }
      else if (!v.paused) { v.pause(); }
    });
  }, { rootMargin: "120px" });
  document.querySelectorAll("video[muted]").forEach(v => obs.observe(v));
})();
