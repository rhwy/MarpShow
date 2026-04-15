# Troubleshooting

## Build fails with "Cannot find module for page"

**Symptom:** `./scripts/build.sh` fails with errors like:
```
[Error [PageNotFoundError]: Cannot find module for page: /api/themes/[id]]
```

**Cause:** The Docker `.next` anonymous volume caches stale build artifacts. When new API routes or pages are added, the old cache doesn't know about them.

**Fix:** The `build.sh` script now recreates the container to get a fresh `.next` volume. If you still encounter this:

```bash
# Stop and remove containers + anonymous volumes
docker compose -p markshow-app down -v

# Restart fresh
./scripts/dev.sh
./scripts/build.sh
```

## PPTX export not working

**Symptom:** Clicking "PPTX" export shows an error or nothing happens.

**Cause:** `pptxgenjs` uses Node.js modules (fs, https) that can't be bundled by webpack for the browser. We load the browser bundle (`pptxgen.bundle.js`) from `/public` at runtime instead.

**Fix:** The file `public/pptxgen.bundle.js` must exist. If missing, copy it from the npm package:
```bash
cp node_modules/pptxgenjs/dist/pptxgen.bundle.js public/
```
