# Read-Only Users Implementation Guide

## Overview

This implementation adds support for a new user role called `read-only` in your Payload CMS project.
Users with this role can access the admin panel and view all data, but cannot create, update, or delete any content.

## Changes Made

### 1. New User Role Added

**File:** `src/collections/Users/index.ts`
- Added `read-only` as a new role option in the user roles field
- Updated admin access to allow both `admin` and `read-only` users
- Restricted create/update operations to admin users only
- Protected the roles field so only admins can modify user roles

### 2. New Access Control Utilities

**Files Created:**
- `src/access/adminOrReadOnly.ts` - Collection-level access for read-only users
- `src/access/adminOrReadOnlyFieldAccess.ts` - Field-level access for read-only users

These utilities allow read-only users to access collections for reading purposes while restricting write operations.

### 3. Collection Updates

**File:** `src/collections/Pages/index.ts`
- Updated to use `adminOrReadOnly` for update operations

### 4. Admin Bar Update

**File:** `src/components/AdminBar/index.tsx`
- Updated to show the admin bar for both admin and read-only users
- Read-only users can now see the navigation and access the admin interface

## User Permissions

### Admin Users (`admin` role)
- Full access to all collections
- Can create, read, update, and delete content
- Can manage user roles and permissions
- Full access to all admin panel features

### Read-Only Users (`read-only` role)
- Can access the admin panel
- Can view all data in collections (subject to existing collection-level access rules)
- **Cannot** create new content
- **Cannot** update existing content
- **Cannot** delete content
- **Cannot** modify user roles or permissions
- Can see the admin bar and navigate the interface

### Customer Users (`customer` role)
- Cannot access the admin panel
- Limited to their own data (orders, cart, addresses)
- Only for frontend customer accounts

## Creating Read-Only Users

To create a read-only user:

1. Log in as an admin user
2. Go to the Users collection in the admin panel
3. Create a new user or edit an existing user
4. Set the roles field to include `read-only` (and optionally `customer`)
5. Save the user

**Example roles combinations:**
- `["read-only"]` - Pure read-only access
- `["read-only", "customer"]` - Read-only access with frontend customer privileges

## Security Considerations

1. **Field-Level Protection**: The `roles` field remains protected - only admins can modify user roles
2. **Collection-Level Protection**: Collections still have their existing access controls
3. **Destructive Operations**: Create, update, and delete operations are restricted to admins
4. **User Management**: Only admins can create or modify user accounts

## Testing the Implementation

To test the read-only functionality:

1. Create a user with the `read-only` role
2. Log in as that user
3. Verify they can access the admin panel
4. Verify they can view content in collections
5. Verify they cannot create, edit, or delete content
6. Verify they cannot modify their own or other users' roles

## Customization

To extend read-only permissions to additional collections, update the collection's access configuration:

```typescript
import { adminOrReadOnly } from '@/access/adminOrReadOnly'

export const YourCollection: CollectionConfig = {
  // ... other config
  access: {
    // ... other access rules
    update: adminOrReadOnly, // Allow read-only users to update this collection
  },
}
```

## Benefits

- **Data Viewing**: Allows non-technical staff to review content and data
- **Security**: Maintains strict control over data modification
- **Compliance**: Useful for audit and review processes
- **Collaboration**: Enables external reviewers to access the system safely
