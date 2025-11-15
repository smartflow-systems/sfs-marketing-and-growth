from __future__ import annotations
from flask import Flask, send_from_directory, jsonify, request, abort
from pathlib import Path
from datetime import timedelta
import smtplib, json, os
from email.message import EmailMessage

BASE = Path(__file__).parent.resolve()
app = Flask(__name__, static_url_path="", static_folder=str(BASE))

def load_json(path: Path, fallback=None):
    try:
        if not path.exists():
            return fallback
        with path.open("r", encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError, OSError):
        return fallback

@app.after_request
def add_caching(resp):
    if resp.mimetype == "text/html":
        resp.cache_control.no_cache = True
    else:
        resp.cache_control.public = True
        resp.cache_control.max_age = int(timedelta(days=7).total_seconds())
    allowed_origin = os.getenv("CORS_ORIGIN", "http://localhost:3000")
    resp.headers.setdefault("Access-Control-Allow-Origin", allowed_origin)
    return resp

@app.route("/")
def index():
    return send_from_directory(BASE, "index.html")

@app.get("/health")
def health():
    cfg = load_json(BASE / "site.config.json", {})
    site_name = cfg.get("siteName", "SmartFlow Systems") if cfg else "SmartFlow Systems"
    return jsonify({"ok": True, "site": site_name})

@app.route("/data/<path:fname>")
def data_files(fname: str):
    # SECURITY FIX: Whitelist allowed filenames only
    ALLOWED_FILES = {"leads.jsonl", "posts.json", "pricing.json", "site.config.json"}
    
    if not fname or fname not in ALLOWED_FILES:
        abort(403)
    
    data_dir = BASE / "data"
    file_path = data_dir / fname
    
    if not file_path.exists():
        abort(404)
    
    return send_from_directory(data_dir, fname)

@app.post("/lead")
def lead():
    payload = request.get_json(silent=True) or {}
    name = str(payload.get("name", "")).strip()
    email = str(payload.get("email", "")).strip()
    if not name or "@" not in email:
        return jsonify({"ok": False, "error": "invalid"}), 400
    payload["ts"] = payload.get("ts") or __import__("datetime").datetime.utcnow().isoformat() + "Z"

    data_dir = BASE / "data"
    data_dir.mkdir(exist_ok=True)
    
    out = data_dir / "leads.jsonl"
    with out.open("a", encoding="utf-8") as f:
        f.write(json.dumps(payload, ensure_ascii=False) + "\n")

    host = os.getenv("SMTP_HOST", "")
    to_addr = os.getenv("SMTP_TO", "")
    if host and to_addr:
        try:
            msg = EmailMessage()
            msg["Subject"] = f"New Lead: {name} ({payload.get('plan') or 'undecided'})"
            msg["From"] = os.getenv("SMTP_FROM", to_addr)
            msg["To"] = to_addr
            body = "\n".join([f"{k}: {payload.get(k,'')}" for k in ("name","email","business","plan","goal","page","ts")])
            msg.set_content(body)
            port = int(os.getenv("SMTP_PORT", "587"))
            user = os.getenv("SMTP_USER", "")
            pwd = os.getenv("SMTP_PASS", "")
            with smtplib.SMTP(host, port, timeout=10) as s:
                s.starttls()
                if user and pwd: s.login(user, pwd)
                s.send_message(msg)
        except Exception:
            pass

    return jsonify({"ok": True})

@app.route("/<path:path>")
def static_proxy(path: str):
    try:
        return send_from_directory(BASE, path)
    except Exception:
        abort(404)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=False)
