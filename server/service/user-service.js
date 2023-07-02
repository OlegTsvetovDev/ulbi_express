const { hash, compare } = require("bcrypt");
const {
  getUserByEmail,
  registerUser,
  createActivationLink,
  activateUser,
  logoutUserByRefreshToken,
  getAllUsers,
} = require("../model/user-model");
const mailService = require("./mail-service");
const {
  generateTokens,
  updateRefreshTokenByUserId,
  refreshUserTokensByRefreshToken,
  validateRefreshToken,
  findRefreshToken,
} = require("./token-service");
const UserDto = require("../dtos/user-dto");
const { BadRequest, UnauthorizedError } = require("../exceptions/api-error");
const { updateTokensByUserId } = require("../model/token-model");

function isEmpty(obj) {
  if (obj === null || obj === undefined) return false;

  for (const prop in obj) {
    if (Object.hasOwn(obj, prop)) {
      return false;
    }
  }

  return true;
}

class UserService {
  async registerNewUser({ email, password }) {
    const candidate = await getUserByEmail({ email });

    console.log("UserService registerNewUser candidate:");
    console.log(candidate);

    if (candidate)
      throw BadRequest(`Пользователь с email ${email} уже существует`);

    // создаем пользователя
    const hashedPassword = await hash(password, 5);
    const user = await registerUser({ email, password: hashedPassword });
    const userDto = new UserDto(user);

    // ссылка для активации + письмо для активации
    const activationLink = await createActivationLink({
      userId: userDto.userId,
    });

    mailService.sendActivationMail({
      email,
      activationLink: `http://${process.env.SERVICE_URL}/api/activate/${activationLink}`,
    });

    const tokens = await generateTokens({ ...userDto });
    await updateRefreshTokenByUserId({
      userId: userDto.userId,
      refreshToken: tokens.refreshToken,
    });

    return {
      tokens,
      user: userDto,
    };
  }

  async activateUser({ activationLink }) {
    if (!activationLink) throw BadRequest("Необходимо указать код активации");

    const user = await activateUser({ activationLink });

    return new UserDto(user);
  }

  async loginUser({ email, password }) {
    const candidate = await getUserByEmail({ email });

    if (!candidate || isEmpty(candidate))
      throw BadRequest(`Пользователь с email ${email} не найден`);

    // console.log("Candidate: ");
    // console.log(candidate);

    const isPasswordValid = await compare(password, candidate.password);
    // console.log(isPasswordValid);
    if (!isPasswordValid) throw BadRequest("Неверные авторизационные данные");

    const userDto = new UserDto(candidate);
    const tokens = await generateTokens({ ...userDto });
    await updateTokensByUserId({
      userId: userDto.userId,
      tokens,
    });

    return {
      tokens,
      user: userDto,
    };
  }

  async logoutUser({ refreshToken }) {
    return await logoutUserByRefreshToken({ refreshToken });
  }

  async refreshUserTokens({ refreshToken }) {
    if (!refreshToken) throw UnauthorizedError();

    const userDataFromJWT = await validateRefreshToken({ refreshToken });
    if (!userDataFromJWT) throw UnauthorizedError();

    const foundUserData = await findRefreshToken({ refreshToken });
    // console.log("foundUserData");
    // console.log(foundUserData);
    if (!foundUserData || !foundUserData.refresh_token)
      throw UnauthorizedError();

    const userDto = new UserDto(foundUserData);
    // console.log(`userDto`);
    // console.log(userDto);
    const tokens = await generateTokens({ ...userDto });
    // console.log("generated tokens");
    // console.log(tokens);
    await updateTokensByUserId({
      userId: userDto.userId,
      tokens,
    });

    return {
      ...userDto,
      tokens,
    };
  }

  async getAllUsers() {
    return await getAllUsers();
  }
}

module.exports = new UserService();
