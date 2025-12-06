# QZero - Sistema de Gestão de Filas e Agendamentos

## Current Version
- **Version:** 1.8.7
- **Build:** 37
- **Bundle ID:** com.afonso.qzerocerto
- **Status:** PRODUCTION-READY ✅

## Recent Changes (December 5, 2025)
- **B2B Registration Compliance**: iOS/Android apps only allow personal account creation - business account option completely hidden on native platforms (Apple/Google B2B compliance)
- **Mobile Scroll Fix**: Removed `min-h-screen` from 40+ page components to eliminate extra scroll space caused by Layout padding
- **Complete B2B Compliance Audit**: All payment CTAs hidden in native iOS/Android apps
- **Toast Notifications Redesigned**: WhatsApp-style toasts with gradient colors, WCAG AA compliant
- **Bug Fix**: Removed non-existent `Notification.create()` call - push notifications use Firebase
- **Version Sync**: All config files synchronized (package.json, build.gradle, Info.plist)
- **Firebase Push**: Verified correct Bundle ID in google-services.json and GoogleService-Info.plist

## B2B Compliance Status (App Store / Play Store Ready)
All components verified to hide payment buttons on native platforms:
- ✅ BusinessFeatureGuard - redirects to waitless-qzero.com
- ✅ ExpiredBanner - shows external website notice
- ✅ TrialBanner - shows external website notice  
- ✅ RestrictedAccessOverlay - shows external website notice
- ✅ PaymentPendingBanner - shows external website notice
- ✅ BusinessSubscription - full external redirect flow for native apps

## Overview
QZero is a production-ready React + Vite application for enterprise queue and appointment management. It aims to improve customer experience and operational efficiency through real-time tracking, analytics, and scalable management tools. The system supports both customer and business accounts, features an integrated Stripe subscription flow, and is prepared for Android/iOS deployment via Capacitor. Its ambition is to be a leading solution for businesses seeking to optimize customer flow and enhance service delivery.

## User Preferences
- Ask before making major changes.
- I prefer detailed explanations.
- Do not make changes to the folder `Z`.
- Do not make changes to the file `Y`.

## System Architecture
**UI/UX Decisions:** The system features a modern, responsive, and mobile-first design utilizing Radix UI, Tailwind CSS, and Framer Motion. Key UI/UX elements include a `useConfirm` hook, WhatsApp-style Sonner notifications with gradient colors, a fixed bottom navigation bar for mobile, WCAG 2.1 AA compliance, and a redesigned calendar component. Mobile layouts have been optimized for minimal scrolling with compact headers (text-xl instead of text-4xl), accordion patterns in BusinessSettings, 4-column stats grids, and reduced padding throughout all pages.

**Technical Implementations:**
- **Backend:** Node.js + Express with security middleware (Helmet, CORS, rate-limiting, input validation, sanitization), Winston logging, and PostgreSQL with Drizzle ORM.
- **Frontend:** React 18, Vite 6, Radix UI, Tailwind CSS, Framer Motion, `@tanstack/react-query` for state management, and React Router DOM v7 for routing.
- **API Client:** Custom standalone client (`src/api/base44Client.js`).
- **Authentication:** Production-ready 2FA system using bcrypt, JWT (HTTP-only cookies), and email-based 6-digit codes. Supports customer ("pessoal") and business ("empresa") account types, including staff invitation with inherited subscription access, optimized for secure cookie handling across environments.
- **Data Persistence:** PostgreSQL for all core data including company profiles, tickets, queues, and appointments, ensuring permanent storage.
- **Payment Processing:** B2B external payment model - Stripe (web, with 7-day free trial). Mobile apps (iOS/Android) redirect to external website (waitless-qzero.com) for subscription purchase, as permitted by Apple/Google B2B guidelines. No in-app purchases.
- **Mobile App (Capacitor):** Production-ready for Android/iOS deployment with security hardening. Includes `@capacitor/geolocation` for geolocation features.
- **Internationalization (i18n):** Production-ready multi-language support for 23 languages using `react-i18next` with automatic browser detection, manual selection persistence, and complete date localization via `date-fns`. Dynamic UI translation is supported via Google Cloud Translation API.
- **GDPR-Compliant System:** Privacy Policy and Terms of Use accessible from Profile > Legal Information section. Account deletion fully removes all user data. No pre-registration consent gate (simplified registration flow).
- **Toast Notifications:** WhatsApp-style design with gradient colors (green success, red error, orange warning, blue info), bottom-center positioning, safe area support for iOS notch.

**Feature Specifications:**
- **Customer Portal:** Business viewing with GPS filtering, virtual queues, appointments, real-time tracking, history, geolocation, and reviews.
- **Business Portal (Paid Subscription):** Dashboard, queue, service, and appointment management, analytics, team management.
- **Enterprise Subscription Flow:** Business profile creation, Stripe Checkout, access control, 7-day free trial.
- **Push Notifications:** Implemented for iOS and Android using Firebase Cloud Messaging, with notifications for queue alerts, ticket calls, appointment reminders, and confirmations, all translated into the user's preferred language. Account deletion is fully GDPR compliant, removing all associated user and business data.

## External Dependencies
- **Stripe:** Payment processing for enterprise subscriptions (web only).
- **OpenStreetMap Nominatim API:** Geocoding business addresses.
- **Google Maps Places API:** Address validation and autocomplete for business profiles.
- **Google Cloud Translation API:** Automatic real-time translation of UI content, business names, descriptions, and emails.
- **Firebase Cloud Messaging:** Push notifications for iOS and Android.

## Build Commands
```bash
# Development
npm run dev

# Build for production
npm run build

# Capacitor sync (after build)
npm run cap:sync

# Open Android Studio
npm run cap:android

# Open Xcode
npm run cap:ios
```
