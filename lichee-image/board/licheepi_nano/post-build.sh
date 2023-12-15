# enable WPA Supplicant for DHCPCD (note that symlink value is an absolute path within final image)
mkdir -p "$1/usr/lib/dhcpcd/dhcpcd-hooks/"
ln -s /usr/share/dhcpcd/hooks/10-wpa_supplicant "$1/usr/lib/dhcpcd/dhcpcd-hooks/"
