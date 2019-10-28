const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next) {
    //Get token from header
    const token = req.header('auth-token');

    //Check if not token
    if (!token) {
        res.status(401).json({ msg: 'No token. Authorization is denied.' });
    };

    //Verify token
    try {
        const decodedToken = jwt.verify(token, config.get('jwtKey'));
        req.user = decodedToken.user; //put the decoded user into the request object

        next();
    } catch (error) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
}