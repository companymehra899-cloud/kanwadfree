const FALLBACK_PRODUCTS = [
  {
    id: 1, slug: "heritage-lounge-sofa", name: "Heritage Lounge Sofa", dim: "2100x900x850 mm",
    price: 48900, category: "home", category_name: "Home Furniture", colors: ["coka", "red", "gold"],
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80",
    thumbs: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80"
    ],
    specs: ["Solid teak frame", "High-density foam", "Premium fabric upholstery", "Made in India"],
    description: "Comfort-first lounge sofa for living rooms."
  },
  {
    id: 2, slug: "executive-office-desk", name: "Executive Office Desk", dim: "1600x800x750 mm",
    price: 32400, category: "office", category_name: "Office Furniture", colors: ["coka", "gold"],
    image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80",
    thumbs: [
      "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80"
    ],
    specs: ["Engineered wood + veneer", "Cable management", "Soft-close drawers", "Scratch-resistant top"],
    description: "Executive desk with cable management."
  },
  {
    id: 3, slug: "teak-dining-collection", name: "Teak Dining Collection", dim: "1800x900x760 mm",
    price: 54200, category: "home", category_name: "Home Furniture", colors: ["coka", "gold", "yellow"],
    image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80",
    thumbs: [
      "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600585154340-0ef3c08c08be?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?auto=format&fit=crop&w=800&q=80"
    ],
    specs: ["6-seater teak table", "Cushioned chairs", "Natural wood grain", "Indoor use"],
    description: "Six-seater teak dining set."
  },
  {
    id: 4, slug: "modular-workstation", name: "Modular Workstation", dim: "1200x600x750 mm",
    price: 18700, category: "workstation", category_name: "Workstation", colors: ["coka", "red"],
    image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80",
    thumbs: [
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80"
    ],
    specs: ["Modular partitions", "Powder-coated steel", "Wire raceway", "Office / institutional"],
    description: "Modular workstation for offices."
  }
];

const LEGACY = { sofa: "heritage-lounge-sofa", desk: "executive-office-desk", dining: "teak-dining-collection", station: "modular-workstation" };
const KEY = "kanwood_cart";
const USERS_KEY = "kanwood_users";
const SESSION_KEY = "kanwood_session";

let CATALOGUE = FALLBACK_PRODUCTS.slice();

function apiRoot() {
  return "";
}

async function apiGet(path) {
  const res = await fetch(apiRoot() + path);
  if (!res.ok) throw new Error("api");
  return res.json();
}

async function apiPost(path, body) {
  const res = await fetch(apiRoot() + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

function users() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); } catch (e) { return []; }
}

function saveUsers(list) {
  localStorage.setItem(USERS_KEY, JSON.stringify(list));
}

function session() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); } catch (e) { return null; }
}

function setSession(user) {
  if (!user) localStorage.removeItem(SESSION_KEY);
  else localStorage.setItem(SESSION_KEY, JSON.stringify({ name: user.name, email: user.email, phone: user.phone || "" }));
}

function findUser(email) {
  const e = String(email || "").trim().toLowerCase();
  return users().find((u) => u.email === e);
}

function money(n) {
  return "₹" + Number(n).toLocaleString("en-IN");
}

function cart() {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { return []; }
}

function saveCart(items) {
  localStorage.setItem(KEY, JSON.stringify(items));
  paintCount();
}

function findProduct(slug) {
  const s = LEGACY[slug] || slug;
  return CATALOGUE.find((p) => p.slug === s);
}

function addToCart(slug, qty) {
  const p = findProduct(slug);
  if (!p) return;
  const items = cart();
  const found = items.find((x) => x.slug === p.slug);
  const q = Math.max(1, Number(qty) || 1);
  if (found) found.qty += q;
  else items.push({ slug: p.slug, name: p.name, price: p.price, img: p.image, dim: p.dim, qty: q });
  saveCart(items);
}

function paintCount() {
  const n = cart().reduce((s, x) => s + x.qty, 0);
  document.querySelectorAll("[data-cart-count]").forEach((el) => { el.textContent = String(n); });
}

function dotsHtml(colors) {
  return (colors || []).map((c) => `<span class="dot ${c}"></span>`).join("");
}

function cardHtml(p, root) {
  const r = root || "";
  return `
    <a class="pcard" data-cat="${p.category}" href="${r}item.html?slug=${encodeURIComponent(p.slug)}">
      <img src="${p.image}" alt="${p.name}">
      <div class="body">
        <h3>${p.name}</h3>
        <p class="dim">${p.dim || p.category_name || ""}</p>
        <p class="price">${money(p.price)} MRP</p>
        <div class="swatches">${dotsHtml(p.colors)}</div>
        <span class="btn btn-line" style="width:100%;">View Details</span>
      </div>
    </a>`;
}

function renderCart() {
  const box = document.getElementById("cartItems");
  const empty = document.getElementById("cartEmpty");
  const layout = document.getElementById("cartLayout");
  if (!box) return;
  const items = cart();
  if (!items.length) {
    if (empty) empty.style.display = "block";
    if (layout) layout.style.display = "none";
    return;
  }
  if (empty) empty.style.display = "none";
  if (layout) layout.style.display = "grid";
  box.innerHTML = items.map((x) => `
    <div class="item" data-slug="${x.slug}">
      <img src="${x.img}" alt="${x.name}">
      <div>
        <h3>${x.name}</h3>
        <p class="dim">${x.dim || ""}</p>
        <div class="qty">
          <button type="button" data-minus>-</button>
          <input value="${x.qty}" readonly>
          <button type="button" data-plus>+</button>
        </div>
      </div>
      <div class="rm">
        <b>${money(x.price * x.qty)}</b>
        <button type="button" class="btn btn-line" data-rm style="margin-top:8px;">Remove</button>
      </div>
    </div>`).join("");
  const sub = items.reduce((s, x) => s + x.price * x.qty, 0);
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set("subTotal", money(sub));
  set("shipFee", "Quote");
  set("grandTotal", money(sub));
}

function bindCart() {
  const box = document.getElementById("cartItems");
  if (!box) return;
  box.addEventListener("click", (e) => {
    const row = e.target.closest(".item");
    if (!row) return;
    const items = cart();
    const it = items.find((x) => x.slug === row.dataset.slug);
    if (!it) return;
    if (e.target.closest("[data-plus]")) it.qty += 1;
    if (e.target.closest("[data-minus]")) it.qty = Math.max(1, it.qty - 1);
    if (e.target.closest("[data-rm]")) {
      saveCart(items.filter((x) => x.slug !== it.slug));
      renderCart();
      return;
    }
    saveCart(items);
    renderCart();
  });
  const form = document.getElementById("cartEnquiry");
  form && form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const note = document.getElementById("cartNote");
    const items = cart();
    if (!items.length) {
      showNote(note, "Add products first.");
      return;
    }
    const payload = {
      name: document.getElementById("enqName").value.trim(),
      email: document.getElementById("enqEmail").value.trim(),
      phone: document.getElementById("enqPhone").value.trim(),
      message: document.getElementById("enqMsg").value.trim(),
      source: "cart",
      items: items.map((x) => ({ slug: x.slug, name: x.name, qty: x.qty, price: x.price })),
      product_name: items.map((x) => x.name).join(", ")
    };
    try {
      const data = await apiPost("/api/enquiries", payload);
      showNote(note, data.message || "Enquiry sent.", true);
      saveCart([]);
      renderCart();
      form.reset();
    } catch (err) {
      showNote(note, err.message || "Could not send enquiry.");
    }
  });
}

function bindMenu() {
  const burger = document.querySelector(".burger");
  const nav = document.querySelector(".nav");
  const overlay = document.querySelector(".nav-overlay");
  const close = () => {
    nav && nav.classList.remove("open");
    overlay && overlay.classList.remove("show");
    document.body.classList.remove("menu-open");
  };
  burger && burger.addEventListener("click", () => {
    nav && nav.classList.toggle("open");
    overlay && overlay.classList.toggle("show");
    document.body.classList.toggle("menu-open");
  });
  overlay && overlay.addEventListener("click", close);
  const navClose = document.querySelector(".nav-close");
  navClose && navClose.addEventListener("click", close);
  document.querySelectorAll(".has-drop").forEach((item) => {
    const trigger = item.querySelector(":scope > a");
    trigger && trigger.addEventListener("click", (e) => {
      e.preventDefault();
      const wasOpen = item.classList.contains("open");
      document.querySelectorAll(".has-drop").forEach((x) => x.classList.remove("open"));
      if (!wasOpen) item.classList.add("open");
    });
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".has-drop")) {
      document.querySelectorAll(".has-drop").forEach((x) => x.classList.remove("open"));
    }
  });
}

function bindSlider() {
  const slides = document.querySelector(".slides");
  if (!slides) return;
  const n = slides.children.length;
  let i = 0;
  const dots = document.querySelectorAll(".dots button");
  const go = (k) => {
    i = (k + n) % n;
    slides.style.transform = "translateX(-" + i * 100 + "%)";
    dots.forEach((d, idx) => d.classList.toggle("on", idx === i));
  };
  dots.forEach((d, idx) => d.addEventListener("click", () => go(idx)));
  setInterval(() => go(i + 1), 4500);
}

function bindPdp() {
  const add = document.querySelector("[data-add]");
  const buy = document.querySelector("[data-buy]");
  const qty = document.getElementById("qty");
  const id = document.body.dataset.product;
  if (!id && !document.body.dataset.item) return;
  document.querySelectorAll("[data-minus]").forEach((b) => b.addEventListener("click", () => {
    if (qty) qty.value = Math.max(1, Number(qty.value) - 1);
  }));
  document.querySelectorAll("[data-plus]").forEach((b) => b.addEventListener("click", () => {
    if (qty) qty.value = Number(qty.value) + 1;
  }));
  add && add.addEventListener("click", () => {
    const slug = document.body.dataset.slug || LEGACY[id] || id;
    addToCart(slug, qty ? qty.value : 1);
    add.textContent = "Saved to enquiry list";
    setTimeout(() => { add.textContent = "Add to Enquiry"; }, 1200);
  });
  buy && buy.addEventListener("click", () => {
    const slug = document.body.dataset.slug || LEGACY[id] || id;
    addToCart(slug, qty ? qty.value : 1);
    location.href = (document.body.dataset.root || "") + "cart.html";
  });
  const main = document.querySelector(".gallery img.main");
  document.querySelectorAll(".thumbs img").forEach((img) => {
    img.addEventListener("click", () => {
      document.querySelectorAll(".thumbs img").forEach((t) => t.classList.remove("on"));
      img.classList.add("on");
      if (main) main.src = img.src;
    });
  });
  const enq = document.getElementById("pdpEnquiry");
  enq && enq.addEventListener("submit", async (e) => {
    e.preventDefault();
    const note = document.getElementById("pdpNote");
    const slug = document.body.dataset.slug || "";
    const p = findProduct(slug);
    try {
      const data = await apiPost("/api/enquiries", {
        name: document.getElementById("pdpName").value.trim(),
        email: document.getElementById("pdpEmail").value.trim(),
        phone: document.getElementById("pdpPhone").value.trim(),
        message: document.getElementById("pdpMsg").value.trim(),
        product_slug: slug,
        product_name: p ? p.name : "",
        qty: qty ? Number(qty.value) || 1 : 1,
        source: "pdp"
      });
      showNote(note, data.message || "Enquiry sent.", true);
      enq.reset();
    } catch (err) {
      showNote(note, err.message || "Could not send enquiry.");
    }
  });
}

function showNote(el, msg, ok) {
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  el.classList.toggle("ok", !!ok);
}

function bindAuth() {
  const tabs = document.querySelectorAll(".toggle button");
  const login = document.getElementById("loginForm");
  const reg = document.getElementById("regForm");
  const note = document.getElementById("authNote");
  const root = document.body.dataset.root || "";
  const me = session();
  const box = document.getElementById("accountBox");

  if (box) {
    if (!me) {
      location.replace(root + "user/login.html");
      return;
    }
    const n = document.getElementById("accName");
    const e = document.getElementById("accEmail");
    const p = document.getElementById("accPhone");
    if (n) n.textContent = me.name;
    if (e) e.textContent = me.email;
    if (p) p.textContent = me.phone || "—";
    const out = document.getElementById("logoutBtn");
    out && out.addEventListener("click", () => {
      setSession(null);
      location.href = root + "user/login.html";
    });
    return;
  }

  if (login && me) {
    location.replace(root + "user/account.html");
    return;
  }

  tabs.forEach((t) => t.addEventListener("click", () => {
    tabs.forEach((x) => x.classList.remove("on"));
    t.classList.add("on");
    const mode = t.dataset.tab;
    if (login) login.style.display = mode === "login" ? "block" : "none";
    if (reg) reg.style.display = mode === "reg" ? "block" : "none";
    if (note) { note.classList.remove("show"); note.textContent = ""; }
  }));

  login && login.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const pass = document.getElementById("loginPass").value;
    const u = findUser(email);
    if (!u) {
      showNote(note, "No account found. Please register first.");
      return;
    }
    if (u.password !== pass) {
      showNote(note, "Wrong password. Try again.");
      return;
    }
    setSession(u);
    showNote(note, "Logged in. Redirecting...", true);
    setTimeout(() => { location.href = root + "user/account.html"; }, 400);
  });

  reg && reg.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim().toLowerCase();
    const phone = document.getElementById("regPhone").value.trim();
    const pass = document.getElementById("regPass").value;
    if (pass.length < 4) {
      showNote(note, "Password must be at least 4 characters.");
      return;
    }
    if (findUser(email)) {
      showNote(note, "This email is already registered. Please login.");
      return;
    }
    const list = users();
    const u = { name, email, phone, password: pass };
    list.push(u);
    saveUsers(list);
    setSession(u);
    showNote(note, "Account created. Redirecting...", true);
    setTimeout(() => { location.href = root + "user/account.html"; }, 400);
  });
}

function bindPin() {
  const open = document.querySelector("[data-pin]");
  const apply = document.getElementById("pinApply");
  const input = document.getElementById("pinInput");
  const out = document.getElementById("pinOut");
  if (!apply) return;
  apply.addEventListener("click", () => {
    const v = (input && input.value || "").trim();
    if (!/^\d{6}$/.test(v)) {
      if (out) out.textContent = "Enter a valid 6-digit pincode.";
      return;
    }
    if (out) out.textContent = "Deliver to " + v + " — usually 5–7 days. Availability may vary.";
    if (open) open.textContent = "Deliver to " + v;
  });
}

function bindSearch() {
  document.querySelectorAll("form.search").forEach((f) => {
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      const root = document.body.dataset.root || "";
      const q = (f.querySelector("input") && f.querySelector("input").value || "").trim();
      location.href = root + "product.html" + (q ? "?q=" + encodeURIComponent(q) : "");
    });
  });
}

function bindCatFilter() {
  const boxes = document.querySelectorAll(".cat-filter");
  const grid = document.querySelector(".prod-grid");
  if (!boxes.length || !grid) return;
  let empty = document.getElementById("catEmpty");
  if (!empty) {
    empty = document.createElement("p");
    empty.id = "catEmpty";
    empty.style.cssText = "grid-column:1/-1;padding:28px 8px;color:var(--mute);";
    empty.textContent = "No products in this category yet.";
    grid.appendChild(empty);
  }
  const fromHash = () => {
    const h = (location.hash || "").replace("#", "");
    if (!h) return;
    boxes.forEach((b) => { b.checked = b.value === h; });
  };
  const apply = () => {
    const cards = document.querySelectorAll(".pcard[data-cat]");
    const on = Array.from(boxes).filter((b) => b.checked).map((b) => b.value);
    let n = 0;
    cards.forEach((c) => {
      const ok = on.includes(c.dataset.cat);
      c.style.display = ok ? "" : "none";
      if (ok) n += 1;
    });
    if (empty) empty.style.display = n ? "none" : "block";
  };
  boxes.forEach((b) => b.addEventListener("change", () => {
    const on = Array.from(boxes).filter((x) => x.checked).map((x) => x.value);
    if (on.length === 1) history.replaceState(null, "", "#" + on[0]);
    else history.replaceState(null, "", location.pathname + location.search);
    apply();
  }));
  fromHash();
  apply();
  window.addEventListener("hashchange", () => { fromHash(); apply(); });
  window.__applyCatFilter = apply;
}

function fillListing() {
  const grid = document.querySelector(".prod-grid");
  if (!grid) return;
  const params = new URLSearchParams(location.search);
  const q = (params.get("q") || "").toLowerCase();
  const list = CATALOGUE.filter((p) => {
    if (!q) return true;
    return (p.name + " " + (p.dim || "") + " " + (p.description || "")).toLowerCase().includes(q);
  });
  grid.innerHTML = list.map((p) => cardHtml(p, "")).join("");
  if (window.__applyCatFilter) window.__applyCatFilter();
  else bindCatFilter();
}

function fillFeatured() {
  const grid = document.getElementById("featuredGrid");
  if (!grid) return;
  const list = CATALOGUE.slice(0, 8);
  grid.innerHTML = list.map((p) => cardHtml(p, "")).join("");
}

function fillContactProducts() {
  const sel = document.getElementById("contactProduct");
  if (!sel) return;
  const keep = sel.value;
  const extra = Array.from(sel.querySelectorAll("option[data-static]"));
  sel.innerHTML = '<option value="">Choose a model (optional)</option>';
  CATALOGUE.forEach((p) => {
    const o = document.createElement("option");
    o.value = p.slug;
    o.textContent = p.name + " — " + p.category_name;
    sel.appendChild(o);
  });
  extra.forEach((o) => sel.appendChild(o));
  if (keep) sel.value = keep;
}

function bindContact() {
  const form = document.getElementById("contactForm");
  if (!form) return;
  const ta = form.querySelector("textarea");
  const wc = document.getElementById("wc");
  ta && ta.addEventListener("input", () => {
    const n = ta.value.trim() ? ta.value.trim().split(/\s+/).length : 0;
    if (wc) wc.textContent = n;
  });
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const note = document.getElementById("authNote");
    const slug = (document.getElementById("contactProduct") || {}).value || "";
    const p = findProduct(slug);
    try {
      const data = await apiPost("/api/enquiries", {
        name: document.getElementById("cName").value.trim(),
        email: document.getElementById("cEmail").value.trim(),
        phone: document.getElementById("cPhone").value.trim(),
        message: document.getElementById("cMsg").value.trim(),
        product_slug: p ? p.slug : "",
        product_name: p ? p.name : slug,
        source: "contact"
      });
      showNote(note, data.message || "Thank you. We will contact you.", true);
      form.reset();
      if (wc) wc.textContent = "0";
    } catch (err) {
      showNote(note, err.message || "Could not send enquiry.");
    }
  });
}

function pdpHtml(p) {
  const thumbs = (p.thumbs && p.thumbs.length ? p.thumbs : [p.image]).filter(Boolean);
  const specs = p.specs && p.specs.length ? p.specs : [];
  return `
    <div class="pdp">
      <div class="gallery">
        <img class="main" src="${p.image}" alt="${p.name}">
        <div class="thumbs">
          ${thumbs.map((t, i) => `<img class="${i===0?"on":""}" src="${t}" alt="">`).join("")}
        </div>
      </div>
      <div class="pdp-info">
        <h1>${p.name}</h1>
        <p class="dim">${p.category_name || ""} · ${p.dim || ""}</p>
        <p class="mrp">${money(p.price)} <small>MRP</small></p>
        <div class="badges">${specs.slice(0,3).map((s) => `<span>${s}</span>`).join("")}<span>Enquiry only</span></div>
        <div class="swatches">${dotsHtml(p.colors)}</div>
        ${p.description ? `<p class="dim" style="margin:10px 0;">${p.description}</p>` : ""}
        <div class="qty">
          <button type="button" data-minus>-</button>
          <input id="qty" value="1">
          <button type="button" data-plus>+</button>
        </div>
        <div class="actions">
          <button class="btn btn-line" type="button" data-add>Add to Enquiry</button>
          <button class="btn btn-dark" type="button" data-buy>Save &amp; Enquire</button>
        </div>
        <form id="pdpEnquiry" class="enq-box">
          <h3>Send Enquiry</h3>
          <div class="field"><label>Name</label><input id="pdpName" required placeholder="Your name"></div>
          <div class="field"><label>Email</label><input id="pdpEmail" type="email" required placeholder="you@email.com"></div>
          <div class="field"><label>Phone</label><input id="pdpPhone" type="tel" required placeholder="+91 98111 67816"></div>
          <div class="field"><label>Message</label><textarea id="pdpMsg" placeholder="Quantity, city, finish…"></textarea></div>
          <button class="btn btn-red" type="submit">Send Enquiry</button>
          <p class="note" id="pdpNote"></p>
        </form>
        <div class="feats">
          <h3>Highlights</h3>
          <ul>${specs.map((s) => `<li>${s}</li>`).join("") || "<li>Made in India</li>"}</ul>
        </div>
        <div class="spec">
          <h3>Specifications</h3>
          <ul>
            <li>Dimensions: ${p.dim || "—"}</li>
            <li>Category: ${p.category_name || p.category}</li>
            <li>Finish: ${(p.colors || []).join(" / ") || "—"}</li>
            <li>No online payment — quote by phone or email</li>
          </ul>
        </div>
      </div>
    </div>`;
}

async function fillPdp() {
  const mount = document.getElementById("pdpMount");
  if (!mount) return;
  const params = new URLSearchParams(location.search);
  let slug = params.get("slug") || "";
  if (!slug && document.body.dataset.product) slug = LEGACY[document.body.dataset.product] || document.body.dataset.product;
  let p = findProduct(slug);
  if (!p && slug) {
    try { p = await apiGet("/api/products/" + encodeURIComponent(slug)); } catch (e) { p = null; }
  }
  if (!p) {
    mount.innerHTML = '<p class="dim">Product not found. <a href="product.html">Back to catalogue</a></p>';
    return;
  }
  document.body.dataset.slug = p.slug;
  document.title = p.name + " | Kanwood Interiors";
  const crumb = document.getElementById("crumbName");
  if (crumb) crumb.textContent = p.name;
  mount.innerHTML = pdpHtml(p);
  bindPdp();
}

function chrome(root, active) {
  const r = root || "";
  const me = session();
  const accHref = me ? r + "user/account.html" : r + "user/login.html";
  const accLabel = me ? me.name.split(" ")[0] : "Login";
  const accSub = me ? "Account" : "Account";
  return `
  <div class="topbar"><div class="wrap">
    <span>Catalogue enquiry · No online payment · 30-day returns on selected orders</span>
    <span><a href="mailto:kanwoodinteriors@gmail.com">kanwoodinteriors@gmail.com</a> · <a href="tel:+919811167816">+91 98111 67816</a></span>
  </div></div>
  <header class="header">
    <div class="wrap head-row">
      <a class="logo" href="${r}index.html">
        <div class="logo-mark">K</div>
        <div><strong>Kanwood</strong><span>Interiors · Est. 2025</span></div>
      </a>
      <form class="search" action="${r}product.html">
        <input type="search" name="q" placeholder="Search sofa, desk, dining, workstation...">
        <button type="submit">Search</button>
      </form>
      <div class="head-acts">
        <a class="icon" href="${r}product.html"><b>Store</b>Catalogue</a>
        <a class="icon" href="${accHref}"><b>${accLabel}</b>${accSub}</a>
        <a class="icon" href="${r}cart.html"><b>Enquiry</b><span>List</span><span class="cart-count" data-cart-count>0</span></a>
        <button class="burger" aria-label="Open menu"><span></span><span></span><span></span></button>
      </div>
    </div>
    <nav class="nav"><div class="wrap"><ul>
      <li><a class="${active==="home"?"active":""}" href="${r}index.html">Home</a></li>
      <li class="has-drop">
        <a class="${active==="product"?"active":""}" href="${r}product.html">Product <span class="caret">▾</span></a>
        <ul class="drop">
          <li><a href="${r}product.html">View All</a></li>
          <li><a href="${r}product.html#home">Home Furniture</a></li>
          <li><a href="${r}product.html#office">Office Furniture</a></li>
          <li><a href="${r}product.html#workstation">Workstation</a></li>
          <li><a href="${r}product.html#institutional">Institutional</a></li>
          <li><a href="${r}product.html#patio">Patio Furniture</a></li>
          <li><a href="${r}product.html#restaurant">Restaurant Furniture</a></li>
          <li><a href="${r}product.html#lockers">Storage Lockers</a></li>
          <li><a href="${r}product.html#cabinets">Cabinets &amp; Wardrobes</a></li>
        </ul>
      </li>
      <li><a class="${active==="about"?"active":""}" href="${r}about.html">About Us</a></li>
      <li><a href="${r}about.html#authenticity">Check Authenticity</a></li>
      <li class="has-drop">
        <a class="${["contact","enquiry","service","dealer","stores"].includes(active)?"active":""}" href="${r}contact.html">Contact Us <span class="caret">▾</span></a>
        <ul class="drop">
          <li><a href="${r}contact.html">General Enquiry</a></li>
          <li><a href="${r}contact.html#after-sales">After Sales Service</a></li>
          <li><a href="${r}contact.html#dealer">Dealer &amp; Price</a></li>
          <li><a href="${r}contact.html#distributorship">Distributorship Enquiry</a></li>
          <li><a href="${r}contact.html#outlets">Company Stores</a></li>
          <li><a href="${r}about.html">Careers</a></li>
        </ul>
      </li>
      <li><a class="${active==="cart"?"active":""}" href="${r}cart.html">Wishlist / Enquiry</a></li>
    </ul></div>
    <button class="nav-close" type="button" aria-label="Close menu">×</button>
    </nav>
  </header>
  <form class="search mob-search" action="${r}product.html">
    <input type="search" name="q" placeholder="Search sofa, desk, dining...">
    <button type="submit">Search</button>
  </form>
  <div class="nav-overlay"></div>`;
}

function foot(root) {
  const r = root || "";
  return `
  <footer class="foot"><div class="wrap">
    <div class="foot-grid">
      <div>
        <h4>Kanwood Interiors</h4>
        <p>Sister company of Bakshi Steel Ind. since 1960. Manufacturer and dealer of office furniture and interiors. Est. 2025.</p>
      </div>
      <div>
        <h4>Company</h4>
        <ul>
          <li><a href="${r}about.html">About Us</a></li>
          <li><a href="${r}contact.html">Contact Us</a></li>
          <li><a href="${r}product.html">Products</a></li>
          <li><a href="${r}about.html#authenticity">Check Authenticity</a></li>
        </ul>
      </div>
      <div>
        <h4>Catalogue</h4>
        <ul>
          <li><a href="${r}product.html">View All</a></li>
          <li><a href="${r}cart.html">Enquiry list</a></li>
          <li><a href="${r}user/login.html">Login</a></li>
          <li><a href="${r}contact.html">Dealer enquiry</a></li>
        </ul>
      </div>
      <div>
        <h4>Get in touch</h4>
        <ul>
          <li><a href="mailto:kanwoodinteriors@gmail.com">kanwoodinteriors@gmail.com</a></li>
          <li><a href="tel:+919811167816">+91 98111 67816</a></li>
          <li>Bakshi Steel Ind. lineage · India</li>
        </ul>
      </div>
    </div>
    <div class="foot-end"><span>Established 2025 · Bakshi Steel Ind. since 1960</span><span>© 2026 Kanwood Interiors</span></div>
  </div></footer>
  <nav class="mobnav">
    <a class="${document.body.dataset.page==="home"?"active":""}" href="${r}index.html"><b>⌂</b>Home</a>
    <a class="${document.body.dataset.page==="product"?"active":""}" href="${r}product.html"><b>□</b>Products</a>
    <a class="${document.body.dataset.page==="cart"?"active":""}" href="${r}cart.html"><b>▣</b>Enquiry</a>
    <a class="${document.body.dataset.page==="login"?"active":""}" href="${r}user/login.html"><b>○</b>Account</a>
    <a class="${document.body.dataset.page==="contact"?"active":""}" href="${r}contact.html"><b>☎</b>Contact</a>
  </nav>`;
}

async function loadCatalogue() {
  try {
    const list = await apiGet("/api/products");
    if (Array.isArray(list) && list.length) CATALOGUE = list;
  } catch (e) {
    CATALOGUE = FALLBACK_PRODUCTS.slice();
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const root = document.body.dataset.root || "";
  const page = document.body.dataset.page || "";
  const mountH = document.getElementById("siteHead");
  const mountF = document.getElementById("siteFoot");
  if (mountH) mountH.outerHTML = chrome(root, page);
  if (mountF) mountF.outerHTML = foot(root);
  paintCount();
  bindMenu();
  bindSlider();
  bindAuth();
  bindPin();
  bindSearch();
  await loadCatalogue();
  fillFeatured();
  fillListing();
  fillContactProducts();
  bindContact();
  bindCart();
  renderCart();
  await fillPdp();
  if (!document.body.dataset.item) bindPdp();
});
