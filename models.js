const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * Movie schema
 */
let movieSchema = mongoose.Schema({
  Title: { type: String, required: true },
  Description: { type: String, required: true },
  Genre: {
    Name: String,
    Description: String
  },
  Director: {
    Name: String,
    Bio: String
  },
  Actors: [String],
  ImagePath: String,
  Featured: Boolean
});

/**
 * User schema
 */
let userSchema = mongoose.Schema({
  Username: { type: String, required: true },
  Password: { type: String, required: true },
  Email: { type: String, required: true },
  Birthday: Date,
  FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

/**
 * User encryption method.
 * @method hashPassword
 * @param {string} password - user password.
 * @returns {string} - encrypted password.
 */
userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

/**
 * Password validation method
 * @method validatePassword
 * @param {string} password - User password
 * @returns {boolean} true if database and user encrypted passwords match 
 */
userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.Password);
};

/** Model for the movies database collection, using movieSchema */
let Movie = mongoose.model('Movie', movieSchema);

/** Model for the users database collection, using userSchema */
let User = mongoose.model('User', userSchema);

module.exports.Movie = Movie;
module.exports.User = User;
