# TUI Kiosk on Lichee Pi (WIP)

![LCD screen in a custom enclosure showing Lichee Pi Nano boot messages](lichee-kiosk-20230311.jpg)

## Dev

Create `.env` file:

```
FEED_URL=...
FEED_KEY=...
```

Create `kiosk_id_rsa.pub` file.

Packaging:

```
yarn build
docker build -t tuiview .
```
