export default function isUserAuthenticated(req,res,next) {
    console.log(req.user)
    if (req.user) {
        next();
      } else {
        // req.session.error = 'Access denied!';
        res.status(401).send("login first");
      }
}
