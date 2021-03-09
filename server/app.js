const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
const bodyParser = require('body-parser');
const Auth = require('./middleware/auth');
const models = require('./models');

const app = express();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(partials());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

app.get('/',
  (req, res) => {
    res.render('index');
  });

//just a theory—maybe this fixes failing 1st test?
// app.get('/users',
//   (req, res) => {
//     res.render('index');
//   });

app.get('/create',
  (req, res) => {
    res.render('index');
  });

app.get('/links',
  (req, res, next) => {
    models.Links.getAll()
      .then(links => {
        res.status(200).send(links);
      })
      .error(error => {
        res.status(500).send(error);
      });
  });

app.post('/links',
  (req, res, next) => {
    var url = req.body.url;
    if (!models.Links.isValidUrl(url)) {
      // send back a 404 if link is not valid
      return res.sendStatus(404);
    }

    return models.Links.get({ url })
      .then(link => {
        if (link) {
          throw link;
        }
        return models.Links.getUrlTitle(url);
      })
      .then(title => {
        return models.Links.create({
          url: url,
          title: title,
          baseUrl: req.headers.origin
        });
      })
      .then(results => {
        return models.Links.get({ id: results.insertId });
      })
      .then(link => {
        throw link;
      })
      .error(error => {
        res.status(500).send(error);
      })
      .catch(link => {
        res.status(200).send(link);
      });
  });

/************************************************************/
// Write your authentication routes here
/************************************************************/

app.post('/signup',
  (req, res) => {
    let options = {};
    options.username = req.body.username;
    options.password = req.body.password;
    return models.Users.get(options)
      .then((data) => {
        console.log('data from get: ', data);
        // console.log('inside then');
        if (data === undefined) {
          return models.Users.create(options)
            .then(() => {
              res.sendStatus(201);
              res.end();
            })
            .catch((err) => {
              res.status(500).send(err);
            });
        } else if (data !== undefined) {
          console.log('data on the outsie');
          //redirect to '/signup'
          // app.get('/signup');git 
          // res.redirect('/signup');
          // res.writeHead('/signup');
          //http redirect
          window.location = 'http://localhost4568/signup'; //javascript redirect
          res.end();
        }
      })
      .catch((err) => {
        if (err) { throw err; }
        console.log('inside here');
      });
  });

app.post('/login',
  (req, res) => {
    console.log('req', req);
    console.log('req.body', req.body);
    //user enters username and password
    //query/send that info to our database
    //check if password inputted matches password stored for that username
    //if it matches
    //that person is logged in and weshow them their account/some other page
    //if it doesn't match
    //tell them that username or password incorrect
    //clear attempt lines
    //make record of how many times attempted
    //lock them out if it's too many attempts
    //forgot password
    //redirect signup page
  });

/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res, next) => {

  return models.Links.get({ code: req.params.code })
    .tap(link => {

      if (!link) {
        throw new Error('Link does not exist');
      }
      return models.Clicks.create({ linkId: link.id });
    })
    .tap(link => {
      return models.Links.update(link, { visits: link.visits + 1 });
    })
    .then(({ url }) => {
      res.redirect(url);
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(() => {
      res.redirect('/');
    });
});

module.exports = app;
