# Hush

**Time first. Everything else only when it matters.**

An adaptive quiet watchface for Pebble Time 2 (Emery) and Pebble Round 2 (Gabbro). The face stays calm—large time, one optional soft detail, and an empty signal rail—until something crosses a threshold you set. Then a colored pip lights up; a wrist flick opens a five-second detail card.

## Features

- Minute-tick display (negligible battery impact by design)
- Themes: Ink, Paper, Night, Phosphor, Coral, plus custom colors
- Always-on slot: off / date / weekday / battery / steps
- Signal categories: calendar (ICS), weather, step pace, system, sun, world overlap
- One-tap presets: Commuter, Parent, Deep Work, Weekend
- Flick to cycle detail cards; optional seconds for 8s after flick
- Low-power mode at ≤15% battery (time + battery only)
- Timeline Quick View aware (`unobstructed` layout)
- Clay settings with thresholds and live AppMessage updates

## CloudPebble

Import zip: upload [`dist/hush-cloudpebble.zip`](dist/hush-cloudpebble.zip) via **Import → Upload Zip** on [CloudPebble](https://cloudpebble.repebble.com/).

Or import from GitHub after this repo is public:
`https://cloudpebble.repebble.com/ide/import/github/<owner>/hush`

App Kind should be Watchface (JavaScript SDK / Alloy).

## Build

Requires the Pebble SDK with Alloy support.

```bash
npm install
pebble build
pebble install --emulator emery
pebble emu-app-config   # open Clay settings
```

Round 2:

```bash
pebble install --emulator gabbro
```

## Battery notes

- Default tick is `minutechange` only
- Seconds never run continuously (optional brief flick window)
- Weather / ICS refresh every 30 minutes, cached on watch
- Steps read on the minute tick only—no live heart-rate sampling
- Partial redraws for time digits and the signal rail when possible

## License

MIT
