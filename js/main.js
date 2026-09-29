const PRODUCTS = {
  sofa: {
    id: "sofa",
    name: "Heritage Lounge Sofa",
    dim: "2100x900x850 mm",
    price: 48900,
    cat: "Home Furniture",
    colors: ["coka", "red", "gold"],
    img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80",
    thumbs: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80"
    ],
    href: "product/heritage-lounge-sofa.html",
    specs: ["Solid teak frame", "High-density foam", "Premium fabric upholstery", "Made in India"]
  },
  desk: {
    id: "desk",
    name: "Executive Office Desk",
    dim: "1600x800x750 mm",
    price: 32400,
    cat: "Office Furniture",
    colors: ["coka", "gold"],
    img: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80",
    thumbs: [
      "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80"
    ],
    href: "product/executive-office-desk.html",
    specs: ["Engineered wood + veneer", "Cable management", "Soft-close drawers", "Scratch-resistant top"]
  },
  dining: {
    id: "dining",
    name: "Teak Dining Collection",
    dim: "1800x900x760 mm",
    price: 54200,
    cat: "Home Furniture",
    colors: ["coka", "gold", "yellow"],
    img: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80",
    thumbs: [
      "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600585154340-0ef3c08c08be?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?auto=format&fit=crop&w=800&q=80"
    ],
    href: "product/teak-dining-collection.html",
    specs: ["6-seater teak table", "Cushioned chairs", "Natural wood grain", "Indoor use"]
  },
  station: {
    id: "station",
    name: "Modular Workstation",
    dim: "1200x600x750 mm",
    price: 18700,
    cat: "Workstation",
    colors: ["coka", "red"],
    img: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80",
    thumbs: [
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80"
    ],
    href: "product/modular-workstation.html",
    specs: ["Modular partitions", "Powder-coated steel", "Wire raceway", "Office / institutional"]
  }
};

const KEY = "kanwood_cart";
const USERS_KEY = "kanwood_users";
const SESSION_KEY = "kanwood_session";

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

function addToCart(id, qty) {
  const p = PRODUCTS[id];
  if (!p) return;
  const items = cart();
  const found = items.find((x) => x.id === id);
  const q = Math.max(1, Number(qty) || 1);
  if (found) found.qty += q;
  else items.push({ id: p.id, name: p.name, price: p.price, img: p.img, dim: p.dim, qty: q });
  saveCart(items);
}

function paintCount() {
  const n = cart().reduce((s, x) => s + x.qty, 0);
  document.querySelectorAll("[data-cart-count]").forEach((el) => { el.textContent = String(n); });
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
    <div class="item" data-id="${x.id}">
      <img src="${x.img}" alt="${x.name}">
      <div>
        <h3>${x.name}</h3>
        <p class="dim">${x.dim}</p>
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
  const ship = sub ? 0 : 0;
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set("subTotal", money(sub));
  set("shipFee", "Free");
  set("grandTotal", money(sub + ship));
}

function bindCart() {
  const box = document.getElementById("cartItems");
  if (!box) return;
  box.addEventListener("click", (e) => {
    const row = e.target.closest(".item");
    if (!row) return;
    const items = cart();
    const it = items.find((x) => x.id === row.dataset.id);
    if (!it) return;
    if (e.target.closest("[data-plus]")) it.qty += 1;
    if (e.target.closest("[data-minus]")) it.qty = Math.max(1, it.qty - 1);
    if (e.target.closest("[data-rm]")) {
      saveCart(items.filter((x) => x.id !== it.id));
      renderCart();
      return;
    }
    saveCart(items);
    renderCart();
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
  if (!id) return;
  document.querySelectorAll("[data-minus]").forEach((b) => b.addEventListener("click", () => {
    qty.value = Math.max(1, Number(qty.value) - 1);
  }));
  document.querySelectorAll("[data-plus]").forEach((b) => b.addEventListener("click", () => {
    qty.value = Number(qty.value) + 1;
  }));
  add && add.addEventListener("click", () => {
    addToCart(id, qty ? qty.value : 1);
    add.textContent = "Added to cart";
    setTimeout(() => { add.textContent = "Add to Cart"; }, 1200);
  });
  buy && buy.addEventListener("click", () => {
    addToCart(id, qty ? qty.value : 1);
    location.href = document.body.dataset.root + "cart.html";
  });
  const main = document.querySelector(".gallery img.main");
  document.querySelectorAll(".thumbs img").forEach((img) => {
    img.addEventListener("click", () => {
      document.querySelectorAll(".thumbs img").forEach((t) => t.classList.remove("on"));
      img.classList.add("on");
      if (main) main.src = img.src;
    });
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
      location.href = root + "product.html";
    });
  });
}

function chrome(root, active) {
  const r = root || "";
  const me = session();
  const accHref = me ? r + "user/account.html" : r + "user/login.html";
  const accLabel = me ? me.name.split(" ")[0] : "Login";
  const accSub = me ? "Account" : "Account";
  return `
  <div class="topbar"><div class="wrap">
    <span>Free delivery on selected orders · 30-day returns</span>
    <span><a href="mailto:kanwoodinteriors@gmail.com">kanwoodinteriors@gmail.com</a> · <a href="tel:+919811167816">+91 98111 67816</a></span>
  </div></div>
  <header class="header">
    <div class="wrap head-row">
      <a class="logo" href="${r}index.html">
        <div class="logo-mark">K</div>
        <div><strong>Kanwood</strong><span>Interiors · Est. 2025</span></div>
      </a>
      <form class="search" action="${r}product.html">
        <input type="search" placeholder="Search sofa, desk, dining, workstation...">
        <button type="submit">Search</button>
      </form>
      <div class="head-acts">
        <a class="icon" href="${r}product.html"><b>Store</b>Catalogue</a>
        <a class="icon" href="${accHref}"><b>${accLabel}</b>${accSub}</a>
        <a class="icon" href="${r}cart.html"><b>Cart</b><span>Bag</span><span class="cart-count" data-cart-count>0</span></a>
        <button class="burger" aria-label="Open menu"><span></span><span></span><span></span></button>
      </div>
    </div>
    <nav class="nav"><div class="wrap"><ul>
      <li><a class="${active==="home"?"active":""}" href="${r}index.html">Home</a></li>
      <li><a class="${active==="product"?"active":""}" href="${r}product.html">Product</a></li>
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
      <li><a class="${active==="cart"?"active":""}" href="${r}cart.html">Wishlist / Cart</a></li>
    </ul></div>
    <button class="nav-close" type="button" aria-label="Close menu">×</button>
    </nav>
  </header>
  <form class="search mob-search" action="${r}product.html">
    <input type="search" placeholder="Search sofa, desk, dining...">
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
        <h4>Shop</h4>
        <ul>
          <li><a href="${r}product.html">View All</a></li>
          <li><a href="${r}cart.html">Cart</a></li>
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
    <a class="${document.body.dataset.page==="cart"?"active":""}" href="${r}cart.html"><b>▣</b>Cart</a>
    <a class="${document.body.dataset.page==="login"?"active":""}" href="${r}user/login.html"><b>○</b>Account</a>
    <a class="${document.body.dataset.page==="contact"?"active":""}" href="${r}contact.html"><b>☎</b>Contact</a>
  </nav>`;
}

document.addEventListener("DOMContentLoaded", () => {
  const root = document.body.dataset.root || "";
  const page = document.body.dataset.page || "";
  const mountH = document.getElementById("siteHead");
  const mountF = document.getElementById("siteFoot");
  if (mountH) mountH.outerHTML = chrome(root, page);
  if (mountF) mountF.outerHTML = foot(root);
  paintCount();
  bindMenu();
  bindSlider();
  bindPdp();
  bindCart();
  renderCart();
  bindAuth();
  bindPin();
  bindSearch();
});
