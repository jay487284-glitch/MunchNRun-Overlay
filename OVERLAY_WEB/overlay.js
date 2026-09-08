(() => {
  "use strict";
  const params = new URLSearchParams(location.search);
  const api = (params.get("api") || "").replace(/\/$/, "");
  const anon = params.get("anon") || "";
  const channel = params.get("channel") || "";
  const read = params.get("read") || "";
  const root = document.getElementById("overlay");
  const cards = document.getElementById("cards");
  const title = document.getElementById("title");
  const template = document.getElementById("card-template");
  let lastPayload = "";

  function followIcon() {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 64 64");
    svg.classList.add("follow-icon");
    const path = document.createElementNS(ns, "path");
    path.setAttribute("fill", "#52d689");
    path.setAttribute("d", "M25 30a12 12 0 1 0 0-24 12 12 0 0 0 0 24Zm0 5C12 35 6 42 6 54h36c0-12-5-19-17-19Zm27-18h-7v7h-7v6h7v7h7v-7h7v-6h-7Z");
    svg.appendChild(path);
    return svg;
  }

  function iconFor(card) {
    const slot = document.createElement("div");
    if (card.event_type === "like") {
      slot.className = "heart";
      const amount = document.createElement("span");
      amount.textContent = Number(card.trigger_count || 1).toLocaleString();
      slot.appendChild(amount);
      return slot;
    }
    if (card.event_type === "follow") return followIcon();
    if (card.gift_image_url && /^https:\/\//i.test(card.gift_image_url)) {
      const image = document.createElement("img");
      image.className = "gift-image";
      image.alt = "";
      image.referrerPolicy = "no-referrer";
      image.src = card.gift_image_url;
      image.addEventListener("error", () => {
        image.replaceWith(fallbackGift(card));
      }, { once: true });
      slot.appendChild(image);
    } else {
      slot.appendChild(fallbackGift(card));
    }
    if (Number(card.trigger_count || 1) !== 1) {
      const count = document.createElement("span");
      count.className = "gift-count";
      count.textContent = `x${card.trigger_count}`;
      slot.appendChild(count);
    }
    return slot;
  }

  function fallbackGift(card) {
    const fallback = document.createElement("span");
    fallback.className = "fallback-gift";
    const colors = { red: "#ef4856", pink: "#f77ebe", cyan: "#4dd5eb", orange: "#f6a646" };
    fallback.style.setProperty("--hunter", colors[card.hunter_type] || "#f6d63f");
    return fallback;
  }

  function render(payload) {
    const serialized = JSON.stringify(payload);
    if (serialized === lastPayload) return;
    lastPayload = serialized;
    const layout = ["horizontal", "vertical", "compact"].includes(payload.layout) ? payload.layout : "horizontal";
    cards.className = `${layout} ${payload.display_mode === "icon_only" ? "icon-only" : "icon-text"}`;
    root.style.setProperty("--scale", String(Math.max(.5, Math.min(2, Number(payload.scale_percent || 100) / 100))));
    title.hidden = !payload.show_title || !payload.title;
    title.textContent = payload.title || "";
    cards.replaceChildren();
    for (const card of Array.isArray(payload.cards) ? payload.cards : []) {
      const node = template.content.firstElementChild.cloneNode(true);
      node.querySelector(".icon-slot").appendChild(iconFor(card));
      node.querySelector(".label").textContent = card.label || "TRIGGER";
      node.querySelector(".action").textContent = card.action_text || "";
      node.dataset.giftId = card.gift_id || "";
      cards.appendChild(node);
    }
  }

  async function refresh() {
    if (!/^https:\/\//i.test(api) || !anon || !channel || !read) return;
    try {
      const response = await fetch(`${api}/rest/v1/rpc/read_mnr_overlay`, {
        method: "POST",
        cache: "no-store",
        headers: { "apikey": anon, "Content-Type": "application/json" },
        body: JSON.stringify({ p_channel_id: channel, p_read_token: read })
      });
      if (!response.ok) return;
      const payload = await response.json();
      if (payload && typeof payload === "object") render(payload);
    } catch (_) {
      // Keep the last valid state during short network interruptions.
    }
  }

  refresh();
  setInterval(refresh, 2000);
})();
