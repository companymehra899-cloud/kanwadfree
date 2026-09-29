import json
import os
import re
import sqlite3
import uuid
from datetime import datetime, timezone
from functools import wraps
from pathlib import Path

from flask import (
    Flask,
    flash,
    g,
    jsonify,
    redirect,
    render_template,
    request,
    send_from_directory,
    session,
    url_for,
)
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename

ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"
UPLOAD_DIR = ROOT / "uploads"
DB_PATH = DATA_DIR / "kanwood.db"

DATA_DIR.mkdir(exist_ok=True)
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_EXT = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
MAX_UPLOAD = 8 * 1024 * 1024

CATEGORIES = [
    {"slug": "home", "name": "Home Furniture", "image": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80"},
    {"slug": "office", "name": "Office Furniture", "image": "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80"},
    {"slug": "workstation", "name": "Workstation", "image": "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80"},
    {"slug": "institutional", "name": "Institutional", "image": "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80"},
    {"slug": "patio", "name": "Patio Furniture", "image": "https://images.unsplash.com/photo-1600585154340-0ef3c08c08be?auto=format&fit=crop&w=800&q=80"},
    {"slug": "restaurant", "name": "Restaurant Furniture", "image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80"},
    {"slug": "lockers", "name": "Storage Lockers", "image": "https://images.unsplash.com/photo-1567016546188-7500fe80a8c4?auto=format&fit=crop&w=800&q=80"},
    {"slug": "cabinets", "name": "Cabinets & Wardrobes", "image": "https://images.unsplash.com/photo-1595428774223-ef3341051a51?auto=format&fit=crop&w=800&q=80"},
]

SEED_PRODUCTS = [
    {
        "slug": "heritage-lounge-sofa",
        "name": "Heritage Lounge Sofa",
        "dim": "2100x900x850 mm",
        "price": 48900,
        "category": "home",
        "colors": ["coka", "red", "gold"],
        "image": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80",
        "thumbs": [
            "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80",
        ],
        "specs": ["Solid teak frame", "High-density foam", "Premium fabric upholstery", "Made in India"],
        "description": "Comfort-first lounge sofa for living rooms. Solid teak frame with premium fabric.",
    },
    {
        "slug": "executive-office-desk",
        "name": "Executive Office Desk",
        "dim": "1600x800x750 mm",
        "price": 32400,
        "category": "office",
        "colors": ["coka", "gold"],
        "image": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80",
        "thumbs": [
            "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80",
        ],
        "specs": ["Engineered wood + veneer", "Cable management", "Soft-close drawers", "Scratch-resistant top"],
        "description": "Executive desk with cable management and soft-close drawers.",
    },
    {
        "slug": "teak-dining-collection",
        "name": "Teak Dining Collection",
        "dim": "1800x900x760 mm",
        "price": 54200,
        "category": "home",
        "colors": ["coka", "gold", "yellow"],
        "image": "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80",
        "thumbs": [
            "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1600585154340-0ef3c08c08be?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?auto=format&fit=crop&w=800&q=80",
        ],
        "specs": ["6-seater teak table", "Cushioned chairs", "Natural wood grain", "Indoor use"],
        "description": "Six-seater teak dining set with cushioned chairs.",
    },
    {
        "slug": "modular-workstation",
        "name": "Modular Workstation",
        "dim": "1200x600x750 mm",
        "price": 18700,
        "category": "workstation",
        "colors": ["coka", "red"],
        "image": "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80",
        "thumbs": [
            "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80",
        ],
        "specs": ["Modular partitions", "Powder-coated steel", "Wire raceway", "Office / institutional"],
        "description": "Modular workstation for offices and institutions.",
    },
]

app = Flask(
    __name__,
    template_folder=str(ROOT / "templates"),
    static_folder=None,
)
app.config["MAX_CONTENT_LENGTH"] = MAX_UPLOAD
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "kanwood-interiors-enquiry-secret")
ADMIN_USER = os.environ.get("ADMIN_USER", "admin")
ADMIN_PASS = os.environ.get("ADMIN_PASSWORD", "kanwood2025")


def now_iso():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA foreign_keys = ON")
    return g.db


@app.teardown_appcontext
def close_db(_exc):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def slugify(text):
    s = re.sub(r"[^a-z0-9]+", "-", (text or "").lower()).strip("-")
    return s or ("item-" + uuid.uuid4().hex[:8])


def dumps(val):
    return json.dumps(val if val is not None else [], ensure_ascii=False)


def loads(val, default=None):
    if default is None:
        default = []
    if not val:
        return default
    try:
        return json.loads(val)
    except (TypeError, ValueError):
        return default


def cat_name(slug):
    for c in CATEGORIES:
        if c["slug"] == slug:
            return c["name"]
    return slug or ""


def product_public(row):
    thumbs = loads(row["thumbs"])
    image = row["image"] or (thumbs[0] if thumbs else "")
    return {
        "id": row["id"],
        "slug": row["slug"],
        "name": row["name"],
        "dim": row["dim"] or "",
        "price": row["price"] or 0,
        "category": row["category"],
        "category_name": cat_name(row["category"]),
        "colors": loads(row["colors"]),
        "image": image,
        "thumbs": thumbs or ([image] if image else []),
        "specs": loads(row["specs"]),
        "description": row["description"] or "",
    }


def init_db():
    db = get_db()
    db.executescript(
        """
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            slug TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            dim TEXT,
            price INTEGER DEFAULT 0,
            category TEXT NOT NULL,
            colors TEXT,
            image TEXT,
            thumbs TEXT,
            specs TEXT,
            description TEXT,
            created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS enquiries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            product_slug TEXT,
            product_name TEXT,
            qty INTEGER DEFAULT 1,
            items TEXT,
            message TEXT,
            source TEXT,
            status TEXT DEFAULT 'new',
            created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS admin_users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL
        );
        """
    )
    row = db.execute("SELECT id FROM admin_users WHERE username = ?", (ADMIN_USER,)).fetchone()
    if not row:
        db.execute(
            "INSERT INTO admin_users (username, password_hash) VALUES (?, ?)",
            (ADMIN_USER, generate_password_hash(ADMIN_PASS)),
        )
    count = db.execute("SELECT COUNT(*) AS n FROM products").fetchone()["n"]
    if count == 0:
        for p in SEED_PRODUCTS:
            db.execute(
                """INSERT INTO products
                   (slug, name, dim, price, category, colors, image, thumbs, specs, description, created_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    p["slug"],
                    p["name"],
                    p["dim"],
                    p["price"],
                    p["category"],
                    dumps(p["colors"]),
                    p["image"],
                    dumps(p["thumbs"]),
                    dumps(p["specs"]),
                    p["description"],
                    now_iso(),
                ),
            )
    db.commit()


def save_upload(file_storage):
    if not file_storage or not file_storage.filename:
        return None
    name = secure_filename(file_storage.filename)
    ext = Path(name).suffix.lower()
    if ext not in ALLOWED_EXT:
        return None
    fname = uuid.uuid4().hex + ext
    dest = UPLOAD_DIR / fname
    file_storage.save(dest)
    return "/uploads/" + fname


def parse_lines(text):
    return [ln.strip() for ln in (text or "").splitlines() if ln.strip()]


def parse_colors(text):
    raw = [c.strip().lower() for c in (text or "").replace(",", " ").split() if c.strip()]
    allowed = {"coka", "red", "gold", "yellow"}
    return [c for c in raw if c in allowed] or ["coka"]


def login_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not session.get("admin"):
            return redirect(url_for("admin_login", next=request.path))
        return fn(*args, **kwargs)

    return wrapper


@app.before_request
def _ensure_db():
    init_db()


@app.route("/health")
@app.route("/api/health")
def api_health():
    return jsonify({"ok": True, "app": "kanwood-enquiry"})


@app.route("/api/categories")
def api_categories():
    db = get_db()
    counts = {
        r["category"]: r["n"]
        for r in db.execute("SELECT category, COUNT(*) AS n FROM products GROUP BY category")
    }
    out = []
    for c in CATEGORIES:
        item = dict(c)
        item["count"] = counts.get(c["slug"], 0)
        out.append(item)
    return jsonify(out)


@app.route("/api/products")
def api_products():
    db = get_db()
    cat = (request.args.get("category") or "").strip()
    q = (request.args.get("q") or "").strip()
    sql = "SELECT * FROM products WHERE 1=1"
    args = []
    if cat:
        sql += " AND category = ?"
        args.append(cat)
    if q:
        sql += " AND (name LIKE ? OR dim LIKE ? OR description LIKE ?)"
        like = "%" + q + "%"
        args.extend([like, like, like])
    sql += " ORDER BY id DESC"
    rows = db.execute(sql, args).fetchall()
    return jsonify([product_public(r) for r in rows])


@app.route("/api/products/<slug>")
def api_product(slug):
    db = get_db()
    row = db.execute("SELECT * FROM products WHERE slug = ?", (slug,)).fetchone()
    if not row:
        return jsonify({"error": "Not found"}), 404
    return jsonify(product_public(row))


@app.route("/api/enquiries", methods=["POST"])
def api_enquiry():
    data = request.get_json(silent=True) or request.form
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    phone = (data.get("phone") or "").strip()
    message = (data.get("message") or "").strip()
    product_slug = (data.get("product_slug") or data.get("product") or "").strip()
    product_name = (data.get("product_name") or "").strip()
    source = (data.get("source") or "contact").strip()[:40]
    try:
        qty = max(1, int(data.get("qty") or 1))
    except (TypeError, ValueError):
        qty = 1
    items = data.get("items")
    if isinstance(items, str):
        try:
            items = json.loads(items)
        except ValueError:
            items = []
    if not isinstance(items, list):
        items = []
    if not name or not email or not phone:
        return jsonify({"ok": False, "error": "Name, email and phone are required."}), 400
    if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
        return jsonify({"ok": False, "error": "Enter a valid email."}), 400
    db = get_db()
    if product_slug and not product_name:
        prow = db.execute("SELECT name FROM products WHERE slug = ?", (product_slug,)).fetchone()
        if prow:
            product_name = prow["name"]
    db.execute(
        """INSERT INTO enquiries
           (name, email, phone, product_slug, product_name, qty, items, message, source, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?)""",
        (
            name,
            email,
            phone,
            product_slug,
            product_name,
            qty,
            dumps(items),
            message,
            source,
            now_iso(),
        ),
    )
    db.commit()
    return jsonify({"ok": True, "message": "Enquiry received. We will contact you shortly."})


@app.route("/uploads/<path:filename>")
def uploaded_file(filename):
    return send_from_directory(UPLOAD_DIR, filename)


@app.route("/admin/login", methods=["GET", "POST"])
def admin_login():
    if session.get("admin"):
        return redirect(url_for("admin_home"))
    error = ""
    if request.method == "POST":
        user = (request.form.get("username") or "").strip()
        password = request.form.get("password") or ""
        db = get_db()
        row = db.execute("SELECT * FROM admin_users WHERE username = ?", (user,)).fetchone()
        if row and check_password_hash(row["password_hash"], password):
            session["admin"] = row["username"]
            nxt = request.args.get("next") or url_for("admin_home")
            if not str(nxt).startswith("/admin"):
                nxt = url_for("admin_home")
            return redirect(nxt)
        error = "Invalid username or password."
    return render_template("admin/login.html", error=error)


@app.route("/admin/logout")
def admin_logout():
    session.pop("admin", None)
    return redirect(url_for("admin_login"))


@app.route("/admin")
@app.route("/admin/")
@login_required
def admin_home():
    db = get_db()
    stats = {
        "products": db.execute("SELECT COUNT(*) AS n FROM products").fetchone()["n"],
        "enquiries": db.execute("SELECT COUNT(*) AS n FROM enquiries").fetchone()["n"],
        "new": db.execute("SELECT COUNT(*) AS n FROM enquiries WHERE status = 'new'").fetchone()["n"],
        "categories": len(CATEGORIES),
    }
    recent = db.execute("SELECT * FROM enquiries ORDER BY id DESC LIMIT 8").fetchall()
    return render_template("admin/dashboard.html", stats=stats, recent=recent, cat_name=cat_name)


@app.route("/admin/products")
@login_required
def admin_products():
    db = get_db()
    rows = db.execute("SELECT * FROM products ORDER BY id DESC").fetchall()
    products = [product_public(r) for r in rows]
    return render_template("admin/products.html", products=products)


@app.route("/admin/products/new", methods=["GET", "POST"])
@login_required
def admin_product_new():
    if request.method == "POST":
        err = save_product(None)
        if not err:
            flash("Product created.", "ok")
            return redirect(url_for("admin_products"))
        flash(err, "err")
    return render_template(
        "admin/product_form.html",
        product=None,
        categories=CATEGORIES,
        title="Add product",
    )


@app.route("/admin/products/<int:pid>/edit", methods=["GET", "POST"])
@login_required
def admin_product_edit(pid):
    db = get_db()
    row = db.execute("SELECT * FROM products WHERE id = ?", (pid,)).fetchone()
    if not row:
        flash("Product not found.", "err")
        return redirect(url_for("admin_products"))
    if request.method == "POST":
        err = save_product(row)
        if not err:
            flash("Product updated.", "ok")
            return redirect(url_for("admin_products"))
        flash(err, "err")
        row = db.execute("SELECT * FROM products WHERE id = ?", (pid,)).fetchone()
    product = product_public(row)
    product["specs_text"] = "\n".join(product["specs"])
    product["thumbs_text"] = "\n".join(product["thumbs"])
    product["colors_text"] = " ".join(product["colors"])
    return render_template(
        "admin/product_form.html",
        product=product,
        categories=CATEGORIES,
        title="Edit product",
    )


@app.route("/admin/products/<int:pid>/delete", methods=["POST"])
@login_required
def admin_product_delete(pid):
    db = get_db()
    db.execute("DELETE FROM products WHERE id = ?", (pid,))
    db.commit()
    flash("Product deleted.", "ok")
    return redirect(url_for("admin_products"))


def unique_slug(db, base, pid=None):
    slug = slugify(base)
    i = 2
    while True:
        row = db.execute("SELECT id FROM products WHERE slug = ?", (slug,)).fetchone()
        if not row or (pid and row["id"] == pid):
            return slug
        slug = slugify(base) + "-" + str(i)
        i += 1


def save_product(existing):
    name = (request.form.get("name") or "").strip()
    if not name:
        return "Name is required."
    category = (request.form.get("category") or "").strip()
    if category not in {c["slug"] for c in CATEGORIES}:
        return "Choose a valid category."
    try:
        price = max(0, int(request.form.get("price") or 0))
    except (TypeError, ValueError):
        return "Price must be a number."
    dim = (request.form.get("dim") or "").strip()
    description = (request.form.get("description") or "").strip()
    specs = parse_lines(request.form.get("specs"))
    colors = parse_colors(request.form.get("colors"))
    image_url = (request.form.get("image") or "").strip()
    thumbs = parse_lines(request.form.get("thumbs"))
    uploaded = save_upload(request.files.get("photo"))
    extra_files = request.files.getlist("photos")
    extra_urls = []
    for f in extra_files:
        u = save_upload(f)
        if u:
            extra_urls.append(u)
    if uploaded:
        image_url = uploaded
        thumbs = [uploaded] + [t for t in thumbs if t != uploaded]
    if extra_urls:
        thumbs = thumbs + extra_urls
    if not image_url and thumbs:
        image_url = thumbs[0]
    if image_url and image_url not in thumbs:
        thumbs = [image_url] + thumbs
    db = get_db()
    slug_in = (request.form.get("slug") or "").strip() or name
    slug = unique_slug(db, slug_in, existing["id"] if existing else None)
    if existing:
        db.execute(
            """UPDATE products SET slug=?, name=?, dim=?, price=?, category=?, colors=?,
               image=?, thumbs=?, specs=?, description=? WHERE id=?""",
            (
                slug,
                name,
                dim,
                price,
                category,
                dumps(colors),
                image_url,
                dumps(thumbs),
                dumps(specs),
                description,
                existing["id"],
            ),
        )
    else:
        db.execute(
            """INSERT INTO products
               (slug, name, dim, price, category, colors, image, thumbs, specs, description, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                slug,
                name,
                dim,
                price,
                category,
                dumps(colors),
                image_url,
                dumps(thumbs),
                dumps(specs),
                description,
                now_iso(),
            ),
        )
    db.commit()
    return None


@app.route("/admin/enquiries")
@login_required
def admin_enquiries():
    db = get_db()
    status = (request.args.get("status") or "").strip()
    sql = "SELECT * FROM enquiries"
    args = []
    if status:
        sql += " WHERE status = ?"
        args.append(status)
    sql += " ORDER BY id DESC"
    rows = db.execute(sql, args).fetchall()
    items = []
    for r in rows:
        d = dict(r)
        d["items_list"] = loads(r["items"])
        items.append(d)
    return render_template("admin/enquiries.html", enquiries=items, status=status)


@app.route("/admin/enquiries/<int:eid>/status", methods=["POST"])
@login_required
def admin_enquiry_status(eid):
    status = (request.form.get("status") or "new").strip()
    if status not in {"new", "contacted", "closed"}:
        status = "new"
    db = get_db()
    db.execute("UPDATE enquiries SET status = ? WHERE id = ?", (status, eid))
    db.commit()
    flash("Enquiry updated.", "ok")
    return redirect(url_for("admin_enquiries"))


@app.route("/admin/categories")
@login_required
def admin_categories():
    db = get_db()
    counts = {
        r["category"]: r["n"]
        for r in db.execute("SELECT category, COUNT(*) AS n FROM products GROUP BY category")
    }
    cats = []
    for c in CATEGORIES:
        item = dict(c)
        item["count"] = counts.get(c["slug"], 0)
        cats.append(item)
    return render_template("admin/categories.html", categories=cats)


SKIP_STATIC = {"api", "admin", "uploads", "templates", "data", "__pycache__"}
SKIP_FILES = {"app.py", "requirements.txt", ".gitignore", "start.sh"}


@app.route("/product/<slug>.html")
def legacy_pdp(slug):
    return redirect("/item.html?slug=" + slug)


@app.route("/")
def serve_index():
    return send_from_directory(ROOT, "index.html")


@app.route("/<path:path>")
def serve_static(path):
    first = path.split("/", 1)[0]
    name = Path(path).name
    if first in SKIP_STATIC or name in SKIP_FILES:
        return jsonify({"error": "Not found"}), 404
    try:
        target = (ROOT / path).resolve()
        target.relative_to(ROOT)
    except ValueError:
        return jsonify({"error": "Not found"}), 404
    if target.is_file():
        return send_from_directory(ROOT, path)
    if (target / "index.html").is_file():
        return send_from_directory(target, "index.html")
    return ("Not found", 404)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=False)
