const app = require('./app.js');
const db = require('./db');
const port = 4568;

app.listen(port, () => {
  console.log(`Shortly is listening on ${port}`);
});

//TASKS:
// What additional steps will the user need to take when interacting with the application? More specifically, what additional routes will the application need to handle?
// What strategies do I need to employ to secure existing site functionality?
// How often should the user need to enter their username + password?

//TASK:
//Usernames and passwords
// The database table, users, and its corresponding model have been provided. Use this to store usernames and passwords.
//The model includes useful methods for encrypting and comparing your passwords.
//create
//compare

// Add routes to your Express server to process incoming POST requests. These routes should enable a user to register for a new account and for users to log in to your application. Take a look at the login.ejs and signup.ejs templates in the views directory to determine which routes you need to add.