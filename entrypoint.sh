#!/bin/sh
echo "Starting webserver"
exec 3>&1
exec lighttpd -D -f /lighttpd.conf
