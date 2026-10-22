# Deploying Uravi Holidays

## Before you start
- **Needs Node.js 22.13 or newer** (the database is SQLite built into Node). The Docker files below already use Node 22.
  Ordinary shared/cPanel hosting usually has older Node, so use Render, Railway, Fly.io or a VPS instead.
- **The database is created automatically** on first start: `uravi.db` inside `DATA_DIR`. Nothing to install or import.
  (`npm run db:init` creates it on demand, and `database/schema.sql` documents the tables.)
- **`DATA_DIR` must be a persistent disk/volume.** It holds the database (enquiries), the photos and logo you upload
  from the admin page, and the login secret. On a host without a persistent disk these are wiped on every deploy.
- Deploy your **whole project folder**: this update plus your existing `public/js/` files (`common.js`, `home.js`,
  `listing.js`, `detail.js`, `admin.js`) and `test/` if you have it. Push it to a private GitHub repository.

## Option A: Render
1. Push the project to GitHub. In Render choose **New > Blueprint** and select the repository (it reads `render.yaml`).
2. Render creates the service, a 1 GB persistent disk at `/data`, and generates `ADMIN_PASSWORD` and `SESSION_SECRET`.
   Persistent disks need a paid instance type.
3. When it is live, open the service's **Environment** tab to read the admin password, then sign in at `/admin`.
4. Add your domain under **Settings > Custom Domains** and create the DNS record Render shows. HTTPS is automatic.

## Option B: Your own server (VPS) with Docker
1. Point DNS for `uraviholidays.in` and `www` (A records) to the server's IP.
2. Install Docker, copy the project to the server, then:

       cp .env.example .env      # edit: set ADMIN_PASSWORD, SESSION_SECRET (openssl rand -hex 32), DOMAIN
       docker compose up -d --build

   Caddy fetches and renews the HTTPS certificate by itself. Open `https://your-domain/admin`.
3. Update later with `git pull && docker compose up -d --build`. Data lives in the `uravi-data` volume and survives.

## After it is live
- `https://your-domain/healthz` shows `{"ok":true}`.
- Sign in at `/admin`, open **Photos & Logo** and upload your logo and package photos.
- Send a test enquiry from the Contact page and check it appears under Enquiries.

## Backups
- `npm run db:backup` saves a copy to `data/backups/` (keeps the newest 14; `KEEP=30` to change). Safe while the site runs.
- Docker: `docker compose exec app npm run db:backup`. Copy it off the server regularly.
- Weekly automatic backup (VPS cron): `0 3 * * 0 cd /path/to/project && docker compose exec -T app npm run db:backup`
- **Restore:** stop the app, replace `uravi.db` in the data folder with the backup file, start the app.
- The admin page also has **Export CSV** for your enquiries.

## Settings (environment variables)
| Name | Purpose |
| --- | --- |
| `ADMIN_PASSWORD` | Admin login. If unset, a random one is generated into `DATA_DIR/admin-password.txt` and printed in the log. |
| `SESSION_SECRET` | Signs the login cookie. Auto-generated and stored if unset. |
| `DATA_DIR` | Folder for database, uploads and secrets. Default `./data`. Point it at a persistent disk. |
| `PORT` | Port to listen on. Hosts normally set this for you. |
| `FORCE_HTTPS` | `1` redirects http to https. Not needed on Render/Railway. |
| `TRUST_PROXY` | Number of proxies in front of the app (default trusts private-network proxies). Set `1` if visitors seem to share one IP. |
| `UPLOAD_DIR` | Photo folder. Default `DATA_DIR/uploads`. |

## Troubleshooting
- **"Too many requests" for everyone:** the app is not seeing real visitor IPs. Set `TRUST_PROXY=1`.
- **Photos or enquiries disappear after a deploy:** `DATA_DIR` is not on a persistent disk.
- **Error about `node:sqlite`:** Node is older than 22.13. Use the Dockerfile or upgrade Node.
- **Forgot the admin password:** set a new `ADMIN_PASSWORD` and restart.
