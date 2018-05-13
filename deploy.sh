#!/usr/bin/env bash
set -x
set -e

echo "BE SURE YOUR ARE CONNECTED AS 'eua' USER"
echo "=========================================Stop service"
pm2 stop keystone

echo "=========================================Turn on production mode"
NODE_ENV=production

echo "=========================================Update repository"
git pull origin master
echo "=========================================Update packages"
npm i
echo "=========================================Rebuild front-end"
./node_modules/gulp/bin/gulp.js build


echo "=========================================start service"
sudo chmod +x ./keystone.js
pm2 start keystone


