/**
 * Password requirements, shared by every form that collects one.
 *
 * These mirror `registerSchema` in `server/validators/authSchemas.js`. They were
 * previously copied into Signup, ResetPassword and UpdatePassword separately,
 * and the special-character rule in all three was narrower than the server's:
 *
 *   client (was)  /[!@#$%^&*(),.?":{}|<>]/
 *   server        /[^A-Za-z0-9]/
 *
 * So thirteen characters the server accepts were rejected by the browser —
 *   ' + - / ; = [ \ ] _ ` ~ and space
 * — which meant a password like `My_Pass1` was refused with "Password does not
 * meet complexity requirements!" even though the API would have taken it. The
 * underscore and hyphen are common enough in real passwords that this is not a
 * rare edge case.
 *
 * Keeping one definition here means the next change to the server rule has one
 * place to follow rather than three, which is how the three drifted apart.
 */

export const PASSWORD_REQUIREMENTS = [
  { id: "length", label: "8+ characters", test: (pw) => pw.length >= 8 },
  { id: "uppercase", label: "Uppercase letter (A-Z)", test: (pw) => /[A-Z]/.test(pw) },
  { id: "lowercase", label: "Lowercase letter (a-z)", test: (pw) => /[a-z]/.test(pw) },
  { id: "number", label: "Number (0-9)", test: (pw) => /\d/.test(pw) },
  {
    id: "special",
    // Anything that is not a letter or a digit, exactly as the server defines
    // it. Written as a negated class rather than an allow-list so the two
    // cannot drift again: an allow-list has to be kept in step by hand.
    label: "Special character (e.g. ! @ # _ - ?)",
    test: (pw) => /[^A-Za-z0-9]/.test(pw),
  },
];

/** True when a password satisfies every requirement above. */
export const meetsPasswordRequirements = (password) =>
  PASSWORD_REQUIREMENTS.every((requirement) => requirement.test(password));
