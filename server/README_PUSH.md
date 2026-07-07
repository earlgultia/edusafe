Push Notification Server Setup
===============================

This document explains how to enable native push delivery for the prototype server.

1) Firebase service account (recommended)
----------------------------------------
- Create a Firebase project and a service account with Cloud Messaging permissions.
- Download the service account JSON and place it at `server/serviceAccountKey.json`.
- Restart the server. It will detect the file and attempt to initialize `firebase-admin`.

2) Fallback using legacy FCM server key
----------------------------------------
- If you cannot use a service account, set the environment variable `FCM_SERVER_KEY` to your server key.
- The server will fallback to the HTTP FCM send method when `firebase-admin` isn't available.

3) Admin protections
---------------------
- The server supports protecting admin endpoints with either an `ADMIN_KEY` header or a Supabase session token.
- To use a static admin header, set `ADMIN_KEY` in the server environment. Include `x-admin-key: <ADMIN_KEY>` on admin requests.
- To use Supabase-based admin validation, set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` environment variables with a service role key. Then send a bearer token in `Authorization: Bearer <token>` where the user has `role: 'admin'` in `user_metadata`.

4) Device registration
----------------------
- Client code should POST to `/api/registerDevice` with `{ token, email, role }` to register device tokens.

6) Bulk device management
-------------------------
- To remove multiple devices at once, POST to `/api/devices/bulk` with `{ tokens: ['token1','token2'] }`.
- This endpoint is protected the same way as other admin routes (see Admin protections above).

7) Export registered devices
----------------------------
- To download all registered devices as CSV, call `GET /api/devices/export`.
- This endpoint is protected the same way as other admin routes (see Admin protections above) and returns a CSV attachment with columns `email,role,token,addedAt`.

8) Installing Capacitor push plugin (client)
-------------------------------------------
- For native builds using Capacitor, install the client plugin in your project root:

```bash
npm install @capacitor/push-notifications
```

- After installing, add Capacitor platforms and sync plugins as usual (e.g., `npx cap add android`, `npx cap sync`).
- The app's runtime will only attempt to load the plugin when `window.Capacitor` is present; web/dev builds will not fail if the plugin is not installed.

Dev: simulate device token (web)
--------------------------------
- For development without native devices, you can simulate device registration to exercise the server flows.
- In the browser console (or from a dev-only UI), enable simulation:

```js
localStorage.setItem('edusafe_simulate_push', '1');
// then perform a sign-in in the app so initNativePush runs and registers a fake token
```

- Alternatively, call the helper from the console after the app loads:

```js
// open browser console and run:
window.__simulatePush && window.__simulatePush({ email: 'dev@example.com', role: 'Admin' });
```

Note: The library exports `simulatePushForDev` which the app exposes to `window.__simulatePush` in dev builds (if desired).

5) Troubleshooting
------------------
- If messages are queued (saved to `db.pushLog`) ensure Firebase credentials are present. Look at server logs on startup.
