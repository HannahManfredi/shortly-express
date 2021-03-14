const models = require('../models');
const Promise = require('bluebird');
const express = require('express');
const app = require('../app.js');

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
    var cookieHash = 'shortlyid';
    session.hash = req.cookies[cookieHash];
    return models.Sessions.get({ hash: session.hash })
      .then((data) => {
        if (!data) {
          req.session = {};
          return models.Sessions.create()
            .then((sessionRecordHash) => {
              var insert = sessionRecordHash.insertId;
              return models.Sessions.get({ id: sessionRecordHash.insertId })
                .then((data) => {
                  req.session.hash = data.hash;
                  req.session.user = {};
                  req.session.user.username = '';
                  return models.Users.get( {id: insert})
                    .then( (data) => {
                      if (data) {
                        req.session.user.username = data.username;
                      }
                      res.session = req.session;
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
              res.session = req.session;
              req.session.hash = sessionRecordHash.hash;
              res.cookie(cookieHash, sessionRecordHash.hash);
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
                    res.session = session;
                    next();
                  } else if (userData) {
                    session.userId = userData.id;
                    session.user = {};
                    session.user.username = userData.username;
                    req.session = session;
                    res.session = req.session;
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

module.exports.verifySession = (req, res, next) => {
  if (models.Sessions.isLoggedIn(req.session) === false) {
    res.redirect(302, '/login');
  } else {
    next();
  }
};

