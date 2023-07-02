const { UnauthorizedError } = require("../exceptions/api-error");
const { validateAccessToken } = require("../service/token-service");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    // console.log(authHeader);

    if (!authHeader) next(UnauthorizedError());

    const accessToken = authHeader.split(" ")[1];
    if (!accessToken) next(UnauthorizedError());

    const userData = await validateAccessToken({ accessToken });
    // console.log("userData");
    // console.log(userData);
    if (!userData) next(UnauthorizedError());

    req.user = userData;
    next();
  } catch (error) {
    console.log(error);
    next(UnauthorizedError());
  }
};
