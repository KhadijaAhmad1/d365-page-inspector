# D365 Page Inspector

A free, open-source Chrome extension for anyone working in Microsoft Dynamics 365 Finance & Operations. Click the icon, and it grabs the technical details of the page you're on, so you stop having to dig them up yourself every time you log a support ticket.

Built with support teams, functional consultants, and technical consultants in mind, but genuinely useful for any regular D365 user.

## Why this exists

Ask most users to raise a D365 ticket and they'll tell you what went wrong, but rarely which environment they were in, which legal entity, or which form. So the support team asks. Then waits. Then asks again. A ticket that should take five minutes to triage ends up needing three separate replies just to establish the basics.

## What it captures

Open the popup on any D365 F&O page and it reads:

- Environment, plus a best-effort guess at whether it's production, sandbox/UAT, or dev
- Legal entity
- User
- Form name and menu item
- The full navigation path (the breadcrumb trail, so support staff know exactly which menu to follow to get there themselves)
- Page title, URL, and timestamp

None of this is guaranteed to be perfect. D365's page structure shifts depending on version, theme, and how heavily an organisation has customised it, so every field stays editable before you copy or export anything. If a field comes back wrong, fix it and move on.

## What you can do with it

- **Copy everything** in one click, formatted and ready to paste into a ticket, email, or Teams message
- **Export** it as a `.txt` file
- **Generate an incident report** by adding a short description of the issue on top of what's already captured
- **Favourite** the pages you check constantly
- **Browse recent captures** instead of retyping the same details twice in one day

Nothing leaves your browser. There's no server behind this, no analytics, no account to sign into. Everything sits in Chrome's local storage on your own machine.

## Installing it

### From source, for now

1. Clone or download this repo.
2. Run `npm install`, then `npm run build`.
3. Open `chrome://extensions` (works in Edge too).
4. Turn on **Developer mode**, top right corner.
5. Click **Load unpacked** and point it at the `dist` folder the build just created.

### Chrome Web Store

Not published yet. Once it's had some real use and a round of feedback, that's the plan — see the roadmap below.

## On privacy

Short version: there isn't a privacy concern here, because there's nowhere for your data to go. Pages you capture, favourites, and recent history live in Chrome's local storage, protected under the `storage` permission, and stay on your device. No backend exists for this to talk to.

## Permissions, and why each one is there

| Permission | What it's for |
|---|---|
| `activeTab` | Reads the current tab's D365 page when you open the popup |
| `scripting` | Runs the content script that actually reads the page |
| `storage` | Keeps recent pages and favourites saved locally |
| `clipboardWrite` | Makes the copy button work |
| Host access to `*.dynamics.com` | The extension only ever wakes up on Dynamics 365 pages |

## Built with

- React and TypeScript
- Vite, with a multi-entry build for the popup, content script, and background service worker
- Chrome Extension Manifest V3
- Chrome Storage API

## Where this is headed

- [ ] Testing detection accuracy across more D365 themes and versions, and fixing what breaks
- [ ] Publishing to the Chrome Web Store
- [ ] Search across all menu items from one place
- [ ] Keyboard shortcuts
- [ ] Dark mode
- [ ] Optional AI-assisted troubleshooting, bring-your-own API key, off unless you turn it on
- [ ] Quick links to open the same record in another environment (Test/UAT/Production)

## Contributing

Found a page where a field isn't detecting properly? Open an issue and include:

- Which D365 version or theme you're on (Fluent or classic)
- The field that came back wrong or empty
- A screenshot or HTML snippet of that part of the page, redacted as needed

That's usually enough to track down the right selector.

## License

MIT. Full text in [LICENSE](LICENSE).

## Author

Built and maintained by Khadija.
