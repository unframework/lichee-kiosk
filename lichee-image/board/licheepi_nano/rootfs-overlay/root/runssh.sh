#!/bin/sh -e

# example Busybox inittab line
# /dev/ttyS0::respawn:/sbin/getty -L  /dev/ttyS0 115200 vt100 # GENERIC_SERIAL

# example command
# /sbin/getty -L -n -l /root/runssh.sh /dev/tty1 115200 linux

echo Hi! Running SSH command
sleep 5

exec ssh -o "StrictHostKeyChecking=no" -t -l hello -p 19350 4.tcp.ngrok.io
