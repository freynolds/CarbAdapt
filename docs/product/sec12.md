## 12. Connect IQ Mobile SDK for iOS: findings (researched 16 Oct 2026)

Question (D5): can the iPhone app pair with and sync to the CarbAdapt Connect IQ app through the Connect IQ Mobile SDK (iPhone ↔ Garmin Connect Mobile ↔ CIQ app or data field), without the Garmin Connect web API?

### 12.1 What the SDK does (Garmin's official SDK, `garmin/connectiq-companion-app-sdk-ios`, docs v1.8.0)
- **Device discovery goes through Garmin Connect Mobile (GCM).** `showConnectIQDeviceSelection` opens GCM; the user picks devices there and GCM returns them to our app through a URL scheme or universal link. The app keeps the `IQDevice` list (UUID, model, name) and must persist it. GCM has to be installed and the watch paired to it.
- **Messaging:** `sendMessage:toApp:` sends to a specific CIQ app (identified by its app UUID, in dashed format on iOS) and `registerForAppMessages` receives from it. Payloads are property-list style: NSString, NSNumber, NSArray, NSDictionary, NSNull. A transient-message option exists.
- **App status and launch:** `getAppStatus` tells whether our CIQ app is installed on the device and its version; `openAppRequest` asks the user on the watch to open it; `showConnectIQStoreForApp` sends the user to the store to install it.
- **Transport:** after discovery the SDK talks to the device over BLE. With the optional iOS background mode "Uses Bluetooth LE accessories" the iPhone app can be woken when the device has data for it; BLE state restoration is supported.
- **Limit:** only one companion app may register for a given CIQ app's messages.
- Sources: github.com/garmin/connectiq-companion-app-sdk-ios (README and docs; last commit 15 Jan 2026); developer.garmin.com/connect-iq/core-topics/mobile-sdk-for-ios/.

### 12.2 What the watch / Edge side can do (Monkey C)
- `Toybox.Communications` provides `registerForPhoneAppMessages` (receive), `transmit` (send to the phone app) and `makeWebRequest` (HTTPS through GCM). Garmin's API doc: "This module was made available to foreground data fields with API 5.0.0." (developer.garmin.com/connect-iq/api-docs/Toybox/Communications.html)
- **Data fields on devices below CIQ 5.0:** communications only run in a **background service**. Phone messages arrive through `Background.registerForPhoneAppMessageEvent()` and `ServiceDelegate.onPhoneAppMessage`. Temporal events run at most every 5 minutes and each background run lasts about 30 s. (developer.garmin.com/connect-iq/api-docs/Toybox/Background.html; forum: forums.garmin.com/developer/connect-iq/f/discussion/350615/does-a-datafield-support-a-companion-app)
- **CIQ 5.0+ (System 7) devices:** data fields can use Communications in the foreground. Forum reports cite Edge x40/x50 and newer watches on System 7. (forums.garmin.com/developer/connect-iq/f/discussion/407776/streaming-data-from-garmin-edge-to-external-device; …/402946/webconnect-in-the-foreground; …/362994/system-7-comm-for-data-fields-backward-compatibility)
- **Reliability reports (developer forum, not official):** a message from an iOS app to an Edge 540 data field was lost, and sending right after connection can drop messages (…/372069/update-data-field-from-companion-app). Developers on older devices still have no real-time phone path for data fields (…/443774/solutions-for-real-time-phone-communication-on-older-devices). Simulator phone↔device messaging is documented as Android-only, so iOS messaging must be tested on real hardware (…/366804/ios-companion-app-to-feed-data-to-edge-datafield).

### 12.3 What this means for CarbAdapt
- **Pairing without a code is feasible on iPhone.** The iOS app (signed in) gets the device from GCM and sends a one-time device token in a message. The CIQ app stores it and confirms with `transmit`. This replaces typing a code, but it is **not** a Garmin-account link: the device identity comes from the phone's GCM, so it does not give Garmin login or Garmin activity webhooks. That still needs the Garmin Connect web API.
- **It does not solve sync for a data field on older devices by itself.** The message only arrives on the next background run (≤ every 5 min, about 30 s), and only while the data field is in an active data screen. The more robust path stays the one already planned: the data field fetches its protocol from our backend with `makeWebRequest` (through GCM) and caches it the day before.
- **Watch-side constraint:** the iOS app's background BLE mode helps receive device→phone messages; pushing phone→device still needs the iOS app to be running or woken.

### 12.4 Recommendation
1. **Keep the on-screen code as the MVP baseline** (decided, D5). It works on every device and does not need the iPhone.
2. **Add a "Pair with iPhone" spike in M4** (≈2–3 days): iOS calls `showConnectIQDeviceSelection` → `getAppStatus` → `sendMessage` with the device token; the CIQ data field receives it in its background service (all devices) or in the foreground (CIQ 5.0+); the code stays as fallback. Exit criteria: works on at least one CIQ 5.0+ Edge or watch and one pre-5.0 device on real hardware.
3. **Protocol sync stays on `makeWebRequest` to the backend**, cached the day before. Use SDK messages only as a secondary push ("your plan changed, refresh") and accept the 5-minute background cadence on pre-5.0 devices.
4. **Consider a glance or widget** in the CIQ app for pairing and status: they can use Communications more freely than a data field on older devices [Verify per device].
5. Store `pairing_method` (code / ciq_mobile / garmin_account) on `devices` so the three paths can coexist; when the Garmin API arrives, link the Garmin account on top.

[Verify] All forum points are developer reports, not Garmin documentation; confirm each on real devices in the spike.

---

