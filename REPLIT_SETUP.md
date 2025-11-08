# 🚀 Replit Setup Guide - SmartFlow Growth

## Quick Start in Replit

### Option 1: Automatic Setup (Recommended)

1. **Open your Replit project**
2. **Click the "Run" button** at the top
   - Replit will automatically install dependencies and start the dev server
   - Wait for "npm install" to complete (~30 seconds)
   - The app will open in the preview pane on the right

### Option 2: Manual Setup

If the automatic setup doesn't work, run these commands in the Replit Shell:

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
```

The app will be available at your Replit URL (e.g., `https://your-repl-name.username.repl.co`)

---

## 🔧 Configuration

### 1. Environment Variables

In Replit, add these **Secrets** (in the left sidebar):

1. Click the 🔒 **Secrets** tab (lock icon)
2. Add these variables:

```
VITE_STRIPE_PUBLISHABLE_KEY = pk_test_your_key_here
VITE_API_URL = http://localhost:5000
```

**To get a Stripe key:**
- Sign up at [stripe.com](https://stripe.com)
- Go to Developers → API Keys
- Copy your **Publishable key** (starts with `pk_test_`)

### 2. Accessing Your App

After running, your app will be available at:
- **Development**: `https://your-repl-name.username.repl.co`
- **Webview**: Opens automatically in the Replit preview pane

---

## 📁 Project Structure in Replit

```
Your Repl
├── src/                    # React source code
│   ├── pages/             # All pages (Landing, Pricing, Tools)
│   ├── components/        # Reusable components
│   └── effects/           # Animations
├── public/                # Static assets
├── index.html             # Entry point
├── package.json           # Dependencies
└── .replit               # Replit configuration
```

---

## 🎯 Running Different Modes

### Development Mode (Default)
```bash
npm run dev
```
- Hot reload enabled
- Source maps for debugging
- Fast refresh on save

### Production Build
```bash
npm run build
```
- Creates optimized build in `dist/` folder
- Minified and compressed

### Preview Production
```bash
npm run preview
```
- Preview the production build locally

---

## 🐛 Troubleshooting

### Issue: "Cannot find module"
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Port 3000 already in use"
**Solution:**
```bash
# Kill the process
pkill -f vite

# Or restart the Repl
# Click the "Stop" button, then "Run" again
```

### Issue: "Environment variables not loading"
**Solution:**
1. Make sure you added secrets in the 🔒 **Secrets** tab (NOT the Shell tab)
2. Restart the Repl after adding secrets
3. Secrets must start with `VITE_` to be accessible in the frontend

### Issue: Blank screen or white page
**Solution:**
```bash
# Clear Vite cache and rebuild
rm -rf node_modules/.vite dist
npm run build
npm run dev
```

### Issue: Changes not reflecting
**Solution:**
- Make sure you're editing files in `src/` folder
- Check the terminal for errors
- Try hard refresh in browser (Ctrl+Shift+R or Cmd+Shift+R)

---

## 🔄 Running Both Frontend + Backend

If you want to run the Flask backend alongside React:

### Method 1: Two Repls (Recommended for Replit)
1. **Current Repl**: Run React frontend (`npm run dev`)
2. **New Repl**: Run Flask backend (`python app.py`)
3. Update `VITE_API_URL` secret to point to your Flask Repl URL

### Method 2: Same Repl (Advanced)
```bash
# Terminal 1: Start Flask
python app.py

# Terminal 2: Start React
npm run dev
```

**Note:** Replit's free tier may struggle with two servers. Consider upgrading or using separate Repls.

---

## 📦 Installing New Packages

```bash
# Add a new package
npm install package-name

# Example: Add axios for API calls
npm install axios
```

Replit will automatically detect package.json changes.

---

## 🚀 Deployment Options

### Option 1: Replit Deployments (Easiest)
1. Click **"Deploy"** in the top right
2. Choose **"Static"** deployment
3. Click **"Deploy"**
4. Your app will be live at `https://your-repl-name.username.repl.app`

**Pricing:** Free tier available, paid plans for custom domains

### Option 2: Export to Vercel
1. Download your Repl as ZIP
2. Upload to [Vercel](https://vercel.com)
3. Vercel auto-detects Vite and deploys

### Option 3: Export to Netlify
1. Download your Repl as ZIP
2. Drag & drop to [Netlify](https://netlify.com)
3. Set build command: `npm run build`
4. Set publish directory: `dist`

---

## 🎨 Customizing Your App

### Change Colors
Edit `src/sfs-premium-theme.css`:
```css
:root {
  --sf-gold: #YOUR_COLOR;
  --sf-black: #YOUR_COLOR;
}
```

### Add New Tools
1. Create `src/pages/tools/YourTool.tsx`
2. Add route in `src/App.tsx`
3. Add to dashboard in `src/pages/Dashboard.tsx`

### Modify Landing Page
Edit `src/pages/Landing.tsx` - everything is in one file for easy editing.

---

## 💡 Tips for Replit

### 1. Use Replit AI
- Press `Ctrl+K` (or `Cmd+K` on Mac) to use Replit AI
- Ask it to explain code or make changes

### 2. Version Control
- Replit has built-in Git
- Click "Version Control" in left sidebar to commit changes

### 3. Invite Collaborators
- Click "Invite" button to add team members
- Free on Hacker plan and above

### 4. Always-On (Paid Feature)
- Free Repls sleep after inactivity
- Upgrade to keep your app running 24/7

### 5. Database Setup (If Needed)
- Replit provides free PostgreSQL
- Click "Database" in left sidebar to activate

---

## 🎯 Next Steps After Setup

1. **Customize Content**
   - Update company name, pricing, testimonials
   - Add your own branding

2. **Connect Stripe**
   - Set up Stripe account
   - Add real product prices
   - Test checkout flow

3. **Add Backend APIs**
   - Connect to real AI APIs (OpenAI, Anthropic)
   - Set up database for user data
   - Implement authentication

4. **Deploy**
   - Use Replit Deployments for quick launch
   - Or export to Vercel/Netlify for production

---

## 📞 Need Help?

- **Replit Docs**: [docs.replit.com](https://docs.replit.com)
- **Vite Docs**: [vitejs.dev](https://vitejs.dev)
- **React Docs**: [react.dev](https://react.dev)
- **Project README**: See `README.md` for full documentation

---

**Happy Building! 🎉**

Your SmartFlow Growth app is ready to make money. Just click Run and start selling!
