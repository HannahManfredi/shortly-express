const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
  console.log('req line 5: ', req.cookies);
  console.log('header cookie: ', req.headers);
  if (JSON.stringify(req.cookies) === '{}') {
    return models.Sessions.create()
      .then( (data) => {
        console.log('data line 8: ', data);
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
    let keys = Object.keys(req.cookies);
    let cookieHash = keys[0];
    session.hash = req.cookies[cookieHash];
    return models.Sessions.get({hash: session.hash})
      .then( (data) => {
        if (!data) {
          req.session = {};
          return models.Sessions.create()
            .then ( (sessionRecordHash) => {
              return models.Sessions.get({ id: sessionRecordHash.insertId })
                .then((data) => {
                  req.session.hash = sessionRecordHash.hash;
                  res.cookie(cookieHash, sessionRecordHash.hash);
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


// it('clears and reassigns a new cookie if there is no session assigned to the cookie', function(done) {
//   var maliciousCookieHash = '8a864482005bcc8b968f2b18f8f7ea490e577b20';
//   var response = httpMocks.createResponse();
//   var requestWithMaliciousCookie = httpMocks.createRequest();
//   requestWithMaliciousCookie.cookies.shortlyid = maliciousCookieHash;

//   createSession(requestWithMaliciousCookie, response, function() {
//     var cookie = response.cookies.shortlyid;
//     expect(cookie).to.exist;
//     expect(cookie).to.not.equal(maliciousCookieHash);
//     done();
//   });
// });
// });
// });