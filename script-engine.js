// =========================================================================
// STANDALONE SCRIPT-TO-VIDEO ENGINE (script-engine.js)
// Directly connects any script or voice input to dynamic 3D scenes & audio
// =========================================================================
(function () {
  let activeTimeline = [];
  let motionPropGroup = null;
  let stageGroup = null;
  let currentTheme = "iman"; // "iman" | "cyber" | "cartoon"
  let studioBassBoost = 8;

  const THEMES = {
    iman:    { bg: "#090a0f", floor: "#141824", primary: "#f5b942", secondary: "#10b981" },
    cyber:   { bg: "#050d1a", floor: "#0b192c", primary: "#38bdf8", secondary: "#a855f7" },
    cartoon: { bg: "#38bdf8", floor: "#4ade80", primary: "#facc15", secondary: "#f43f5e" }
  };

  // 1. ACCESS THE 3D STAGE SAFELY
  function getStage() {
    if (window.scene) return window.scene;
    if (typeof threeScene !== "undefined") return threeScene;
    return null;
  }

  // 2. HIDE STATIC TABLE & BUILD DYNAMIC 3D MOTION GRAPHICS FOR EACH SENTENCE
  function renderDynamicScene(visualType, charMode) {
    const s = getStage();
    if (!s || typeof THREE === "undefined") return;

    // Hide any old static desk meshes automatically
    s.traverse(obj => {
      if (obj.isGroup && obj.children.length > 3 && obj.position.y === 0 && obj !== stageGroup) {
        if (obj.name === "desk") obj.visible = false;
      }
    });

    if (stageGroup) s.remove(stageGroup);
    stageGroup = new THREE.Group();
    stageGroup.name = "DynamicScriptStage";

    const theme = THEMES[currentTheme] || THEMES.iman;
    s.background = new THREE.Color(theme.bg);

    // Sleek circular 3D studio floor
    const floor = new THREE.Mesh(
      new THREE.CylinderGeometry(3.2, 3.2, 0.08, 32),
      new THREE.MeshStandardMaterial({ color: theme.floor, metalness: 0.4, roughness: 0.3 })
    );
    floor.position.set(0, -0.04, 0);
    stageGroup.add(floor);

    // Floating 3D Motion Graphic matching the script phrase
    motionPropGroup = new THREE.Group();
    motionPropGroup.position.set(0.55, 1.35, -0.2);

    if (visualType === "chart") {
      // Iman Gadzhi Style Rising 3D Growth Bars
      [0.35, 0.7, 1.15].forEach((h, i) => {
        const bar = new THREE.Mesh(
          new THREE.BoxGeometry(0.16, h, 0.16),
          new THREE.MeshStandardMaterial({ color: i === 2 ? theme.secondary : theme.primary, metalness: 0.5 })
        );
        bar.position.set((i - 1) * 0.24, h / 2 - 0.45, 0);
        motionPropGroup.add(bar);
      });
    } else if (visualType === "coin") {
      // Spinning 3D Gold Wealth Coin
      const coin = new THREE.Mesh(
        new THREE.CylinderGeometry(0.34, 0.34, 0.07, 24),
        new THREE.MeshStandardMaterial({ color: theme.primary, metalness: 0.85, roughness: 0.2 })
      );
      coin.rotation.x = Math.PI / 2;
      motionPropGroup.add(coin);
    } else if (visualType === "hologram") {
      // Glowing 3D AI Wireframe Core
      const outer = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.36, 0),
        new THREE.MeshStandardMaterial({ color: theme.primary, wireframe: true })
      );
      const inner = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 16, 16),
        new THREE.MeshBasicMaterial({ color: theme.secondary })
      );
      motionPropGroup.add(outer, inner);
    } else if (visualType === "action") {
      // Dramatic Red/Gold Impact Ring for Conflict/Action phrases
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.34, 0.07, 12, 24),
        new THREE.MeshStandardMaterial({ color: "#ef4444", emissive: "#7f1d1d" })
      );
      motionPropGroup.add(ring);
    }

    stageGroup.add(motionPropGroup);
    s.add(stageGroup);

    // Switch character interaction mode automatically
    const modeSelect = document.getElementById("sceneMode");
    if (modeSelect && modeSelect.value !== charMode) {
      modeSelect.value = charMode;
      modeSelect.dispatchEvent(new Event("change"));
    }
  }

  // 3. PARSE SCRIPT DIRECTLY INTO UNIQUE, NON-REPEATING VIDEO SCENES
  const VISUAL_CYCLE = ["chart", "coin", "hologram", "action"];

  function compileScriptToVideo(rawScript) {
    const phrases = rawScript
      .split(/(?<=[,.!?])|\b(?=and\b|then\b|but\b|so\b)/i)
      .map(s => s.trim())
      .filter(Boolean);

    let timeCursor = 0;

    activeTimeline = phrases.map((phrase, idx) => {
      const duration = Math.max(1.4, phrase.split(/\s+/).length * 0.42);
      const lower = phrase.toLowerCase();

      // Match specific keywords OR rotate visuals automatically so every sentence is fresh
      let visual = VISUAL_CYCLE[idx % VISUAL_CYCLE.length];
      let charMode = idx % 2 === 0 ? "desk" : "two_talk";

      if (/fight|hit|punch|attack|rival|angry|war/.test(lower)) {
        visual = "action";
        charMode = "two_fight";
      } else if (/money|rich|profit|grow|20%|dollar|win|business/.test(lower)) {
        visual = "chart";
        charMode = "desk";
      } else if (/gold|luxury|watch|coin|empire|buy/.test(lower)) {
        visual = "coin";
        charMode = "desk";
      } else if (/ai|smart|tech|future|system|brain|phone/.test(lower)) {
        visual = "hologram";
        charMode = "two_talk";
      }

      const sceneNode = {
        id: idx,
        text: phrase,
        visual: visual,
        charMode: charMode,
        start: timeCursor,
        end: timeCursor + duration
      };
      timeCursor += duration;
      return sceneNode;
    });

    if (activeTimeline.length > 0) {
      renderDynamicScene(activeTimeline[0].visual, activeTimeline[0].charMode);
    }
    renderCleanControllerUI();
  }

  // 4. INJECT CLEAN TOP CATEGORY BAR & SCENE EDITOR
  function renderCleanControllerUI() {
    if (!document.getElementById("engineTopBar")) {
      const bar = document.createElement("div");
      bar.id = "engineTopBar";
      bar.style.cssText = "display:flex; gap:6px; overflow-x:auto; padding:10px; background:#090a0f; border-bottom:1px solid #262d3d; position:sticky; top:0; z-index:999;";
      bar.innerHTML = `
        <button type="button" data-theme="iman" class="engTab" style="padding:7px 12px; border-radius:20px; border:none; background:#f5b942; color:#000; font-weight:700; font-size:12px; white-space:nowrap;">💰 Iman Motion</button>
        <button type="button" data-theme="cyber" class="engTab" style="padding:7px 12px; border-radius:20px; border:none; background:#161c2c; color:#fff; font-weight:700; font-size:12px; white-space:nowrap;">🔷 Cyber Tech</button>
        <button type="button" data-theme="cartoon" class="engTab" style="padding:7px 12px; border-radius:20px; border:none; background:#161c2c; color:#fff; font-weight:700; font-size:12px; white-space:nowrap;">🧸 Kids Cartoon</button>
      `;
      document.body.insertBefore(bar, document.body.firstChild);

      bar.querySelectorAll(".engTab").forEach(btn => {
        btn.onclick = function () {
          bar.querySelectorAll(".engTab").forEach(b => { b.style.background = "#161c2c"; b.style.color = "#fff"; });
          this.style.background = "#f5b942";
          this.style.color = "#000";
          currentTheme = this.dataset.theme;
          if (activeTimeline.length > 0) {
            renderDynamicScene(activeTimeline[0].visual, activeTimeline[0].charMode);
          }
        };
      });
    }
  }

  // 5. CONTINUOUSLY FLOAT 3D OBJECTS & WATCH FOR SCRIPT/VOICE CHANGES
  setInterval(() => {
    if (motionPropGroup) {
      motionPropGroup.rotation.y += 0.035;
      motionPropGroup.position.y = 1.35 + Math.sin(Date.now() * 0.004) * 0.08;
    }
  }, 30);

  let lastScriptSnapshot = "";
  setInterval(() => {
    const scriptEl = document.getElementById("scriptInput");
    if (scriptEl && scriptEl.value.trim() !== lastScriptSnapshot) {
      lastScriptSnapshot = scriptEl.value.trim();
      compileScriptToVideo(lastScriptSnapshot);
    }
  }, 500);

  // 6. SYNC TIMELINE DURING PLAYBACK & EXPORT
  document.addEventListener("click", e => {
    if (e.target && (e.target.id === "remixBtn" || e.target.id === "replayBtn" || e.target.textContent.includes("AI Build"))) {
      const scriptEl = document.getElementById("scriptInput");
      if (scriptEl) compileScriptToVideo(scriptEl.value);

      const startT = performance.now();
      let lastCueId = -1;
      const playLoop = setInterval(() => {
        const sec = (performance.now() - startT) / 1000;
        const cue = activeTimeline.find(c => sec >= c.start && sec < c.end);
        if (cue && cue.id !== lastCueId) {
          lastCueId = cue.id;
          renderDynamicScene(cue.visual, cue.charMode);
        }
        if (activeTimeline.length > 0 && sec > activeTimeline[activeTimeline.length - 1].end) {
          clearInterval(playLoop);
        }
      }, 120);
    }
  });
})();
