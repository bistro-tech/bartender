#!/bin/bash

PWD="$(dirname "$(realpath "${BASH_SOURCE[0]}")")"

## expect the following variables:
# IP
# shellcheck disable=SC1091
. "$PWD"/.env
if [ -z "$IP" ]; then
    echo "IP not provided."
    exit 1
fi

## cleanup
find "$PWD"/generated -type f -not -name '.gitkeep' -delete
ssh "almalinux@$IP" << EOF
    sudo rm -rf /home/almalinux/{vps-install,.ssh}
EOF

## Ensure files are executable
chmod +x "$PWD"/install.bash

## copy files
scp -r "$PWD"/ "almalinux@$IP:/home/almalinux/vps-install"

## run remote script
ssh "almalinux@$IP" << EOF
    cd /home/almalinux/vps-install
    sudo ./install.bash
EOF

## download generated files
scp -r "almalinux@$IP:/home/almalinux/vps-install/generated" "$PWD"

## ask to reboot
read -rp "Reboot now? [y/N] " REBOOT
if ! [[ $REBOOT =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo "Reboot skipped. Please reboot manually and clean the '~/vps-install/generated' directory."
    exit 0
fi

echo "Rebooting..."
ssh "almalinux@$IP" << EOF
    rm -rf /home/almalinux/vps-install/generated
    sudo reboot
EOF
exit 0
