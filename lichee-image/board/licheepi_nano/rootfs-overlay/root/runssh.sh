#!/bin/sh -e

# example Busybox inittab line
# /dev/ttyS0::respawn:/sbin/getty -L  /dev/ttyS0 115200 vt100 # GENERIC_SERIAL

# example command
# /sbin/getty -L -n -l /root/runssh.sh /dev/tty1 115200 linux

# small delay for initial WiFi init
sleep 2
exec ssh -o "StrictHostKeyChecking=no" -o "IdentitiesOnly=yes" -t -l hello -p 10697 4.tcp.ngrok.io

echo Waiting before restart...
sleep 15
