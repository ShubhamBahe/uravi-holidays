# Uravi Holidays website

Express + SQLite (built-in `node:sqlite`, Node 22.5+). Only dependency: express.

    npm install
    npm start          # http://localhost:3000   (admin: /admin)
    npm test           # 540+ backend checks
    npm run db:init    # creates data/uravi.db (also created automatically on first start)
    npm run db:backup  # safe copy of the database into data/backups/

Admin password: set `ADMIN_PASSWORD`, otherwise one is generated into `data/admin-password.txt` on first start.
Other env vars: `PORT`, `DATA_DIR`, `SESSION_SECRET`, `FORCE_HTTPS`, `TRUST_PROXY`.

**Deploying:** see [DEPLOY.md](DEPLOY.md) (Render, or any VPS with Docker + automatic HTTPS). Health check: `/healthz`.

## Photos and logo (admin page)
Sign in at `/admin`, open the **Photos & Logo** tab and upload a photo for any package, or your logo.
Bulk upload matches file names to packages (e.g. `main-goa-tour-package.jpg`). Uploads are saved in
`data/uploads/` (override with `UPLOAD_DIR`). On hosts with a temporary disk, point `DATA_DIR` at a persistent volume
or the uploads and enquiries are lost on redeploy.
Fallback: files dropped in `public/images/photos/<slug>.jpg` and `public/images/one-day-tour/` are also used.

## Content
Business details (name, phones, email, address, services) are in the `SITE` object at the top of `data.js`.
Packages, menus and reviews are also in `data.js`. Enquiries are stored in `data/uravi.db`.
