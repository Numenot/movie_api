const jwtSecret = 'jwt_secret';

const jwt = require('jsonwebtoken'),
  passport = require('passport');

require('./passport');

/**
 * Creates json web token
 * @function generateToken 
 * @param {string} user - Authenticated user returned passport strategy.
 * @returns {string} json web token.
 */
let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username, // username encoded in the JWT
    expiresIn: '7d', // Token will expire in 7 days
    algorithm: 'HS256' // This is the algorithm used to “sign” or encode the values of the JWT
  });
}

/**
 * POST request to login endpoint.
 * Request parameters must include username and password.
 * @function
 * @param {*} app
 * @returns {Object} An object containing logged in user data and associated web token.
 */
module.exports = (router) => {
  router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: 'Something is not right',
          user: user
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }
        let token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      });
    })(req, res);
  });
}
