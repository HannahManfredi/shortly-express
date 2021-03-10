const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
  console.log('req line 5: ', req);
  console.log('req.cookies: ', req.cookies );
  if (JSON.stringify(req.cookies) === '{}') {
    console.log('inside if');
    return models.Sessions.create()
      .then( (data) => {
        //check if a session already exists
        if (req.session) {

        }
        req.session = {};
        return models.Sessions.get({id: data.insertId})
          .then( (data) => {
            req.session.hash = data.hash;
            // let x = data[cookies];
            console.log('req.session: ', req.session);
            //where does the string 'shortlyid' exist?
            res.cookie('shortlyid', data.hash);
            next();
          })
          .catch( (err) => {
            throw (err);
          });
      })
      .catch( (err) => {
        throw (err);
      });
  } else {

  }
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/



