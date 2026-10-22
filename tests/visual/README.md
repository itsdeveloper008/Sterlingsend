# Visual goldens

Goldens live in `tests/visual/golden/`.

## Run

Against a production build on `:3103`:

```bash
node scripts/visual-goldens-partc.mjs http://127.0.0.1:3103
```

Tolerance is 1.5% mismatched pixels (pixelmatch threshold 0.12).

## Update goldens

After intentional sheet or template style changes:

```bash
node scripts/visual-goldens-partc.mjs http://127.0.0.1:3103 --update
```

Commit the updated PNGs under `tests/visual/golden/`.
