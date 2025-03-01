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

3. **Elite** ($$)
   - All Featured plan benefits
   - Quarterly inclusion in weekly newsletter
   - Highlighted sales promotions
   - Priority placement in search results
   - Available in monthly and annual billing options

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
  │     ├── role: "operator" | "admin"
  │     ├── businessIds: Array<String>
  │     ├── name: String
  │     └── createdAt: Timestamp
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
3. Authentication system (login/register)
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
3. Promotion management for Elite users
4. Newsletter integration

### Phase 4: Admin & Advanced Features
1. Admin dashboard
2. Analytics
3. Advanced search filters
4. Mobile optimizations

## Technical Requirements

### Authentication
- Firebase Authentication
- Protected routes
- Role-based access control

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