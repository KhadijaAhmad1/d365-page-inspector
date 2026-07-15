# D365 Page Inspector

A free, open-source Chrome extension that captures the technical context of your current Microsoft Dynamics 365 Finance & Operations page in one click, so you spend less time chasing basic details when reporting a support ticket.

Built for anyone who works in D365 F&O day to day: end users, functional consultants, technical consultants, and support teams.

## The problem

When something goes wrong in D365, the person raising the ticket rarely includes everything the support team actually needs: which environment, which legal entity, which form, which menu item, and the exact time it happened. That means extra rounds of "can you confirm which company you were in?" before anyone can start investigating.

## What it does

Click the extension icon on any Dynamics 365 F&O page and it automatically reads:

- Environment (and a best-effort guess at environment type: production, sandbox/UAT, or development)
- Legal entity
- User
- Current page title
- Form name
- Menu item
- Full URL
- Timestamp

From there you can:

- **Copy all** — one click, formatted and ready to paste into a ticket, email, or Teams message
- **Export** — save as a `.txt` file
- **Generate an incident report** — add a short description of the issue and get a ready-to-send report combining your description with the captured context
- **Favourite** pages you check often
- **Browse recent pages** you've captured, without needing to retype anything

Detection is best-effort — D365's page structure varies by version, theme, and customisation, so every field is editable before you copy or export it. Nothing is ever sent anywhere: all data stays in your browser's local storage.

## Installation

### From source (current)

1. Download or clone this repository.
2. Run `npm install` then `npm run build`.
3. Open `chrome://extensions` in Chrome or Edge.
4. Turn on **Developer mode** (top right).
5. Click **Load unpacked** and select the `dist` folder produced by the build.

### Chrome Web Store

Not yet published. This is planned once the extension has had some real-world use and feedback — see [Roadmap](#roadmap).

## Privacy

This extension does not collect, transmit, or store any data outside your own browser. Captured pages, favourites, and recent history are kept in Chrome's local storage on your device only, using the `storage` permission. There is no backend, no analytics, and no account.

## Permissions explained

| Permission | Why it's needed |
|---|---|
| `activeTab` | Read the current tab's D365 page when you open the popup |
| `scripting` | Run the content script that reads page context |
| `storage` | Save recent pages and favourites locally |
| `clipboardWrite` | Support the copy-to-clipboard button |
| Host access to `*.dynamics.com` | The extension only activates on Dynamics 365 pages |

## Tech stack

- React + TypeScript
- Vite (multi-entry build for popup, content script, and background service worker)
- Chrome Extension Manifest V3
- Chrome Storage API

## Roadmap

- [ ] Gather feedback from real D365 users and iterate on field detection accuracy across more D365 themes/versions
- [ ] Publish to the Chrome Web Store
- [ ] Global search across D365 menu items
- [ ] Keyboard shortcuts
- [ ] Dark mode
- [ ] Optional AI-assisted troubleshooting suggestions (bring-your-own API key, off by default)
- [ ] "Open in another environment" quick links

## Contributing

Issues and pull requests are welcome. If a detection selector doesn't work for your D365 environment, please open an issue with:

- The D365 version/theme you're using (Fluent or classic)
- Which field wasn't detected correctly
- A redacted screenshot or HTML snippet of the relevant page element, if you're able to share one

## License

MIT — see [LICENSE](LICENSE).

## Author

Built and maintained by Meeral.
