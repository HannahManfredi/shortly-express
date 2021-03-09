const parseCookies = (req, res, next) => {
  let cookieObject = {};
  if (!req.headers.cookie) {
    req.cookies = cookieObject;
    next();
  } else {
    let copyOfCookiesString = req.headers.cookie.slice();
    let arrayOfCookiesString = copyOfCookiesString.split(';');
    arrayOfCookiesString.forEach(str => {
      let equalsIndex = str.indexOf('=');
      let keyString = str.slice(0, equalsIndex).replace(/\s/g, '');
      let cookieString = str.slice(equalsIndex + 1);
      cookieObject[keyString] = cookieString;
    });
    // console.log('cookieObject: ', cookieObject);
    req.cookies = cookieObject;
    next();
  }
};

module.exports = parseCookies;

//The database table, sessions, has been provided as a place to store your
//generated session hashes.

// Commit your progress: "Complete Parsing Cookie"
