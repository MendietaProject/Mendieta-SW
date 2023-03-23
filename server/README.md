# MendietaAPI
This is an API for the Mendieta project that runs on nodejs.

__IMPORTANT 1:__ Node.js version must be `>=14.17.6`. The easiest way to install node is to use [nvm](https://github.com/nvm-sh/nvm).

__IMPORTANT 2:__ Depending on your platform you _might_ need to install the `serialport` package (running `npm install serialport`). If you tried to run the project on an older version of node, remove the `node_modules` folder and install dependencies again. The `serialport` takes a while to build on Raspberry Pi, be patient and restart the board after it finishes.

## Required Packages
* Express
* Nodemon
* [serialport](https://www.npmjs.com/package/serialport)
  
## Installing dependencies
To install the required dependencies, use

> npm install

## Running the server
To run the server normally, simply start it with:

> npm run start

To debug the program, use:

> npm run dev
