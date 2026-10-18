# apps/garmin-ciq

Connect IQ data field, written in Monkey C. Not an npm workspace member. The root `workspaces` array does not include this folder. No device project in this step.

## What goes here

The on-device data field: the in-workout eat and drink prompts. It reads a compact schedule from the device API (`GET /device/protocol`), which the server builds from a fueling plan.

## What must NOT go here

- Account login, the product library, or any screen that already exists on the web and iOS apps.
- Calc rules. The watch displays a schedule the server already computed.

## Milestone

After M5. The build plan starts the device API and this data field once the iOS phase is underway. Garmin login on the server waits for Connect Developer Program approval and is a separate flag from this folder.
