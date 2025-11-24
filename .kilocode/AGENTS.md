## Complete Technical Documentation - Custom Ecommerce Payload

## Executive Summary

This project is a fully functional e-commerce application built on **Payload CMS** + **Next.js** + **PostgreSQL**, featuring significant architectural enhancements including React Server Components, the Repository Pattern, and performance optimizations. Developed by Yago López as a custom version of the official Payload template.

## 🏗️ System Architecture

### Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Frontend                          │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────────────────┐ │
│  │  App Router │  │React Components│  │Repository Pattern     │ │
│  │   (App)     │  │  (UI/UX)     │  │  (Data Layer)         │ │
│  └─────────────┘  └─────────────┘  └────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Payload CMS API                           │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────────────────┐ │
│  │  Auth       │  │  GraphQL    │  │  REST API              │ │
│  │  System     │  │  Endpoint   │  │  Endpoints             │ │
│  └─────────────┘  └─────────────┘  └────────────────────────┘ │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────────────────┐ │
│  │Collections  │  │  Globals    │  │  Layout Builder        │ │
│  │(Users,Pages,│  │(Header,     │  │  (Block System)        │ │
│  │ Products)   │  │ Footer)     │  │                        │ │
│  └─────────────┘  └─────────────┘  └────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                ┌───────────┼───────────┐
                ▼           ▼           ▼
    ┌─────────────────┐ ┌─────────────┐ ┌─────────────────┐
    │ PostgreSQL      │ │Vercel Blob  │ │   Stripe        │
    │ Database        │ │  Storage    │ │  Payments       │
    │ (Main Data)     │ │  (Media)    │ │                 │
    └─────────────────┘ └─────────────┘ └─────────────────┘
```

### Key Components

#### 1\. **Frontend - Next.js App Router**

  * **Technology**: Next.js 14+ with App Router
  * **React Version**: React 18+ with Server Components
  * **Styling**: TailwindCSS + shadcn/ui components
  * **Structure**:
    ```
    src/app/
    ├── (app)/          # Public pages (storefront)
    ├── (payload)/      # Admin panel and API routes
    └── components/     # Shared components
    ```

#### 2\. **Backend - Payload CMS**

  * **Database**: PostgreSQL with native adapter
  * **Editor**: Lexical (successor to Slate.js)
  * **Authentication**: Payload's own system
  * **APIs**: GraphQL + automatic REST endpoints
  * **Storage**: Vercel Blob Storage for media
  * **Plugins**: SEO plugin, e-commerce plugin

#### 3\. **Repository Pattern**

Abstraction layer that separates data logic from business logic:

```typescript
// Example: ProductsRepository.ts
export class ProductsRepository {
  static async getBySlug({ slug }: { slug: string }): Promise<Product | null> {
    const { isEnabled: draft } = await draftMode()
    return await payload.find({
      collection: 'products',
      depth: 3,
      draft,
      // ... query configuration
    })
  }
}
```

## 📁 Project Structure

### Main Directories

```
src/
├── app/                      # Next.js App Router
│   ├── (app)/               # Public pages
│   │   ├── layout.tsx       # Main layout
│   │   ├── page.tsx         # Homepage
│   │   ├── products/        # Product catalog
│   │   ├── shop/            # Main shop
│   │   └── [slug]/          # Dynamic pages
│   ├── (payload)/           # Admin panel
│   │   ├── admin/           # Admin configuration
│   │   ├── api/             # Custom API routes
│   │   └── layout.tsx       # Admin layout
│   └── globals.css          # Global styles
│
├── collections/             # Payload configurations
│   ├── Users/               # User management
│   ├── Pages/               # CMS Pages
│   ├── Categories/          # Product categories
│   └── Media/               # File management
│
├── components/              # React Components
│   ├── ui/                  # Base components (shadcn)
│   ├── forms/               # User forms
│   ├── checkout/            # Checkout process
│   ├── product/             # Product components
│   └── layout/              # Layout components
│
├── repositories/            # Data layer
│   ├── ProductsRepository.ts
│   ├── UsersRepository.ts
│   ├── OrdersRepository.ts
│   └── PagesRepository.ts
│
├── blocks/                  # Block system
│   ├── ArchiveBlock/        # Archive block
│   ├── Banner/              # Banner block
│   ├── Content/             # Content block
│   ├── Form/                # Form block
│   └── ...
│
├── fields/                  # Custom fields
├── hooks/                   # Custom React hooks
├── providers/               # Context providers
├── utilities/               # General utilities
└── globals/                 # Global variables
```

## 🏗️ Implemented Architectural Patterns

### 1\. Repository Pattern

**Purpose**: To abstract data access logic from the rest of the application.

**Benefits**:

  * Separation of concerns
  * Improved testability
  * Facilitates maintenance
  * Consistency in data access

**Implementation**:

```typescript
// ProductsRepository.ts - Complete example
export class ProductsRepository {
  static async getAll({ searchValue, sort, category }: FindAllOptions = {}) {
    return await payload.find({
      collection: 'products',
      draft: false,
      overrideAccess: true,
      select: {
        title: true,
        slug: true,
        gallery: true,
        categories: true,
        priceInUSD: true,
      },
      ...(sort ? { sort } : { sort: 'title' }),
      ...(searchValue || category ? { /* filters */ } : {}),
    })
  }
}
```

### 2\. React Server Components

**Location**: Primarily in `src/app/` (App Router)

**Advantages**:

  * Server-side rendering by default
  * Less JavaScript on the client
  * Better SEO and initial performance
  * Direct database access

**Example**:

```typescript
// app/page.tsx - Server Component by default
async function HomePage() {
  const products = await ProductsRepository.getAll()
  return (
    <div>
      <ProductGrid products={products.docs} />
    </div>
  )
}
```

### 3\. Layout Builder Pattern

**Purpose**: A system of modular blocks for building dynamic pages.

**Block Components**:

  * `Hero` - Customizable hero sections
  * `Content` - Rich text content blocks
  * `Media` - Image and video insertion
  * `Archive` - Product/page listings
  * `Form` - Dynamic forms
  * `CallToAction` - Calls to action

**Configuration**:

```typescript
// blocks/Content/config.ts
export const ContentBlock: Block = {
  slug: 'content',
  labels: {
    singular: 'Content Block',
    plural: 'Content Blocks',
  },
  fields: [
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
  ],
}
```

## 🔐 Authentication and Authorization System

### User Roles

1.  **`admin`**: Full access to the administration panel
2.  **`customer`**: Customer with limited access
3.  **`read-only`**: Read-only user (custom implementation)

### Access Control

```typescript
// Example of access control in Users collection
access: {
  create: ({ req: { user } }) => user?.role === 'admin',
  update: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'read-only',
  read: () => true, // Everyone can read
}
```

### Authentication Flow

```
User → NextAuth/Payload Auth → JWT Token → Verification → Resource Access
```

## 🛠️ Main Technologies and Dependencies

### Frontend

  * **Next.js 14+**: React Framework with App Router
  * **React 18+**: UI Library
  * **TypeScript**: Static typing
  * **TailwindCSS**: CSS Framework
  * **shadcn/ui**: UI Components
  * **React Hook Form**: Form handling

### Backend

  * **Payload CMS**: Headless CMS and framework
  * **PostgreSQL**: Main database
  * **Lexical Editor**: Rich text editor
  * **Vercel Blob Storage**: File storage

### Integrations

  * **Stripe**: Payment processing
  * **GraphQL**: Query API
  * **REST API**: Traditional endpoints
  * **Webhooks**: External integrations

## 📊 Database Configuration

### Main Schema

**Collections (Tables)**:

  * `users` - User management
  * `pages` - Content pages
  * `categories` - Product categories
  * `media` - Multimedia files
  * `products` - Product catalog
  * `orders` - Customer orders
  * `transactions` - Payment transactions

**Globals (Configuration)**:

  * `header` - Header configuration
  * `footer` - Footer configuration

## 🎨 UI Component System

### Component Structure

```
components/
├── ui/                    # shadcn/ui base components
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   └── ...
├── forms/                 # Specific forms
│   ├── LoginForm/
│   ├── CheckoutForm/
│   └── ...
├── layout/                # Layout components
│   ├── Header/
│   ├── Footer/
│   └── ...
└── product/              # Product components
    ├── ProductGrid/
    ├── ProductItem/
    └── VariantSelector/
```

## 🔄 Data Flow

### Data Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Client     │     │   Server     │     │   Database   │
│  Components  │◄───►│   Components │◄───►│   PostgreSQL │
└──────────────┘     └──────────────┘     └──────────────┘
       ▲                     ▲                     ▲
       │                     │                     │
       ▼                     ▼                     ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   React      │     │  Repository  │     │   Payload    │
│  Server      │     │   Pattern    │     │     CMS      │
│ Components   │     │              │     │              │
└──────────────┘     └──────────────┘     └──────────────┘
```

### Request Lifecycle

1.  **Request** → Next.js Router
2.  **Server Component** → Repository Pattern
3.  **Repository** → Payload API
4.  **Payload** → PostgreSQL Query
5.  **Response** → Component Render
6.  **Client** → Interactive Hydration

## 🚀 Performance Optimizations

### Implemented

1.  **React Server Components**: Less client-side JavaScript
2.  **Image Optimization**: Next.js Image component
3.  **Static Generation**: Static pages where possible
4.  **On-demand Revalidation**: Selective cache updating
5.  **Database Query Optimization**: Select fields and depth optimization
6.  **Code Splitting**: Lazy loading of components

## 🧪 Testing Strategy

### Test Structure

```
tests/
├── e2e/                    # End-to-end tests
│   └── frontend.e2e.spec.ts
├── fixtures/               # Test data
│   ├── products.ts
│   ├── users.ts
│   └── orders.ts
├── unit/                   # Unit tests
│   ├── ProductsRepository.unit.spec.ts
│   └── OrdersRepository.unit.spec.ts
└── int/                    # Integration tests
    └── api.int.spec.ts
```

### Types of Tests

1.  **Unit Tests**: Repositories and utilities
2.  **Integration Tests**: API endpoints
3.  **E2E Tests**: Complete user flows

## 🔧 Development Configuration

### Environment Variables

```bash
# Database
DATABASE_URI=postgresql://...

# Authentication
PAYLOAD_SECRET=...

# Storage
BLOB_READ_WRITE_TOKEN=...

# Payments
STRIPE_SECRET_KEY=...
STRIPE_PUBLISHABLE_KEY=...
STRIPE_WEBHOOK_SECRET=...
```

### Development Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "payload": "payload",
    "generate:types": "payload generate:types",
    "migrate:create": "payload migrate:create",
    "test": "playwright test",
    "test:int": "vitest"
  }
}
```

## 📚 Implemented Best Practices

### Code

1.  **TypeScript Strict Mode**: Full typing
2.  **ESLint + Prettier**: Code quality
3.  **Conventional Commits**: Consistent versioning
4.  **SOLID Principles**: Maintainable architecture
5.  **Clean Architecture**: Layer separation

### Performance

1.  **React Server Components**: Server-side rendering
2.  **Lazy Loading**: On-demand components
3.  **Image Optimization**: WebP and responsive
4.  **Database Indexing**: Query optimization
5.  **CDN Integration**: Asset delivery

### Security

1.  **Role-Based Access**: Granular control
2.  **Input Validation**: Data sanitization
3.  **CSRF Protection**: Security tokens
4.  **Rate Limiting**: Protection against abuse
5.  **Environment Variables**: Secrets management
