lyrical
=======

An application to show exactly what a song means to you

Installation
============

1. Install nodejs, npm, and postgres
1. Set up a postgres database
    - Create a user and a blank DB owned by that user
        - Default database when not in development mode is 'lyrical\_production'
        - Default development mode database is 'lyrical\_development'
    - Configure your credentials
        - Copy lyrical/orm/config.json.default to config.json, and edit as needed
        - Use the default credentials of lyrical:lyrical and setup will be automatic
1. Checkout project
1. Execute ./build.sh
    - This minifies all the JS
1. Execute ./lyrical.sh
    - This will automatically copy the default configuration if needed, npm install, and start the server
    - The app will sync the database if necessary on startup