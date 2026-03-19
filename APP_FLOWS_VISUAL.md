# 🚲 Old Bicycle Marketplace - Main Application Flows

## Table of Contents
1. [System Architecture](#system-architecture)
2. [User Authentication Flow](#user-authentication-flow)
3. [Buyer Journey](#buyer-journey)
4. [Seller Journey](#seller-journey)
5. [Payment & Transaction Flow](#payment--transaction-flow)
6. [Real-time Chat System](#real-time-chat-system)
7. [Dispute Resolution Flow](#dispute-resolution-flow)
8. [Admin Dashboard Flow](#admin-dashboard-flow)
9. [Inspection & Review Flow](#inspection--review-flow)

---

## System Architecture

```mermaid
graph TB
    subgraph Frontend["Frontend (React + Vite)"]
        F1["Auth Pages"]
        F2["Buyer Dashboard"]
        F3["Seller Dashboard"]
        F4["Chat Component"]
        F5["Admin Dashboard"]
        F6["Payment Page"]
    end

    subgraph Backend["Backend (NestJS)"]
        B1["Auth Module"]
        B2["Users Module"]
        B3["Bicycles Module"]
        B4["Payment Module"]
        B5["Messages Module"]
        B6["Transactions Module"]
        B7["Disputes Module"]
        B8["Admin Module"]
    end

    subgraph Database["MongoDB Database"]
        D1["Users Collection"]
        D2["Bicycles Collection"]
        D3["Transactions Collection"]
        D4["Messages Collection"]
        D5["Wallets Collection"]
        D6["Reviews Collection"]
        D7["Disputes Collection"]
    end

    subgraph Services["External Services"]
        S1["ZaloPay API"]
        S2["Cloudinary API"]
        S3["Socket.IO Servers"]
    end

    Frontend -->|HTTP/REST| Backend
    Frontend -->|WebSocket| S3
    Backend -->|CRUD Operations| Database
    Backend -->|Payment Processing| S1
    Backend -->|Image Storage| S2
    Backend -->|Real-time Events| S3
```

---

## User Authentication Flow

```mermaid
sequenceDiagram
    participant User as User/Browser
    participant API as NestJS API
    participant DB as MongoDB
    
    User->>API: 1. POST /auth/register<br/>(email, password, role)
    API->>DB: 2. Check if user exists
    alt User Exists
        API-->>User: Error - User already exists
    else New User
        API->>DB: 3. Hash password & create user
        DB-->>API: User created with ID
        API-->>User: Success - JWT token + userId
    end
    
    User->>API: 4. POST /auth/login<br/>(email, password)
    API->>DB: 5. Find user by email
    alt Invalid Credentials
        API-->>User: Error - Invalid credentials
    else Valid Credentials
        API->>API: 6. Compare password hash
        API-->>User: Success - JWT token
    end
    
    User->>API: 7. GET /users/profile<br/>(Bearer token)
    API->>API: 8. Verify JWT
    API->>DB: 9. Get user profile
    DB-->>API: User data
    API-->>User: User profile
```

---

## Buyer Journey

```mermaid
graph LR
    A["🔐 User Login"] --> B["👀 Browse Bicycles"]
    B --> C{Interested?}
    C -->|No| B
    C -->|Yes| D["📝 View Details<br/>& Reviews"]
    D --> E{"Make<br/>Offer?"}
    E -->|No| B
    E -->|Yes| F["💬 Send Message<br/>to Seller"]
    F --> G["🤝 Negotiate<br/>Price"]
    G --> H{Agreed?}
    H -->|No| B
    H -->|Yes| I["🛒 Create Order"]
    I --> J["💳 Initiate Payment<br/>ZaloPay"]
    J --> K["⏳ Wait for Seller<br/>Confirmation"]
    K --> L["🔍 Inspection<br/>Process"]
    L --> M["📦 Receive Bicycle"]
    M --> N{"Satisfied?"}
    N -->|No| O["⚖️ Open Dispute"]
    N -->|Yes| P["⭐ Leave Review"]
    O --> Q["🏆 Dispute<br/>Resolution"]
    P --> R["✅ Transaction<br/>Complete"]
    Q --> R
```

---

## Seller Journey

```mermaid
graph LR
    A["🔐 User Login"] --> B["📋 Create Listing"]
    B --> C["📝 Fill Bicycle Info<br/>Tab 1: Basic Info"]
    C --> D["📷 Upload Photos<br/>Tab 2: Images"]
    D --> E["💰 Set Price<br/>Tab 3: Price & Delivery"]
    E --> F["📊 Condition & Details<br/>Tab 4: Condition"]
    F --> G["📤 Publish Listing"]
    G --> H["💬 Wait for Offers"]
    H --> I{Offer<br/>Received?}
    I -->|Yes| J["💬 Chat with Buyer"]
    J --> K{"Price<br/>Agreed?"}
    K -->|No| J
    K -->|Yes| L["✅ Accept Order"]
    L --> M["⏳ Buyer Pays<br/>Escrow"]
    M --> N["🔍 Inspection<br/>Scheduled"]
    N --> O["📋 Inspector<br/>Approves"]
    O --> P["📦 Prepare & Ship"]
    P --> Q["💰 Receive Payment<br/>from Escrow"]
    Q --> R["⭐ Buyer Reviews"]
    R --> S["✅ Transaction<br/>Complete"]
```

---

## Payment & Transaction Flow

```mermaid
sequenceDiagram
    participant Buyer as Buyer
    participant API as NestJS API
    participant Escrow as Escrow Wallet
    participant ZaloPay as ZaloPay Gateway
    participant Seller as Seller
    
    Buyer->>API: 1. Confirm Purchase<br/>(bicycleId, amount)
    API->>API: 2. Create Transaction<br/>(status: PENDING)
    API->>ZaloPay: 3. Request Payment URL
    ZaloPay-->>API: Payment Link
    API-->>Buyer: 4. Redirect to ZaloPay
    Buyer->>ZaloPay: 5. Complete Payment
    ZaloPay-->>Buyer: Payment Confirmation
    ZaloPay->>API: 6. Webhook Callback<br/>(transaction_id, status)
    
    alt Payment Failed
        API->>API: Mark Transaction FAILED
        API-->>Buyer: Payment failed
    else Payment Success
        API->>Escrow: 7. Lock Amount in Escrow
        Escrow-->>API: Amount Locked
        API->>API: 8. Update Transaction<br/>(status: ESCROW_LOCKED)
        API-->>Buyer: 9. Payment successful
        API-->>Seller: 10. New order received
        
        Note over API,Escrow: 7-day inspection period
        
        API->>API: 11. Inspection approved
        API->>Escrow: 12. Release Payment
        Escrow->>Seller: 13. Amount transferred
        API->>API: 14. Update Transaction<br/>(status: COMPLETED)
    end
```

---

## Real-time Chat System

```mermaid
graph TB
    subgraph Client["Front-end (Chat Context)"]
        C1["Chat Component<br/>Socket.IO Client"]
        C2["Message Input"]
        C3["Message Display"]
    end
    
    subgraph Server["Back-end (Socket.IO Server)"]
        S1["Socket.IO Gateway"]
        S2["Messages Service"]
        S3["Rooms Manager"]
    end
    
    subgraph Data["Data Storage"]
        D1["Messages Collection"]
        D2["Conversations Collection"]
    end
    
    C1 -->|WebSocket| S3
    S3 -->|Join Room| S1
    C2 -->|emit: sendMessage| S1
    S1 -->|Save Message| S2
    S2 -->|Store| D1
    S2 -->|emit: newMessage| S1
    S1 -->|Broadcast to Room| C3
    
    C1 -->|emit: userTyping| S1
    S1 -->|emit: userIsTyping| C1
    
    C1 -->|emit: markAsRead| S1
    S1 -->|Update readAt| S2

    style C1 fill:#4CAF50
    style S1 fill:#2196F3
    style D1 fill:#FF9800
```

**Chat Features:**
- Real-time message delivery via WebSocket
- Typing indicators
- Read receipts
- User online status
- Conversation history
- Message persistence in MongoDB

---

## Dispute Resolution Flow

```mermaid
stateDiagram-v2
    [*] --> INITIATED
    
    INITIATED --> SELLER_RESPONSE: Seller notified
    note right of INITIATED
        Buyer reports issue
        Evidence uploaded
    end note
    
    SELLER_RESPONSE --> INVESTIGATING: Seller responds
    SELLER_RESPONSE --> INITIATED: No response timeout
    
    INVESTIGATING --> APPEAL_BUYER: Inspector analyzes
    note right of INVESTIGATING
        Inspector reviews
        evidence & reports
    end note
    
    APPEAL_BUYER --> RESOLVED_REFUND: Buyer agrees
    APPEAL_BUYER --> APPEAL_SELLER: Buyer appeals
    
    APPEAL_SELLER --> RESOLVED_PARTIAL: Admin decides
    APPEAL_SELLER --> RESOLVED_REFUND: 100% refund
    APPEAL_SELLER --> RESOLVED_KEEP: Seller keeps
    
    RESOLVED_REFUND --> [*]
    RESOLVED_PARTIAL --> [*]
    RESOLVED_KEEP --> [*]
    
    style INITIATED fill:#FFC107
    style SELLER_RESPONSE fill:#FFC107
    style INVESTIGATING fill:#2196F3
    style APPEAL_BUYER fill:#FF9800
    style APPEAL_SELLER fill:#F44336
    style RESOLVED_REFUND fill:#4CAF50
    style RESOLVED_PARTIAL fill:#4CAF50
    style RESOLVED_KEEP fill:#4CAF50
```

**Dispute Statuses:**
1. **INITIATED** - Buyer opens dispute with evidence
2. **SELLER_RESPONSE** - Seller provides response
3. **INVESTIGATING** - Inspector examines case
4. **APPEAL_BUYER** - Initial decision, buyer can appeal
5. **APPEAL_SELLER** - Escalation level
6. **RESOLVED_** - Final resolution (REFUND, PARTIAL, KEEP)

---

## Admin Dashboard Flow

```mermaid
graph TB
    A["🔐 Admin Login"] --> B["📊 Dashboard Overview<br/>Stats & Metrics"]
    B --> C{Select Module}
    
    C -->|Users| D["👥 User Management"]
    D --> D1["View all users by role"]
    D --> D2["Ban/Suspend users"]
    D --> D3["Verify seller accounts"]
    
    C -->|Categories| E["📂 Category Manager"]
    E --> E1["Create/Edit categories"]
    E --> E2["Manage system fields"]
    
    C -->|Disputes| F["⚖️ Dispute Moderation"]
    F --> F1["Review open disputes"]
    F --> F2["Analyze evidence"]
    F --> F3["Make final decisions"]
    
    C -->|Settings| G["⚙️ System Settings"]
    G --> G1["Config fees/taxes"]
    G --> G2["Maintenance mode"]
    G --> G3["Email templates"]
    
    C -->|Audit| H["📋 Audit Logs"]
    H --> H1["View all system actions"]
    H --> H2["Track changes"]
    
    style A fill:#FF5722
    style B fill:#FF5722
    style C fill:#FF5722
```

---

## Inspection & Review Flow

```mermaid
sequenceDiagram
    participant Inspector as Inspector
    participant API as NestJS API
    participant DB as MongoDB
    participant Buyer as Buyer
    
    API->>Inspector: 1. Inspection assigned<br/>(notification)
    Inspector->>API: 2. Accept inspection job
    
    Inspector->>API: 3. Complete report<br/>- Condition details<br/>- Test results<br/>- Damage assessment<br/>- Verdict (PASS/FAIL/<br/>NEED_REPAIR)
    
    alt Verdict: PASS
        API->>API: 4. Approve transaction
        API->>DB: 5. Update transaction status<br/>(INSPECTION_APPROVED)
        API-->>Buyer: 6. Approved - ready to receive
    else Verdict: FAIL
        API->>API: 4. Initiate dispute
        API-->>Buyer: 5. Item failed inspection
    end
    
    Buyer->>API: 7. POST /reviews<br/>(rating, comment, inspect_id)
    API->>DB: 8. Create review<br/>+ Update seller rating
    DB-->>API: Review stored
    API-->>Buyer: 9. Review posted
    
    alt Seller has unresolved disputes
        Seller->>API: 10. POST /reviews/{id}/response
        API->>DB: 11. Add response to review
        DB-->>API: Response stored
    end
```

---

## User Role Permission Matrix

```mermaid
graph TD
    A["GUEST<br/>Users"] --> A1["✓ View bicycles"]
    A --> A2["✓ View reviews"]
    A --> A3["✗ Message"]
    A --> A4["✗ Purchase"]
    A --> A5["✗ List bicycles"]
    
    B["BUYER<br/>Users"] --> B1["✓ All guest actions"]
    B --> B2["✓ Make offers"]
    B --> B3["✓ Message sellers"]
    B --> B4["✓ Purchase bicycles"]
    B --> B5["✓ Open disputes"]
    B --> B6["✓ Leave reviews"]
    
    C["SELLER<br/>Users"] --> C1["✓ All buyer actions"]
    C --> C2["✓ Create listings"]
    C --> C3["✓ Edit own listings"]
    C --> C4["✓ Accept orders"]
    C --> C5["✓ Respond to disputes"]
    C --> C6["✓ Respond to reviews"]
    
    D["INSPECTOR<br/>Users"] --> D1["✓ View inspections"]
    D --> D2["✓ Complete reports"]
    D --> D3["✓ Verify products"]
    D --> D4["✓ Provide verdicts"]
    
    E["ADMIN<br/>Users"] --> E1["✓ Manage users"]
    E --> E2["✓ Manage categories"]
    E --> E3["✓ Moderate disputes"]
    E --> E4["✓ View audit logs"]
    E --> E5["✓ System config"]
    
    style A fill:#E3F2FD
    style B fill:#C8E6C9
    style C fill:#FFF9C4
    style D fill:#FFE0B2
    style E fill:#F8BBD0
```

---

## Wallet System Flow

```mermaid
graph TB
    subgraph Wallets["Wallet Types"]
        W1["User Wallet<br/>(Personal Balance)"]
        W2["Escrow Wallet<br/>(Locked Funds)"]
        W3["Platform Wallet<br/>(Commission)"]
    end
    
    subgraph Transactions["Transaction Flow"]
        T1["Payment Received"]
        T2["Fund Locked in Escrow"]
        T3["Inspection Approved"]
        T4["Refund Triggered"]
    end
    
    subgraph Settlement["Settlement"]
        S1["Seller Receives<br/>Amount - Fee"]
        S2["Platform Gets<br/>Commission"]
        S3["Buyer Refunded"]
    end
    
    T1 --> T2
    T2 --> T3
    T3 --> S1
    T3 --> S2
    
    T2 --> T4
    T4 --> S3
    
    style W1 fill:#4CAF50
    style W2 fill:#FF9800
    style W3 fill:#2196F3
```

---

## Complete Transaction Lifecycle

```mermaid
graph LR
    L0["Listing Created"] --> L1["PENDING"]
    L1 --> L2["BUYER_CONFIRMED"]
    L2 --> L3["PAYMENT_INITIATED"]
    L3 --> L4{Payment Status}
    
    L4 -->|Failed| L5["PAYMENT_FAILED"]
    L4 -->|Success| L6["ESCROW_LOCKED"]
    
    L5 --> L9["CANCELLED"]
    
    L6 --> L7["INSPECTION_SCHEDULED"]
    L7 --> L8{Inspection Result}
    
    L8 -->|PASS| L10["INSPECTION_APPROVED"]
    L8 -->|FAIL| L11["INSPECTION_FAILED"]
    
    L10 --> L12["PAYMENT_RELEASED"]
    L12 --> L13["COMPLETED"]
    
    L11 --> L14["DISPUTE_OPENED"]
    L14 --> L15{Dispute Result}
    L15 -->|Refund| L16["REFUNDED"]
    L15 -->|Partial| L17["PARTIALLY_REFUNDED"]
    L15 -->|Seller Wins| L13
    
    L16 --> L9
    L17 --> L13
    
    style L13 fill:#4CAF50
    style L9 fill:#F44336
    style L16 fill:#FF9800
    style L17 fill:#FF9800
```

---

## Key Features Summary

| Feature | Technology | Status |
|---------|-----------|--------|
| Real-time Chat | Socket.IO | ✅ WebSocket-based |
| Payment Processing | ZaloPay API | ✅ Integrated |
| Image Management | Cloudinary | ✅ Cloud storage |
| Authentication | JWT | ✅ Role-based |
| Database | MongoDB + TypeORM | ✅ Document-based |
| Escrow System | Custom Wallet | ✅ 7-day protection |
| Dispute Resolution | Multi-stage | ✅ Inspector + Admin |
| Reviews & Ratings | 1-5 Star | ✅ Community-driven |
| Inspections | Report-based | ✅ Technical verdict |

---

## Quick Reference: API Endpoints

### Auth Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh-token` - Token refresh

### Bicycle Endpoints
- `GET /bicycles` - List all bicycles (with filters)
- `POST /bicycles` - Create new listing
- `GET /bicycles/:id` - Get bicycle details
- `PUT /bicycles/:id` - Update listing
- `DELETE /bicycles/:id` - Delete listing

### Transaction Endpoints
- `POST /transactions` - Create transaction
- `GET /transactions` - List user transactions
- `GET /transactions/:id` - Get transaction details
- `PUT /transactions/:id/status` - Update status

### Messages Endpoints
- `GET /messages/conversations` - List conversations
- `POST /messages/send` - Send message
- `GET /messages/:conversationId` - Get chat history

### Disputes Endpoints
- `POST /disputes` - Open dispute
- `GET /disputes` - List disputes
- `PUT /disputes/:id/respond` - Seller response
- `PUT /disputes/:id/resolve` - Admin resolution

---

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│         Client (Browser)                │
│  React 19 + Vite + Tailwind CSS         │
└────────────────┬────────────────────────┘
                 │ HTTP/WebSocket
                 ▼
┌─────────────────────────────────────────┐
│    NestJS Backend (REST + Socket.IO)    │
│  - Express for HTTP                     │
│  - Socket.IO for Real-time              │
│  - TypeORM + MongoDB                    │
└────────────────┬────────────────────────┘
                 │
        ┌────────┼────────┐
        ▼        ▼        ▼
    ┌───────┐ ┌────────┐ ┌──────────┐
    │MongoDB│ │ZaloPay │ │Cloudinary│
    │       │ │ API    │ │ API      │
    └───────┘ └────────┘ └──────────┘
```

---

## Summary

This bicycle marketplace is a **complete peer-to-peer platform** with:
- ✅ Multi-role user system (Guest → Buyer → Seller → Inspector → Admin)
- ✅ Secure payment processing with escrow protection
- ✅ Real-time communication between buyers and sellers
- ✅ Technical inspection and quality assurance
- ✅ Dispute resolution mechanism
- ✅ Community reviews and reputation system
- ✅ Admin dashboard for platform management

The architecture is **scalable, secure, and user-centric**, designed to build trust in the peer-to-peer marketplace through multiple verification layers and community feedback.
