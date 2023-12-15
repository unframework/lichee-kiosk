#!/bin/sh -e

# example Busybox inittab line
# /dev/ttyS0::respawn:/sbin/getty -L  /dev/ttyS0 115200 vt100 # GENERIC_SERIAL

# example command
# /sbin/getty -L -n -l /root/runssh.sh /dev/tty1 115200 linux

echo Hi! Running SSH command
sleep 15

exec ssh -o "StrictHostKeyChecking=no" -o "IdentitiesOnly=yes" -i /root/ssh_key -t -l hello -p 12235 8.tcp.ngrok.io
