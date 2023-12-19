# enable WPA Supplicant for DHCPCD (note that symlink value is an absolute path within final image)
mkdir -p "$1/usr/lib/dhcpcd/dhcpcd-hooks/"
ln -s /usr/share/dhcpcd/hooks/10-wpa_supplicant "$1/lib/dhcpcd/dhcpcd-hooks/"

# restrict root SSH directory permissions to comply with OpenSSH requirements
chmod -R go-rwx "$1/root/.ssh"
