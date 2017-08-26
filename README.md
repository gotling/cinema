# Cinema
Play movies automatically on Raspberry Pi using [OMX Player](http://elinux.org/Omxplayer).

## Prerequisite

A Raspberry Pi running [Raspbian](https://www.raspberrypi.org/downloads/raspbian/) *Jessie Lite* or *Stretch Lite* with user named *pi*.

## Installation

Install node.js:

    curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
    sudo apt install nodejs

Install process manager:

    sudo npm install pm2 -g

Install OMX player:

    sudo apt install omxplayer

Clone repository:

    cd
    git clone https://github.com/gotling/cinema

Install dependencies:

    npm install --no-bin-links

Reoccurring tasks:

    crontab -e

Paste the following to start movie every day at 19:00:

    0 19 * * * curl http://localhost:3000/play

Paste the following to delete old log files on boot:

    @reboot rm ~/cinema/omxplayer.old.log*

Start slideshow on login.

    echo '~/cinema/bin/showimage' >> ~/.bashrc

Run as service:

    cd ~/cinema/
    pm2 start ecosystem.json --env production
    pm2 save
    pm2 startup
    sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u pi --hp /home/pi

## Configuration

TODO

## Usage

Open remote control:

    http://ip-or-name:3000
