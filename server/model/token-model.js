const db = require("../db/db");

const tokenModel = {
  // not tested
  async getUserByRefreshToken(refreshToken) {
    const userByRefreshToken = `
      select *
        from users u
        where u.refreshToken = '${refreshToken}'
    `;

    return await db.one(userByRefreshToken);
  },

  async updateRefreshTokenByUserId({ userId, refreshToken }) {
    const refreshTokenByUserId = `
      update users
        set refresh_token = '${refreshToken}'
        where user_id = '${userId}';
    `;

    return await db.none(refreshTokenByUserId);
  },

  async updateTokensByUserId({ userId, tokens }) {
    const tokensByUserId = `
      update users
        set refresh_token = '${tokens.refreshToken}',
            access_token = '${tokens.accessToken}'
        where user_id = '${userId}';
    `;

    return await db.none(tokensByUserId);
  },

  async findRefreshToken({ refreshToken }) {
    const refreshToken_ = `
      select *
        from users u
        where u.refresh_token = '${refreshToken}';
    `;

    return await db.one(refreshToken_);
  },
};

module.exports = tokenModel;
