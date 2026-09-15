# IndoCampingLovers

National camping directory for Indonesia, built for the IndoCampingLovers (ICL) community.

## Product Goal

Help campers discover suitable campgrounds across Indonesia based on location, facilities, access, price, and camping style.

## Initial Architecture

- Frontend: Next.js + TypeScript + Tailwind CSS
- Hosting: Netlify
- Database: Supabase PostgreSQL
- Storage: Supabase Storage (initial phase)
- Maps: MapLibre / OpenStreetMap
- Engineering workflow: ChatGPT -> GitHub -> Netlify

## Branch Strategy

- `main`: stable / production-ready code
- `develop`: active development and Netlify development preview

## Roadmap

### M0 — Foundation
- Repository and branch setup
- Next.js scaffold
- TypeScript and Tailwind
- Netlify configuration
- Base project structure

### M1 — Database Foundation
- Supabase schema
- Campgrounds
- Locations
- Facilities
- Prices
- Photos
- Contacts
- Verification

### M2 — Public Directory
- Homepage
- Camping directory
- Search and filters
- Responsive campground cards

### M3 — Campground Detail
- Gallery
- Quick facts
- Facilities
- Access
- Pricing
- Map
- Contacts
- Verification status

### M4 — Geographic Discovery & SEO
- Province pages
- Regency/city pages
- Metadata
- Sitemap
- Structured data

### M5 — Community Contribution
- Add campground
- Suggest edit
- Photo submission
- Moderation queue

### M6 — Admin
- Campground CRUD
- Submission review
- Verification management

### M7 — Production Hardening
- Security and RLS
- Validation
- Performance
- Analytics
- SEO audit

## Status

M0.1 — Repository foundation in progress.
