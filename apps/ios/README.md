# apps/ios

SwiftUI app. Not a pnpm workspace member. No Xcode project in this step.

## What goes here

The iOS client: screens, APNs registration, Sign in with Apple, and on-device label OCR. It calls the same HTTP API as the web app, using a Swift client generated from `packages/contracts`.

## What must NOT go here

- A second backend or a private copy of the fueling rules.
- Garmin pairing UI that belongs with the device protocol (the pairing screen can live here; the device API lives on the server).

## Milestone

M5, after the web app is accepted. The build plan says iOS starts only once Francisco signs off the web version.
