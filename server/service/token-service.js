const { sign, verify } = require("jsonwebtoken");
const {
  updateRefreshTokenByUserId,
  findRefreshToken,
} = require("../model/token-model");
const { UnauthorizedError } = require("../exceptions/api-error");

class TokenService {
  async generateTokens(payload) {
    const accessToken = sign(payload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: "1m",
    });
    const refreshToken = sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: "30d",
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async updateRefreshTokenByUserId({ userId, refreshToken }) {
    // console.log(`userId: ${userId}`);
    // console.log(`refreshToken: ${refreshToken}`);

    if (!userId || !refreshToken)
      throw new Error(
        "Для обновления refresh token необходимы user_id и refresh token."
      );

    return await updateRefreshTokenByUserId({ userId, refreshToken });
  }

  async updateTokensByUserId({ userId, tokens }) {
    // console.log(`userId: ${userId}`);
    // console.log(`refreshToken: ${tokens}`);

    if (!userId || !tokens)
      throw new Error("Для обновления токенов необходимы user_id и токены.");

    return await updateTokensByUserId({ userId, tokens });
  }

  async validateAccessToken({ accessToken }) {
    try {
      const userData = verify(accessToken, process.env.JWT_ACCESS_SECRET);

      return userData;
    } catch (error) {
      console.log(error);

      return null;
    }
  }

  async validateRefreshToken({ refreshToken }) {
    try {
      const userData = verify(refreshToken, process.env.JWT_REFRESH_SECRET);

      return userData;
    } catch (error) {
      console.log(error);

      return null;
    }
  }

  async findRefreshToken({ refreshToken }) {
    try {
      const userData = await findRefreshToken({ refreshToken });

      return userData;
    } catch (error) {
      throw UnauthorizedError();
    }
  }
}

module.exports = new TokenService();
