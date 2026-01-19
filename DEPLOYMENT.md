# GitHub Pages Deployment

1. Commit all your changes:
   ```sh
   git add .
   git commit -m "Prepare for GitHub Pages deployment"
   ```
2. Push your code to the main branch on GitHub.
3. Set the repository's GitHub Pages source to the `gh-pages` branch (in repo settings).
4. Deploy with:
   ```sh
   npm run deploy
   ```

Your site will be available at:
https://<your-username>.github.io/<your-repo-name>/

---

**Note:**
- Make sure your `index.html` and all assets are in the root directory.
- If you use custom domains or subfolders, adjust paths accordingly.
