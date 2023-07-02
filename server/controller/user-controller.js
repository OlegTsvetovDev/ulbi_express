const { validationResult } = require("express-validator");
const {
  registerNewUser,
  activateUser,
  loginUser,
  logoutUser,
  refreshUserTokens,
  getAllUsers,
} = require("../service/user-service");
const { BadRequest, UnauthorizedError } = require("../exceptions/api-error");

class UserController {
  async registration(req, res, next) {
    // console.log("UserController.registration fired");
    try {
      const errors = validationResult(req);
      console.log(errors);
      if (!errors.isEmpty())
        return next(
          BadRequest("Произошла ошибка при валидации", errors.array())
        );

      const { email, password } = req.body;
      const userData = await registerNewUser({ email, password });

      res.cookie("refreshToken", userData.tokens.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: true,
      });

      res.status(200).json({
        message: `Пользователь с email ${email} успешно создан.`,
        ...userData,
      });
    } catch (error) {
      // res.status(400).json({ message: `${error}` });
      // console.log(error);
      next(error);
    }
  }

  async login(req, res, next) {
    // console.log(`Controller login fired`);
    try {
      const errors = validationResult(req);
      // console.log(errors);
      if (!errors.isEmpty())
        return next(
          BadRequest("Произошла ошибка при валидации", errors.array())
        );

      const { email, password } = req.body;
      if (!req.body.email || !req.body.password)
        return BadRequest("Для авторизации необходимы логин и пароль");

      let userData;
      try {
        userData = await loginUser({ email, password });
        // console.log(userData);
      } catch (error) {
        next(BadRequest("Неверные авторизационные данные"), error);
      }

      // console.log("userData.tokens.refreshToken:");
      // console.log(userData.tokens.refreshToken);

      res.cookie("refreshToken", userData.tokens.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        // secure: true,
      });

      res.status(200).json({
        message: `Пользователь с email ${email} успешно авторизован.`,
        ...userData,
      });
    } catch (error) {
      console.log(error);
      next(BadRequest("Непредвиденная ошибка"), error);
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      console.log("User controller refresh token");
      // console.log(req.cookies);
      // console.log(refreshToken);
      await logoutUser({ refreshToken });
      res.clearCookie("refreshToken");

      return res.status(200).json({
        message: "Пользователь успешно вышел из приложения",
      });
    } catch (error) {
      console.log(error);
      next(BadRequest("Непредвиденная ошибка"), error);
    }
  }

  async refresh(req, res, next) {
    // console.log("REFRESH STARTED");
    try {
      const { refreshToken } = req.cookies;

      let userData;
      try {
        userData = await refreshUserTokens({ refreshToken });
      } catch (error) {
        next(UnauthorizedError(), error);
      }

      // console.log("userData REFRESH");
      // console.log(userData);

      if (!userData) throw UnauthorizedError();

      // console.log("refresh userData:");
      // console.log(userData);

      res.cookie("refreshToken", userData.tokens.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        // secure: true,
      });

      res.status(200).json({
        message: "Токены обновлены",
        ...userData,
      });
    } catch (error) {
      console.log(error);
      next(BadRequest("Непредвиденная ошибка"), error);
    }
    // console.log("REFRESH ENDED");
  }

  async activate(req, res, next) {
    try {
      const activationLink = req.params.link;
      if (!activationLink)
        res.status(400).json({
          message: "Необходимо указать код активации",
        });

      const user = await activateUser({ activationLink });
      if (!user)
        res.status(404).json({
          message: "Пользователь не найден",
        });

      // console.log(user);

      // если нужен будет редирект
      // res.redirect(`http://${process.env.CLIENT_URL}`);

      res.status(200).json({
        message: `Пользователь ${user.email} успешно активирован`,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Что-то пошло не так",
        error: error,
      });
    }
  }

  async getUsers(req, res, next) {
    try {
      const users = await getAllUsers();
      res.json(users || [123, 333]);
    } catch (error) {
      console.log(error);
      next(BadRequest("Непредвиденная ошибка"), error);
    }
  }
}

module.exports = new UserController();
