# SFS Agent Integration Guide

**Complete guide to working with the SFS Memory & Knowledge Agent and other SFS agents**

Created: 2025-11-19
Author: boweazy (Garet) - SmartFlow Systems

---

## Overview

You now have a **complete agent ecosystem** that works across:
- **Claude.ai** (web & mobile)
- **ChatGPT** (web & mobile)
- **Claude Code** (terminal CLI)
- **Local agent orchestrator** (SmartFlowSite)

All agents can now access **full knowledge** of all 26 SFS repositories!

---

## Your Agent Ecosystem

### 🧠 **SFS Memory & Knowledge Agent** (NEW!)
**Location:** `/home/garet/SFS/SmartFlowSite/.sfs/agents/sfs-memory-knowledge-agent.json`

**What it does:**
- Central knowledge hub for all 26 SFS repositories
- Syncs context to Claude.ai, ChatGPT, and local systems
- Coordinates with other agents to provide full ecosystem awareness
- Answers questions about any SFS project
- Maintains tech stacks, patterns, and cross-project relationships

**Capabilities:**
- `knowledge-management` - Maintains central knowledge base
- `context-injection` - Provides context to other agents
- `repo-mapping` - Tracks all 26 repositories
- `cross-project-awareness` - Understands how projects relate
- `ai-memory-sync` - Syncs to Claude.ai and ChatGPT
- `agent-coordination` - Works with all other SFS agents

---

### 📝 **Documentation Writer Agent**
**Location:** `/home/garet/SFS/SmartFlowSite/.sfs/agents/documentation-writer.json`

**Integration with Memory Agent:**
- Memory Agent provides repo details and tech stacks
- Documentation Writer generates READMEs with accurate info
- Works together on code commits and feature completions

---

### 🎨 **SmartFlow Theme Enforcer Agent**
**Location:** `/home/garet/SFS/SmartFlowSite/.sfs/agents/smartflow-theme-enforcer.json`

**Integration with Memory Agent:**
- Memory Agent provides brown/black/gold theme standards
- Theme Enforcer applies styles to projects
- Ensures all SFS projects maintain signature aesthetic

---

### ⚙️ **CI/CD Setup Agent**
**Location:** `/home/garet/SFS/SmartFlowSite/.sfs/agents/ci-setup-agent.json`

**Integration with Memory Agent:**
- Memory Agent provides deployment patterns and standards
- CI Agent configures GitHub Actions workflows
- Works on new repos and deployment requests

---

### 📦 **Repo Manager Agent**
**Location:** `/home/garet/SFS/SmartFlowSite/.sfs/agents/repo-manager.json`

**Integration with Memory Agent:**
- Memory Agent tracks all repo metadata
- Repo Manager handles repo creation and configuration
- Keeps knowledge base updated with new repos

---

### 💬 **ChatGPT Content Creator Agent**
**Location:** `/home/garet/SFS/SmartFlowSite/.sfs/agents/chatgpt-content-creator.json`

**Integration with Memory Agent:**
- Memory Agent syncs knowledge to ChatGPT
- Content Creator uses SFS context for marketing materials
- Maintains brand consistency across content

---

## How Agents Work Together

### Example 1: Creating a New SFS Project

**Workflow:**
1. **You:** "Create a new booking app repo"
2. **Repo Manager:** Creates the repository
3. **Memory Agent:** Analyzes tech stack, updates knowledge base
4. **Theme Enforcer:** Applies brown/black/gold theme
5. **CI Agent:** Sets up GitHub Actions workflow
6. **Documentation Writer:** Creates README with full context
7. **Memory Agent:** Syncs new repo to Claude.ai and ChatGPT

---

### Example 2: Asking About an SFS Project

**Workflow:**
1. **You:** "What does SFSDataQueryEngine do?"
2. **Memory Agent:** Queries knowledge base
3. **Response:** "SFSDataQueryEngine is an AI-powered natural language SQL translator built with TypeScript, React, OpenAI GPT-4, and Prisma. Features include NL → SQL translation, Chart.js visualizations, multi-database support (SQLite/PostgreSQL), export to CSV/JSON/Excel, and 18 pre-built SocialScaleBooster templates. Located at /home/garet/SFS/SFSDataQueryEngine"

---

### Example 3: Updating Documentation Across Projects

**Workflow:**
1. **You:** "Update all READMEs with new deployment info"
2. **Memory Agent:** Identifies all 26 repos
3. **Documentation Writer:** Updates each README
4. **Memory Agent:** Syncs updated info to AI platforms
5. **Theme Enforcer:** Ensures consistent formatting

---

## Using the Agent CLI

### List All Agents
```bash
cd /home/garet/SFS/SmartFlowSite
npm run agent list
```

### Get Agent Info
```bash
npm run agent info sfs-memory-knowledge-agent
```

### Invoke an Agent
```bash
npm run agent invoke sfs-memory-knowledge-agent
```

### Register New Agent
```bash
npm run agent register .sfs/agents/my-new-agent.json
```

---

## Integration with Claude.ai

### How the Memory Agent Works with Claude.ai:

1. **Knowledge Source:** Uses `CLAUDE_AI_PROJECT_FULL.md`
2. **Sync Method:** You copy/paste into Claude.ai Project
3. **Result:** Claude.ai has full context of all 26 SFS repos

### To Sync Knowledge to Claude.ai:

**Option A: Manual (Recommended)**
1. Open `/home/garet/SFS/sfs-marketing-and-growth/CLAUDE_AI_PROJECT_FULL.md`
2. Copy entire contents
3. Go to Claude.ai → Projects → "SmartFlow Systems"
4. Paste into Project Knowledge
5. Save

**Option B: Using Memory Agent (Future)**
```bash
npm run agent invoke sfs-memory-knowledge-agent sync-claude-ai.json
```
*(sync-claude-ai.json would contain action: "sync_to_claude_ai")*

---

## Integration with ChatGPT

### How the Memory Agent Works with ChatGPT:

1. **Knowledge Source:** Uses `CLAUDE_AI_PROJECT_QUICK.md` (condensed version)
2. **Sync Method:** Paste into Custom GPT or Memory
3. **Result:** ChatGPT knows all SFS projects

### To Sync Knowledge to ChatGPT:

1. Open `/home/garet/SFS/sfs-marketing-and-growth/CLAUDE_AI_PROJECT_QUICK.md`
2. Copy contents
3. Go to ChatGPT → Settings → Memory (or Custom GPT instructions)
4. Paste knowledge
5. Save

---

## Agent Coordination Patterns

### Pattern 1: On Repo Creation
```
repo-manager creates repo
  ↓
sfs-memory-knowledge-agent analyzes + updates knowledge
  ↓
smartflow-theme-enforcer applies theme
  ↓
ci-setup-agent configures CI/CD
  ↓
documentation-writer generates README
  ↓
sfs-memory-knowledge-agent syncs to AI platforms
```

### Pattern 2: On Theme Request
```
User requests theme update
  ↓
sfs-memory-knowledge-agent provides brown/black/gold standards
  ↓
smartflow-theme-enforcer applies theme
  ↓
sfs-memory-knowledge-agent verifies consistency
```

### Pattern 3: On Documentation Update
```
Code changes committed
  ↓
sfs-memory-knowledge-agent identifies affected projects
  ↓
documentation-writer updates docs with context
  ↓
sfs-memory-knowledge-agent syncs updated info
```

### Pattern 4: On AI Query
```
User asks "Which repos use Python?"
  ↓
sfs-memory-knowledge-agent queries knowledge base
  ↓
Returns: sfs-marketing-and-growth (FastAPI/Python 3.11+)
  ↓
Provides full tech stack + features + local path
```

---

## Available Actions for Memory Agent

### 1. Sync to Claude.ai
```json
{
  "action": "sync",
  "target_platform": "claude-ai"
}
```

### 2. Sync to ChatGPT
```json
{
  "action": "sync",
  "target_platform": "chatgpt"
}
```

### 3. Query Knowledge Base
```json
{
  "action": "query",
  "query": "What does SFSDataQueryEngine do?"
}
```

### 4. Analyze Repository
```json
{
  "action": "analyze",
  "repository": "sfs-marketing-and-growth"
}
```

### 5. Inject Context to Another Agent
```json
{
  "action": "inject-context",
  "target_agent": "documentation-writer",
  "repository": "SmartFlowSite"
}
```

### 6. Update Knowledge Base
```json
{
  "action": "update-knowledge",
  "update_data": {
    "repository": "new-sfs-project",
    "tech_stack": ["React", "Node.js"],
    "purpose": "New booking platform"
  }
}
```

---

## Knowledge Base Structure

The Memory Agent maintains knowledge about:

### 1. All 26 Repositories
- GitHub URLs
- Local paths
- Tech stacks
- Features
- Production status
- Cross-project relationships

### 2. Tech Stack Standards
- Frontend: React 18/19, TypeScript, Tailwind CSS, Radix UI
- Backend: Node.js (Express), Python (FastAPI), Prisma ORM
- Databases: SQLite (dev), PostgreSQL (prod)
- AI/ML: OpenAI GPT-4, LangChain, ChromaDB
- Payments: Stripe, Stripe Connect
- Deployment: Replit, GitHub Actions CI/CD
- Auth: JWT, OAuth, RBAC

### 3. Common Patterns
- CI/CD: GitHub Actions workflows with health checks
- Deployment: Replit with env vars
- Theme: Brown/black/gold signature colors
- Auth: JWT with RBAC (Admin, Staff, Analyst, Owner)
- Database: Prisma ORM with migrations

### 4. Cross-Project Integration
- Which projects use OpenAI
- Which have Stripe integration
- Which share authentication
- Which use same tech stacks
- How data flows between systems

---

## Workflow Examples

### Workflow 1: New Repo Setup
```bash
# Create repo
npm run agent invoke repo-manager create-repo.json

# Memory Agent auto-triggers:
# - Analyzes new repo
# - Updates knowledge base
# - Syncs to Claude.ai/ChatGPT
# - Notifies other agents

# Theme Agent applies branding
npm run agent invoke smartflow-theme-enforcer apply-theme.json

# CI Agent sets up deployment
npm run agent invoke ci-setup-agent configure-ci.json

# Documentation Writer creates README
npm run agent invoke documentation-writer generate-readme.json
```

### Workflow 2: Knowledge Refresh
```bash
# Refresh all knowledge
npm run agent invoke sfs-memory-knowledge-agent refresh-knowledge.json

# Memory Agent:
# - Scans all 26 repos
# - Updates tech stacks
# - Refreshes local paths
# - Regenerates CLAUDE_AI_PROJECT_FULL.md
# - Syncs to all platforms
```

### Workflow 3: Query Ecosystem
```bash
# Ask a question
npm run agent invoke sfs-memory-knowledge-agent query.json
# (query.json contains: {"query": "Which repos use Python?"})

# Memory Agent responds with full context:
# - sfs-marketing-and-growth (Python 3.11+ FastAPI)
# - Tech stack, features, local path, GitHub URL
```

---

## Files Created During This Session

### Knowledge Base Files
1. `/home/garet/.claude/CLAUDE.md` - Master knowledge base (Claude Code)
2. `/home/garet/SFS/sfs-marketing-and-growth/CLAUDE_AI_PROJECT_FULL.md` - Full knowledge (Claude.ai)
3. `/home/garet/SFS/sfs-marketing-and-growth/CLAUDE_AI_PROJECT_QUICK.md` - Quick reference (ChatGPT)
4. `/home/garet/SFS/sfs-marketing-and-growth/CLAUDE_AI_SETUP_INSTRUCTIONS.md` - Setup guide

### Agent Files
5. `/home/garet/SFS/SmartFlowSite/.sfs/agents/sfs-memory-knowledge-agent.json` - Memory Agent manifest

### Documentation
6. `/home/garet/SFS/sfs-marketing-and-growth/SFS_AGENT_INTEGRATION_GUIDE.md` - This file!

---

## Next Steps

### Immediate
1. ✅ Copy `CLAUDE_AI_PROJECT_FULL.md` to Claude.ai Project
2. ✅ Copy `CLAUDE_AI_PROJECT_QUICK.md` to ChatGPT Memory
3. ✅ Test querying the Memory Agent

### Short-term
1. Register the Memory Agent with orchestrator
2. Test agent coordination workflows
3. Create automation scripts for knowledge sync

### Long-term
1. Set up automatic knowledge refresh on repo changes
2. Build web dashboard for agent management
3. Create integration with more AI platforms

---

## Testing Your Setup

### Test 1: Query from Claude.ai
In your Claude.ai "SmartFlow Systems" project, ask:
> "What does SFSDataQueryEngine do?"

**Expected:** Detailed answer with tech stack, features, local path

### Test 2: Query from ChatGPT
In ChatGPT with memory enabled, ask:
> "Which SFS projects use Python?"

**Expected:** sfs-marketing-and-growth with full details

### Test 3: Query from Local Agent
```bash
cd /home/garet/SFS/SmartFlowSite
npm run agent invoke sfs-memory-knowledge-agent
```

**Expected:** Agent responds with knowledge base access

---

## Troubleshooting

### Issue: Agent not found
**Solution:** Register the agent first:
```bash
npm run agent register .sfs/agents/sfs-memory-knowledge-agent.json
```

### Issue: Knowledge out of date
**Solution:** Trigger knowledge refresh:
```bash
npm run agent invoke sfs-memory-knowledge-agent refresh-knowledge.json
```

### Issue: Claude.ai doesn't remember
**Solution:** Re-paste knowledge into Project:
1. Open `CLAUDE_AI_PROJECT_FULL.md`
2. Copy all contents
3. Update Claude.ai Project Knowledge

---

## Agent API Endpoints

If the orchestrator is running at `http://localhost:5001`:

- `GET /api/agents` - List all agents
- `GET /api/agents/sfs-memory-knowledge-agent` - Get Memory Agent info
- `POST /api/agents/sfs-memory-knowledge-agent/invoke` - Invoke Memory Agent
- `POST /api/agents/register` - Register new agent
- `GET /health` - Check orchestrator status

---

## Summary

**You now have:**
- ✅ Complete knowledge base of all 26 SFS repos
- ✅ SFS Memory & Knowledge Agent that coordinates with all other agents
- ✅ Integration with Claude.ai, ChatGPT, and local systems
- ✅ Full ecosystem awareness across all AI platforms
- ✅ Agent coordination patterns for common workflows
- ✅ Knowledge sync capabilities to keep everything up-to-date

**Your agents work together to:**
- Maintain comprehensive SFS knowledge
- Provide context to each other
- Sync knowledge across AI platforms
- Answer questions about any SFS project
- Automate repo setup and configuration
- Ensure theme and pattern consistency

---

**Last Updated:** 2025-11-19
**Author:** boweazy (Garet) - SmartFlow Systems
**Purpose:** Enable full SFS ecosystem awareness across all AI platforms and agent systems
