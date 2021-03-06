const express = require('express'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  uuid = require('uuid');

//Server-side validation
const { check, validationResult } = require('express-validator');

//Integrating mongoose and models in the REST API
const mongoose = require('mongoose');
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;
// This is the local database
// mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(morgan('common'));

//CORS
const cors = require('cors');
let allowedOrigins = ['http://localhost:8080', 'http://localhost:4200', 'http://testsite.com', 'http://localhost:1234', 'https://myflix-myflixapp.netlify.app', 'https://numenot.github.io'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) { // If a specific origin isn’t found on the list of allowed origins
      let message = 'The CORS policy for this application doesnt allow access from origin ' + origin;
      return callback(new Error(message), false);
    }
    return callback(null, true);
  }
}));

//Authentication
let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

/**
 * API endpoints. Example request and response bodies are provided in the documentation.html file.
 */

/**
 * Return a list of ALL movies
 * @method GET
 * @example /movies
 * @param {string} URL
 * @param {authenticationCallback} 
 * @param {requestCallback}
 * @returns {array} Array of all movies in database.
 */
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * Return data about a movie (genre, description, etc..) by title
 * @method GET
 * @param {string} URL
 * @example /movies/Halloween
 * @param {authenticationCallback} 
 * @param {requestCallback}
 * @returns {Object} Movie details 
 */
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * Return data about a genre (description) by name
 * @method GET 
 * @param {string} URL
 * @example /genres/Horror
 * @param {authenticationCallback} 
 * @param {requestCallback}
 * @returns {string} Data about specific genre
 */
app.get('/genres/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ 'Genre.Name': req.params.Name })
    .then((movie) => {
      res.json(movie.Genre);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * Return data about a director (bio, birth year, death year) by name
 * @method GET 
 * @param {string} URL
 * @example /directors/Quentin%20Tarantino
 * @param {authenticationCallback} 
 * @param {requestCallback}
 * @returns {Object} Data about specific director
 */
app.get('/directors/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ 'Director.Name': req.params.Name })
    .then((movie) => {
      res.json(movie.Director);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * Get all users details (username, password, email, birthday)
 * @method GET 
 * @param {string} URL
 * @example /users
 * @param {authenticationCallback} 
 * @param {requestCallback}
 * @returns {string} Data about all users in an array
 */
app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.find()
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * Get User details by username (username, password, email, birthday)
 * @method GET 
 * @param {string} URL
 * @example /users/testuser
 * @param {authenticationCallback} 
 * @param {requestCallback}
 * @returns {string} Data about a specific user
 */
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOne({ Username: req.params.Username }).populate('FavoriteMovies')
    .then((user) => {
      res.status(200).json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


/**
 * Allows new users to register
 * Data in JSON in this format:
 *{
  * ID: Integer,
  * Username: String,
  * Password: String,
  * Email: String,
  * Birthday: Date
  *}
 * @method POST 
 * @param {string} URL
 * @param {object} validationChain
 * @param {requestCallback}
 * @returns {Object} New user record.
 */
app.post('/users',
  [
    check('Username', 'Username is required and should be at least 5 characters').isLength({ min: 5 }),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ],
  (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + 'already exists');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: hashedPassword,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            })
            .then((user) => { res.status(201).json(user) })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            })
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });


/**
 * Update a user's info, by username.
 * We’ll expect JSON in this format
 * {
  * Username: String,
  * (required)
  * Password: String,
  * (required)
  * Email: String,
  * (required)
  * Birthday: Date
 * }
 * @method PUT
 * @param {string} URL
 * @example /users/testuser
 * @param {object} validationChain
 * @param {authenticationCallback}
 * @param {requestCallback}
 * @returns {Object} Updated user record.
 */
app.put('/users/:Username', passport.authenticate('jwt', { session: false }),
  [
    check('Username', 'Username is required and should be at least 5 characters').isLength({ min: 5 }),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ],
  (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOneAndUpdate({ Username: req.params.Username }, {
      $set:
      {
        Username: req.body.Username,
        Password: hashedPassword,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      }
    },
      { new: true }, // This line makes sure that the updated document is returned
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error: ' + err);
        } else {
          res.json(updatedUser);
        }
      });
  });

/**
 * Get favorite movies list by username
 * @method GET 
 * @param {string} URL
 * @example /users/testuser/movies
 * @param {authenticationCallback} 
 * @param {requestCallback}
 * @returns {string} Favorite movie list (list of movie IDs)
 */
app.get('/users/:Username/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user.FavoriteMovies);
    }).catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * Add a movie to a user's list of favorites
 * @method POST
 * @param {string} URL
 * @example /users/testuser/movies/61bb7e6c62ec8625c3ad40f5
 * @param {authenticationCallback} 
 * @param {requestCallback}
 * @returns {Object} Updated list of favorite movies
 */
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
    $push: { FavoriteMovies: req.params.MovieID }
  },
    { new: true }, // This line makes sure that the updated document is returned
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
});

/**
 * Allows users to remove a movie from their list of favorites
 * @method DELETE
 * @param {string} URL
 * @example /users/testuser/movies/61bb7e6c62ec8625c3ad40f5
 * @param {authenticationCallback} 
 * @param {requestCallback}
 * @returns {Object} Updated list of favorite movies
 */
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
    $pull: { FavoriteMovies: req.params.MovieID }
  },
    { new: true }, // This line makes sure that the updated document is returned
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
});

/**
 * Allows existing users to delete their account/user
 * @method DELETE
 * @param {string} URL
 * @example /users/testuser
 * @param {authenticationCallback} 
 * @param {requestCallback}
 * @returns {Object} a confirmation message
 */
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// main index page
app.get('/', (req, res) => {
  res.send('Welcome to myFlix!');
});

app.use(express.static('public'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});
