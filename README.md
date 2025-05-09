# 💼 Wallet Style Studio — Custom Phantom UI Generator

This is the official repository for **Wallet Style Studio**, a frontend app that allows users to **generate fully custom Phantom wallet UI styles** using AI and visual prompts.

🌐 Live Preview: [Open Project in Lovable](https://lovable.dev/projects/9431a51c-2ffc-4f3e-8eb5-115819bf2c10)

---

## 🧠 About the Project

Wallet Style Studio was built with a clear goal:  
**Let anyone create a beautifully customized wallet interface in seconds**, using AI-powered background generation, dynamic color extraction, and live UI component styling — with the option to mint the design as an NFT.

This project combines solid frontend engineering with creative automation. The development, logic, design, and UX architecture were created and curated by me. AI tools (such as Lovable) are used to accelerate iteration — not replace real product thinking.

---

## 🛠️ Tech Stack

This project is built using:

- ⚡ **Vite** – Lightning-fast frontend tooling
- ⚛️ **React** + **TypeScript** – Modular and typed UI framework
- 🎨 **Tailwind CSS** – Utility-first styling
- 🧱 **shadcn/ui** – Clean, accessible component library
- ☁️ **Supabase** – Database and Edge Functions for theme storage and minting logic
- 🧠 **OpenAI + Edge AI** – Used for background generation and style extraction

---

## ✏️ How to Edit the Code

You can work on this project in two ways:

### Option 1: Use Lovable (Fastest way to iterate)

Just open the project in [Lovable](https://lovable.dev/projects/9431a51c-2ffc-4f3e-8eb5-115819bf2c10), prompt AI for help, and let it update your codebase.  
Changes made here are automatically committed back to GitHub.

> This method is useful for quickly iterating on components, layouts, styles, and logic.

---

### Option 2: Work locally with your IDE

You retain full control over the codebase. Here's how to run the project locally:

```bash
# Step 1: Clone the repo
git clone https://github.com/<your_username>/wallet-style-studio.git

# Step 2: Navigate to the project directory
cd wallet-style-studio

# Step 3: Install dependencies
npm install

# Step 4: Start the dev server
npm run dev
Option 3: GitHub UI or Codespaces
You can edit any file directly on GitHub and commit changes.

You can also launch a GitHub Codespace (browser-based IDE) and start editing immediately.

🚀 Deployment
To deploy or share a preview, open the project in Lovable and click Share → Publish.
Alternatively, the build output can be exported and deployed via any static hosting provider (e.g. Vercel, Netlify).

🌐 Custom Domains
You can connect a custom domain to your Lovable-hosted preview:

Go to Project > Settings > Domains

Click Connect Domain

Follow the instructions for DNS setup.

More details: Lovable Docs – Setting up a custom domain

🧩 NFT Minting Logic
Note: Themes are not saved permanently unless the user mints them as an NFT.
This preserves uniqueness and keeps the interface clean. All styles are stored via Supabase and linked to wallet addresses for ownership tracking.

👨‍💻 Author
Created & developed by [Alexanfr-God]
Custom AI wallet UI builder, idea-to-product executor, and crypto UX enthusiast.
