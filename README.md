# Mini 4WD Speed Checker Firmware

This repository hosts over-the-air (OTA) firmware updates for the ESP32-C3 Mini Speed Checker.

## Release process

1. Export the compiled `.bin` firmware from Arduino IDE.
2. Create a GitHub Release with a new version tag, for example `v1.0.1`.
3. Upload the binary with the exact asset name `speed-checker.bin`.
4. Update `manifest.json` with the same version, the release URL, and the SHA-256 checksum.

Devices download only from the HTTPS URL specified in `manifest.json`.
