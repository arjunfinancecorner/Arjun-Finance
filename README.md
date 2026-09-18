# Arjun Finance Corner — Landing Page

## Already set up
- WhatsApp number: 91 96558 80439 (wired to both the WhatsApp button and the floating button)
- Countdown: per-visitor, 1 hour from when they land on the page (stored in their browser, so a refresh doesn't reset it)
- ₹1 Crore calculator: live on the page (see "How the calculator works" below)

## Still to fill in

1. **Google Form embed** (or skip it — see note below) — open `index.html`, search for `YOUR_GOOGLE_FORM_EMBED_URL`
   (it's in the "Unga Details Kudunga" section).
   - Create a Google Form: Name, Phone Number, Age, Yearly Investable Amount
   - Responses tab → green Sheets icon → link to a new Google Sheet
   - Send → embed icon `<>` → copy the `src` URL from the iframe code
   - Paste it in place of `YOUR_GOOGLE_FORM_EMBED_URL`
   - **If you're collecting name/phone/age directly on your Razorpay page instead** (Razorpay supports custom fields), you can delete the whole lead-form `<section>` block from `index.html` and skip this step entirely — just let me know and I'll pull the section out cleanly.

2. **Second Razorpay link for ₹299** — right now both the sticky strip and the offer card point to your ₹49 link only. After the 1-hour window closes, the countdown shows 00:00:00 but the button still charges ₹49, since there's only one link. If you want the price to actually flip to ₹299, share that link and I'll wire it in.

## Full payment → confirmation → WhatsApp flow (thank-you.html + Apps Script)

A static GitHub Pages site can't run server-side code, so "collect payment, send email, hand over the WhatsApp link" runs through **Razorpay's own Payment Page** (free, no code) plus a small **Google Apps Script** (also free, no server to maintain). Here's the exact setup:

### Step 1 — Switch to a Razorpay Payment Page
Your current link (`razorpay.me/@arjun...`) is a Personal Payment Link — it can't redirect or trigger webhooks. Instead:
1. Razorpay Dashboard → **Payment Pages** → Create Payment Page → amount ₹49
2. **Configure Payment Receipt** → turn on the automatic email receipt (built-in, no setup needed beyond this toggle)
3. **Page Settings → Post-payment actions** → set redirect URL to your hosted `thank-you.html` (e.g. `https://yourdomain.com/thank-you.html`)
4. Replace the Razorpay link in `index.html`'s offer button with this new Payment Page link

### Step 2 — Deploy the Apps Script (sends your own branded email + logs to Sheet)
The `apps-script/Code.gs` file in this folder does this. Full setup steps are written as comments at the top of that file:
1. Create a blank Google Sheet, copy its ID from the URL
2. Go to script.google.com → New Project → paste in `Code.gs`
3. Add a Script Property `RAZORPAY_WEBHOOK_SECRET` with a password you make up
4. Deploy → New deployment → Web app → Execute as Me → Who has access: Anyone
5. Copy the deployed Web App URL

### Step 3 — Connect the webhook
Razorpay Dashboard → your Payment Page → **Webhooks** → paste the Apps Script Web App URL → select event `payment.captured` → enter the same secret from Step 2.

That's it — from then on: person pays → Razorpay auto-emails a receipt → your Apps Script also sends your own branded email with the WhatsApp link → the sheet logs every payment → the person is redirected to `thank-you.html`, which shows the WhatsApp community link immediately, no waiting for email.

### Still need from you
- Your actual WhatsApp **community** invite link (not your personal number) — currently a placeholder in both `thank-you.html` and `Code.gs` (`YOUR_COMMUNITY_INVITE_LINK`)

## How the ₹1 Crore calculator works

Visitor enters: monthly income, how much they can save/invest per month, and current age.

- Their monthly investment is assumed to step up 10% every year (matching average salary growth)
- The ₹1 Crore target itself is adjusted upward 6% every year (inflation) — so the calculator is solving for real, today's-value ₹1 Crore, not a shrinking one
- Growth on the investment is assumed at 12% per annum, compounded monthly — this is stated on-page as an illustrative, market-linked assumption, not a guarantee
- Output: number of years needed, and the age they'd be at that point

If you want the assumed 12% return rate changed, it's one line in `script.js` (`ASSUMED_ANNUAL_RETURN`).

## How to host on GitHub Pages (free, permanent)

1. Create a GitHub account if you don't have one → github.com
2. Create a new repository, e.g. `arjun-finance-corner`
3. Upload all files in this folder (`index.html`, `style.css`, `script.js`, `assets/` folder) — keep the same folder structure
4. Go to repo **Settings → Pages**
5. Under "Branch," select `main` and `/root`, click Save
6. Your page goes live at `https://yourusername.github.io/arjun-finance-corner/`
7. (Optional, recommended) Buy a domain like `arjunfinancecorner.com` (~₹600–800/year from Namecheap/GoDaddy) and point it to your GitHub Pages site under Settings → Pages → Custom domain — this looks far more credible than the github.io link.

## For your next funnel pages

Keep this same repo. Create a new folder per funnel, e.g. `/masterclass/`, `/insurance-audit/`,
each with its own `index.html` reusing this `style.css` — so every page matches your brand,
and you only rebuild the content that changes (headline, price, offer).

## Notes

- Payment button currently links to your Razorpay payment link for ₹49 — same link used at both the sticky strip and the main offer card.
- No testimonials section included — add one later once you've collected real client feedback.
- Footer disclaimer uses "Finance Educator & Wealth Coach," not "Investment Adviser" — keep this wording; SEBI reserves "Investment Adviser" for registered entities only.
