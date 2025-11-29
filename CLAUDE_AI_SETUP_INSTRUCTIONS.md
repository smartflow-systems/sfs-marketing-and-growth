# How to Set Up Claude.ai Project with SFS Knowledge

## Step-by-Step Instructions

### Option 1: Create a Project (RECOMMENDED ⭐)

**Step 1: Open Claude.ai**
- Go to https://claude.ai
- Log in to your account

**Step 2: Create a New Project**
- Look in the **left sidebar**
- Click **"Projects"**
- Click **"+ Create Project"** button

**Step 3: Name Your Project**
- Project Name: **"SmartFlow Systems"** (or "SFS Development")
- Click **Create**

**Step 4: Add Project Knowledge**
- Click **"Add Content"** or **"Project Knowledge"** section
- You'll see a text box where you can paste content

**Step 5: Copy & Paste the Knowledge**
- Open the file: `CLAUDE_AI_PROJECT_FULL.md` (for complete knowledge)
  - OR `CLAUDE_AI_PROJECT_QUICK.md` (for quick reference)
- **Copy the ENTIRE contents**
- **Paste into the Project Knowledge field**
- Click **"Save"** or **"Update"**

**Step 6: Start Using It!**
- Click **"New Chat"** within the project
- Try asking: "What does SFSDataQueryEngine do?"
- Claude will now have full context about all your SFS projects!

---

### Option 2: Use Claude's Memory Feature (Alternative)

**Step 1: Enable Memory**
- Go to https://claude.ai
- Click your **profile icon** (bottom left)
- Go to **Settings → Memory**
- Toggle **"Remember things I tell you"** to ON

**Step 2: Tell Claude Key Facts**
In a new conversation, paste this:

```
Remember the following about me:

- I'm boweazy (Garet), primary developer for SmartFlow Systems
- I maintain 26 repositories under the smartflow-systems GitHub organization
- All SFS projects use brown/black/gold theming (signature colors)
- Tech stack: React/TypeScript (frontend), Node.js/Python (backend), Prisma, OpenAI GPT-4
- Deployment: Replit with GitHub Actions CI/CD
- Primary workspace: /home/garet/SFS/
- Key projects: SmartFlowSite, SFSDataQueryEngine, sfs-marketing-and-growth, SocialScaleBooster
- Always maintain brown/black/gold aesthetic in all SFS projects
- Use JWT auth with RBAC (Admin, Staff, Analyst, Owner)
- Stripe for payments, Stripe Connect for multi-tenant
```

Claude will remember this across all your conversations.

---

## Which File to Use?

### Use `CLAUDE_AI_PROJECT_FULL.md` if:
✅ You work on SFS projects frequently
✅ You need deep technical details
✅ You want all 26 repos documented
✅ You need tech stacks, features, and patterns
✅ You're doing active development work

### Use `CLAUDE_AI_PROJECT_QUICK.md` if:
✅ You just need quick lookups
✅ You want a condensed reference
✅ You prefer less text
✅ You're mostly planning/managing (not coding)

---

## Testing Your Setup

After setup, try these test questions in Claude.ai:

**Test 1: Project Knowledge**
"What is SFSDataQueryEngine and what does it do?"

**Expected Answer:** Claude should know it's an AI-powered natural language to SQL translator, built with TypeScript/React/OpenAI, and located at /home/garet/SFS/SFSDataQueryEngine

**Test 2: Tech Stack**
"What tech stack does sfs-marketing-and-growth use?"

**Expected Answer:** Python 3.11+ (FastAPI), React 18.2, TypeScript 5.2, PostgreSQL

**Test 3: Theme**
"What colors should I use for a new SFS project?"

**Expected Answer:** Brown/black/gold (SmartFlow Systems signature palette)

**Test 4: Patterns**
"How do I deploy an SFS project?"

**Expected Answer:** Replit deployment with env vars SFS_PAT, REPLIT_TOKEN, SFS_SYNC_URL, and GitHub Actions CI/CD

---

## Mobile App Setup

**For iOS/Android Claude App:**

1. Open the Claude mobile app
2. Tap **menu icon** (☰)
3. Tap **"Projects"**
4. Tap **"+ New Project"**
5. Name it: **"SmartFlow Systems"**
6. Add Project Knowledge (same copy/paste method)

Projects sync across web and mobile!

---

## Troubleshooting

**Q: I don't see "Projects" in my sidebar**
A: Projects may be a Claude Pro feature. Try the Memory option instead.

**Q: The text is too long to paste**
A: Use the Quick version (`CLAUDE_AI_PROJECT_QUICK.md`) instead - it's shorter but still comprehensive.

**Q: Can I create multiple projects?**
A: Yes! You can create:
- "SFS - Development" (full knowledge)
- "SFS - Marketing" (marketing repos only)
- "SFS - Quick Reference" (quick version)

**Q: Will this work on mobile?**
A: Yes! Projects sync across web and mobile Claude apps.

---

## File Locations

These files are saved at:
```
/home/garet/SFS/sfs-marketing-and-growth/
├── CLAUDE_AI_PROJECT_FULL.md          ← Complete knowledge (recommended)
├── CLAUDE_AI_PROJECT_QUICK.md         ← Quick reference version
└── CLAUDE_AI_SETUP_INSTRUCTIONS.md    ← This file
```

You can also access the original master copy at:
```
/home/garet/.claude/CLAUDE.md
```

---

## Next Steps

1. ✅ Choose your file (Full or Quick)
2. ✅ Create Claude.ai Project
3. ✅ Copy/paste the content
4. ✅ Test with sample questions
5. ✅ Start working with full SFS context!

---

**Need Help?**
- Re-read this file: `/home/garet/SFS/sfs-marketing-and-growth/CLAUDE_AI_SETUP_INSTRUCTIONS.md`
- Check Claude.ai help docs: https://support.anthropic.com
- The files are saved locally - you can always copy/paste again

---

**Last Updated:** 2025-11-19
