const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
  if (JSON.stringify(req.cookies) === '{}') {
    return models.Sessions.create()
      .then( (data) => {
        req.session = {};
        return models.Sessions.get({ id: data.insertId })
          .then((dataFromGet) => {
            req.session.hash = dataFromGet.hash;
            res.cookie('shortlyid', dataFromGet.hash);
            next();
          })
          .catch((err) => {
            throw (err);
          });
      })
      .catch( (err) => {
        throw (err);
      });
  } else {
    let session = {};
    // session.userId =
    if (req.cookies) {
      let keys = Object.keys(req.cookies);
      var cookieHash = keys[0];
      session.hash = req.cookies[cookieHash];
    } else {
      var cookieHash = 'shortlyid';
    }
    return models.Sessions.get({hash: session.hash})
      .then( (data) => {
        if (!data) {
          req.session = {};
          // session.userId = data.id;
          return models.Sessions.create()
            .then ( (sessionRecordHash) => {
              return models.Sessions.get({ id: sessionRecordHash.insertId })
                .then((data) => {
                  req.session.hash = sessionRecordHash.hash;
                  res.cookie(cookieHash, sessionRecordHash.hash, { 'domain': 'http://localhost4568/' });
                  next();
                })
                .catch((err) => {
                  throw (err);
                });
            })
            .catch( (err) => {
              throw (err);
            });
        } else {
          let idWeNeed = data.id;
          return models.Sessions.update({hash: session.hash}, {userId: data.id})
            .then( (updateData) => {
              return models.Users.get({id: idWeNeed})
                .then( (userData) => {
                  if (!userData) {
                    req.session = session;
                    next();
                  } else if (userData) {
                    session.userId = userData.id;
                    session.user = {};
                    session.user.username = userData.username;
                    req.session = session;
                    next();
                  }
                })
                .catch( (err) => {
                  throw (err);
                });
            })
            .catch( (err) => {
              throw (err);
            });
        }
      })
      .catch( (err) => {
        throw (err);
      });
    next();
  }
};


/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/
