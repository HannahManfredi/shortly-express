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
            req.session.user = {};
            req.session.username = req.body.username;
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
    var cookieHash = 'shortlyid';
    session.hash = req.cookies[cookieHash];
    return models.Sessions.get({ hash: session.hash })
      .then((data) => {
        if (!data) {
          req.session = {};
          // req.session.user.username = req.body.username;
          // console.log('req.body line 35', req.body);
          // console.log('req.session.user.username line 34: ', req.session.user.username);
          return models.Sessions.create()
            .then((sessionRecordHash) => {
              var insert = sessionRecordHash.insertId;
              return models.Sessions.get({ id: sessionRecordHash.insertId })
                .then((data) => {
                  req.session.hash = data.hash;
                  req.session.user = {};
                  req.session.user.username = '';
                  console.log('insert: ', insert);
                  return models.Users.get( {id: insert})
                    .then( (data) => {
                      if (data) {
                        req.session.user.username = data.username;
                      }
                      res.cookie(cookieHash, sessionRecordHash.hash);
                      next();
                    })
                    .catch( (err) => {
                      throw err;
                    });
                })
                .catch((err) => {
                  throw (err);
                });
              req.session.hash = sessionRecordHash.hash;
              res.cookie(cookieHash, sessionRecordHash.hash);
              console.log('req.session line 40: ', req.session);
              next();
            })
            .catch((err) => {
              throw (err);
            });
        } else if (data) {
          let idWeNeed = data.id;
          return models.Sessions.update({userId: null}, {userId: data.id})
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
                    console.log('req.session line 74: ', req.session);
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
