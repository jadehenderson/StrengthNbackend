const jwt = require("jsonwebtoken");

module.exports = async(req, res, next) => {
    try {
        const jwtToken = req.header("token");
        if (!jwtToken) {
            return res.status(403).json("Not authorized")
        }
        const payload = jwt.verify(jwtToken, "hello");
        req.user = payload.user;

    } catch (err) {
        console.log(err.message);
        return res.status(403).json("Not authorized")
    }

}