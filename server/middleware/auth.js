const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
  console.log('req.cookies: ', req.cookies );
  if (req.cookies === {}) {
    console.log('inside if');
    //'initializes a new session when there are no cookies on the request'
    let session = new models.Session();
    console.log(session);
    return session.create()
      .then( () => {
        res.end();
      })
      .catch( (err) => {
        throw (err);
      });
  }

  //'sets a new cookie on the response when a session is initialized'

};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/



//'assigns a session object to the request if a session already exists'
//'creates a new hash for each new session'
//'assigns a username and userId property to the session object if the session is assigned to a user'