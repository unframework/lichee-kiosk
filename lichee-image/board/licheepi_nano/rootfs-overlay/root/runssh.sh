#!/bin/sh -e

# small delay for initial WiFi init
sleep 5

# start non-interactive SSH client with TTY forwarding
exec ssh \
  -o "StrictHostKeyChecking=no" \
  -o "IdentitiesOnly=yes" \
  -o "KbdInteractiveAuthentication=no" \
  -t \
  -l hello \
  example.com
