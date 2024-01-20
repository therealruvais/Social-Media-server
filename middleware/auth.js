const jwt = require("jsonwebtoken")

const authVerify =  (req, res,next) => {
    const cookie = req.headers.cookie
    if (!cookie) throw new Error(`No cookie in the header`)
  const token = cookie.split("=")[1];
    if (!token) throw new Error('invalid token')
    jwt.verify(token.toString(), process.env.USER_KEY, (error, user) => {
        if (error) {
          return res.status(403).json({ msg: "Token verification failed" });
        }
        if (!user)
          return res.status(404).json({ msg: "User not found in cookie" });

        req.user = user
    })
    next()
}


module.exports = authVerify