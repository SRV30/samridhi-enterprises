/**
 * Validates a password against standard complexity rules.
 * Rules:
 * - 8 to 128 characters long
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 * - At least one numeric digit (0-9)
 * - At least one special character
 *
 * @param {string} password - The cleartext password to validate
 * @returns {{isValid: boolean, message?: string}}
 */
export const validatePassword = (password) => {
  const minLength = 8;
  const maxLength = 128;

  if (!password || typeof password !== "string" || password.length < minLength || password.length > maxLength) {
    return {
      isValid: false,
      message: `Password must be between ${minLength} and ${maxLength} characters long.`,
    };
  }

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!hasUppercase) {
    return {
      isValid: false,
      message: "Password must contain at least one uppercase letter.",
    };
  }
  if (!hasLowercase) {
    return {
      isValid: false,
      message: "Password must contain at least one lowercase letter.",
    };
  }
  if (!hasDigit) {
    return {
      isValid: false,
      message: "Password must contain at least one numeric digit.",
    };
  }
  if (!hasSpecial) {
    return {
      isValid: false,
      message: "Password must contain at least one special character.",
    };
  }

  return { isValid: true };
};

export default validatePassword;
