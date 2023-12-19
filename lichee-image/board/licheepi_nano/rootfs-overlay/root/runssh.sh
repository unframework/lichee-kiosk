#!/bin/sh -e

# small delay for initial WiFi init
sleep 5

# start SSH client with TTY forwarding
exec ssh -o "StrictHostKeyChecking=no" -o "IdentitiesOnly=yes" -t \
  -l hello \
  example.com
