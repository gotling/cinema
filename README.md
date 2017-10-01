# Cinema
Play movies automatically on Raspberry Pi using [OMX player](http://elinux.org/Omxplayer).

## Prerequisite

A Raspberry Pi running [Raspbian](https://www.raspberrypi.org/downloads/raspbian/) *Jessie Lite* or *Stretch Lite* with a user named *pi*.

## Installation

Install node.js:

    curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
    sudo apt install nodejs

Allow nodejs to run on port 80 with standard user:

    sudo setcap cap_net_bind_service=+ep /usr/bin/node

Install process manager:

    sudo npm install pm2 -g

Install OMX player:

    sudo apt install omxplayer

Clone repository:

    cd
    git clone https://github.com/gotling/cinema

Install dependencies:

    cd ~/cinema/
    npm install --no-bin-links

Make helper scripts executable:

    chmod +x ~/cinema/bin/*

Setup reoccurring tasks:

    crontab -e

Paste the following to start movie every day at 19:00:

    0 19 * * * curl http://localhost/play

Paste the following to have software updated on boot:

    @reboot /home/pi/cinema/bin/update

Send OMX player debug log to */dev/null* to not fill up or tear out the SD card. Edit */etc/fstab* and add the following in the end:

    /dev/null /home/pi/cinema/omxplayer.log none defaults,bind 0 0

Start slideshow on login and restart if killed once:

    echo '~/cinema/bin/showimage' >> ~/.bashrc

Run as service:

    cd ~/cinema/
    pm2 start ecosystem.json --env production
    pm2 save
    pm2 startup
    sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u pi --hp /home/pi

## Configuration

Copy default config file to production:

    cd ~/cinema/config/
    cp production.json-default production.json

Open *production.json* and change values to real ones.

Then reload service:

    pm2 reload cinema

## Usage

Open remote control:

    http://ip-or-name/
