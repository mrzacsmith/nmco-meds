# NMCO Meds Project Focus

## Project Overview
NMCO Meds is a dual-domain cannabis directory service operating as:
- **303 Meds**: Serving Colorado (CO)
- **505 Meds**: Serving New Mexico (NM)

The application uses a shared codebase with domain-specific content, styling, and data.

## Core Structure

### Domain Management
- Single codebase with domain detection based on:
  - Hostname in production
  - Environment variables for development (`DOMAIN=303meds` or `DOMAIN=505meds`)
  - URL parameters as fallback (`?domain=303meds` or `?domain=505meds`)

### Business Listing Tiers
1. **Free Listing**
   - Basic information only (name, location, contact)
   - Minimal visibility in search results
   - No special features

2. **Featured** ($)
   - Complete business profile
   - Featured business card display
   - Google Maps pin with hover functionality
   - Multiple images
   - Detailed business information
   - Available in monthly and annual billing options
   - Standard tier covers 1-2 locations in a single state

3. **Elite** ($$)
   - All Featured plan benefits
   - Quarterly inclusion in weekly newsletter
   - Highlighted sales promotions
   - Priority placement in search results
   - Available in monthly and annual billing options
   - Standard tier covers 1-2 locations in a single state

4. **Corporate Plans** ($$$)
   - Available as Featured or Elite level
   - Covers up to 25 locations in a single state
   - Centralized management of all locations
   - Bulk editing capabilities
   - Enhanced analytics and reporting
   - Priority customer support
   - Available in monthly and annual billing options (with significant discount for annual)

### User Roles
1. **Operator** (default)
   - Can manage only their own business listing
   - Can upgrade subscription
   - Can update business details

2. **Admin**
   - Can add/remove/update any listing
   - Can manage user roles
   - Can view all businesses across domains
   - Initially set manually in Firebase

## Database Structure

### Firebase Collections
```
businesses-co/
  ├── [businessId]/
  │     ├── name: String
  │     ├── type: String
  │     ├── address: String
  │     ├── city: String
  │     ├── state: "CO"
  │     ├── coordinates: {lat: Number, lng: Number}
  │     ├── description: String
  │     ├── images: Array<String>
  │     ├── tags: Array<String>
  │     ├── planLevel: "free" | "featured" | "elite"
  │     ├── planBilling: null | "monthly" | "annual"
  │     ├── planExpiry: Timestamp
  │     ├── corporatePlan: Boolean
  │     ├── corporateId: String (reference to corporate group if part of one)
  │     ├── ownerId: String (reference to users collection)
  │     └── promotions/
  │           ├── [promotionId]/
  │                 ├── title: String
  │                 ├── description: String
  │                 ├── startDate: Timestamp
  │                 ├── endDate: Timestamp
  │                 └── imageUrl: String

businesses-nm/
  ├── [businessId]/
  │     ├── ... (same structure as businesses-co)

users/
  ├── [userId]/
  │     ├── email: String
  │     ├── displayName: String
  │     ├── role: "operator" | "admin"
  │     ├── states: Array<"CO" | "NM"> (states where user has businesses)
  │     ├── businessIds: {
  │     │     co: Array<String> (references to businesses-co)
  │     │     nm: Array<String> (references to businesses-nm)
  │     │ }
  │     ├── companyName: String (for corporate users with multiple locations)
  │     ├── phone: String
  │     ├── isMultiState: Boolean (flag for corporate users with locations in both states)
  │     ├── hasCorporatePlan: Boolean
  │     ├── corporatePlanDetails: {
  │     │     co: {
  │     │         planLevel: "featured" | "elite" | null,
  │     │         planBilling: "monthly" | "annual" | null,
  │     │         planExpiry: Timestamp | null
  │     │     },
  │     │     nm: {
  │     │         planLevel: "featured" | "elite" | null,
  │     │         planBilling: "monthly" | "annual" | null,
  │     │         planExpiry: Timestamp | null
  │     │     }
  │     │ }
  │     ├── createdAt: Timestamp
  │     └── lastLogin: Timestamp

corporate-groups/
  ├── [corporateId]/
  │     ├── name: String
  │     ├── ownerId: String (reference to users collection)
  │     ├── states: Array<"CO" | "NM">
  │     ├── businessIds: {
  │     │     co: Array<String> (references to businesses-co)
  │     │     nm: Array<String> (references to businesses-nm)
  │     │ }
  │     ├── planDetails: {
  │     │     co: {
  │     │         planLevel: "featured" | "elite" | null,
  │     │         planBilling: "monthly" | "annual" | null,
  │     │         planExpiry: Timestamp | null,
  │     │         locationCount: Number
  │     │     },
  │     │     nm: {
  │     │         planLevel: "featured" | "elite" | null,
  │     │         planBilling: "monthly" | "annual" | null,
  │     │         planExpiry: Timestamp | null,
  │     │         locationCount: Number
  │     │     }
  │     │ }
  │     ├── createdAt: Timestamp
  │     └── updatedAt: Timestamp
```

## Template & Content Differences

### Domain-Specific Elements
1. **Visual Differences**
   - Color schemes:
     - 303 Meds (CO): Green/blue primary palette
     - 505 Meds (NM): Red/orange primary palette
   - Logo variations
   - Hero images specific to each state

2. **Content Differences**
   - State-specific copy throughout the site
   - Location-based search defaults
   - Popular cities list
   - Legal information specific to each state

3. **Data Differences**
   - Separate business collections for each state
   - State-specific featured businesses
   - Different promotional content

## Implementation Priorities

### Phase 1: Core Structure & Authentication
1. Domain context and theme setup ✅
2. Basic page structure and navigation ✅
3. Authentication system (login/register with Google and email)
4. Business dashboard (basic)
5. Initial deployment

### Phase 2: Business Listings & Maps
1. Complete business listing pages
2. Google Maps integration
3. Search functionality
4. Business profile management

### Phase 3: Subscription & Premium Features
1. Subscription management
2. Featured/Elite plan implementation
3. Corporate plan implementation
4. Promotion management for Elite users
5. Newsletter integration

### Phase 4: Admin & Advanced Features
1. Admin dashboard
2. Analytics
3. Advanced search filters
4. Mobile optimizations

## Technical Requirements

### Authentication
- Firebase Authentication with email and Google sign-in
- Protected routes
- Role-based access control
- Support for multi-state business operators

### Maps Integration
- Google Maps API
- Custom pins for businesses
- Hover interaction between list and map

### Deployment
- Separate domains pointing to same application
- Environment-based configuration
- SSL certificates for both domains

## Design Principles
1. Maintain consistent UX across domains while allowing for visual differentiation
2. Clear distinction between subscription tiers
3. Mobile-first responsive design
4. Performance optimization for map and image-heavy pages
5. Accessibility compliance 