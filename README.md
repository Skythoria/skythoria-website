# Skythoria Website – Tools Folder Guide

This guide explains how to add new HTML-based tools to the Skythoria server website, hosted via GitHub Pages.

---

## 📁 Folder Structure

All tools are located inside the `/tools/` directory in the repository.

Example structure:

```
tools/
├── index.html               ← Main tools hub page
├── text-formatter.html      ← Minecraft text formatter tool
├── mythicmob-creator.html   ← MythicMobs mob builder
├── my-new-tool.html         ← Future tools go here
```

---

## ➕ Adding a New Tool

1. **Create the new tool** as a `.html` file (fully self-contained: includes its own `<html>`, `<head>`, `<body>` etc.).
   - Example: `my-new-tool.html`
   - Place it inside the `/tools/` directory.

2. **Update `tools/index.html`** to include a link to the new tool:
   Open `tools/index.html` and add the following HTML snippet inside the `<section>`:

```html
<div class="tool">
  <h3><a href="my-new-tool.html">My New Tool</a></h3>
  <p>Brief description of what this tool does for Skythoria players or admins.</p>
</div>
```

3. **Commit and push** the changes to GitHub.

```bash
git add tools/my-new-tool.html tools/index.html
git commit -m "Add My New Tool to tools page"
git push
```

---

## ✅ Notes

- The **Tools tab** on the main site links to `tools/index.html`, so you do **not need to update the main site nav** when adding more tools.
- Tools should **match the Skythoria site styling** (dark theme, red accents, Minecraft font, etc.).
- Tool pages should use the standard `<div class="nav">` bar at the top:

```html
<div class="nav">
  <a href="/">Home</a>
  <a href="/tools/">Tools</a>
  <a href="https://discord.gg/NCtM5fMY" target="_blank">Discord</a>
</div>
```

---

## 💡 Optional Improvements

As the list grows, consider:
- Organizing tools by category
- Adding tool icons or thumbnails
- Using a grid layout or card system

---

## 🧪 Local Preview

To test locally before pushing:

```bash
python3 -m http.server
```

Then open: [http://localhost:8000/tools/](http://localhost:8000/tools/)

---

## 📎 Example Snippet for `tools/index.html`

```html
<div class="tool">
  <h3><a href="text-formatter.html">Minecraft Text Formatter</a></h3>
  <p>Live preview and format generator for Minecraft color codes (& codes).</p>
</div>

<div class="tool">
  <h3><a href="mythicmob-creator.html">MythicMob Creator</a></h3>
  <p>Easy GUI builder for MythicMobs YAML files with full syntax support.</p>
</div>

<!-- Add new entries below like this -->
<div class="tool">
  <h3><a href="my-new-tool.html">My New Tool</a></h3>
  <p>Short description of what the new tool does.</p>
</div>
```

---

## 🧠 Final Tip

Keep `tools/index.html` as the central hub — clean and updated — and any future tool will auto-appear on the site via the Tools tab in the nav bar.

Enjoy building out Skythoria’s toolset!
