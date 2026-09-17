# ❄ Winter Arc System V2 — Online Save

This version adds:
- Email/password login
- Cloud save through Supabase
- Local fallback if Supabase is not configured
- Automatic day progression from 17/09/2026
- XP / level / coins / momentum / energy / 12 skills / quest history
- Export / Import backup

## 1. Create the cloud database
1. Create a Supabase project.
2. Open SQL Editor.
3. Paste `schema.sql` and run it.
4. In Authentication settings, enable Email/Password.

Supabase docs: https://supabase.com/docs/guides/auth

## 2. Connect the website
Open `config.js` and paste:
- Project URL
- Publishable/anon key

Use the browser-safe publishable key only. NEVER put a service_role/secret key here.

## 3. Put online
Upload `index.html`, `config.js`, and `schema.sql` to GitHub (schema.sql can be omitted from the public website repo if desired), then enable GitHub Pages.

The website itself is static; Supabase provides authentication + database storage.

## 4. Daily use
Once configured, log in with the same account on laptop/phone. Your character save is stored in the cloud. The browser also keeps a local cache for resilience.

If cloud is not configured, the game still works locally exactly like V1.1.
