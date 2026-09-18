# Where `public/` images came from

Provenance for every image file the prototype ships, so any of them can be
re-fetched or re-derived without guessing. Not deployed — this file is
documentation, the images themselves live under `public/`.

## Live-data evidence photos

Source: `External Memory/Debit reason master table.xlsx`, sheet **Sheet4** —
the 18 Sep pull that replaced the earlier `Sample data` extract. One real
Pilot, audit date 16 Sep 2026. Downloaded to `public/` so they are part of the
build and ship with every Vercel deploy rather than being fetched from
`images.meesho.com` at view time — which also means the prototype renders with
no network at all.

Sheet4 holds two blocks with different columns, so the table below is in two
parts. Base URL for every row: `https://images.meesho.com`

### Debit block — columns `image_1`–`image_4`

Six of the block's seventeen rows are in the fixture; which six, and why, is
reasoned out in `liveData.json`'s `_debitRowsNote`.

| Local path | Source path | Sheet column |
|---|---|---|
| `evidence/VLR082828771125/own-1.jpg` | `/ReturnPickupImages/VLR082828771125/imageVLR0828287711251.jpg` | image_1 |
| `evidence/VLR082828771125/own-2.jpg` | `/ReturnPickupImages/VLR082828771125/imageVLR0828287711252.jpg` | image_2 |
| `evidence/VLR082828771125/qc-1.jpg` | `/SecondaryQcImages/LM/VLR082828771125/imageVLR0828287711251.jpg` | image_3 |
| `evidence/VLR082828771125/qc-2.jpg` | `/SecondaryQcImages/LM/VLR082828771125/imageVLR0828287711252.jpg` | image_4 |
| `evidence/VLR082820371194/own-1.jpg` | `/ReturnPickupImages/VLR082820371194/imageVLR0828203711941.jpg` | image_1 |
| `evidence/VLR082820371194/own-2.jpg` | `/ReturnPickupImages/VLR082820371194/imageVLR0828203711942.jpg` | image_2 |
| `evidence/VLR082820371194/qc-1.jpg` | `/SecondaryQcImages/LM/VLR082820371194/imageVLR0828203711941.jpg` | image_3 |
| `evidence/VLR082820371194/qc-2.jpg` | `/SecondaryQcImages/LM/VLR082820371194/imageVLR0828203711942.jpg` | image_4 |
| `evidence/VLR082741397175/own-1.jpg` | `/ReturnPickupImages/VLR082741397175/imageVLR0827413971751.jpg` | image_1 |
| `evidence/VLR082741397175/own-2.jpg` | `/ReturnPickupImages/VLR082741397175/imageVLR0827413971752.jpg` | image_2 |
| `evidence/VLR082738981967/own-1.jpg` | `/ReturnPickupImages/VLR082738981967/imageVLR0827389819671.jpg` | image_1 |
| `evidence/VLR082738981967/own-2.jpg` | `/ReturnPickupImages/VLR082738981967/imageVLR0827389819672.jpg` | image_2 |
| `evidence/VLR082757394936/own-1.jpg` | `/ReturnPickupImages/VLR082757394936/imageVLR0827573949361.jpg` | image_1 |
| `evidence/VLR082757394936/own-2.jpg` | `/ReturnPickupImages/VLR082757394936/imageVLR0827573949362.jpg` | image_2 |
| `evidence/VLR082730980679/own-1.jpg` | `/CustomerDoorstepDeliveryImages/VL0085011544407/imageVL00850115444071.jpg` | image_1 |
| `evidence/VLR082730980679/own-2.jpg` | `/CustomerDoorstepDeliveryImages/VL0085011544407/imageVL00850115444072.jpg` | image_2 |

`VLR082730980679`'s two photographs sit under a DIFFERENT id in the source
path (`VL0085011544407`) — that is the delivery shipment id, and it is the
sheet's own pairing, not a transcription slip. The same held for the ICUD rows
in the previous extract.

### Wrong-RVP block — columns `pickup_image_1`–`_3`, `catalog_image_link`

Three of the block's eight rows are in the fixture; the choice is reasoned out
in `liveData.json`'s `_wrongNote`. The catalog links are long content-hashed
paths, so they are abbreviated below — the full URLs are in the sheet, one
cell per row.

| Local path | Source path | Sheet column |
|---|---|---|
| `evidence/VLR082406378860/own-1.jpg` | `/ReturnPickupImages/VLR082406378860/imageVLR0824063788601.jpg` | pickup_image_1 |
| `evidence/VLR082406378860/own-2.jpg` | `/ReturnPickupImages/VLR082406378860/imageVLR0824063788602.jpg` | pickup_image_2 |
| `evidence/VLR082406378860/own-3.jpg` | `/ReturnPickupImages/VLR082406378860/imageVLR0824063788603.jpg` | pickup_image_3 |
| `evidence/VLR082406378860/catalog-1.jpg` | `/images/catalogs/174995192/cover/1/2/ee12346c…5454.jpg` | catalog_image_link |
| `evidence/VLR082411058372/own-1.jpg` | `/ReturnPickupImages/VLR082411058372/imageVLR0824110583721.jpg` | pickup_image_1 |
| `evidence/VLR082411058372/own-2.jpg` | `/ReturnPickupImages/VLR082411058372/imageVLR0824110583722.jpg` | pickup_image_2 |
| `evidence/VLR082411058372/own-3.jpg` | `/ReturnPickupImages/VLR082411058372/imageVLR0824110583723.jpg` | pickup_image_3 |
| `evidence/VLR082411058372/catalog-1.jpg` | `/images/catalogs/163637607/cover/1/2/90612610…b606.jpg` | catalog_image_link |
| `evidence/VLR082408131054/own-1.jpg` | `/ReturnPickupImages/VLR082408131054/imageVLR0824081310541.jpg` | pickup_image_1 |
| `evidence/VLR082408131054/own-2.jpg` | `/ReturnPickupImages/VLR082408131054/imageVLR0824081310542.jpg` | pickup_image_2 |
| `evidence/VLR082408131054/own-3.jpg` | `/ReturnPickupImages/VLR082408131054/imageVLR0824081310543.jpg` | pickup_image_3 |
| `evidence/VLR082408131054/catalog-1.jpg` | `/images/catalogs/486089196/cover/1/2/7ebf5d35…bb1.jpg` | catalog_image_link |

**The four `qc-*.jpg` are downscaled**, long edge to 1200px, from originals at
3072x4096, 3456x4970 and 4608x3862. They arrived at 430–550 KB each — one loss
page was pulling over 1.9 MB, which on a Pilot's phone on mobile data is a
visible stall on exactly the screen the demo is about. The largest tile the
prototype ever draws is about 150 CSS px, so 1200 is still several times what
any display needs, and nothing about what the photographs SHOW has changed.
Pull the source URLs above again if you ever need the originals.

The pickup, delivery and catalog photographs are untouched — the API already
serves those between 5 KB and 90 KB.

**Retired with the `Sample data` extract:** `evidence/VLR082719500815/`,
`VLR082726387731/`, `VLR082665517559/`, `VLR082748453676/` and
`VLR082777512683/` were deleted when Sheet4 replaced that fixture — no row
referenced them any more and they were about 1.5 MB of the build. Their source
URLs are in this file's history if any of those five rows is ever wanted back.

## Stock catalogue

`catalog/product-{1,2,3}.avif` — the three dummy product shots the prototype
uses for row thumbnails and stand-in evidence tiles on Mock-data rows (see
`state/productImages.js`). They were remote URLs in `mockData.json` until
they moved here, for the same build-and-offline reason as above.

| Local path | Source |
|---|---|
| `catalog/product-1.avif` | `https://images.meesho.com/images/products/304506809/b3qdl_512.avif?width=360` |
| `catalog/product-2.avif` | `https://images.meesho.com/images/products/468319600/li3pv_512.avif?width=360` |
| `catalog/product-3.avif` | `https://images.meesho.com/images/products/434200566/ivj5b_512.avif?width=360` |
