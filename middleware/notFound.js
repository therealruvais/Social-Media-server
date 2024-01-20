const notFound = (req, res) =>
  res.status(404).send("Sorry Requested Route Does not Exist");

module.exports = notFound;
