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
- **Vertical branding (emoji + name) lives in the top header, not the sidebar.** `AppShell` passes each layout's `verticalLabel`/`verticalEmoji` straight through to `Header`, which renders it next to the mobile menu button; `Sidebar` renders only the "Back to Dashboard" link and nav items — no brand block. This applies to all three verticals identically (shared component, no per-vertical branching).
- **Currency is ₹ (Indian Rupees) sitewide** — Grocery, Medical, and Electronics all format money via `formatCurrency` in `lib/utils/formatters.ts` (`Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" })`). Never hardcode `$`/`USD`/a dollar sign in a page, component, or form label — route every currency value through `formatCurrency`.
- **Demo/mock data uses an Indian context sitewide** — customers, suppliers/vendors, contact names, phone numbers (`+91 XXXXX-XXXXX`), and addresses (city/state/PIN) across all three verticals reflect Indian names and geography, consistent with the ₹ currency. Product/medicine names, brands, and barcodes (GS1 India `890` prefix) should stay India-appropriate. Preserve existing IDs and foreign-key relationships when editing seed data — only display fields (names/phones/addresses) change; a denormalized name copy (e.g. a sale's `customerName`) must always match the customer/supplier it references by id.

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
/inventory/grocery/stock-adjustments
/inventory/grocery/wastage
/inventory/grocery/reports

/inventory/medical/dashboard
/inventory/medical/customers
/inventory/medical/suppliers
/inventory/medical/medicines
/inventory/medical/categories
/inventory/medical/manufacturers
/inventory/medical/purchases           Tabs: Purchase Orders / Purchases / Purchase Returns
/inventory/medical/sales               Tabs: Sales / Sales Returns
/inventory/medical/prescriptions
/inventory/medical/inventory
/inventory/medical/stock-adjustments
/inventory/medical/batches
/inventory/medical/low-stock
/inventory/medical/expiry

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
      stock-adjustments/page.tsx
      wastage/page.tsx
      reports/page.tsx
    medical/
      layout.tsx                Medical shell: AppShell + medical nav (grouped into sections) + medical theme + MedicalDataProvider
      dashboard/page.tsx        Tab host (Overview / Reports / Analytics / Import-Export) — see components/medical/*Section.tsx
      customers/page.tsx
      suppliers/page.tsx
      medicines/page.tsx        No "New Entry" route — adding a medicine is a "+ Add Medicine" action on this page
      categories/page.tsx
      manufacturers/page.tsx
      purchases/page.tsx        Tab host (Purchase Orders / Purchases / Purchase Returns) — see components/medical/*Section.tsx
      sales/page.tsx            Tab host (Sales / Sales Returns) — see components/medical/*Section.tsx; FEFO-aware, links a completed sale to a pending prescription when applicable
      prescriptions/page.tsx
      inventory/page.tsx        Derived per-medicine view (total stock = SUM of active batch quantities)
      stock-adjustments/page.tsx
      batches/page.tsx          Real per-batch collection (medicine:batch is one-to-many)
      low-stock/page.tsx        Derived filter of medicines where totalStock <= minimumStock
      expiry/page.tsx           Batch-level, via lib/utils/medicalStock.ts wrapping the shared expiry helper
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
    AppShell.tsx                Sidebar + Header + content wrapper, used by every vertical layout; passes
                                 `verticalLabel`/`verticalEmoji` through to Header (not Sidebar) and an
                                 optional `notificationPanel` prop through to Header (no vertical switcher)
    Sidebar.tsx                 Renders nav items passed in via config only — no vertical branding (icon/
                                 name) here, that lives in the header; fixed/sticky on desktop (lg:), only
                                 its own nav list scrolls internally if it overflows — main content scrolls
                                 independently
    Header.tsx                  Top bar: vertical branding (emoji + label, via optional `verticalLabel`/
                                 `verticalEmoji` props), page title, search, notification bell (opens the
                                 optional `notificationPanel` node as a dropdown when supplied; static
                                 otherwise)
    Tabs.tsx                    Generic tab bar (config-driven: {value,label}[]) for consolidating related
                                 pages under one route, selected via a `?tab=` query param
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
    ExpiryBadge.tsx, WeightUnitLabel.tsx, BarcodeDisplay.tsx, StockAdjustmentForm.tsx, etc.
  medical/
    MedicineForm.tsx, PurchaseForm.tsx, PurchaseOrderForm.tsx, ReceivePOForm.tsx, SaleForm.tsx,
    SalesReturnForm.tsx, PurchaseReturnForm.tsx, StockAdjustmentForm.tsx, PrescriptionForm.tsx,
    CustomerForm.tsx, SupplierForm.tsx, MedicalExpiryBadge.tsx, PrescriptionRequiredBadge.tsx,
    PurchasesSection.tsx, PurchaseOrdersSection.tsx, PurchaseReturnsSection.tsx (tabs under /purchases),
    SalesSection.tsx, SalesReturnsSection.tsx (tabs under /sales),
    DashboardOverview.tsx, ReportsSection.tsx, AnalyticsSection.tsx, ImportExportSection.tsx
      (tabs under /dashboard), NotificationsPanel.tsx (rendered in the header bell's dropdown, not a route)
  electronics/
    SerialNumberField.tsx, IMEIField.tsx, WarrantyBadge.tsx, ModelSpecList.tsx, etc.

lib/
  types/
    shared.ts                   Base interfaces: BaseProduct, BaseCustomer, BaseVendor, BaseSaleRecord, etc.
    grocery.ts                  Extends shared types with grocery-specific fields
    medical.ts                  Extends shared types with medical-specific fields
    electronics.ts              Extends shared types with electronics-specific fields
  mock-data/
    grocery/  (products.ts, customers.ts, vendors.ts, categories.ts, brands.ts, purchases.ts, sales.ts, adjustments.ts)
    medical/  (medicines.ts, batches.ts, customers.ts, suppliers.ts, categories.ts, manufacturers.ts, purchaseOrders.ts, purchases.ts, sales.ts, salesReturns.ts, purchaseReturns.ts, stockAdjustments.ts, prescriptions.ts)
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
    navigation.ts                Per-vertical nav item arrays: { label, href, icon, section? } — `section`
                                  is optional; a vertical that omits it on every item renders as a flat
                                  list (Grocery, Electronics), one that sets it on every item renders
                                  grouped with section headers (Medical)
    theme.ts                     Per-vertical accent color tokens
  utils/
    formatters.ts                 `formatCurrency` — all three verticals display currency in ₹ (Indian
                                   Rupees) via this shared helper
                                   (`Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" })`);
                                   also id.ts, filters.ts, expiry.ts (shared expiry-status helper, all verticals), etc.
    medicalStock.ts               Medical-only: derives a medicine's total stock/low-stock/expiry status
                                   from its batches — never duplicate this logic in a page or component
    medicalFefo.ts                Medical-only: pure First-Expiry-First-Out batch allocation helper
```

# Component Architecture

- **Shared components** (`components/shared/`) know nothing about "grocery/medical/electronics" — they take props/config (columns, nav items, stat values, chart data) and render generically.
- **Vertical-specific components** (`components/grocery/`, `components/medical/`, `components/electronics/`) are small, focused display widgets for fields that only make sense in that vertical (e.g. `IMEIField`, `PrescriptionRequiredBadge`, `ExpiryBadge`). They compose shared primitives (Badge, Button) rather than reimplementing them.
- Pages compose shared layout components + vertical-specific field components + data from that vertical's Context provider.
- No component should contain `if (vertical === 'grocery')` branching logic. If a component needs to look different per vertical, it takes that difference as a prop/config, not as an internal conditional on vertical identity.

# Grocery Architecture

**Nav/pages:** Dashboard, Customers, Vendors, Products, Categories, Brands, New Entry, Purchases, Sales, Inventory, Low Stock, Expiry, Stock Adjustments, Wastage, Reports.

**Domain concepts / fields:** unit of measure (Kg, Gram, Litre, Packet, Piece), weight/volume, expiry date, barcode, stock level, low-stock threshold, stock adjustments (increase/decrease with a reason — Damaged, Lost, Wastage, Stock Count, Manual Correction) that mutate a product's stock and back the Wastage view.

**Data flow:** Products, Purchases, Sales, and Stock Adjustments all live in one `GroceryState` (see State Management). Completing a Purchase increases the relevant products' `stockQty`; completing a Sale decreases it (blocked client-side if it would exceed available stock); a Stock Adjustment applies its +/- delta directly. Inventory, Low Stock (`stockQty <= reorderLevel`), Expiry (via the shared `lib/utils/expiry.ts` helper), Wastage (adjustments filtered to decrease + Damaged/Wastage reasons), Dashboard, and Reports are all derived from this same state on every render — none of them hold separate data.

**Mock data theme:** Rice, Sugar, Salt, Cooking Oil, Milk, Bread, Biscuits, Flour, and similar everyday grocery SKUs, with realistic units, prices, and stock counts.

# Medical Architecture

**Nav/pages (grouped sections in the sidebar):**
- Dashboard
- Masters: Customers, Suppliers, Medicines, Categories, Manufacturers
- Purchasing: Purchases
- Sales: Sales, Prescriptions
- Inventory: Inventory, Stock Adjustments, Batches, Low Stock, Expiry

The sidebar has **no dropdowns, expandable groups, or nested navigation** — `MASTERS`, `PURCHASING`,
`SALES`, and `INVENTORY` are plain visual section-header labels (rendered by `Sidebar.tsx`'s
`groupBySection`) above flat, directly clickable links. There is no "New Entry" route for Medical. Adding
a medicine, customer, supplier, etc. is a contextual "+ Add" action on that entity's own page (e.g.
"+ Add Medicine" on Medicines), not a separate nav item. Barcode is a field on `MedicalMedicine` plus a
search predicate on the Medicines page — not its own route.

**Consolidated pages (tabs, not sidebar items):** Purchase Orders, Purchase Returns, Sales Returns,
Reports, Analytics, Import/Export, and Notifications no longer have their own nav item or route. Instead:
- `/inventory/medical/purchases` hosts a `Tabs` bar — Purchase Orders / Purchases / Purchase Returns
  (`?tab=purchase-orders|purchases|purchase-returns`, default Purchases) — rendering
  `components/medical/PurchaseOrdersSection.tsx` / `PurchasesSection.tsx` / `PurchaseReturnsSection.tsx`.
- `/inventory/medical/sales` hosts a `Tabs` bar — Sales / Sales Returns (`?tab=sales|sales-returns`,
  default Sales) — rendering `components/medical/SalesSection.tsx` / `SalesReturnsSection.tsx`.
  `Prescriptions` remains its own separate sidebar item and route.
- `/inventory/medical/dashboard` hosts a `Tabs` bar — Overview / Reports / Analytics / Import & Export
  (`?tab=overview|reports|analytics|import-export`, default Overview) — rendering
  `components/medical/DashboardOverview.tsx` / `ReportsSection.tsx` / `AnalyticsSection.tsx` /
  `ImportExportSection.tsx`.
- Notifications have no page at all: `components/medical/NotificationsPanel.tsx` renders the same derived
  alert list inside a dropdown opened from the header bell (`AppShell`/`Header`'s `notificationPanel`
  prop), wired up in `app/inventory/medical/layout.tsx`.
- When adding a genuinely new Medical page, default to a new tab on the closest existing consolidated
  page (Purchasing/Sales/Dashboard) rather than a new top-level nav item, unless it doesn't fit any of
  them.

## Medicine vs. Batch — the core data model

Medical distinguishes **Medicine** (master/catalog data) from **Batch** (a specific received stock lot):

- `MedicalMedicine` (`lib/types/medical.ts`) holds only catalog fields: name, genericName, brandName,
  sku, barcode, categoryId, manufacturerId, dosageForm, strength, packSize, unit, purchasePrice,
  sellingPrice, mrp, minimumStock, prescriptionRequired, active. **It does not extend `BaseProduct`** and
  has **no `stockQty` or `expiryDate` field** — those are batch-specific and must never be reintroduced
  onto the medicine.
- `MedicalBatch` holds the stock-bearing fields: medicineId, batchNumber, manufacturingDate, expiryDate,
  quantity, purchasePrice, mrp, supplierId, date. A medicine can have any number of batches.
- **A medicine's total stock is always `SUM(quantity)` over its batches with `quantity > 0`** — computed
  on every render via `getMedicineTotalStock(batches, medicineId)` in `lib/utils/medicalStock.ts`. This
  value is never stored on the medicine or cached anywhere. The same file exposes `isLowStock`,
  `getMedicineActiveBatches`, `getBatchExpiryStatus` (a thin wrapper around the shared
  `lib/utils/expiry.ts` helper — never fork that logic), and `getExpiringOrExpiredBatches` (excludes
  batches with `quantity <= 0`, since exhausted batches are not active inventory).

## FEFO (First-Expiry-First-Out)

`lib/utils/medicalFefo.ts` exports `allocateFefo(batches, medicineId, requestedQty)`, a pure function that
sorts the medicine's active batches by `expiryDate` ascending and greedily allocates the requested
quantity earliest-expiry-first, returning the per-batch allocations plus any shortfall. This is the
**only** place FEFO logic may live — `SaleForm` calls it for a live pre-submit shortfall preview, and
`lib/data/medicalRepository.ts` calls it again at commit time inside `addSale`/`updateSaleStatus` (never
trusting a stale client-computed allocation). A sale's line items record which batches were drawn from
via `batchAllocations: { batchId, batchNumber, quantity }[]`.

## Purchase Order → Purchase → Batch → Inventory flow

- A `MedicalPurchaseOrder` has status `draft | pending | received | cancelled` and **never affects
  stock**, regardless of status, until it is received.
- **Receiving** a PO (`receivePurchaseOrder` in the repository) builds a completed `MedicalPurchase` from
  the batch details entered at receipt time and routes it through the exact same `addPurchase` /
  batch-upsert path a direct Purchase uses (`upsertBatchOnReceipt`) — so there is only one code path that
  ever creates or increases a batch, whether stock arrived via a PO or a direct Purchase entry.
- A direct `MedicalPurchase` only creates/updates a batch when `status === "completed"` (a `pending`
  purchase does not move stock, matching Grocery's purchase semantics).
- `upsertBatchOnReceipt` matches an existing batch by `(medicineId, batchNumber)`: if found it increases
  that batch's quantity and refreshes its price/expiry/supplier; otherwise it creates a new batch.

## Sale flow (FEFO + prescription-aware)

A completed sale calls `allocateFefo` per line item, decrements the allocated batches, and stamps
`batchAllocations` onto the sale record — this is the only way batch stock decreases from a sale. Selling
a `prescriptionRequired` medicine surfaces a banner in `SaleForm` requiring either a linked pending
prescription (from `MedicalPrescription`) or an explicit walk-in override checkbox. **A prescription is
only marked `fulfilled` by the explicit `fulfillPrescription(prescriptionId, saleId)` action fired when a
sale with a linked prescription is submitted — never automatically, and never merely by viewing the
prescription.** `MedicalPrescription.fulfilledBySaleId` records which sale fulfilled it.

## Returns and Stock Adjustments

- **Sales Returns** (`addSalesReturn`) restock into the batch the original sale drew from (via its
  `batchAllocations[0]`) if that batch still exists; otherwise the medicine's latest-expiry active batch;
  otherwise a synthetic `RETURN-<saleId>` batch is created so returned stock is never silently lost.
- **Purchase Returns** (`addPurchaseReturn`) decrease a named batch's quantity, clamped at 0, and can
  never exceed that batch's available quantity (the form caps the input).
- **Stock Adjustments** (`addStockAdjustment`) increase/decrease a specific batch's quantity (clamped at
  0) with a reason (Damaged, Expired, Lost, Manual Correction, Stock Count, Other). If no `batchId` is
  given and the medicine has more than one (or zero) active batches, the adjustment is recorded but does
  **not** guess a batch to mutate — guessing would corrupt FEFO ordering.

All three of the above are **derived-state mutators, never separate stock records** — Inventory, Low
Stock, Expiry, Dashboard, Reports, Analytics, and Notifications all recompute from the same
`medicines`/`batches` arrays afterward; none of them read a purchase/sale/return/adjustment total as if it
were an independent stock figure.

## Derived views — no duplicated datasets

Inventory, Low Stock, Expiry, Dashboard stats, Reports, Analytics, and Notifications are **always**
computed live from `medicines`, `batches`, `purchaseOrders`, `purchases`, `sales`, `salesReturns`,
`purchaseReturns`, `stockAdjustments`, `prescriptions`, `customers`, and `suppliers` — never from a
separate stored dataset. Do not create files like `medicalInventoryData.ts`, `medicalLowStockData.ts`,
`medicalExpiryData.ts`, or `medicalDashboardStats.ts` — if a new page needs a new aggregate, add a pure
derivation function (in `lib/utils/medicalStock.ts` or inline in the page) over the existing state.

## LocalStorage schema note

`MedicalState` grew additive array fields (`batches`, `purchaseOrders`, `salesReturns`,
`purchaseReturns`, `stockAdjustments`) on top of the original shape. `STORAGE_VERSION` was **not**
bumped for this change — the existing `HYDRATE` reducer case (`{ ...getInitialMedicalState(),
...action.state }`) already backfills any array missing from an older persisted payload, which is exactly
what an additive schema change like this needs. `MedicalMedicine` also **dropped**
`stockQty`/`expiryDate`/`batchNumber`; any of those fields lingering on old persisted medicine records are
inert (nothing reads them) and are harmless to leave in place. If a future Medical schema change ever
*removes or renames* a field that old data still needs to satisfy new required logic, add an explicit
migration step in `MedicalDataProvider`'s hydration effect rather than relying on the merge trick or
bumping the storage version (which would silently discard all persisted Medical data).

**Mock data theme:** Paracetamol, Amoxicillin, Vitamin tablets, Cough syrup, and similar realistic
pharmacy SKUs, now split across `medicines.ts` (catalog) and `batches.ts` (stock lots, with a deliberate
mix of expired/expiring-soon/healthy batches, some medicines with only one batch, and at least one
medicine with zero batches to exercise the out-of-stock state). Manufacturers (Cipla, Sun Pharma, GSK,
Abbott, Dr. Reddy's) and medicine barcodes (GS1 India `890` prefix) already reflect an Indian pharmacy
context; `customers.ts` and `suppliers.ts` use Indian names, `+91` phone numbers, and Indian
city/state/PIN addresses — keep new Medical seed data consistent with this Indian pharmacy setting, and
currency throughout Medical is ₹ (see `lib/utils/formatters.ts`'s `formatCurrency`), not $.

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
- `Sidebar`/`navigation.ts` support an optional `section?: string` on `NavItem` for grouped sidebars
  (used by Medical today); omitting it on every item (Grocery, Electronics) renders the original flat
  list unchanged.
- `ChartWrapper` supports an optional `type?: "bar" | "line" | "pie"` (default `"bar"`, used by Medical's
  Analytics page for trend lines and distribution pies); omitting it keeps the original bar-chart-only
  behavior Grocery and Electronics already rely on.

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

