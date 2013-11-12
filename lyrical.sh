#!/bin/sh
lyrical_dir="lyrical"

# Set NODE_PATH for requirejs
export NODE_PATH=${PWD}/${lyrical_dir}

# cd to server root
cd ${lyrical_dir}

# Install node modules
npm install

# Check for config files
if [ ! -f ./config.json ] && [ -f ./config.json.default ]
    then
        echo "Copying default Lyrical config..."
        cp ./config.json.default ./config.json
fi

if [ ! -f ./orm/config/config.json ] && [ -f ./orm/config/config.json.default ]
    then
        echo "Copying default ORM config..."
        cp ./orm/config/config.json.default ./orm/config/config.json
fi

# Start!
# Launch test, client, or app
if [ "$1" = "debug" ]; then
    node --debug app.js
elif [ "$1" = "debug-brk" ]; then
    node --debug-brk app.js
else
    node app.js
fi
