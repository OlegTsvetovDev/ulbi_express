class UserDto {
  userId;
  email;
  isActivated;

  constructor(model) {
    this.userId = model.user_id;
    this.email = model.email;
    this.isActivated = model.is_activated;
  }
}

module.exports = UserDto;
