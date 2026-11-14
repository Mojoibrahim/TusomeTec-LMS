# LMS
LMS

## Backend authentication configuration

Set a dedicated, high-entropy `JWT_SECRET` of at least 32 bytes in `backend/.env` before starting the backend. The server refuses to start without it and does not use a built-in fallback. Use the same value across backend instances; changing it invalidates existing JWTs. You may generate a value with:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
