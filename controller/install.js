const 
  github = require('./github'),
  greenlight = require('./greenlight'),
  projects = require('./projects'),
  sessions = require('./sessions'),
  colors = require('colors');

module.exports = function () {
  console.log('Beginning install process!'.blue);
  projects.action = 'install';
  github.getCredentials()
    .then(greenlight.getSessions)
    .then(sessions.selectSession)
    .then(projects.selectProject)
    .then(projects.installProject)
    .then(projects.initializeProject)
    .then(res => console.log(`Successfully installed ${res.name}!`.blue))
    .catch(err => console.log(err));
};
