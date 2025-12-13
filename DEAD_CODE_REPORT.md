# Dead Code Analysis Report
## LocalLens Backend & Frontend

Generated: $(date)

---

## 🔴 CRITICAL ISSUES

### 1. **Payment Routes Not Registered** ⚠️
**Location:** `src/app/routes.ts`

**Issue:** Payment routes are defined but never registered in the main routes file.

**Files:**
- `src/app/modules/payment/payment.routes.ts` - Routes exist but not imported
- `src/app/modules/payment/payment.controller.ts` - Controller functions exist

**Impact:** Payment callbacks (`/payment/success`, `/payment/fail`, `/payment/cancel`) are completely inaccessible, breaking payment functionality.

**Fix Required:**
```typescript
// In src/app/routes.ts, add:
import { paymentRoutes } from "./modules/payment/payment.routes";

// In allRoutes array, add:
{
  path: "/payment",
  route: paymentRoutes,
}
```

---

## 🟡 BACKEND DEAD CODE

### 2. **Unused Auth Endpoints**
**Location:** `src/app/modules/auth/auth.routes.ts`

**Dead Endpoints:**
- `POST /auth/refresh-token` - Not called from frontend
- `POST /auth/change-password` - Not called from frontend

**Frontend Status:** 
- `auth.api.ts` does not include these endpoints
- No frontend components use them

**Recommendation:** Remove if not needed, or implement frontend integration.

---

### 3. **Debug/Test Endpoints in Production Code**
**Location:** `src/app/modules/tour/tour.route.ts` & `tour.controller.ts`

**Dead Endpoints:**
- `GET /tour/debug` - Debug endpoint (line 14)
- `GET /tour/debug/user` - Debug endpoint (line 36-39)
- `GET /tour/test/my-tours` - Test endpoint (line 42-45)

**Controller Functions:**
- `debugAllTours` (line 296-342)
- `debugUser` (line 344-358)
- `testMyTours` (line 360-387)

**Issues:**
- `debugAllTours` uses `Types.ObjectId` without import (line 306) - **BUG**
- Contains hardcoded guideId: `"693bde1b3c1c654202473778"` (line 304)
- Contains console.log statements instead of proper logging

**Recommendation:** 
- Remove debug/test endpoints for production
- Or move to a separate debug route file with environment-based access control

---

### 4. **Unused Tour Endpoint**
**Location:** `src/app/modules/tour/tour.route.ts`

**Dead Endpoint:**
- `GET /tour/guide/my-tours` (line 22-26) - Replaced by `/tour/my-tours`

**Status:** 
- Frontend uses `/tour/my-tours` (universal endpoint)
- Old guide-specific endpoint is redundant

**Recommendation:** Remove if `/tour/my-tours` handles all cases.

---

### 5. **Frontend-Backend Endpoint Mismatches**
**Location:** Multiple files

**Mismatch 1: Tour Details Endpoint**
- **Frontend:** `redux/features/tour/tour.api.ts` line 42-48 calls `/tour/details/:id`
- **Backend:** Only has `/tour/:id` route (handles both slug and ID)
- **Status:** Frontend query exists but calls non-existent endpoint
- **Impact:** `useGetTourByIdQuery` will fail when called

**Mismatch 2: Tour Update Endpoint**
- **Frontend:** `redux/features/tour/tour.api.ts` line 50-57 calls `/tour/update/:id`
- **Backend:** Has `/tour/:id` route for PATCH (line 68-74)
- **Status:** Frontend calls wrong endpoint
- **Impact:** Tour updates will fail

**Controller Function:**
- `getTourById` (line 124-141) - Exists but route uses `/:id` which calls `getTourBySlug`

**Recommendation:** 
- Fix frontend to use `/tour/:id` for both get and update, OR
- Add `/tour/details/:id` and `/tour/update/:id` routes in backend

---

### 6. **Missing Import in Tour Controller**
**Location:** `src/app/modules/tour/tour.controller.ts`

**Bug:** Line 306 uses `Types.ObjectId` but `Types` is not imported.

**Fix Required:**
```typescript
import { Types } from "mongoose";
```

---

## 🟢 FRONTEND DEAD CODE

### 7. **Duplicate API Endpoint Definition**
**Location:** `redux/features/tour/tour.api.ts`

**Issue:** `getTourBySlug` is defined twice:
- Line 24-30
- Line 49-55

**Impact:** Second definition overwrites the first, potential confusion.

**Fix Required:** Remove duplicate definition.

---

### 8. **Unused Tour Details Page**
**Location:** `app/(main)/tours/[id]/page.tsx`

**Issues:**
- Line 9-12: `getTourById` function is a stub that always returns `null`
- Line 24: Uses the stub function instead of actual API call
- TODO comment on line 8 indicates incomplete implementation

**Status:** Page exists but doesn't fetch real data.

**Recommendation:** 
- Implement actual API call using `useGetTourBySlugQuery` or `useGetTourByIdQuery`
- Or remove if not needed

---

### 9. **Broken API Endpoints in Frontend**
**Location:** `redux/features/tour/tour.api.ts`

**Broken Endpoints:**
- `getTourById` (line 42-48) - Calls `/tour/details/:id` which doesn't exist in backend
- `updateTour` (line 50-57) - Calls `/tour/update/:id` but backend has `/tour/:id`

**Status:** 
- Backend doesn't have `/tour/details/:id` or `/tour/update/:id` routes
- Frontend component `app/(main)/tours/[slug]/page.tsx` uses `useGetTourByIdQuery` (line 47)
- These will cause API errors

**Recommendation:** Fix frontend endpoints to match backend routes (`/tour/:id` for both).

---

### 10. **Missing Frontend API Calls**
**Location:** Frontend API files

**Missing Implementations:**
- No payment API endpoints in frontend (payment callbacks are backend-only, but frontend might need payment status checks)
- No refresh-token API call (though backend has endpoint)
- No change-password API call (though backend has endpoint)

**Recommendation:** Implement if needed, or remove backend endpoints if not.

---

## 📊 SUMMARY

### Backend Dead Code:
- ✅ 1 Critical: Payment routes not registered
- ✅ 2 Unused endpoints: refresh-token, change-password
- ✅ 3 Debug/test endpoints: /tour/debug, /tour/debug/user, /tour/test/my-tours
- ✅ 1 Redundant endpoint: /tour/guide/my-tours
- ✅ 1 Missing import bug: Types.ObjectId
- ✅ 2 Endpoint mismatches: Frontend expects /tour/details/:id and /tour/update/:id

### Frontend Dead Code:
- ✅ 1 Duplicate definition: getTourBySlug
- ✅ 1 Stub function: getTourById in tour details page (old file)
- ✅ 2 Broken API queries: getTourById and updateTour call wrong endpoints
- ✅ Missing implementations: refresh-token, change-password

### Total Issues Found: **14**

---

## 🔧 RECOMMENDED ACTIONS

### High Priority:
1. **Register payment routes** - Critical for payment functionality
2. **Fix Types.ObjectId import** - Bug that will cause runtime error
3. **Remove or protect debug endpoints** - Security concern

### Medium Priority:
4. Fix frontend API endpoints (`getTourById` and `updateTour`) to match backend routes
5. Remove duplicate `getTourBySlug` definition
6. Remove old stub tour details page (`app/(main)/tours/[id]/page.tsx`) if not used
7. Align frontend/backend endpoint expectations

### Low Priority:
8. Remove unused auth endpoints or implement frontend integration
9. Clean up redundant tour endpoints
10. Remove stub functions

---

## 📝 NOTES

- Payment routes are the most critical issue - they must be registered for payment callbacks to work
- Debug endpoints should not be in production code
- Frontend and backend have some endpoint mismatches that need alignment
- Some endpoints exist in backend but have no frontend integration

