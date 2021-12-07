const express = require('express'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  uuid = require('uuid');

const app = express();

app.use(bodyParser.json());

let movies = [
  {
    title: 'Lord Of The Rings: Return Of The King',
    director: 'Peter Jackson',
    description: 'The former Fellowship members prepare for the final battle. While Frodo and Sam approach Mount Doom to destroy the One Ring, they follow Gollum, unaware of the path he is leading them to.',
    genre: 'Fantasy/Adventure'
  },
  {
    title: 'Pulp Fiction',
    director: 'Quentin Tarantino',
    description: 'In the realm of underworld, a series of incidents intertwines the lives of two Los Angeles mobsters, a gangsters wife, a boxer and two small-time criminals.',
    genre: 'Crime/Drama'
  },
  {
    title: 'The Silence of the Lambs',
    director: 'Jonathan Demme',
    description: 'Clarice Starling, an FBI agent, seeks help from Hannibal Lecter, a psychopathic serial killer and former psychiatrist, in order to apprehend another serial killer who has been claiming female victims',
    genre: 'Thriller/Horror'
  },
  {
    title: 'No Country for Old Men',
    director: 'Coen Brothers',
    description: 'A hunters life takes a drastic turn when he discovers two million dollars while strolling through the aftermath of a drug deal.',
    genre: 'Crime/Western'
  },
  {
    title: 'Alien',
    director: 'Ridley Scott',
    description: 'The crew of a spacecraft, Nostromo, intercept a distress signal from a planet and set out to investigate it. However, to their horror, they are attacked by an alien which later invades their ship.',
    genre: 'Sci-fi/Horror'
  }
];

let directors = [
  {
    name: 'Jonathan Demme',
    bio: 'Robert Jonathan Demme was an American film director, producer, and screenwriter of film and television who earned widespread acclaim.',
    yearOfBirth: '1944',
    yearOfDeath: '2017'
  }
]

app.use(morgan('common'));

// Return a list of ALL movies
app.get('/movies', (req, res) => {
  res.json(movies);
});

// Return data about a movie (genre, description, etc..) by title
app.get('/movies/:title', (req, res) => {
  res.json(movies.find((movie) =>
    { return movie.title === req.params.title }));
});

// Return data about a director (bio, birth year, death year) by name
app.get('/directors/:name', (req, res) => {
  res.json(directors.find((director) =>
    { return director.name === req.params.name }));
});

// Allow new users to register
app.post('/users', (req, res) => {
  res.send('Create user and send A JSON object holding data about the new user, containing a username, email and password, and an id');
});

// Allow users to update their user info (username)
app.put('/users/:username', (req, res) => {
  res.send('Update data and show a text message indicating the information that was updated.');
});

// Allow users to add a movie to their list of favorites
app.put('/users/:username/favorites', (req, res) => {
  res.send('Add movie and show a text message indicating whether the movie was successfully added to the favorites');
});

// Allow users to remove a movie from their list of favorites
app.delete('/users/:username/favorites', (req, res) => {
  res.send('Delete movie from favorites list and confirm via message');
});

// Allow existing users to deregister
app.delete('/users/:username', (req, res) => {
  res.send('Delete user and show a text message indicating the user was able to deregister');
});

// main index page
app.get('/', (req, res) => {
  res.send('Welcome to myFlix!');
});

app.use(express.static('public'));

// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send('Something broke!');
// });

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
