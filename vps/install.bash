#!/bin/bash

PWD="$(dirname "$(realpath "${BASH_SOURCE[0]}")")"
USR_HOME="$(eval echo ~"$SUDO_USER")"
GENERATED_FOLDER="$PWD/generated"

######## Utility functions ########
exit_on_error() {
    echo "Error: $1"
    exit 1
}

sudo_required() {
    [ "$(id -u)" -ne 0 ] && exit_on_error "This script must be run as root. Try 'sudo ${BASH_SOURCE[0]}'"
}

sudo_forbidden() {
    [ "$(id -u)" -eq 0 ] && exit_on_error "This script must be run as a regular user. Try '${BASH_SOURCE[0]}'"
}

create_user() {
    sudo_required
    if [ -z "$1" ]; then
        echo "No username provided."
        exit 1
    fi
    local USR_HOME PASSWD
    mkdir -p "$GENERATED_FOLDER/$1"

    PASSWD=$(openssl rand -base64 32)
    useradd -m -p "$PASSWD" "$1"
    USR_HOME="$(eval echo ~"$1")"

    echo "$PASSWD" > "$GENERATED_FOLDER/$1/passwd"
    echo "User $1 created."

    ## SSH
    mkdir -p "$USR_HOME/.ssh"
    ssh-keygen -t ed25519 -f "$GENERATED_FOLDER/$1/github" -N ""
    cat "$GENERATED_FOLDER/$1/github.pub" >> "$USR_HOME/.ssh/authorized_keys"
    chmod -R 600 "$USR_HOME/.ssh/authorized_keys"
    chown "$1:$1" "$USR_HOME/.ssh/authorized_keys"
}
###################################

sudo_required

echo "
    #########################################
    #                                       #
    #  Bistro-tech VPS INSTALLATION SCRIPT  #
    #                                       #
    #########################################
    PWD: $PWD
    USR_HOME: $USR_HOME
    GENERATED_FOLDER: $GENERATED_FOLDER
"

################################# Environment #################################
echo "Loading environment variables from .env file..."
. "$PWD/.env" || exit_on_error "ENV file not found."
# Check if all required environment variables are set
echo "Environment variables loaded."
################################ Update System ################################
echo "Updating system..."
echo "Installing Epel repository..."
dnf update -y
dnf upgrade -y
dnf install -y epel-release
dnf update -y
dnf install -y podman htop firewalld rsync
echo "Minimal packages installed."
############################### Additionnal Users #############################
echo "Creating additional users..."
create_user "bistro-tech"
################################## SSH Setup ##################################
echo "Configuring SSH..."
## Generate SSH key
echo "Generating SSH key..."
## Add authorized keys
echo "Adding authorized keys..."
mkdir -p "$USR_HOME/.ssh"
for key in "$PWD"/ssh-keys/*; do
    echo "Adding key: $key"
    cat "$key" >> "$USR_HOME/.ssh/authorized_keys"
done
chmod -R 600 "$USR_HOME/.ssh/"*
chown -R "$SUDO_USER":"$SUDO_USER" "$USR_HOME/.ssh"

## Hardening SSH
echo "Hardening SSH..."
RDM_SSH_PORT=$(shuf -n 1 -i 10000-65500)
echo "$RDM_SSH_PORT" > "$PWD/generated/ssh-port"

sed -i "s/#Port 22/Port $RDM_SSH_PORT/g" /etc/ssh/sshd_config
sed -i "s/#AddressFamily any/AddressFamily inet/g" /etc/ssh/sshd_config
sed -i "s/#MaxAuthTries 6/MaxAuthTries 3/g" /etc/ssh/sshd_config
sed -i "s/#MaxSessions 10/MaxSessions 2/g" /etc/ssh/sshd_config
sed -i "s/#MaxStartups 10:30:100/MaxStartups 3:50:3/g" /etc/ssh/sshd_config
sed -i "s/#LogLevel INFO/LogLevel VERBOSE/g" /etc/ssh/sshd_config
sed -i "s/#TCPKeepAlive yes/TCPKeepAlive yes/g" /etc/ssh/sshd_config
sed -i "s/#PasswordAuthentication yes/PasswordAuthentication no/g" /etc/ssh/sshd_config
sed -i "s/#PermitEmptyPasswords no/PermitEmptyPasswords no/g" /etc/ssh/sshd_config
sed -i "s/#PermitRootLogin prohibit-password/PermitRootLogin no/g" /etc/ssh/sshd_config
############################# Additionnal Settings ############################
echo "Configuring additional settings..."
## Hostname
hostnamectl set-hostname "BISTRO-TECH-VPS"
## Ask for password when invoking sudo
echo "Configuring sudo..."
rm -f /etc/sudoers.d/90-cloud-init-users
sed -i 's/NOPASSWD: //g' /etc/sudoers
## Disable IPv6
echo "net.ipv6.conf.all.disable_ipv6=1" >> /etc/sysctl.conf
################################# Firewall Setup ##############################
echo "Configuring firewall..."
systemctl enable firewalld
systemctl start firewalld
firewall-cmd --permanent --remove-service=ssh
firewall-cmd --permanent --add-port="$RDM_SSH_PORT/tcp"
######################## Ensure files are downloadable ########################
echo "Ensuring files are downloadable..."
chmod -R 777 "$GENERATED_FOLDER"
