module.exports.validateSignUpInput = (
  username,
  email,
  password,
  confirmPassword
) => {
  const errors = {};
  if (username.trim() === "") errors.username = "Username must not be empty";
  if (username.length < 3)
    errors.username = "Username must contain a least 3 caracters";
  if (email.trim() === "") {
    errors.email = "Email must not be empty";
  } else {
    const regExEmail =
      /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
    if (!email.match(regExEmail)) {
      errors.email = "Email must be a valid email address";
    }
  }

  const regExPassword = new RegExp(
    "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
  );
  if (!password.match(regExPassword))
    errors.password = "Password must be a valid password";
  if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords must match";
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

module.exports.validateSignInInput = (username, password) => {
  const errors = {};
  if (username.trim() === "") {
    errors.username = "Username must not be empty";
  }
  if (password.trim() === "") {
    errors.password = "Password must not be empty";
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

module.exports.ValidateNoteContent = (content) => {
  const errors = {};
  if (content.trim() === "") {
    errors.note = "Note content must not be empty";
  }

  if (content.length < 8) {
    errors.note = "Note content must content at least 8 caracters";
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

// RegEx	Description
// ^	The password string will start this way
// (?=.*[a-z])	The string must contain at least 1 lowercase alphabetical character
// (?=.*[A-Z])	The string must contain at least 1 uppercase alphabetical character
// (?=.*[0-9])	The string must contain at least 1 numeric character
// (?=.*[!@#$%^&*])	The string must contain at least one special character, but we are escaping reserved RegEx characters to avoid conflict
// (?=.{8,})	The string must be eight characters or longer

// by- Nic Raboy
