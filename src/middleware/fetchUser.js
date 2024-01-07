const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const fetchuser = (req, res, next) => {
    // get the user from jwt token and add id to req object
    const token = req.header('authToken');
    console.log(token)
    if (!token) {
        res.send({ error: 'Please authenticate using a valid token1' });
        return;
    }
    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.userID = data.ID;
        next();
    } catch (e) {
        res.send({ error: 'Please authenticate using a valid token2' });
    }
}

module.exports = fetchuser;