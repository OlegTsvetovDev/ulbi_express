const db = require("../db/db");
const { v4 } = require("uuid");

class UserModel {
  async getUserByEmail({ email }) {
    // console.log("UserModel.getUserByEmail fired");
    if (!email)
      throw new Error("Необходимо указать email для поиска пользователя.");

    try {
      return await db.one(`
        select * from users u
          where u.email = '${email}';
        `);
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async registerUser({ email, password }) {
    if (!email || !password)
      throw new Error("Для регистрации необходимы email и пароль.");

    try {
      const foundUser = await db.one(`
        insert into users (email, password)
          values ('${email}', '${password}')
          returning *;
      `);

      console.log("DB query:");
      console.log(foundUser);

      return foundUser;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async createActivationLink({ userId }) {
    const activationLink = v4();

    try {
      await db.none(`
        update users
          set activation_link = '${activationLink}'
          where user_id = '${userId}';
      `);

      return activationLink;
    } catch (error) {
      console.log(error);
    }
  }

  async activateUser({ activationLink }) {
    try {
      const user = `
      update users
        set is_activated = true
        where activation_link = '${activationLink}'
        returning *;
    `;

      return await db.one(user);
    } catch (error) {
      console.log(error);
    }
  }

  async loginUser({ email, password }) {
    const login = `
      select *
    `;

    return db.one(login);
  }

  async logoutUserByRefreshToken({ refreshToken }) {
    console.log(refreshToken);
    const userByRefreshToken = `
      update users
        set refresh_token = '',
            access_token = ''
        where refresh_token = '${refreshToken}';

    `;

    return await db.none(userByRefreshToken);
  }

  async getAllUsers() {
    const allUsers = `
      select *
        from users u;
    `;

    return await db.any(allUsers);
  }
}

module.exports = new UserModel();
