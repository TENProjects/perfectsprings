# VPS hosting

This release targets one Linux VPS with Nginx, systemd and Node.js 22 or newer. The `public/` directory contains the complete built website: 29 HTML pages, optimized images, styles and browser modules. The Node service handles `/api/enquiry-token` and `/api/enquiries`. There are no runtime npm dependencies and no database.

## Build

From the source checkout:

```sh
npm ci
SITE_URL=https://perfectspringsllc.com npm run build:vps
npm test
```

Outputs:

- `dist/public/`: uploadable public document root; contains no server code, secrets or original full-resolution campaign PNGs.
- `dist/vps/`: complete release with public files, API server, deployment examples and this guide.
- `dist/perfectsprings-vps.tar.gz`: complete upload archive.
- `dist/perfectsprings-public.tar.gz`: public files only, for a host with an existing API setup.

Set `SITE_URL` to the actual HTTPS domain before building; it controls canonical URLs, social metadata and the sitemap. A static-only upload displays the site but needs the enquiry API configured at the same origin for form delivery.

## Install on an Ubuntu/Debian VPS

Install Nginx and Node.js 22+ using your server's supported package source. Verify `node --version` and `command -v node`; update the service's `/usr/bin/node` path if different. Point the domain's DNS to the VPS before requesting TLS.

Upload the full archive to `/tmp/perfectsprings-vps.tar.gz`, then:

```sh
sudo adduser --system --group --no-create-home perfectsprings
sudo mkdir -p /var/www/perfectsprings
sudo tar -xzf /tmp/perfectsprings-vps.tar.gz -C /var/www/perfectsprings
sudo chown -R root:root /var/www/perfectsprings
sudo cp /var/www/perfectsprings/.env.example /etc/perfectsprings.env
sudo chown root:perfectsprings /etc/perfectsprings.env
sudo chmod 640 /etc/perfectsprings.env
sudoedit /etc/perfectsprings.env
```

Configure `SITE_URL=https://perfectspringsllc.com`, `RESEND_API_KEY`, `ENQUIRY_FROM` on a verified sending domain, `ENQUIRY_TO` as the approved inbox and a `FORM_SECRET` generated with `openssl rand -hex 32`. Keep credentials outside the public directory. systemd supplies `PUBLIC_DIR`, `PORT` and `TRUST_PROXY`. In this mode, the server uses the configured public origin for HTTPS form validation and accepts Nginx's overwritten `X-Real-IP` for per-client rate limiting. Node binds to loopback only. Run one service instance.

```sh
sudo cp /var/www/perfectsprings/deploy/perfectsprings.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now perfectsprings
sudo cp /var/www/perfectsprings/deploy/nginx.conf /etc/nginx/sites-available/perfectsprings
sudo ln -s /etc/nginx/sites-available/perfectsprings /etc/nginx/sites-enabled/perfectsprings
sudo nginx -t
sudo systemctl reload nginx
```

The Nginx example serves `perfectspringsllc.com`. Replace it if using a different domain, and use the same origin in `/etc/perfectsprings.env` and the build. It intentionally does not configure `www`; add a redirect to the canonical domain if needed.

Install Certbot with its Nginx integration using the VPS distribution's supported method, then issue TLS:

```sh
sudo certbot --nginx -d perfectspringsllc.com --redirect
sudo certbot renew --dry-run
```

Allow SSH, HTTP and HTTPS in the VPS firewall; keep port 4173 private. Do not open the site for form submissions until HTTPS is active. The service's trusted proxy setting assumes only the supplied local Nginx can reach it.

## Verify after installation

```sh
sudo systemctl status perfectsprings --no-pager
curl -I https://perfectspringsllc.com/
curl -I https://perfectspringsllc.com/products/cast-mango.html
curl -I https://perfectspringsllc.com/js/preloader.js
curl -I https://perfectspringsllc.com/.env
curl -i https://perfectspringsllc.com/api/enquiry-token
sudo journalctl -u perfectsprings -n 50 --no-pager
```

The pages and script should return 200; `/.env` should be denied. The token endpoint should return 200 once all email settings are present. Until configured, 503 is expected and forms retain the direct contact alternatives. Test a real contact enquiry and distributor application in a browser, confirm approved inbox receipt and check product selection. Local tests use a stub email provider; they do not prove delivery.

For updates, retain the previous release outside the document root, replace the release files and restart `perfectsprings`. Keep `/etc/perfectsprings.env` unchanged. Roll back by restoring the prior release and restarting. Nginx configuration/TLS and server access were not provisioned by creating this package.

Reference documentation: [Nginx reverse proxy headers](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_set_header), [Node.js CLI and environment files](https://nodejs.org/api/cli.html#--env-filefile), [Certbot Nginx integration](https://eff-certbot.readthedocs.io/en/stable/using.html#nginx).
