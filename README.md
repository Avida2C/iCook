# iCook
Your Kitchen, Your Creativity.
Next.js React TypeScript Tailwind CSS DaisyUI
iCook is a social cooking app for home cooks. It brings recipe discovery, a pantry, and a small community into one mobile-first interface: find something to cook, use what you already have, share what you make, and keep up with other cooks.
iCook is a social cooking app for home cooks. You discover recipes and posts, keep a pantry, plan the week, publish your own recipes, and follow other cooks. The UI is a phone layout, centered on larger screens.
This repository is a local, browser-only demo. There is no backend. Accounts and app data stay in `localStorage` on the device you are using.
The app lives in `iCook-FE`. Catalog recipes and community posts ship with the project. Accounts and anything you change are stored in the browser with `localStorage`. There is no API server.
## Features
## The app
- **Discover** — a community feed of recipes and cooking posts, with likes and comments
- **Recipes** — browse by category, open ingredient lists and steps, and save recipes for later
- **Pantry** — track ingredients at home and see which recipes match what you already have
- **Week plan** — plan breakfast, lunch, dinner, and snacks for the week
- **Create** — publish your own recipes and posts, then edit them from your library
- **Profile** — a cook profile, followers and following, saved recipes, and public profiles
- **Messages** — conversations with other cooks
- **Settings** — profile details, light and dark theme, accent color, notifications, and security (password, passkeys, authenticator app, and backup codes)
Signed-in screens sit inside one shell: app bar, bottom navigation, and a More panel. The bottom nav is Me, Discover, Recipes, Pantry, and More. Routes under `src/app/(app)/` require a session and send you to `/login` when there isn’t one.
Search (`/search`) is still a placeholder screen.
- **Discover** (`/discover`) is the community feed. It mixes recipe cards and cooking posts, with likes, comments, and featured recipes. Open a recipe at `/recipe/[id]` or a post at `/post/[id]`.
- **Recipes** (`/recipes`) browses the catalog by category: breakfast, lunch, dinner, snacks, sweets, fruity, toasty, savoury, and pasta. A recipe page shows ingredients, steps, and nutrition when the recipe has it. You can save a recipe, share it, or add it to the week. `/recipes/more` lists more from a category.
- **Pantry** (`/hub`) is the ingredient list for what you have at home. Matching compares those names to recipe ingredients, so recipes you already have the food for can rank higher in search.
- **Search** opens from the app bar. It looks through recipes, posts, and cooks, and it understands phrases such as “gluten-free dinner” or “quick dinners”. `/search` is a leftover placeholder and is not the search UI.
- **Week plan** (`/plan`, from More) is a week of breakfast, lunch, dinner, and snack. Each slot can be assigned to Me, Partner, or Kids.
- **Create** (`/create`) starts a recipe (`/create/recipe`) or a post (`/create/post`). Published work is listed in `/create/library`, and you can edit it at `/recipe/[id]/edit` or `/post/[id]/edit`. New recipes and posts show up in the feed next to the catalog.
- **Profile** (`/user`) is your cook profile: activity, recipes you made, and recipes you saved (`/user/recipes`, `/user/saved`). Followers and following are `/user/followers` and `/user/following`. Another cook’s profile is `/user/[handle]`. Messages are `/messages`, with a thread at `/messages/[id]`.
- **More** holds settings: user details, email, password, security, theme, accent color, notifications, about, terms, and privacy. Security can turn the password off, add a passkey (WebAuthn), an authenticator app (TOTP), and one-time backup codes. Theme is light or dark and follows the system until you pick one. Accent colors are coral, yellow, green, blue, violet, and teal.
- **Account** screens sit outside the shell: get started (`/`), sign up (`/signup`), log in (`/login`), and forgot password (`/forgot-password`). Deleting an account starts a 30-day window (`/delete-account`, `/restore-account`). The demo account cannot be deleted or have its email and password changed.
Catalog content is in `src/components/recipes/recipesData.ts` and `src/components/app/postsData.ts`. Seed profiles and the starter social lists live under `src/components/app/user/`.
## Tech stack
- [Next.js 16](https://nextjs.org) (App Router) and React 19
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4 and daisyUI 5
- WebAuthn passkeys and [otpauth](https://github.com/hectorm/otpauth) for authenticator codes
- Tailwind CSS 4 + DaisyUI 5
- React Compiler
- WebAuthn passkeys and otpauth (authenticator codes)
## Requirements
- Node.js 20.9 or newer
- npm
## Getting started
You need Node.js 20.9 or newer.
From `iCook-FE`:
```bash
cd iCook-FE

[1 line collapsed]

npm run dev
```
Open [http://localhost:3000](http://localhost:3000).
Open http://localhost:3000.
A demo account is created automatically:
A demo account is created on load:
| | |
| --- | --- |
| Email | `demo@icook.app` |
| Password | `demo1234` |
| Username | `@courtneyhenry` |
- Email: `demo@icook.app`
- Password: `demo1234`
- Username: `@courtneyhenry`
You can also sign up with a new account. Anything you create stays in this browser. The demo account’s email and password are fixed, and that account cannot be deleted.
You can also sign up. That account stays in this browser only.
### Scripts
After a correct password, login asks for an email code. Mail is not connected, so the code is shown on the screen.
## Scripts
Run these from `iCook-FE`:
| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
- `npm run dev`: start the Next.js dev server
- `npm run build`: build the production app into `.next/`
- `npm run start`: serve the production build
- `npm run lint`: run ESLint
## Data and sign-in
## Project structure
Sign-in is a development stand-in, not a production auth system. Passwords are stored in the browser in plaintext. Passkeys use the WebAuthn API on this device. Authenticator setup uses TOTP locally. Email codes shown during login are generated in the app, because there is no mail server.
Use the demo account or a throwaway password. Clearing site data for `localhost` signs you out and removes pantry items, saved recipes, posts, messages, and the week plan.
## Project layout
```
iCook-FE/                 Next.js app
  src/app/                Routes (discover, recipes, pantry, create, profile, settings)
  src/components/         Screens and shared UI
  src/lib/                Auth, pantry matching, week plan, and other helpers
  public/icons/           Navigation and recipe artwork
PROJECT_OVERVIEW.txt      Product overview
iCook-FE/
  src/app/                 routes (auth pages, and the signed-in app)
  src/components/
    app/                   shell, discover, recipes, create, messages, profile
    auth/                  login, signup, account recovery
    pantry/                pantry state
    plan/                  week plan
    recipes/               catalog data and saved recipes
    ingredients/           ingredient catalog used by recipes and the pantry
    theme/                 light/dark theme and accent color
  src/lib/                 auth, pantry matching, recipe search, week plan
  public/icons/            navigation and category artwork
PROJECT_OVERVIEW.txt       longer product write-up
```
## Notes
- App data uses `localStorage` keys prefixed with `icook.` (account, session, pantry, saved recipes, created posts and recipes, likes, comments, messages, week plan, theme, accent).
- Sign-in is a local stand-in. Passwords are stored in the browser in plaintext. Use the demo account or a throwaway password.
- Clearing site data for `localhost` signs you out and removes the pantry, saves, posts, messages, and week plan.
- `.next/` is build output and is ignored by git.
- Env files (`.env`, `.env.*`) are ignored. The app does not need one to run.
