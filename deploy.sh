#!/usr/bin/env bash
set -x
set -e

echo "BE SURE YOUR ARE CONNECTED AS 'eua' USER"
echo "stop service"
# will be if service is running

echo "Turn on production mode"
NODE_ENV=production

echo "Update repository"
git pull origin master
npm i
# add css rebuild here with gulp


echo "start service"
chmod +x ./keystone.js



