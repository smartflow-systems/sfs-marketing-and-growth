set -euo pipefail; for d in "$HOME/workspace/SmartFlowSite" "$HOME/SmartFlowSite" "$PWD"; do [ -d "$d/.git" ] && { cd "$d"; break; }; done; git rev-parse --is-inside-work-tree >/dev/null; ts="$(date +%Y%m%d-%H%M%S)"; [ -f app.py ] && cp -n app.py ".sfs-backup-app.$ts.py"; [ -f main.py ] && cp -n main.py ".sfs-backup-main.$ts.py"; cat > /tmp/sfs-db-block.py <<'PY'
# ---- DB config (SQLite fallback) ----
import os
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import OperationalError

DB_URL = os.getenv("DATABASE_URL", "sqlite:///sfs.db")
app.config["SQLALCHEMY_DATABASE_URI"] = DB_URL
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {"pool_pre_ping": True}

db = SQLAlchemy(app)
PY
; if [ -f app.py ] && ! grep -q 'db = SQLAlchemy(app)' app.py; then awk 'BEGIN{inserted=0} /app\s*=\s*Flask\(/ && !inserted{print; print ""; while((getline line < "/tmp/sfs-db-block.py")>0) print line; print ""; inserted=1; next} {print} END{ if(!inserted){ print ""; print("# SFS NOTE: could not find app = Flask(...); appended DB block at end"); while((getline line < "/tmp/sfs-db-block.py")>0) print line; print ""} }' app.py > app.py.new && mv app.py.new app.py; fi; if [ -f app.py ]; then sed -E -i 's/^(\s*)db\.create_all\(\)/\1# SFS: moved to init_db(); was: db.create_all()/g' app.py; fi; if [ -f app.py ] && ! grep -q '^def init_db\(' app.py; then cat >> app.py <<'PY'

# ---- DB init at startup (non-fatal if DB down) ----
def init_db():
    with app.app_context():
        try:
            db.create_all()
            app.logger.info("DB ready ✅ using %s", DB_URL)
        except OperationalError as e:
            app.logger.warning("DB unavailable, running degraded: %s", e)
PY
; fi; if [ -f main.py ]; then grep -q 'from app import app, init_db' main.py || sed -i '1s|^|from app import app, init_db\n|' main.py; grep -q '^init_db\(\)' main.py || echo 'init_db()' >> main.py; else cat > main.py <<'PY'
from app import app, init_db
init_db()
# Gunicorn loads "app" from this module path "main:app"
PY
; fi; if ! grep -q 'def db_health' app.py; then cat >> app.py <<'PY'

# ---- simple DB health endpoint ----
@app.get("/health/db")
def db_health():
    try:
        db.session.execute(db.text("SELECT 1"))
        return {"ok": True, "db": str(DB_URL)}, 200
    except Exception as e:
        return {"ok": False, "error": str(e)}, 503
PY
; fi; echo "✅ Patches applied. Now hit Run."; rm /tmp/sfs-db-block.py
