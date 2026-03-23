# Audi Test Drive Tracker

## Current State
The app has role-based access control where the first principal to call `_initializeAccessControlWithSecret` with the correct CAFFEINE_ADMIN_TOKEN becomes admin. Once that slot is taken, all subsequent logins get `#user` role. There is no way for the legitimate super admin to reclaim the admin role if it was taken by another principal.

## Requested Changes (Diff)

### Add
- `claimSuperAdminByToken(token: Text)` backend function: verifies the token against CAFFEINE_ADMIN_TOKEN env var, and if it matches, assigns the caller the `#admin` role (overwriting whatever role they currently have). This lets the legitimate owner reclaim super admin at any time.
- Settings page: "Claim Super Admin" card section with a password-type input for the admin token and a submit button. Only visible to non-admin users.

### Modify
- `src/backend/main.mo`: add the new claim function using `mo:prim` to read env var
- `src/frontend/src/pages/Settings.tsx`: add the claim super admin UI section

### Remove
- Nothing

## Implementation Plan
1. Add `claimSuperAdminByToken` to main.mo using Prim.envVar to read CAFFEINE_ADMIN_TOKEN
2. Regenerate/update backend.d.ts to include new function
3. Add UI in Settings.tsx for non-admin users to enter admin token and claim super admin role
