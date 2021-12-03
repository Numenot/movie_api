const express = require('express'),
  morgan = require('morgan');

const app = express();

let topMovies = [
  {
    title: 'Lord Of The Rings: Return Of The King',
    director: 'Peter Jackson'
  },
  {
    title: 'Pulp Fiction',
    director: 'Quentin Tarantino'
  },
  {
    title: 'The Silence of the Lambs',
    director: 'Jonathan Demme'
  },
  {
    title: 'No Country for Old Men',
    director: 'Coen Brothers'
  },
  {
    title: 'Forrest Gump',
    director: 'Robert Zemeckis'
  },
  {
    title: 'Alien',
    director: 'Ridley Scott'
  },
  {
    title: 'The Thing',
    director: 'John Carpenter'
  },
  {
    title: 'Parasite',
    director: 'Bong Joon-ho'
  },
  {
    title: 'Jurassic Park',
    director: 'Steven Spielberg'
  },
  {
    title: 'Se7en',
    director: 'David Fincher'
  }
];

app.use(morgan('common'));

app.get('/movies', (req, res) => {
  res.json(topMovies);
});

app.get('/', (req, res) => {
  res.send('Welcome to myFlix!');
});

app.use(express.static('public'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
