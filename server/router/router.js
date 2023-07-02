const Router = require("express").Router;
const { body } = require("express-validator");
const {
  activate,
  refresh,
  registration,
  login,
  logout,
  getUsers,
} = require("../controller/user-controller");
const authMiddleware = require("../middleware/auth-middleware");

const router = new Router();

router.get("/activate/:link", activate);
router.get("/refresh", refresh);

router.post(
  "/registration",
  body("email").isEmail(),
  body("password").isLength({ min: 6, max: 50 }),
  registration
);
router.post("/login", login);
router.post("/logout", logout);

router.get("/users", authMiddleware, getUsers);

module.exports = router;
