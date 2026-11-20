# Trace

Mobile spy-thriller game prototype. You are an agent with a new name, a forged passport and a device that must reach Dubai. Every scan, camera and payment leaves a trace, and those traces come back later as evidence against you.

## Current build: airport sandbox missions (`index.html`)

Stylized 3D spy sandbox at Mumbai airport with noir comic story panels (three.js r160, browser, no build step).

- **Missions are generated:** 3 objectives (dead drop to an airside contact, steal the security-office laptop, plant a bug on a moving businessman) × 5 complications (alert-list timer, extra guards, a guard with your photo, crowd surge, longer-range CCTV), with a fresh cover story each time
- **Guards:** view cones, suspicion meters (`?` / `!`), search, chase and radio to each other. They notice running, restricted areas, suspicious actions and a look that matches the wanted description
- **CCTV:** sweeping cameras feed a control room that sends the nearest guard
- **Tools:** blend into crowds, change outfit in the washroom (no cameras), buy disguises at duty free, take a staff jacket from the locker, tailgate staff through locked doors, pull a fire alarm, or answer the emigration officer from your cover story
- **Career:** money, stars and heat persist in the browser. Heat makes guards recognise you faster; a new passport lowers it
- First play: title flyover with GUARD / CCTV / TARGET labels, noir cold open, then a thriller tutorial (a guard grows suspicious within seconds; hide in a crowd, change your look, sneak into the staff area) where the first mistake is forgiven
- Every CCTV camera that spots you takes a real black-and-white snapshot from its own point of view (CAM, timestamp, REC, face-match box) that pins to the screen as a polaroid and shows up in the end-of-mission footprint
- A glowing floor trail leads to the current goal; phones vibrate on detection; airport announcements play
- Caught and mission-complete noir panels

## Story chapter (`cab.html`)

Chapter 1, ghar se airport: book a cab on a night street, ride a kaali-peeli to T2 with an inside view, a flyover jam and driver small talk.

## Earlier prototypes (`prototypes/`)

- `v2-realistic.html`: walkable airport with Mixamo characters and HDRI lighting (uses `assets/`)

## v2: 3D Mumbai airport (`prototypes/v2-realistic.html`)

Walk a third-person character through a 3D Terminal 2 at night (three.js, runs in the browser):

- **Door:** a CISF jawan checks your documents
- **Contact:** a cleaner with a yellow trolley hands you the device. Do it out of CCTV view (the washroom has no cameras)
- **Check-in:** queue behind other passengers at Zephyr Air Row D. Cutting the line gets you noticed
- **Optional:** sit on a bench and hide the device inside your laptop, away from cameras
- **Emigration:** pick counter 11 (relaxed) or 14 (strict) and answer from your cover story
- **Security:** bag on the belt, walk through the detector, collect the bag
- **Gate 72:** board before 03:55

Every CCTV camera that sees you is counted. Suspicious acts on camera, police stops for running, and secondary checks all become traces in the end report. Controls: left-side drag to walk and right-side drag for the camera on phones; WASD, Shift, mouse drag and E on desktop.

## Earlier prototype: text story (`prototypes/v1-story.html`)

1. **Safehouse:** briefing, ₹5,00,000 budget
2. **Forger:** pick a passport tier (Jugaad / Clean / Ghost). Cheaper means a higher chance of a machine-scan flag
3. **Photo studio:** the beard in your photo must match your face at the airport
4. **Cover story:** memorise it in 30 seconds. It is never shown again except in quick rehearsals
5. **Bookings:** return or one-way ticket (UAE needs onward travel), tourist or business visa (must match your purpose), hotel
6. **Pocket litter:** visiting cards, invitation letter, receipts, cover phone line, family photo. These become evidence cards in interrogation
7. **Packing:** where to hide the signal cloner (cabin, inside the laptop, check-in, or leave it)
8. **Mumbai T2:** CISF gate → check-in → emigration → security X-ray → boarding gate events
9. **Flight:** a curious neighbour (sometimes counter-intelligence)
10. **Dubai T1:** pick an immigration line, face match, questions → customs (green or red) → SIM → hotel

Systems: real-time clock (check-in closes 03:15), heart-rate/nerve meter with a breathing mini-game, timed answers, hidden suspicion, secondary-inspection interrogation, and a digital-footprint report at the end.

## Play online

https://trace-game.pages.dev (Cloudflare Pages, no login needed). To publish changes: `CLOUDFLARE_ACCOUNT_ID=... sh scripts/deploy-cloudflare.sh` (rebuilds `site/` and deploys).

## Run

Open `index.html` in a browser (needs internet for three.js from jsDelivr). Single file, no build step. Sound is synthesised in the browser. Use headphones.
