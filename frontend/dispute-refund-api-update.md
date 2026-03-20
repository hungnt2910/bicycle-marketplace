# Dispute & Refund — Frontend API Synchronization Guide
## (Buyer + Admin roles — Web Frontend)

> **Generated**: 2026-03-12
> **Scope**: Only frontend changes. Backend code MUST NOT be modified.
> **Inspector role**: See separate file `docs/inspector-dispute-api.md`

---

## SECTION 1 — Backend API Reference

### 1.1 Global Prefix

```
app.setGlobalPrefix('api/v1');   // main.ts line 18
```

All endpoints below are prefixed with `/api/v1/`.

---

### 1.2 Dispute Endpoints

#### `POST /api/v1/disputes` — Create Dispute (Buyer)

| Item | Detail |
|------|--------|
| **Guard** | `JwtAuthGuard` + `RolesGuard` |
| **Allowed roles** | `buyer` |
| **Request body** (`CreateDisputeDto`) | See below |
| **Response** | `{ message: string, data: Dispute }` |

**Request Body:**
```json
{
  "transactionId": "string (required — MongoDB ObjectId)",
  "reason": "string (required — DisputeReason enum)",
  "description": "string (required — detailed issue description)",
  "evidence": {
    "photos": ["string[]? — photo URLs"],
    "videos": ["string[]? — video URLs"],
    "documents": ["string[]? — document URLs"]
  }
}
```

**`DisputeReason` enum values:**
| Value | Meaning |
|-------|---------|
| `item_not_received` | Không nhận được hàng |
| `item_not_as_described` | Hàng không đúng mô tả |
| `damaged_item` | Hàng bị hư hỏng |
| `counterfeit_parts` | Linh kiện giả |
| `seller_unresponsive` | Người bán không phản hồi |
| `buyer_refusing_delivery` | Người mua từ chối nhận hàng |
| `other` | Lý do khác |

**Response example:**
```json
{
  "message": "Dispute created successfully. An admin will review your case.",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "transactionId": "...",
    "reporterId": "...",
    "reportedUserId": "...",
    "reason": "item_not_as_described",
    "description": "...",
    "evidence": { "photos": ["..."], "videos": ["..."] },
    "status": "open",
    "timeline": [{ "action": "Dispute opened", "performedBy": "...", "notes": "...", "timestamp": "..." }],
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Side effects:**
- Transaction status → `disputed`
- Escrow is **frozen** (no auto-release)
- Transaction's `dispute` field is populated

---

#### `GET /api/v1/disputes/my-disputes` — Get My Disputes 

| Item | Detail |
|------|--------|
| **Allowed roles** | Any authenticated user |
| **Query params** | `?status=open` (optional — filter by DisputeStatus) |
| **Response** | `{ message: string, data: Dispute[] }` |

**`DisputeStatus` enum values:**
| Value | Meaning |
|-------|---------|
| `open` | Mới mở |
| `under_review` | Admin đang xem xét |
| `awaiting_evidence` | Chờ bằng chứng |
| `resolved_buyer_favor` | Giải quyết có lợi cho buyer |
| `resolved_seller_favor` | Giải quyết có lợi cho seller |
| `resolved_partial_refund` | Hoàn tiền một phần |
| `closed` | Đã đóng |

---

#### `GET /api/v1/disputes/:id` — Get Dispute Detail

| Item | Detail |
|------|--------|
| **Allowed roles** | Any authenticated user |
| **Params** | `:id` — dispute MongoDB ObjectId |
| **Response** | `{ message: string, data: Dispute }` |

**Full Dispute object shape:**
```typescript
interface Dispute {
  _id: string;
  transactionId: string;          // ref → Transaction
  reporterId: string;             // ref → User (buyer)
  reportedUserId?: string;        // ref → User (seller)
  reason: DisputeReason;          // enum (see above)
  description?: string;
  evidence?: {
    photos?: string[];
    videos?: string[];
    documents?: string[];
  };
  inspectorReport?: {
    inspectorId?: string;         // ref → User
    reportId?: string;            // ref → InspectionReport
    comparisonNotes?: string;
  };
  status: DisputeStatus;          // enum (see above)
  assignedAdminId?: string;       // ref → User (admin)
  resolution?: {
    decision?: string;            // 'buyer_favor' | 'seller_favor' | 'partial_refund'
    refundAmount?: number;
    penaltyToSeller?: number;
    penaltyToBuyer?: number;
    notes?: string;
    resolvedAt?: Date;
  };
  timeline?: Array<{
    action: string;
    performedBy: string;          // ref → User
    notes?: string;
    timestamp: Date;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
  resolvedAt?: Date;
}
```

---

#### `PATCH /api/v1/disputes/:id/assign` — Assign Dispute (Admin)

| Item | Detail |
|------|--------|
| **Allowed roles** | `admin` |
| **Params** | `:id` — dispute ObjectId |
| **Request body** | None — admin is extracted from JWT |
| **Response** | `{ message: "Dispute assigned to you", data: Dispute }` |

**Side effects:**
- `assignedAdminId` → current admin
- `status` → `under_review`
- Timeline entry added

---

#### `POST /api/v1/disputes/:id/resolve` — Resolve Dispute (Admin)

| Item | Detail |
|------|--------|
| **Allowed roles** | `admin` |
| **HTTP method** | `POST` (with `@HttpCode(200)`) |
| **Params** | `:id` — dispute ObjectId |
| **Request body** (`ResolveDisputeDto`) | See below |
| **Response** | `{ message: string, data: Dispute }` |

**Request Body:**
```json
{
  "decision": "buyer_favor | seller_favor | partial_refund (required)",
  "refundAmount": 0,
  "penaltyToSeller": 0,
  "penaltyToBuyer": 0,
  "notes": "string (required — admin resolution notes)"
}
```

**Side effects by decision:**
| Decision | Dispute Status | Transaction Status | Escrow Action |
|----------|----------------|-------------------|---------------|
| `buyer_favor` | `resolved_buyer_favor` | `refunded` | `refundFunds()` — buyer gets full refund |
| `seller_favor` | `resolved_seller_favor` | `completed` | `releaseFunds()` — seller gets payout |
| `partial_refund` | `resolved_partial_refund` | *(unchanged)* | *(partial refund logic — placeholder)* |

---

#### `GET /api/v1/disputes/admin/all` — Get All Disputes (Admin)

| Item | Detail |
|------|--------|
| **Allowed roles** | `admin`, `inspector` |
| **Query params** | `?status=open&page=1&limit=20` |
| **Response** | See below |

**Response:**
```json
{
  "message": "Disputes retrieved successfully",
  "data": [ "...Dispute[]" ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "pages": 3
  }
}
```

---

### 1.3 Escrow Endpoints (Admin only)

#### `POST /api/v1/escrow/:transactionId/release` — Manual Release

```json
// Request body
{ "reason": "string" }
// Response
{
  "message": "Funds manually released by admin",
  "data": { "transactionId": "...", "releasedBy": "admin@email.com", "reason": "...", "timestamp": "..." }
}
```

#### `POST /api/v1/escrow/:transactionId/refund` — Manual Refund

```json
// Request body
{ "reason": "string" }
// Response
{
  "message": "Funds manually refunded by admin",
  "data": { "transactionId": "...", "refundedBy": "admin@email.com", "reason": "...", "timestamp": "..." }
}
```

#### `GET /api/v1/escrow/held` — Get Held Transactions
#### `GET /api/v1/escrow/statistics` — Get Escrow Statistics

---

### 1.4 Inspection Endpoints (reference for Inspector mobile doc)

| Endpoint | Method | Roles | Purpose |
|----------|--------|-------|---------|
| `/api/v1/inspections/:id` | GET | Any | Get inspection by ID |
| `/api/v1/inspections/bicycle/:bicycleId` | GET | Any | Get inspection by bicycle ID |
| `/api/v1/disputes/:id/inspector-evidence` | PATCH | inspector | Add comparison notes |

> NOTE: The `PATCH :id/evidence` endpoint (buyer/seller adding evidence) is **commented out** in the backend controller (lines 107-126). This feature is NOT available.

---

## SECTION 2 — Dispute Flow Architecture

```
DISPUTE & REFUND FLOW

  BUYER                    INSPECTOR (Mobile)      ADMIN
  ------                   ------------------      -----

  1. Receives bicycle
     |
  2. Within 3-day refund window
     |
  3. POST /disputes ----------------------------------------> 6. GET admin/all
     |-- Creates dispute                            |           |
     |-- Transaction -> 'disputed'          4. PATCH |        7. PATCH
     +-- Escrow -> frozen                  inspector-|          :id/assign
                                           evidence  |           |
  5. Tracks dispute:                         ^       |        8. Reviews
     GET /my-disputes                        |       |          evidence
     GET /:id                                |       |           |
     |                                       |       |        9. POST
  Wait for resolution <--------------------------------------   :id/resolve
     |                                               |          |-- buyer_
  If buyer_favor:                                    |          |   favor
     -> Wallet credited (refund)                     |          |-- seller_
     -> Transaction -> 'refunded'                    |          |   favor
  If seller_favor:                                   |          +-- partial_
     -> Seller wallet credited (release)             |              refund
     -> Transaction -> 'completed'                   |
                                                     |        10. Optional:
                                                     |        POST escrow/
                                                     |        :txId/refund
                                                     |        POST escrow/
                                                     |        :txId/release
```

### Flow Summary

1. **Buyer** creates dispute via `POST /api/v1/disputes` with `transactionId`, `reason`, `description`, and optional `evidence`
2. Transaction status auto-changes to `disputed`, escrow gets frozen
3. **Inspector** (mobile app) may add comparison notes via `PATCH /api/v1/disputes/:id/inspector-evidence`
4. **Admin** views all disputes via `GET /api/v1/disputes/admin/all`
5. **Admin** assigns dispute to self via `PATCH /api/v1/disputes/:id/assign` -> status becomes `under_review`
6. **Admin** resolves dispute via `POST /api/v1/disputes/:id/resolve` with `decision` + `notes`
7. Escrow is auto-handled by the backend (`refundFunds` or `releaseFunds`) based on decision
8. **Fallback**: Admin can manually trigger `POST /api/v1/escrow/:transactionId/release` or `/refund`

---

## SECTION 3 — Current Frontend Problems

### Problem 1 — No `disputeApi.js` file exists

**Location**: `frontend/src/api/`
**Issue**: There is **no** dispute API file. The frontend has zero API functions for dispute CRUD.

All 6 dispute endpoints have no frontend bindings:
- `POST /api/v1/disputes`
- `GET /api/v1/disputes/my-disputes`
- `GET /api/v1/disputes/:id`
- `PATCH /api/v1/disputes/:id/assign`
- `POST /api/v1/disputes/:id/resolve`
- `GET /api/v1/disputes/admin/all`

---

### Problem 2 — Admin DisputeResolution page uses hardcoded mock data

**File**: `frontend/src/pages/admin/DisputeResolution.jsx`
**Issue**: The entire page uses a hardcoded `useState` array with fake disputes (lines 7-53). No API calls to the backend.

```jsx
// CURRENT — Hardcoded mock data
const [disputes] = useState([
  {
    id: 'DSP001',
    orderId: 'ORD12345',
    bikeName: 'Giant XTC SLR 29',
    ...
  },
]);
```

Additional issues in this page:
- Status values don't match backend (`pending`/`investigating`/`resolved`/`rejected` vs backend `open`/`under_review`/`resolved_buyer_favor`/etc.)
- No API calls for assign, resolve, or detail view
- Amount format inconsistent with backend (no `.amount` field in dispute — it's on the Transaction)
- Buttons ("Xem chi tiet", "Bat dau dieu tra", "Danh dau da giai quyet") have no `onClick` handlers

---

### Problem 3 — No Buyer dispute pages exist

**Location**: `frontend/src/pages/buyer/`
**Issue**: There are zero buyer-facing dispute pages:
- No "Create Dispute" page
- No "My Disputes" page
- No "Dispute Detail" page
- No dispute button on `TransactionDetail.jsx`

---

### Problem 4 — No dispute routes in `App.jsx`

**File**: `frontend/src/App.jsx`
**Issue**: No routes for buyer dispute pages. The admin route `/admin/disputes` exists but renders the mock `DisputeResolution` component.

Missing routes:
- `/buyer/disputes` — My Disputes list
- `/buyer/disputes/create?transactionId=xxx` — Create Dispute form
- `/buyer/disputes/:id` — Dispute Detail
- `/admin/disputes/:id` — Admin Dispute Detail

---

### Problem 5 — No dispute sidebar navigation

**File**: `frontend/src/layouts/DashboardLayout.jsx`
**Issue**: Neither buyer nor admin sidebar has a "Disputes" or "Tranh chap" menu item (buyer sidebar is in `BuyerLayout` — also no dispute nav item).

---

### Problem 6 — Escrow API is correct (No changes needed)

**File**: `frontend/src/api/escrowApi.jsx`

```js
releaseFunds: (transactionId, reason) => axiosClient.post(`/api/v1/escrow/${transactionId}/release`, { reason }),
refundFunds: (transactionId, reason) => axiosClient.post(`/api/v1/escrow/${transactionId}/refund`, { reason }),
getHeldTransactions: () => axiosClient.get('/api/v1/escrow/held'),
getStatistics: () => axiosClient.get('/api/v1/escrow/statistics'),
```

---

## SECTION 4 — Required Frontend Fixes

### Fix 1 — Create `frontend/src/api/disputeApi.jsx`

**New file needed.**

```jsx
import axiosClient from '../services/axiosClient';

const disputeApi = {
  // -- Buyer --
  create: (payload) =>
    axiosClient.post('/api/v1/disputes', payload),
  // payload: { transactionId, reason, description, evidence? }

  getMyDisputes: (params = {}) =>
    axiosClient.get('/api/v1/disputes/my-disputes', { params }),
  // params: { status? }

  getById: (disputeId) =>
    axiosClient.get(`/api/v1/disputes/${disputeId}`),

  // -- Admin --
  getAll: (params = {}) =>
    axiosClient.get('/api/v1/disputes/admin/all', { params }),
  // params: { status?, page?, limit? }

  assign: (disputeId) =>
    axiosClient.patch(`/api/v1/disputes/${disputeId}/assign`),

  resolve: (disputeId, payload) =>
    axiosClient.post(`/api/v1/disputes/${disputeId}/resolve`, payload),
  // payload: { decision, refundAmount?, penaltyToSeller?, penaltyToBuyer?, notes }
};

export default disputeApi;
```

**Why**: No dispute API file exists. All 6 endpoints need frontend bindings.

---

### Fix 2 — Create Buyer pages

#### 2a. `frontend/src/pages/buyer/CreateDispute.jsx`

**Purpose**: Form for buyer to submit a dispute within 3-day refund window.

**API calls**:
```js
// On submit
disputeApi.create({
  transactionId: '...',
  reason: 'item_not_as_described',  // from form select
  description: '...',               // from form textarea
  evidence: {                        // optional
    photos: ['url1', 'url2'],
    videos: ['url3'],
  }
});
```

**Form fields needed**:
- `transactionId` — hidden, from URL query param
- `reason` — `<select>` dropdown with `DisputeReason` enum values
- `description` — `<textarea>`
- `evidence.photos` — file upload via Cloudinary -> URL array
- `evidence.videos` — file upload via Cloudinary -> URL array

---

#### 2b. `frontend/src/pages/buyer/MyDisputes.jsx`

**Purpose**: List all buyer's disputes with status filters.

**API calls**:
```js
// On mount + filter change
disputeApi.getMyDisputes({ status: filterValue || undefined });
```

**Response parsing**:
```js
const disputes = res?.data?.data || [];
```

---

#### 2c. `frontend/src/pages/buyer/DisputeDetail.jsx`

**Purpose**: View full dispute detail + timeline.

**API calls**:
```js
// On mount
disputeApi.getById(disputeId);
```

**Response parsing**:
```js
const dispute = res?.data?.data || {};
```

---

### Fix 3 — Rewrite `frontend/src/pages/admin/DisputeResolution.jsx`

**Current code issues**:

| Line | Current | Required |
|------|---------|----------|
| 7 | `const [disputes] = useState([{ id: 'DSP001', ... }])` | `const [disputes, setDisputes] = useState([])` + fetch from API |
| 55 | Status map: `pending/investigating/resolved/rejected` | Must use backend values: `open/under_review/resolved_buyer_favor/etc.` |
| 220 | `<button>Xem chi tiet</button>` — no handler | Navigate to `/admin/disputes/:id` |
| 224 | `<button>Bat dau dieu tra</button>` — no handler | Call `disputeApi.assign(disputeId)` |
| 230 | `<button>Danh dau da giai quyet</button>` — no handler | Open resolve modal -> call `disputeApi.resolve(disputeId, payload)` |

**Required API calls**:
```js
// On mount
const res = await disputeApi.getAll({ status, page, limit });
const disputes = res?.data?.data || [];
const pagination = res?.data?.pagination || {};

// On "Bat dau dieu tra" click
await disputeApi.assign(disputeId);

// On "Giai quyet" submit
await disputeApi.resolve(disputeId, {
  decision: 'buyer_favor',
  refundAmount: 0,
  penaltyToSeller: 0,
  penaltyToBuyer: 0,
  notes: 'Admin resolution notes',
});
```

**Status label mapping (corrected)**:
```js
const statusLabels = {
  open: 'Cho xu ly',
  under_review: 'Dang xem xet',
  awaiting_evidence: 'Cho bang chung',
  resolved_buyer_favor: 'Hoan tien cho buyer',
  resolved_seller_favor: 'Giu tien cho seller',
  resolved_partial_refund: 'Hoan tien mot phan',
  closed: 'Da dong',
};
```

---

### Fix 4 — Add dispute button to `TransactionDetail.jsx`

**File**: `frontend/src/pages/buyer/TransactionDetail.jsx`
**Change**: Add a "Mo tranh chap" button when transaction status allows disputes.

```jsx
// Condition: transaction was delivered and within 3-day window
const canDispute = 
  ['delivered', 'completed'].includes(normalizedStatus) &&
  !tx.dispute?.isDisputed &&
  new Date() - new Date(tx.deliveredAt || tx.updatedAt) < 3 * 24 * 60 * 60 * 1000;

// Button
{canDispute && (
  <Button
    variant="danger"
    onClick={() => navigate(`/buyer/disputes/create?transactionId=${tx._id}`)}
  >
    Mo tranh chap
  </Button>
)}
```

---

### Fix 5 — Add routes to `App.jsx`

```jsx
// Import new pages
import CreateDispute from './pages/buyer/CreateDispute';
import MyDisputes from './pages/buyer/MyDisputes';
import DisputeDetail from './pages/buyer/DisputeDetail';

// Buyer dispute routes (inside buyer protected section)
<Route
  path="/buyer/disputes"
  element={
    <PrivateRoute allowedRoles={['buyer']}>
      {buyerShell('disputes', <MyDisputes />)}
    </PrivateRoute>
  }
/>
<Route
  path="/buyer/disputes/create"
  element={
    <PrivateRoute allowedRoles={['buyer']}>
      {buyerShell('disputes', <CreateDispute />)}
    </PrivateRoute>
  }
/>
<Route
  path="/buyer/disputes/:id"
  element={
    <PrivateRoute allowedRoles={['buyer']}>
      {buyerShell('disputes', <DisputeDetail />)}
    </PrivateRoute>
  }
/>
```

---

## SECTION 5 — Suggested Frontend API Structure

### `frontend/src/api/disputeApi.jsx`

```jsx
import axiosClient from '../services/axiosClient';

const disputeApi = {
  // ================================================
  //  BUYER ENDPOINTS
  // ================================================

  /**
   * Create a new dispute
   * POST /api/v1/disputes
   * @param {Object} payload
   * @param {string} payload.transactionId       — required
   * @param {string} payload.reason              — required (DisputeReason enum)
   * @param {string} payload.description         — required
   * @param {Object} [payload.evidence]          — optional
   * @param {string[]} [payload.evidence.photos]
   * @param {string[]} [payload.evidence.videos]
   * @param {string[]} [payload.evidence.documents]
   */
  create: (payload) =>
    axiosClient.post('/api/v1/disputes', payload),

  /**
   * Get buyer's own disputes
   * GET /api/v1/disputes/my-disputes
   * @param {Object} [params]
   * @param {string} [params.status] — filter by DisputeStatus
   */
  getMyDisputes: (params = {}) =>
    axiosClient.get('/api/v1/disputes/my-disputes', { params }),

  /**
   * Get dispute detail by ID
   * GET /api/v1/disputes/:id
   * @param {string} disputeId
   */
  getById: (disputeId) =>
    axiosClient.get(`/api/v1/disputes/${disputeId}`),

  // ================================================
  //  ADMIN ENDPOINTS
  // ================================================

  /**
   * Get all disputes (admin view)
   * GET /api/v1/disputes/admin/all
   * @param {Object} [params]
   * @param {string} [params.status]
   * @param {number} [params.page]
   * @param {number} [params.limit]
   */
  getAll: (params = {}) =>
    axiosClient.get('/api/v1/disputes/admin/all', { params }),

  /**
   * Admin assigns dispute to themselves
   * PATCH /api/v1/disputes/:id/assign
   * No request body — admin extracted from JWT
   * @param {string} disputeId
   */
  assign: (disputeId) =>
    axiosClient.patch(`/api/v1/disputes/${disputeId}/assign`),

  /**
   * Admin resolves dispute
   * POST /api/v1/disputes/:id/resolve
   * @param {string} disputeId
   * @param {Object} payload
   * @param {string} payload.decision           — 'buyer_favor' | 'seller_favor' | 'partial_refund'
   * @param {number} [payload.refundAmount]     — for partial refund
   * @param {number} [payload.penaltyToSeller]
   * @param {number} [payload.penaltyToBuyer]
   * @param {string} payload.notes              — required
   */
  resolve: (disputeId, payload) =>
    axiosClient.post(`/api/v1/disputes/${disputeId}/resolve`, payload),
};

export default disputeApi;
```

### Already correct: `frontend/src/api/escrowApi.jsx`

No changes needed — endpoints match backend exactly.

---

## SECTION 6 — Recommended UI Flow

### 6.1 Buyer Pages

#### Page: Create Dispute (`/buyer/disputes/create?transactionId=xxx`)

| Component | Detail |
|-----------|--------|
| **Entry point** | Button on `TransactionDetail.jsx` (only show if `delivered`/`completed` and within 3-day window and not already disputed) |
| **Form fields** | Reason (select), Description (textarea), Evidence upload (photos/videos via Cloudinary) |
| **Submit** | `disputeApi.create(payload)` -> redirect to `/buyer/disputes/:id` |
| **Validation** | `transactionId` required, `reason` required, `description` min 10 chars |

#### Page: My Disputes (`/buyer/disputes`)

| Component | Detail |
|-----------|--------|
| **Entry point** | Sidebar link "Tranh chap" or from BuyerDashboard |
| **Data source** | `disputeApi.getMyDisputes({ status })` |
| **Filters** | Status dropdown (all/open/under_review/resolved_*/closed) |
| **List items** | Show: reason, status badge, created date, transaction reference |
| **Click action** | Navigate to `/buyer/disputes/:id` |

#### Page: Dispute Detail (`/buyer/disputes/:id`)

| Component | Detail |
|-----------|--------|
| **Data source** | `disputeApi.getById(disputeId)` |
| **Sections** | Header (status + reason), Description, Evidence gallery, Inspector report (if exists), Resolution (if resolved), Timeline |
| **Read-only** | Buyer cannot modify dispute after creation |

---

### 6.2 Admin Pages

#### Page: Dispute List (`/admin/disputes`) — Refactored DisputeResolution

| Component | Detail |
|-----------|--------|
| **Data source** | `disputeApi.getAll({ status, page, limit })` |
| **Filters** | Status dropdown, Pagination |
| **List items** | Dispute ID, reason, reporter, status badge, created date, assigned admin |
| **Actions** | "Xem chi tiet" -> navigate, "Nhan xu ly" -> `disputeApi.assign()`, "Giai quyet" -> modal |

#### Modal: Resolve Dispute

| Component | Detail |
|-----------|--------|
| **Trigger** | "Giai quyet" button on a dispute with status `under_review` |
| **Form fields** | Decision (radio: buyer_favor/seller_favor/partial_refund), refundAmount (if partial), notes (textarea) |
| **Submit** | `disputeApi.resolve(disputeId, payload)` |
| **After success** | Refresh dispute list, show toast |

#### Page: Admin Dispute Detail (`/admin/disputes/:id`)

| Component | Detail |
|-----------|--------|
| **Data source** | `disputeApi.getById(disputeId)` |
| **Sections** | All dispute data + admin controls |
| **Actions** | Assign (if open), Resolve (if under_review), Manual escrow release/refund |

---

### 6.3 Response Parsing Cheat Sheet

All backend responses follow this pattern:

```js
// Response structure
{
  message: 'string',
  data: { ... } || [ ... ],
  pagination: { page, limit, total, pages }  // only for paginated endpoints
}

// Parsing
const result = res?.data?.data || res?.data || {};
const list = Array.isArray(result) ? result : result?.disputes || [];
const pagination = res?.data?.pagination || {};
```

---

### 6.4 Constants File Reference

Create `frontend/src/constants/dispute.js`:

```js
export const DisputeReason = {
  ITEM_NOT_RECEIVED: 'item_not_received',
  ITEM_NOT_AS_DESCRIBED: 'item_not_as_described',
  DAMAGED_ITEM: 'damaged_item',
  COUNTERFEIT_PARTS: 'counterfeit_parts',
  SELLER_UNRESPONSIVE: 'seller_unresponsive',
  BUYER_REFUSING_DELIVERY: 'buyer_refusing_delivery',
  OTHER: 'other',
};

export const DisputeReasonLabels = {
  item_not_received: 'Khong nhan duoc hang',
  item_not_as_described: 'Hang khong dung mo ta',
  damaged_item: 'Hang bi hu hong',
  counterfeit_parts: 'Linh kien gia',
  seller_unresponsive: 'Nguoi ban khong phan hoi',
  buyer_refusing_delivery: 'Nguoi mua tu choi nhan hang',
  other: 'Ly do khac',
};

export const DisputeStatus = {
  OPEN: 'open',
  UNDER_REVIEW: 'under_review',
  AWAITING_EVIDENCE: 'awaiting_evidence',
  RESOLVED_BUYER_FAVOR: 'resolved_buyer_favor',
  RESOLVED_SELLER_FAVOR: 'resolved_seller_favor',
  RESOLVED_PARTIAL_REFUND: 'resolved_partial_refund',
  CLOSED: 'closed',
};

export const DisputeStatusLabels = {
  open: 'Cho xu ly',
  under_review: 'Dang xem xet',
  awaiting_evidence: 'Cho bang chung',
  resolved_buyer_favor: 'Hoan tien cho buyer',
  resolved_seller_favor: 'Giu tien cho seller',
  resolved_partial_refund: 'Hoan tien mot phan',
  closed: 'Da dong',
};

export const DisputeDecision = {
  BUYER_FAVOR: 'buyer_favor',
  SELLER_FAVOR: 'seller_favor',
  PARTIAL_REFUND: 'partial_refund',
};

export const DisputeDecisionLabels = {
  buyer_favor: 'Co loi cho nguoi mua (hoan tien)',
  seller_favor: 'Co loi cho nguoi ban (giai ngan)',
  partial_refund: 'Hoan tien mot phan',
};
```

---

## APPENDIX — File Checklist

### Files to CREATE

| # | File | Purpose |
|---|------|---------|
| 1 | `frontend/src/api/disputeApi.jsx` | API functions for all dispute endpoints |
| 2 | `frontend/src/constants/dispute.js` | Enum values + Vietnamese labels |
| 3 | `frontend/src/pages/buyer/CreateDispute.jsx` | Buyer: create dispute form |
| 4 | `frontend/src/pages/buyer/MyDisputes.jsx` | Buyer: list disputes |
| 5 | `frontend/src/pages/buyer/DisputeDetail.jsx` | Buyer: view dispute detail |

### Files to MODIFY

| # | File | Change |
|---|------|--------|
| 1 | `frontend/src/pages/admin/DisputeResolution.jsx` | Replace mock data with real API calls |
| 2 | `frontend/src/pages/buyer/TransactionDetail.jsx` | Add "Mo tranh chap" button |
| 3 | `frontend/src/App.jsx` | Add buyer dispute routes |

### Files CORRECT (no changes needed)

| # | File | Status |
|---|------|--------|
| 1 | `frontend/src/api/escrowApi.jsx` | Matches backend |
| 2 | `frontend/src/api/adminApi.jsx` | Escrow methods are correct |

### Files NOT to modify

| # | File |
|---|------|
| 1 | Any file in `backend/src/` |
| 2 | `frontend/src/api/transactionApi.jsx` (unrelated) |
| 3 | `frontend/src/api/walletApi.jsx` (unrelated) |
