# Project Overview

A **Next.js frontend-only demo** of an Inventory Management platform, built to show prospective clients (grocery store owners, pharmacy/medical shop owners, electronics retailers) what a tailored inventory system for their business could look like. One codebase, one consistent app shell, three distinct industry "verticals": **Grocery**, **Medical**, **Electronics**.

This is a **sales/showcase artifact**, not yet a production SaaS product.

# Project Goal

Make each vertical feel like a real, working, industry-specific inventory product — realistic navigation, realistic mock data, realistic CRUD-feeling interactions — while keeping the underlying layout, components, and design language shared and consistent across all three.

# Current Scope

- Frontend only. No backend, no database, no authentication, no external APIs.
- Data is mock/static, seeded into in-memory state, and persisted client-side to `localStorage` per vertical. CRUD actions (add/edit/delete) update in-memory state immediately and are then saved to `localStorage`, so changes **survive a page refresh**. Mock data remains the fallback/seed dataset used the first time a browser has no stored data.
- Three verticals: Grocery, Medical, Electronics, each with its own navigation, fields, and mock data — sharing one design system and one set of reusable UI components.
- Architecture must make a **future backend/Prisma integration** straightforward (see "Future Backend Integration" below), but do not build that integration now.

# Technology Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- React
- Lucide React (icons)
- Recharts (or an equivalent lightweight chart library) for dashboard/report charts
- No state management library beyond React Context + `useReducer` (no Redux/Zustand unless a real need emerges)
- No ORM, no database, no auth library at this stage

# Important Restrictions

- Do NOT add a backend, API routes used as a real backend, database, Prisma schema, or authentication unless explicitly instructed.
- Client-side `localStorage` persistence is now the current persistence layer (added intentionally — see "State Management"). Do NOT add a backend/database to achieve persistence; `localStorage` is the sanctioned mechanism until a real backend is explicitly instructed.
- Do NOT introduce a generic `/inventory/[type]/...` dynamic route that tries to render all three verticals from one shared template — navigation items and fields differ enough per vertical that this would fight the "distinct product per industry" goal. Use explicit per-vertical route folders instead.
- Do NOT build the main dashboard as a complex admin/config panel. It is a showcase entry point: platform intro, high-level stats, and three cards into the verticals.
- Do NOT add a cross-vertical switcher in the header/sidebar. Navigating between verticals happens by returning to the main dashboard (`/`).
- Do NOT implement dark mode unless asked — light theme only for now.
- Do NOT over-engineer shared components to be "infinitely generic." Build for the three known verticals; don't add config knobs for hypothetical future verticals.

# Application Architecture

- **Main dashboard (`/`)**: app-style overview (not a marketing landing page). Uses a lightweight shell (header + hero/intro strip), shows platform-level stats, and presents three large "vertical cards" (Grocery / Medical / Electronics) with mini stats and a CTA into each. This is the only place a user switches verticals.
- **Vertical apps (`/inventory/grocery`, `/inventory/medical`, `/inventory/electronics`)**: each is a self-contained app experience with its own `layout.tsx` that:
  1. Wraps children in the shared `AppShell` (sidebar + header + content area).
  2. Supplies that vertical's nav config (from `lib/config/navigation.ts`) to the sidebar.
  3. Applies that vertical's accent color theme (from `lib/config/theme.ts`).
  4. Mounts that vertical's `DataProvider` (Context + `useReducer`) so all pages within the vertical share one in-memory data store for the session.
- **Shared design system**: one Tailwind-based visual language (spacing, radii, shadows, typography, table/card/modal styles) used by every shared component. Only the accent color token changes per vertical — components themselves are not duplicated per vertical.

# Route Architecture

All routes live under the Next.js App Router. Main dashboard at root; each vertical has its own explicit folder tree (not a dynamic `[type]` segment), because nav items and page sets differ per vertical.

```
/                                          Main dashboard

/inventory/grocery/dashboard
/inventory/grocery/customers
/inventory/grocery/vendors
/inventory/grocery/products
/inventory/grocery/categories
/inventory/grocery/brands
/inventory/grocery/new-entry
/inventory/grocery/purchases
/inventory/grocery/sales
/inventory/grocery/inventory
/inventory/grocery/low-stock
/inventory/grocery/expiry
/inventory/grocery/reports

/inventory/medical/dashboard
/inventory/medical/customers
/inventory/medical/suppliers
/inventory/medical/medicines
/inventory/medical/categories
/inventory/medical/manufacturers
/inventory/medical/new-entry
/inventory/medical/purchases
/inventory/medical/sales
/inventory/medical/inventory
/inventory/medical/batches
/inventory/medical/expiry
/inventory/medical/prescriptions
/inventory/medical/reports

/inventory/electronics/dashboard
/inventory/electronics/customers
/inventory/electronics/vendors
/inventory/electronics/products
/inventory/electronics/categories
/inventory/electronics/brands
/inventory/electronics/models
/inventory/electronics/new-entry
/inventory/electronics/purchases
/inventory/electronics/sales
/inventory/electronics/inventory
/inventory/electronics/serial-numbers
/inventory/electronics/warranty
/inventory/electronics/returns
/inventory/electronics/reports
```

Each vertical folder has one `layout.tsx` at its root (e.g. `app/inventory/grocery/layout.tsx`) that all pages under it share.

# Folder Structure

```
app/
  layout.tsx                    Root layout (fonts, global providers, global CSS)
  page.tsx                      Main dashboard ("/")
  inventory/
    grocery/
      layout.tsx                Grocery shell: AppShell + grocery nav + grocery theme + GroceryDataProvider
      dashboard/page.tsx
      customers/page.tsx
      vendors/page.tsx
      products/page.tsx
      categories/page.tsx
      brands/page.tsx
      new-entry/page.tsx
      purchases/page.tsx
      sales/page.tsx
      inventory/page.tsx
      low-stock/page.tsx
      expiry/page.tsx
      reports/page.tsx
    medical/
      layout.tsx                Medical shell: AppShell + medical nav + medical theme + MedicalDataProvider
      dashboard/page.tsx
      customers/page.tsx
      suppliers/page.tsx
      medicines/page.tsx
      categories/page.tsx
      manufacturers/page.tsx
      new-entry/page.tsx
      purchases/page.tsx
      sales/page.tsx
      inventory/page.tsx
      batches/page.tsx
      expiry/page.tsx
      prescriptions/page.tsx
      reports/page.tsx
    electronics/
      layout.tsx                Electronics shell: AppShell + electronics nav + electronics theme + ElectronicsDataProvider
      dashboard/page.tsx
      customers/page.tsx
      vendors/page.tsx
      products/page.tsx
      categories/page.tsx
      brands/page.tsx
      models/page.tsx
      new-entry/page.tsx
      purchases/page.tsx
      sales/page.tsx
      inventory/page.tsx
      serial-numbers/page.tsx
      warranty/page.tsx
      returns/page.tsx
      reports/page.tsx

components/
  shared/
    AppShell.tsx                Sidebar + Header + content wrapper, used by every vertical layout
    Sidebar.tsx                 Renders nav items passed in via config
    Header.tsx                  Top bar: page title, search, notifications, (no vertical switcher)
    StatCard.tsx
    DataTable.tsx                Generic table: columns config + rows
    SearchBar.tsx
    FilterBar.tsx
    Modal.tsx
    FormPanel.tsx                Slide-over/drawer for New Entry / Edit forms
    Button.tsx
    Badge.tsx
    Toast.tsx / NotificationCenter.tsx
    ChartWrapper.tsx             Thin wrapper around Recharts with shared styling
    EmptyState.tsx
    Pagination.tsx
    Breadcrumbs.tsx
    PageHeader.tsx
  dashboard/
    VerticalCard.tsx             Grocery/Medical/Electronics entry card on main dashboard
    PlatformStats.tsx
  grocery/
    ExpiryBadge.tsx, WeightUnitLabel.tsx, BarcodeDisplay.tsx, etc.
  medical/
    BatchBadge.tsx, PrescriptionRequiredBadge.tsx, MRPDisplay.tsx, GenericNameField.tsx, etc.
  electronics/
    SerialNumberField.tsx, IMEIField.tsx, WarrantyBadge.tsx, ModelSpecList.tsx, etc.

lib/
  types/
    shared.ts                   Base interfaces: BaseProduct, BaseCustomer, BaseVendor, BaseSaleRecord, etc.
    grocery.ts                  Extends shared types with grocery-specific fields
    medical.ts                  Extends shared types with medical-specific fields
    electronics.ts              Extends shared types with electronics-specific fields
  mock-data/
    grocery/  (products.ts, customers.ts, vendors.ts, categories.ts, brands.ts, purchases.ts, sales.ts)
    medical/  (medicines.ts, customers.ts, suppliers.ts, manufacturers.ts, batches.ts, purchases.ts, sales.ts, prescriptions.ts)
    electronics/ (products.ts, customers.ts, vendors.ts, brands.ts, models.ts, purchases.ts, sales.ts, serials.ts)
  data/
    groceryRepository.ts        getProducts/addProduct/updateProduct/deleteProduct/etc. — future API swap point
    medicalRepository.ts
    electronicsRepository.ts
  context/
    GroceryDataProvider.tsx     Context + useReducer, seeded from mock-data, exposes repository-shaped API
    MedicalDataProvider.tsx
    ElectronicsDataProvider.tsx
  config/
    navigation.ts                Per-vertical nav item arrays: { label, href, icon }
    theme.ts                     Per-vertical accent color tokens
  utils/
    formatters.ts, id.ts, filters.ts, etc.
```

# Component Architecture

- **Shared components** (`components/shared/`) know nothing about "grocery/medical/electronics" — they take props/config (columns, nav items, stat values, chart data) and render generically.
- **Vertical-specific components** (`components/grocery/`, `components/medical/`, `components/electronics/`) are small, focused display widgets for fields that only make sense in that vertical (e.g. `IMEIField`, `PrescriptionRequiredBadge`, `ExpiryBadge`). They compose shared primitives (Badge, Button) rather than reimplementing them.
- Pages compose shared layout components + vertical-specific field components + data from that vertical's Context provider.
- No component should contain `if (vertical === 'grocery')` branching logic. If a component needs to look different per vertical, it takes that difference as a prop/config, not as an internal conditional on vertical identity.

# Grocery Architecture

**Nav/pages:** Dashboard, Customers, Vendors, Products, Categories, Brands, New Entry, Purchases, Sales, Inventory, Low Stock, Expiry, Reports.

**Domain concepts / fields:** unit of measure (Kg, Gram, Litre, Packet, Piece), weight/volume, expiry date, barcode, stock level, low-stock threshold.

**Mock data theme:** Rice, Sugar, Salt, Cooking Oil, Milk, Bread, Biscuits, Flour, and similar everyday grocery SKUs, with realistic units, prices, and stock counts.

# Medical Architecture

**Nav/pages:** Dashboard, Customers, Suppliers, Medicines, Categories, Manufacturers, New Entry, Purchases, Sales, Inventory, Batches, Expiry, Prescriptions, Reports.

**Domain concepts / fields:** generic name, manufacturer, batch number, manufacturing date, expiry date, MRP, prescription-required flag, medicine category.

**Mock data theme:** Paracetamol, Amoxicillin, Vitamin tablets, Cough syrup, and similar realistic pharmacy SKUs, with batch/expiry data.

# Electronics Architecture

**Nav/pages:** Dashboard, Customers, Vendors, Products, Categories, Brands, Models, New Entry, Purchases, Sales, Inventory, Serial Numbers, Warranty, Returns, Reports.

**Domain concepts / fields:** brand, model, serial number, IMEI (for phones), warranty period/status, product specifications, return status.

**Mock data theme:** Smartphones, Laptops, TVs, Headphones, Smartwatches, and similar realistic electronics SKUs, with serials/IMEIs and warranty info.

# Shared Components

Sidebar, Header, StatCard, DataTable, SearchBar, FilterBar, Modal, FormPanel (drawer), Button, Badge, Toast/NotificationCenter, ChartWrapper, EmptyState, Pagination, Breadcrumbs, PageHeader, AppShell.

Rules:
- Every shared component is vertical-agnostic and driven entirely by props/config.
- Accent color is applied via a CSS variable set by the active vertical's layout, not hardcoded into the component.
- New cross-vertical UI needs (e.g. a new kind of card) go into `components/shared/`; anything that only one vertical will ever use goes into that vertical's component folder.

# Mock Data Strategy

- Each vertical's seed data lives in `lib/mock-data/<vertical>/*.ts` as typed arrays (typed against `lib/types/<vertical>.ts`).
- Data is **realistic and populated** — enough rows that tables, dashboards, and charts look like a real, in-use system (not 2-3 placeholder rows).
- `lib/data/<vertical>Repository.ts` exposes functions like `getProducts()`, `addProduct(product)`, `updateProduct(id, changes)`, `deleteProduct(id)`, etc. Today these operate on the in-memory reducer state; this is the seam where real API calls will be swapped in later.
- Each vertical's `DataProvider` (`lib/context/<vertical>DataProvider.tsx`) initializes `useReducer` state from the mock-data seed, and exposes the repository-shaped functions via Context so pages never touch raw arrays directly.
- No mock data crosses vertical boundaries (Grocery customers are not visible to Medical, etc.) — each vertical's Customers/Vendors/Suppliers are separate datasets, per the "per-vertical" decision.

# State Management

- React Context + `useReducer`, one provider per vertical, mounted in that vertical's `layout.tsx` so it's scoped to all pages under `/inventory/<vertical>/...` and shared between them for the session.
- No global cross-vertical store — verticals are isolated; the only shared "state" is UI chrome state (e.g. sidebar collapsed) which can live in a small shared UI context or local state.
- CRUD actions (add/edit/delete) dispatch reducer actions that update in-memory arrays immediately, so navigating between pages (e.g. New Entry → Inventory) reflects the change without a refresh.
- `localStorage` is the **current, sanctioned persistence layer** — namespaced per vertical (`inventory:grocery`, `inventory:medical`, `inventory:electronics` — see `lib/utils/storage.ts`, `GROCERY_STORAGE_KEY`/`MEDICAL_STORAGE_KEY`/`ELECTRONICS_STORAGE_KEY` in each `lib/data/<vertical>Repository.ts`). This is a deliberate decision, not an oversight, and supersedes the earlier in-memory-only design. Mock data (`lib/mock-data/<vertical>/*.ts`) is **only the fallback/initial seed** — it is never the source of truth once a browser has persisted data for a vertical.
- **Persisted `localStorage` data always takes priority over mock data at startup.** On every load: if `inventory:<vertical>` exists in `localStorage`, that data becomes the app state and the mock seed is discarded; mock data is written to `localStorage` only the very first time a vertical has no stored data yet, to establish an initial persisted dataset. The mock-seeded initial render must never overwrite an existing `localStorage` entry — this is the rule that keeps a refresh from silently reverting user-created, edited, or deleted records back to the seed data.
- `useReducer` is always initialized from mock data on every render (server and client) to keep the initial render deterministic and hydration-safe — reading `localStorage` during SSR or module init is not allowed (see "Things Claude Must NOT Do"). Hydration from `localStorage` happens only in a client-only `useEffect` after mount:
  - If a stored dataset exists, it is dispatched into the reducer via a `HYDRATE` action, replacing the mock-seeded state. **No write to `localStorage` happens in this branch** — writing here (before the `HYDRATE` dispatch has actually landed in `state`) is exactly the bug that let the mock seed clobber real persisted data on refresh.
  - If nothing is stored, the mock-seeded state is written to `localStorage` once, becoming the initial persisted dataset.
  - A **separate** effect, keyed off `state` and skipping only its very first (mount) invocation via a ref, persists every subsequent state change. Skipping the mount invocation — rather than gating on an eagerly-set flag — is what guarantees this effect never fires with the stale, pre-hydration mock state: by the time it runs again, either the `HYDRATE` dispatch has landed or a real CRUD change occurred.
- CRUD mutations persist automatically: every dispatch updates in-memory state, which re-triggers the persist effect above and writes the new state to that vertical's `localStorage` key — no page/component needs to call `writeStorage` directly.
- Derived views (e.g. Grocery Inventory/Low Stock/Expiry, Medical Batches, Electronics Warranty/Serial Numbers) are never persisted separately — they continue to be calculated from the same persisted source state (products/medicines/etc.) on every render, not stored under their own key.
- Persistence must never be implemented by rewriting the mock-data source files (e.g. editing `lib/mock-data/<vertical>/products.ts` at runtime) — `localStorage` via `lib/utils/storage.ts` is the only persistence mechanism; mock-data files stay static, read-only seed data.
- This `localStorage` layer is a placeholder/seam for a future backend and must remain swappable later (see "Future Backend Integration") without changing how pages consume Context data — only the read/write calls inside each Provider's effects change.

# Navigation Rules

- Sidebar nav items per vertical come from `lib/config/navigation.ts`, keyed by vertical, in the exact order given in the approved module lists (see Grocery/Medical/Electronics Architecture above).
- No vertical switcher lives inside a vertical's header/sidebar. To move to a different vertical, the user navigates back to `/` (main dashboard) and selects a card.
- The main dashboard is reachable from inside a vertical only via a clearly labeled "Back to Dashboard" link/logo, not via a dropdown of the other two verticals.
- Active nav item is highlighted using the vertical's accent color token.

# UI/UX Rules

- One shared design language across all three verticals: consistent spacing, typography scale, card/table/modal styling, button styles, icon set (Lucide).
- Each vertical gets a distinct **accent color** (applied via CSS variable from `lib/config/theme.ts`) used for sidebar active states, primary buttons, key badges, and chart series — everything else stays neutral/shared.
- Dashboards (main + per-vertical) include stat cards and at least one chart (e.g. sales trend, stock-level breakdown) built from that vertical's mock data.
- Reports pages have functional client-side filters (date range, category, etc.) that actually filter the in-memory mock data — not just decorative filter UI.
- Forms (New Entry, Edit) use the shared `FormPanel`/`Modal` and, on submit, dispatch real state updates via the vertical's repository/provider — not just a toast with no effect.
- Notifications/toasts confirm actions (e.g. "Product added", "Low stock alert") using the shared `Toast`/`NotificationCenter` component.

# Responsive Design Rules

- Desktop-first, mobile-usable: primary design target is desktop/tablet (this is how inventory staff would actually use such a tool), but nothing should break on mobile.
- Sidebar collapses to an off-canvas/drawer on small screens; tables get horizontal scroll or a stacked/card view on narrow widths; forms stack to single column.
- Do not invest in pixel-perfect mobile layouts beyond "doesn't break and is usable" unless asked.

# Naming Conventions

- Route folders: kebab-case, matching the URL segment exactly (e.g. `low-stock`, `new-entry`, `serial-numbers`).
- Components: PascalCase filenames matching the exported component (e.g. `StatCard.tsx`).
- Vertical-specific components prefixed by nothing extra (folder already scopes them, e.g. `components/medical/BatchBadge.tsx`, not `MedicalBatchBadge.tsx`).
- Types: singular PascalCase interfaces (e.g. `GroceryProduct`, `MedicalMedicine`, `ElectronicsProduct`), extending shared base interfaces from `lib/types/shared.ts`.
- Mock data files: plural lowercase matching the entity (e.g. `products.ts`, `customers.ts`, `batches.ts`).
- Repository functions: `get<Entity>s`, `add<Entity>`, `update<Entity>`, `delete<Entity>` (e.g. `getMedicines`, `addMedicine`).

# Coding Conventions

- TypeScript everywhere; no `any` — define proper interfaces in `lib/types/`.
- Functional components + hooks only.
- Keep components focused: a page composes smaller components rather than being one large file.
- Co-locate vertical-specific logic inside that vertical's folder; never branch shared components on "which vertical is this."
- Prefer Tailwind utility classes; avoid ad hoc inline styles except for dynamic accent-color wiring via CSS variables.
- Keep mock data realistic in volume and content, not placeholder-looking (real product names, plausible prices/stock/dates).

# Reusability Rules

- Before creating a new component, check `components/shared/` first — if the need isn't truly vertical-specific, build/extend a shared component instead of duplicating per vertical.
- A shared component should never import from a vertical-specific folder.
- Configuration (nav items, theme colors, table columns) is what varies per vertical — components themselves should not need to vary.

# Future Backend Integration

The architecture is intentionally structured so a backend can be added later with minimal rework:

- **Repository layer (`lib/data/*Repository.ts`)** is the seam: swap in-memory array operations for real API/Prisma calls inside these functions; calling code (Context providers, pages) does not need to change.
- **Types (`lib/types/*.ts`)** are already shaped like real domain models, so they can map directly to future Prisma schemas/API response shapes.
- **Context providers** can later be swapped for data-fetching hooks (e.g. React Query) without changing how pages consume data, since pages already go through provider-exposed functions rather than touching arrays directly.
- **The current `localStorage` persistence layer (`lib/utils/storage.ts`)** is itself a placeholder seam: when a real backend arrives, the read/write calls in each Provider can be replaced with API/Prisma calls without changing routes, components, or the Context/repository shape.
- When a backend is introduced, expect: Prisma schema per vertical's entities, API routes or server actions replacing repository internals and the `localStorage` calls, and possibly auth — none of this should require restructuring routes, components, or the folder layout defined here.

# Things Claude Must NOT Do

- Do not add a backend, database, Prisma schema, API routes-as-backend, or authentication unless explicitly instructed.
- Do not access `localStorage` during server rendering or module initialization, and do not let it produce a different initial server/client render (hydration-safe: read it only from a client-only effect after mount).
- Do not write the mock-seeded initial state to `localStorage` when a stored dataset already exists for that vertical — persisted data always wins over mock data on startup; only write the mock seed when nothing is stored yet.
- Do not persist state by rewriting mock-data source files (e.g. `lib/mock-data/<vertical>/*.ts`) at runtime — `localStorage` via `lib/utils/storage.ts` is the only persistence mechanism.
- Do not add a cross-vertical switcher inside a vertical's shell.
- Do not merge the three verticals into one dynamic `[type]` route/template.
- Do not turn the main dashboard into an admin/config panel.
- Do not add dark mode unless asked.
- Do not branch shared components on vertical identity (`if (vertical === 'grocery')`); use config/props instead.
- Do not invent new nav items/pages beyond the approved module lists without checking first.
- Do not over-build mobile responsiveness beyond "usable, doesn't break" without being asked.
- Do not install new dependencies beyond what's listed in Technology Stack without checking first.

# Development Workflow

1. Scaffold shared design tokens and `AppShell`/`Sidebar`/`Header` first, since every route depends on them.
2. Build `lib/types/`, `lib/mock-data/`, `lib/data/*Repository.ts`, and `lib/context/*DataProvider.tsx` for one vertical at a time (suggest starting with Grocery as the reference implementation).
3. Build that vertical's pages using shared components, validating the pattern works end-to-end (nav → data → CRUD → dashboard stats/charts reflect changes).
4. Repeat the pattern for Medical, then Electronics, reusing everything from `components/shared/` and only adding what's genuinely vertical-specific.
5. Build the main dashboard last (or in parallel), once vertical dashboards exist to pull representative stats from.
6. Before adding any new shared component, check whether an existing one can be configured to do the job instead.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
