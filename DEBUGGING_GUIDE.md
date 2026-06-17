# OfferListing Debugging Guide

## What Was Fixed

### 1. **Backend: Added Active Status Filtering** ✅
- **File**: `SmartBooking.API/Repositories/OfferRepository.cs`
- **Issue**: `GetAllAsync()` was returning ALL offers regardless of status
- **Fix**: Added `.Where(o => o.Status == "Active")` filter
- **Result**: Public API now only returns offers with Status = "Active"

### 2. **Frontend: Enhanced Error Handling & Logging** ✅
- **File**: `frontend/src/pages/OfferListing.tsx`
- **Changes**:
  - Added detailed console.log statements to trace the API request
  - Logs API URL, response structure, and offer count
  - Improved error messages with specific troubleshooting hints
  - Added retry button for network errors

---

## Step-by-Step Debugging Instructions

### Step 1: Verify Backend is Running
```bash
# In the SmartBooking.API directory
dotnet run
# Should see: "Now listening on: https://localhost:5237"
```

### Step 2: Check Browser Console (F12)
1. Open your browser and go to `http://localhost:5173` (or your frontend port)
2. Press **F12** to open Developer Tools
3. Go to the **Console** tab
4. Look for these logs:
   ```
   📡 Fetching offers from API...
   API Base URL: http://localhost:5237/api
   Full Request URL: http://localhost:5237/api/offers
   ✅ API Response Status: 200
   📦 Full API Response: [...]
   📊 Offers Count: X
   🔍 Sample Offer Structure: {...}
   ```

### Step 3: Inspect Network Tab
1. In DevTools, go to **Network** tab
2. Reload the page (F5)
3. Look for a request to `offers` (or `/api/offers`)
4. Click on it and check:
   - **Status**: Should be `200` (success) or `304` (cached)
   - **Response**: Should be a JSON array like:
     ```json
     [
       {
         "id": 1,
         "title": "...",
         "businessName": "...",
         "offerPrice": 99.99,
         "status": "Active",
         ...
       }
     ]
     ```
   - **Headers**: Check if `Authorization` header is present (if token exists)

### Step 4: Verify Database Has Active Offers
```bash
# Run in SmartBooking.API directory
dotnet ef dbcontext info
# Or open SQL Server Management Studio and query:
# SELECT * FROM Offers WHERE Status = 'Active';
```

### Step 5: Test API Directly
**Option A: Using VS Code REST Client**
1. Open `SmartBooking.API/SmartBooking.API.http`
2. Add this request:
   ```http
   ### Get All Active Offers
   GET http://localhost:5237/api/offers
   ```
3. Click "Send Request"
4. Check the response

**Option B: Using cURL**
```bash
curl http://localhost:5237/api/offers
```

**Option C: Using Postman**
1. Create new GET request
2. URL: `http://localhost:5237/api/offers`
3. Click "Send"

---

## Common Issues & Solutions

### ❌ Issue: "API Response Status: 0" or No Response
**Cause**: Backend not running or port mismatch  
**Solution**:
1. Verify backend runs on port **5237** (check `appsettings.json`)
2. Check `axiosClient.ts` has correct baseURL: `http://localhost:5237/api`
3. Ensure backend is running: `dotnet run`

### ❌ Issue: "Response is not an array"
**Cause**: API is returning a single object instead of array  
**Solution**:
1. Check API response in Network tab
2. Verify `OfferRepository.GetAllAsync()` returns `IEnumerable<Offer>`
3. Check if pagination wrapper is being used

### ❌ Issue: "Offers Count: 0" (Empty Array)
**Cause**: Either no Active offers in DB, or filtering is too strict  
**Solution**:
1. Create test offer via Admin Dashboard with Status = "Active"
2. Verify offer Status field equals exactly `"Active"` (case-sensitive!)
3. Check offer dates: `StartDate <= Today <= EndDate`

### ❌ Issue: CORS Error
**Cause**: Frontend and backend on different origins  
**Solution**:
1. Check `Program.cs` has CORS configured
2. Ensure CORS policy allows `http://localhost:5173` (frontend URL)

### ❌ Issue: Token/Authorization Error (401)
**Cause**: Expired or invalid JWT token  
**Solution**:
1. The public listing endpoint (`GET /api/offers`) should NOT require `[Authorize]`
2. Verify `OffersController.GetAll()` doesn't have `[Authorize]` attribute
3. Frontend's `axiosClient` will auto-remove invalid tokens

---

## Verification Checklist

- [ ] Backend running on port 5237
- [ ] `OfferRepository.GetAllAsync()` filters by Status = "Active"
- [ ] At least one offer exists in DB with Status = "Active"
- [ ] Frontend console shows API URL correctly
- [ ] Network tab shows 200 status response
- [ ] Response is a JSON array `[{...}, {...}]`
- [ ] Offers display on the page

---

## Testing Tips

### Create Test Data
1. Go to `/admin` (Admin Dashboard)
2. Login with your credentials
3. Go to "Manage Offers"
4. Create a new offer with:
   - Title: "Test Offer"
   - Status: **Active** (important!)
   - End Date: Future date
5. Save and verify it appears on home page

### Clear Cache
```javascript
// Run in browser console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Force Reload (bypass cache)
- Press **Ctrl+Shift+R** (Windows/Linux)
- Press **Cmd+Shift+R** (Mac)

---

## Still Not Working?

1. **Check Console for Error Messages**: Look for ❌ symbols and detailed error logs
2. **Verify Response Structure**: Ensure API returns array with correct field names (title, offerPrice, businessName, etc.)
3. **Check Data Types**: Ensure offerPrice is a number, not a string
4. **Restart Everything**: Stop frontend + backend, then restart both
5. **Database Connection**: Verify database has offers data using SQL Server Management Studio
