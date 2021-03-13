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
            // req.session.user = {};
            // req.session.username = req.body.username;
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

//req and res here are referenced globally maybe?
module.exports.verifySession = (req, res, next) => {
  console.log('step 2');
  // console.log('req.session: ', req.session);
  // if (JSON.stringify(req.session.username) === undefined || JSON.stringify(req.session.user.username) === '' || JSON.stringify(req.session.user) === '{}' || models.Sessions.isLoggedIn(req.session) === false) {
  //   console.log('in 102');
  //   res.redirect(201, '/login');
  // } else if (models.Sessions.isLoggedIn(req.session) === true) {
  //   console.log('is logged in 105');
  //   next();
  // }
  if (models.Sessions.isLoggedIn(req.session) === false) {
    // res.redirect(201, 'http://localhost:4568/login');
    console.log('line 111 auth is not logged in step 3');
    // res.req.path = '/login';
    res.redirect(302, '/login');
    // app.get('/login');
  } else {
    console.log('line 113 auth is logged in step 4');
    next();
  }
};

