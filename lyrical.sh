#!/bin/sh
lyrical_dir="lyrical"

export NODE_PATH=${PWD}/${lyrical_dir}
echo $NODE_PATH
cd ${lyrical_dir}

node app.js