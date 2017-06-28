var
  view = require('../view'),
  request = require('request'),
  rp = require('request-promise'),
  fs = require('fs'),
  mkdirp = require('mkdirp'),
  colors = require('colors'),
  env = require('./env'),
  applicationDirectory = `${env.home()}/opspark`,
  userFilePath = `${applicationDirectory}/user`;

// Checks if directory exists and creates if not
function checkForDirectory(path) {
  if (!fs.existsSync(path)) {
    console.log(colors.yellow('Creating new directory'));
    mkdirp.sync(path);
  }
}

// Checks if status was 200 or 400
// If 400, ends function and says to retry
// If 200, function continues
// Runs 'checkForDirectory' func for applicationDirectoryand userFilePath
// Checks if file exists
// If it exists, prompts for if user wants file to be overwritten
// If it doesn't exist, creates file
function storeCreds(body, hash) {
  const path = `${userFilePath}/user.json`;
  const userInfo = {};
  userInfo.until = body.until;
  userInfo.hash = hash;

  if (body.status === 400) {
    console.warn('Incorrect hash, please try again.');
    return null;
  }

  checkForDirectory(applicationDirectory);
  checkForDirectory(userFilePath);

  if (fs.existsSync(path)) {
    console.log(colors.red('Hey, this file is already there!'));
    view.inquireForInput('Overwrite file? (y/n)', (err, input) => {
      console.log(input);
      if (err) {
        console.warn(colors.red('Something went wrong! Run that code again.'));
      } else if (input.toLowerCase()[0] === 'y') {
        console.warn(colors.yellow('Rewriting. . .'));
        fs.writeFileSync(path, JSON.stringify(userInfo));
        console.warn(colors.green('All done!'));
      } else {
        console.warn(colors.green('Exiting without overwrite.'));
      }
    });
  } else {
    console.warn('Writing file. . .');
    fs.writeFileSync(path, JSON.stringify(userInfo));
    console.warn(colors.green('All done!'));
  }
}

// POST request to Greenlight, runs storeCreds with response object
function greenlightRequest(hash) {
  const options = {
    method: 'POST',
    // uri: 'https://greenlight.operationspark.org/api/os/verify',
    uri: 'http://localhost:3000/',
    body: {
      hash,
    },
    json: true,
  };
  rp(options)
    .then(res => storeCreds(res, hash))
    .catch(err => console.error('upload failed:', err));
}

// Asks for hash from user
// Runs greenlightRequest with input hash
function getInput() {
  view.inquireForInput('Enter the hash', (err, input) => {
    if (err) {
      console.warn('There was an error!');
    }
    return greenlightRequest(input);
  });
}

module.exports = getInput;

getInput();
