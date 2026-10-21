/**
 * Form validation utilities for Authentication (Login and Signup)
 */

export interface PasswordCriteria {
  minLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export interface PasswordStrength {
  score: number; // 0 to 4
  label: "Too Weak" | "Weak" | "Fair" | "Strong";
  color: string;
  criteria: PasswordCriteria;
  isValid: boolean;
}

/**
 * Validates full name: letters, spaces, hyphens, and apostrophes only.
 * Must be between 2 and 50 characters.
 */
export function validateFullName(name: string): { isValid: boolean; error?: string } {
  const trimmed = name.trim();
  if (!trimmed) {
    return { isValid: false, error: "Full name is required" };
  }
  if (trimmed.length < 2) {
    return { isValid: false, error: "Full name must be at least 2 characters" };
  }
  if (trimmed.length > 50) {
    return { isValid: false, error: "Full name cannot exceed 50 characters" };
  }
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(trimmed)) {
    return { isValid: false, error: "Name can only contain letters, spaces, hyphens, or apostrophes" };
  }
  return { isValid: true };
}

/**
 * Validates username: 3-20 characters, alphanumeric, underscores, hyphens, and periods.
 * Must start with an alphanumeric character.
 */
export function validateUsername(username: string): { isValid: boolean; error?: string } {
  const trimmed = username.trim();
  if (!trimmed) {
    return { isValid: false, error: "Username is required" };
  }
  if (trimmed.length < 3) {
    return { isValid: false, error: "Username must be at least 3 characters" };
  }
  if (trimmed.length > 20) {
    return { isValid: false, error: "Username cannot exceed 20 characters" };
  }
  const usernameRegex = /^[a-zA-Z0-9][a-zA-Z0-9_.-]*[a-zA-Z0-9]$|^[a-zA-Z0-9]{3,}$/;
  if (!usernameRegex.test(trimmed)) {
    return {
      isValid: false,
      error: "Username must start/end with a letter or number (allowed: letters, numbers, _, -, .)",
    };
  }
  return { isValid: true };
}

/**
 * Validates email with standard RFC-compliant regex.
 */
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  const trimmed = email.trim();
  if (!trimmed) {
    return { isValid: false, error: "Email address is required" };
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: "Please enter a valid email address (e.g., name@example.com)" };
  }
  return { isValid: true };
}

/**
 * Validates phone number: 7 to 15 digits, allows optional leading +, spaces, hyphens, brackets.
 */
export function validatePhone(phone: string): { isValid: boolean; error?: string } {
  const trimmed = phone.trim();
  if (!trimmed) {
    return { isValid: false, error: "Phone number is required" };
  }
  // Strip non-numeric characters except leading +
  const numericOnly = trimmed.replace(/[^0-9]/g, "");
  if (numericOnly.length < 7 || numericOnly.length > 15) {
    return { isValid: false, error: "Phone number must contain 7 to 15 digits" };
  }
  const phoneRegex = /^(\+?[0-9\s\-().]{7,20})$/;
  if (!phoneRegex.test(trimmed)) {
    return { isValid: false, error: "Invalid phone number format" };
  }
  return { isValid: true };
}

/**
 * Validates age: must be an integer between 1 and 120.
 */
export function validateAge(age: string): { isValid: boolean; error?: string } {
  const trimmed = age.trim();
  if (!trimmed) {
    return { isValid: false, error: "Age is required" };
  }
  const ageNum = parseInt(trimmed, 10);
  if (isNaN(ageNum) || !/^\d+$/.test(trimmed)) {
    return { isValid: false, error: "Age must be a valid whole number" };
  }
  if (ageNum < 1 || ageNum > 120) {
    return { isValid: false, error: "Age must be between 1 and 120" };
  }
  return { isValid: true };
}

/**
 * Validates date of birth in dd-mm-yyyy or yyyy-mm-dd format.
 * Ensures realistic calendar date and past date.
 */
export function validateDateOfBirth(
  dob: string,
  expectedAge?: string
): { isValid: boolean; error?: string; calculatedAge?: number } {
  const trimmed = dob.trim();
  if (!trimmed) {
    return { isValid: false, error: "Date of birth is required" };
  }

  // Support dd-mm-yyyy, dd/mm/yyyy, or yyyy-mm-dd
  let day: number, month: number, year: number;
  const dmyMatch = trimmed.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  const ymdMatch = trimmed.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);

  if (dmyMatch) {
    day = parseInt(dmyMatch[1], 10);
    month = parseInt(dmyMatch[2], 10);
    year = parseInt(dmyMatch[3], 10);
  } else if (ymdMatch) {
    year = parseInt(ymdMatch[1], 10);
    month = parseInt(ymdMatch[2], 10);
    day = parseInt(ymdMatch[3], 10);
  } else {
    return { isValid: false, error: "Please enter date as DD-MM-YYYY (e.g. 15-08-1995)" };
  }

  if (month < 1 || month > 12) {
    return { isValid: false, error: "Month must be between 1 and 12" };
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) {
    return { isValid: false, error: `Day must be between 1 and ${daysInMonth} for that month` };
  }

  const birthDate = new Date(year, month - 1, day);
  const today = new Date();

  if (birthDate > today) {
    return { isValid: false, error: "Date of birth cannot be in the future" };
  }

  const currentYear = today.getFullYear();
  if (year < currentYear - 120) {
    return { isValid: false, error: "Year of birth cannot be more than 120 years ago" };
  }

  // Calculate age
  let calculatedAge = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    calculatedAge--;
  }

  if (expectedAge) {
    const ageNum = parseInt(expectedAge.trim(), 10);
    if (!isNaN(ageNum)) {
      // Allow +/- 1 year tolerance for birthday timing
      if (Math.abs(calculatedAge - ageNum) > 1) {
        return {
          isValid: false,
          error: `DOB indicates age ~${calculatedAge}, which does not match entered age (${ageNum})`,
          calculatedAge,
        };
      }
    }
  }

  return { isValid: true, calculatedAge };
}

/**
 * Validates gender.
 */
export function validateGender(gender: string): { isValid: boolean; error?: string } {
  const trimmed = gender.trim();
  if (!trimmed) {
    return { isValid: false, error: "Gender is required" };
  }
  const validGenders = ["male", "female", "other", "prefer not to say"];
  if (!validGenders.includes(trimmed.toLowerCase())) {
    return { isValid: false, error: "Please select a valid gender (Male, Female, Other)" };
  }
  return { isValid: true };
}

/**
 * Validates required text fields like parent names or address.
 */
export function validateRequiredText(
  value: string,
  fieldName: string,
  minLength: number = 2,
  maxLength: number = 100
): { isValid: boolean; error?: string } {
  const trimmed = value.trim();
  if (!trimmed) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  if (trimmed.length < minLength) {
    return { isValid: false, error: `${fieldName} must be at least ${minLength} characters` };
  }
  if (trimmed.length > maxLength) {
    return { isValid: false, error: `${fieldName} cannot exceed ${maxLength} characters` };
  }
  return { isValid: true };
}

/**
 * Evaluates password strength against industry-standard requirements:
 * - 8+ characters
 * - Uppercase letter
 * - Lowercase letter
 * - Digit
 * - Special character
 */
export function evaluatePasswordStrength(password: string): PasswordStrength {
  const criteria: PasswordCriteria = {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password),
  };

  const passedCount = Object.values(criteria).filter(Boolean).length;

  let score = 0;
  let label: PasswordStrength["label"] = "Too Weak";
  let color = "#EF4444"; // red

  if (password.length === 0) {
    score = 0;
    label = "Too Weak";
    color = "#EF4444";
  } else if (passedCount <= 2 || password.length < 6) {
    score = 1;
    label = "Weak";
    color = "#F87171"; // light red
  } else if (passedCount === 3 || passedCount === 4) {
    score = 2;
    label = "Fair";
    color = "#F59E0B"; // amber
  } else if (passedCount === 5) {
    score = 4;
    label = "Strong";
    color = "#10B981"; // emerald green
  }

  // Strong password requires minLength + at least upper, lower, number, and special character
  const isValid = criteria.minLength && criteria.hasUpper && criteria.hasLower && criteria.hasNumber && criteria.hasSpecial;

  return {
    score,
    label,
    color,
    criteria,
    isValid,
  };
}

/**
 * Validates login form inputs:
 * Username/Email and Password.
 */
export function validateLoginForm(
  username: string,
  password: string
): { isValid: boolean; errors: { username?: string; password?: string }; generalError?: string } {
  const errors: { username?: string; password?: string } = {};

  const trimmedUsername = username.trim();
  if (!trimmedUsername) {
    errors.username = "Username or email is required";
  } else if (trimmedUsername.length < 3) {
    errors.username = "Username must be at least 3 characters";
  }

  if (!password) {
    errors.password = "Password is required";
  } else if (password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  const isValid = Object.keys(errors).length === 0;
  const generalError = !isValid
    ? errors.username || errors.password || "Please check your credentials"
    : undefined;

  return { isValid, errors, generalError };
}
