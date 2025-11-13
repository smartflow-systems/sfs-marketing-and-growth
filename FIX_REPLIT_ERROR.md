# Fix for SQLAlchemy Double Initialization Error

## Error Description
```
RuntimeError: A 'SQLAlchemy' instance has already been registered on this Flask app.
Import and use that instance instead.
```

**Location**: `/home/runner/workspace/app.py`, line 635
**Issue**: Old version of code on Replit with duplicate SQLAlchemy initialization

## ✅ Local Code Status
The code in this Git repository is **CORRECT** and has been fixed.
- Only ONE SQLAlchemy initialization at line 23: `db = SQLAlchemy(model_class=Base)`
- Proper init at line 41: `db.init_app(app)`
- No duplicate initialization

## 🔧 Fix on Replit

### Option 1: Pull Latest Code (Recommended)

1. **Open Replit Shell** for sfs-marketing-and-growth

2. **Pull latest code**:
   ```bash
   git pull origin main
   ```

3. **Kill any running processes**:
   ```bash
   killall gunicorn
   killall python
   ```

4. **Clear Python cache**:
   ```bash
   find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null
   find . -name "*.pyc" -delete
   ```

5. **Restart the Replit**:
   - Click the "Stop" button
   - Click the "Run" button

### Option 2: Force Update

If pull doesn't work:

1. **Check current git status**:
   ```bash
   git status
   ```

2. **If there are local changes, stash them**:
   ```bash
   git stash
   ```

3. **Force pull**:
   ```bash
   git fetch origin
   git reset --hard origin/main
   ```

4. **Clear cache and restart** (same as Option 1, steps 3-5)

### Option 3: Manual Fix (Last Resort)

If you can't pull, manually edit `/home/runner/workspace/app.py`:

1. **Find the duplicate initialization** (around line 635):
   ```python
   # Remove this line if it exists:
   db = SQLAlchemy(app)
   ```

2. **Keep only the correct initialization** (should be at top of file):
   ```python
   class Base(DeclarativeBase):
       pass

   db = SQLAlchemy(model_class=Base)

   # Later in the file:
   db.init_app(app)
   ```

3. **Save and restart**

## 🧪 Test Locally (WSL/Linux)

Before deploying to Replit, test locally:

1. **Navigate to directory**:
   ```bash
   cd /home/garet/SFS/sfs-marketing-and-growth
   ```

2. **Install dependencies** (if needed):
   ```bash
   pip3 install -r requirements.txt
   ```

3. **Set environment variables**:
   ```bash
   export FLASK_APP=app.py
   export FLASK_ENV=development
   export DATABASE_URL="sqlite:///sfs_marketing.db"
   ```

4. **Run with Flask development server**:
   ```bash
   flask run --host=0.0.0.0 --port=5000
   ```

   OR with Gunicorn:
   ```bash
   gunicorn main:app --bind 0.0.0.0:5000 --reload
   ```

5. **Check for errors** in terminal output

## 📝 Root Cause

The error occurs because:
1. Replit has an **old version** of `app.py` (635+ lines)
2. The old version had TWO SQLAlchemy initializations:
   - Line 23: `db = SQLAlchemy(model_class=Base)`
   - Line 635: `db = SQLAlchemy(app)` ← **DUPLICATE (WRONG)**

3. Flask-SQLAlchemy doesn't allow multiple instances on the same app

## ✅ Verification

After applying the fix, you should see:
```
[2025-11-08 XX:XX:XX +0000] [XXXX] [INFO] Starting gunicorn
[2025-11-08 XX:XX:XX +0000] [XXXX] [INFO] Listening at: http://0.0.0.0:5000
[2025-11-08 XX:XX:XX +0000] [XXXX] [INFO] Booting worker with pid: XXXX
[scheduler] Started booking reminders scheduler
```

**No errors!** The app should start successfully.

## 🔗 Related Files

- **app.py** (622 lines) - Main application file (CORRECT VERSION)
- **main.py** - Entry point for Gunicorn
- **requirements.txt** - Python dependencies

## 📞 Next Steps

1. Apply fix on Replit (Option 1 recommended)
2. Verify app starts without errors
3. Test the application in browser
4. If issues persist, check:
   - Database connectivity
   - Environment variables
   - Stripe API keys

---

**Last Updated**: November 8, 2025
**Status**: Local code verified ✅ | Replit needs update
