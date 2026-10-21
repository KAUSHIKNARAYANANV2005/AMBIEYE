import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  StatusBar,
} from "react-native";
import { Link, router } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import Feather from "@expo/vector-icons/Feather";
import { Colors, Shadows } from "@/constants/theme";
import {
  validateFullName,
  validateUsername,
  validateEmail,
  validatePhone,
  validateAge,
  validateDateOfBirth,
  validateGender,
  validateRequiredText,
  evaluatePasswordStrength,
} from "@/utils/validation";

export default function SignUpScreen() {
  const { signup, userType, isLoading, error, clearError } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMotherName] = useState("");
  const [address, setAddress] = useState("");
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDoctor = userType === "doctor";
  const accentColor = isDoctor ? Colors.primary : Colors.secondary;

  const passwordStrength = evaluatePasswordStrength(password);

  useEffect(() => {
    if (error) {
      Alert.alert("Signup Failed", error, [{ text: "OK", onPress: clearError }]);
    }
  }, [error, clearError]);

  const clearFieldError = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (validationError) {
      setValidationError("");
    }
  };

  const validateStep = (step: number) => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      const fn = validateFullName(fullName);
      if (!fn.isValid) errors.fullName = fn.error!;

      const un = validateUsername(username);
      if (!un.isValid) errors.username = un.error!;

      const em = validateEmail(email);
      if (!em.isValid) errors.email = em.error!;

      const ph = validatePhone(phone);
      if (!ph.isValid) errors.phone = ph.error!;

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        setValidationError("Please fix the highlighted fields to continue");
        return false;
      }
      setFieldErrors({});
      setValidationError("");
      return true;
    }

    if (step === 2) {
      const ag = validateAge(age);
      if (!ag.isValid) errors.age = ag.error!;

      const dob = validateDateOfBirth(dateOfBirth, age);
      if (!dob.isValid) errors.dateOfBirth = dob.error!;

      const gn = validateGender(gender);
      if (!gn.isValid) errors.gender = gn.error!;

      const fn = validateRequiredText(fatherName, "Father's name", 2, 50);
      if (!fn.isValid) errors.fatherName = fn.error!;

      const mn = validateRequiredText(motherName, "Mother's name", 2, 50);
      if (!mn.isValid) errors.motherName = mn.error!;

      const ad = validateRequiredText(address, "Address", 5, 200);
      if (!ad.isValid) errors.address = ad.error!;

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        setValidationError("Please fill out all personal details accurately");
        return false;
      }
      setFieldErrors({});
      setValidationError("");
      return true;
    }

    if (step === 3) {
      if (!password) {
        errors.password = "Password is required";
      } else if (!passwordStrength.isValid) {
        errors.password = "Password must satisfy all security requirements below";
      }

      if (!confirmPassword) {
        errors.confirmPassword = "Confirm password is required";
      } else if (password !== confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }

      if (!agreedToPrivacy) {
        errors.agreedToPrivacy = "Please accept the Privacy Policy and Terms of Service";
      }

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        setValidationError(
          errors.password || errors.confirmPassword || errors.agreedToPrivacy || "Please check your inputs"
        );
        return false;
      }
      setFieldErrors({});
      setValidationError("");
      return true;
    }

    return false;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    setValidationError("");
    setCurrentStep(currentStep - 1);
  };

  const handleSignUp = async () => {
    if (!validateStep(3)) return;
    setIsSubmitting(true);
    try {
      const success = await signup({
        fullName: fullName.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        age: age.trim(),
        gender: gender.trim(),
        dateOfBirth: dateOfBirth.trim(),
        fatherName: fatherName.trim(),
        motherName: motherName.trim(),
        address: address.trim(),
      });
      if (success) {
        if (userType === "doctor") router.replace("/(doctor)");
        else router.replace("/(patient)");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepLabels = ["Basic Info", "Personal", "Security"];
  const stepTitles = ["Basic Information", "Personal Details", "Create Password"];
  const stepIcons = ["user", "heart", "lock"] as const;

  const renderInput = (
    fieldName: string,
    placeholder: string,
    value: string,
    onValueChange: (val: string) => void,
    options: {
      icon?: string;
      keyboardType?: any;
      multiline?: boolean;
      secureTextEntry?: boolean;
      showToggle?: boolean;
      onToggle?: () => void;
      showValue?: boolean;
      autoCapitalize?: "none" | "sentences" | "words" | "characters";
    } = {}
  ) => {
    const errorMsg = fieldErrors[fieldName];
    return (
      <View style={styles.inputGroup}>
        <View
          style={[
            styles.inputWrapper,
            errorMsg ? styles.inputWrapperError : null,
            options.multiline ? styles.inputWrapperMultiline : null,
          ]}
        >
          {options.icon && (
            <View style={styles.inputIconBg}>
              <Feather
                name={options.icon as any}
                size={16}
                color={errorMsg ? Colors.error : Colors.textSecondary}
              />
            </View>
          )}
          <TextInput
            style={[styles.input, options.multiline ? styles.inputMultiline : null]}
            placeholder={placeholder}
            placeholderTextColor={Colors.textLight}
            value={value}
            onChangeText={(text) => {
              onValueChange(text);
              clearFieldError(fieldName);
            }}
            keyboardType={options.keyboardType || "default"}
            autoCapitalize={options.autoCapitalize || "none"}
            autoCorrect={false}
            multiline={options.multiline}
            secureTextEntry={options.secureTextEntry && !options.showValue}
            editable={!isSubmitting}
          />
          {options.showToggle && (
            <TouchableOpacity onPress={options.onToggle} style={styles.eyeButton}>
              <Feather
                name={options.showValue ? "eye-off" : "eye"}
                size={16}
                color={Colors.textLight}
              />
            </TouchableOpacity>
          )}
        </View>
        {errorMsg ? (
          <View style={styles.fieldErrorRow}>
            <Feather name="alert-circle" size={12} color={Colors.error} />
            <Text style={styles.fieldErrorText}>{errorMsg}</Text>
          </View>
        ) : null}
      </View>
    );
  };

  const renderPasswordRequirement = (met: boolean, text: string) => (
    <View style={styles.requirementItem} key={text}>
      <Feather
        name={met ? "check-circle" : "circle"}
        size={13}
        color={met ? Colors.success : "rgba(255,255,255,0.3)"}
      />
      <Text style={[styles.requirementText, met && styles.requirementTextMet]}>
        {text}
      </Text>
    </View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            {renderInput("fullName", "Full Name", fullName, setFullName, {
              icon: "user",
              autoCapitalize: "words",
            })}
            {renderInput("username", "Username (3-20 characters)", username, setUsername, {
              icon: "at-sign",
              autoCapitalize: "none",
            })}
            {renderInput("email", "Email Address", email, setEmail, {
              icon: "mail",
              keyboardType: "email-address",
              autoCapitalize: "none",
            })}
            {renderInput("phone", "Phone Number (e.g., +1 234 567 8900)", phone, setPhone, {
              icon: "phone",
              keyboardType: "phone-pad",
            })}
          </>
        );
      case 2:
        return (
          <>
            {renderInput("age", "Age (e.g., 28)", age, setAge, {
              icon: "calendar",
              keyboardType: "numeric",
            })}
            {renderInput(
              "dateOfBirth",
              "Date of Birth (DD-MM-YYYY)",
              dateOfBirth,
              setDateOfBirth,
              { icon: "calendar" }
            )}

            {/* Gender selector pills */}
            <View style={styles.genderContainer}>
              <Text style={styles.genderLabel}>Gender</Text>
              <View style={styles.genderPills}>
                {["Male", "Female", "Other"].map((g) => {
                  const isSelected = gender.toLowerCase() === g.toLowerCase();
                  return (
                    <TouchableOpacity
                      key={g}
                      style={[
                        styles.genderPill,
                        isSelected && [
                          styles.genderPillActive,
                          { borderColor: accentColor, backgroundColor: `${accentColor}18` },
                        ],
                      ]}
                      onPress={() => {
                        setGender(g);
                        clearFieldError("gender");
                      }}
                    >
                      <Text
                        style={[
                          styles.genderPillText,
                          isSelected && [styles.genderPillTextActive, { color: accentColor }],
                        ]}
                      >
                        {g}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {fieldErrors.gender ? (
                <View style={styles.fieldErrorRow}>
                  <Feather name="alert-circle" size={12} color={Colors.error} />
                  <Text style={styles.fieldErrorText}>{fieldErrors.gender}</Text>
                </View>
              ) : null}
            </View>

            {renderInput("fatherName", "Father's Name", fatherName, setFatherName, {
              icon: "user",
              autoCapitalize: "words",
            })}
            {renderInput("motherName", "Mother's Name", motherName, setMotherName, {
              icon: "user",
              autoCapitalize: "words",
            })}
            {renderInput("address", "Residential Address", address, setAddress, {
              icon: "map-pin",
              multiline: true,
              autoCapitalize: "sentences",
            })}
          </>
        );
      case 3:
        return (
          <>
            {renderInput("password", "Create Password", password, setPassword, {
              icon: "lock",
              secureTextEntry: true,
              showToggle: true,
              showValue: showPassword,
              onToggle: () => setShowPassword(!showPassword),
            })}

            {/* Password Strength Meter */}
            {password.length > 0 && (
              <View style={styles.strengthCard}>
                <View style={styles.strengthHeader}>
                  <Text style={styles.strengthTitle}>Password Strength</Text>
                  <Text style={[styles.strengthBadge, { color: passwordStrength.color }]}>
                    {passwordStrength.label}
                  </Text>
                </View>

                {/* 4-bar indicator */}
                <View style={styles.strengthBarRow}>
                  {[1, 2, 3, 4].map((seg) => (
                    <View
                      key={seg}
                      style={[
                        styles.strengthBarSegment,
                        passwordStrength.score >= seg && {
                          backgroundColor: passwordStrength.color,
                        },
                      ]}
                    />
                  ))}
                </View>

                {/* Requirements Checklist */}
                <View style={styles.requirementsList}>
                  {renderPasswordRequirement(
                    passwordStrength.criteria.minLength,
                    "At least 8 characters"
                  )}
                  {renderPasswordRequirement(
                    passwordStrength.criteria.hasUpper,
                    "At least one uppercase letter (A-Z)"
                  )}
                  {renderPasswordRequirement(
                    passwordStrength.criteria.hasLower,
                    "At least one lowercase letter (a-z)"
                  )}
                  {renderPasswordRequirement(
                    passwordStrength.criteria.hasNumber,
                    "At least one number (0-9)"
                  )}
                  {renderPasswordRequirement(
                    passwordStrength.criteria.hasSpecial,
                    "At least one special symbol (!@#$%...)"
                  )}
                </View>
              </View>
            )}

            {renderInput("confirmPassword", "Confirm Password", confirmPassword, setConfirmPassword, {
              icon: "lock",
              secureTextEntry: true,
              showToggle: true,
              showValue: showConfirmPassword,
              onToggle: () => setShowConfirmPassword(!showConfirmPassword),
            })}

            {/* Live Password Match Cue */}
            {confirmPassword.length > 0 && (
              <View style={styles.matchIndicator}>
                {password === confirmPassword ? (
                  <View style={styles.matchRow}>
                    <Feather name="check" size={13} color={Colors.success} />
                    <Text style={styles.matchTextSuccess}>Passwords match</Text>
                  </View>
                ) : (
                  <View style={styles.matchRow}>
                    <Feather name="x" size={13} color={Colors.error} />
                    <Text style={styles.matchTextError}>Passwords do not match</Text>
                  </View>
                )}
              </View>
            )}

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => {
                setAgreedToPrivacy(!agreedToPrivacy);
                clearFieldError("agreedToPrivacy");
              }}
              disabled={isLoading}
            >
              <View
                style={[
                  styles.checkbox,
                  agreedToPrivacy && {
                    backgroundColor: accentColor,
                    borderColor: accentColor,
                  },
                  fieldErrors.agreedToPrivacy ? { borderColor: Colors.error } : null,
                ]}
              >
                {agreedToPrivacy && <Feather name="check" size={13} color="#fff" />}
              </View>
              <View style={styles.checkboxTextRow}>
                <Text style={styles.checkboxText}>I agree to the </Text>
                <TouchableOpacity
                  onPress={() => router.push("/auth/privacy")}
                  disabled={isLoading}
                >
                  <Text style={[styles.checkboxLink, { color: accentColor }]}>
                    Privacy Policy
                  </Text>
                </TouchableOpacity>
                <Text style={styles.checkboxText}> and Terms</Text>
              </View>
            </TouchableOpacity>
            {fieldErrors.agreedToPrivacy ? (
              <View style={styles.fieldErrorRow}>
                <Feather name="alert-circle" size={12} color={Colors.error} />
                <Text style={styles.fieldErrorText}>{fieldErrors.agreedToPrivacy}</Text>
              </View>
            ) : null}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      {/* Background decorations */}
      <View style={[styles.bgCircle1, { backgroundColor: accentColor }]} />
      <View style={styles.bgCircle2} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Feather name="arrow-left" size={20} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
            <View style={styles.logoRow}>
              <View style={styles.logoEmblemContainer}>
                <View style={[styles.logoGlow, { backgroundColor: accentColor }]} />
                <View style={[styles.logoEmblem, { borderColor: `${accentColor}50` }]}>
                  <Image source={require("../../assets/images/logo.png")} style={styles.logo} />
                </View>
              </View>
              <View>
                <Text style={styles.appName}>AmbiEye</Text>
                <View
                  style={[
                    styles.roleBadge,
                    { backgroundColor: `${accentColor}20`, borderColor: `${accentColor}40` },
                  ]}
                >
                  <Feather name={isDoctor ? "activity" : "eye"} size={11} color={accentColor} />
                  <Text style={[styles.roleBadgeText, { color: accentColor }]}>
                    {isDoctor ? "Doctor" : "Patient"}
                  </Text>
                </View>
              </View>
            </View>
            <Text style={styles.headerTitle}>Create Account</Text>
          </View>

          {/* Step Progress */}
          <View style={styles.stepProgress}>
            {stepLabels.map((label, i) => {
              const step = i + 1;
              const isActive = currentStep === step;
              const isCompleted = currentStep > step;
              return (
                <React.Fragment key={step}>
                  <View style={styles.stepItem}>
                    <View
                      style={[
                        styles.stepCircle,
                        isActive && { backgroundColor: accentColor, borderColor: accentColor },
                        isCompleted && styles.stepCircleCompleted,
                      ]}
                    >
                      {isCompleted ? (
                        <Feather name="check" size={14} color="#fff" />
                      ) : (
                        <Feather
                          name={stepIcons[i]}
                          size={14}
                          color={isActive ? "#fff" : "rgba(255,255,255,0.4)"}
                        />
                      )}
                    </View>
                    <Text style={[styles.stepLabel, isActive && styles.stepLabelActive]}>
                      {label}
                    </Text>
                  </View>
                  {i < 2 && (
                    <View
                      style={[
                        styles.stepConnector,
                        isCompleted && styles.stepConnectorCompleted,
                      ]}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <Text style={styles.stepTitle}>{stepTitles[currentStep - 1]}</Text>

            {validationError ? (
              <View style={styles.errorBanner}>
                <Feather name="alert-circle" size={15} color={Colors.error} />
                <Text style={styles.errorText}>{validationError}</Text>
              </View>
            ) : null}

            {renderStepContent()}

            {/* Buttons */}
            <View style={styles.buttonRow}>
              {currentStep > 1 && (
                <TouchableOpacity
                  style={styles.prevButton}
                  onPress={handlePrevious}
                  disabled={isLoading}
                >
                  <Feather name="arrow-left" size={16} color={Colors.textSecondary} />
                  <Text style={styles.prevButtonText}>Back</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[
                  styles.nextButton,
                  { backgroundColor: accentColor },
                  currentStep === 1 && styles.nextButtonFull,
                  isLoading && styles.nextButtonDisabled,
                ]}
                onPress={currentStep === 3 ? handleSignUp : handleNext}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Text style={styles.nextButtonText}>
                      {currentStep === 3 ? "Create Account" : "Continue"}
                    </Text>
                    <Feather name="arrow-right" size={16} color="#fff" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/auth/login" asChild>
              <TouchableOpacity disabled={isLoading}>
                <Text style={[styles.footerLink, { color: accentColor }]}>Sign in</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  bgCircle1: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    opacity: 0.08,
    top: -80,
    right: -60,
  },
  bgCircle2: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: Colors.accent,
    opacity: 0.05,
    bottom: 80,
    left: -40,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    paddingTop: 56,
    marginBottom: 24,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  logoEmblemContainer: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  logoGlow: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    opacity: 0.35,
    transform: [{ scale: 1.25 }],
  },
  logoEmblem: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(255,255,255,0.06)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    overflow: "hidden",
  },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 21,
    resizeMode: "cover",
  },
  appName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  stepProgress: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  stepItem: {
    alignItems: "center",
    gap: 6,
  },
  stepCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.15)",
  },
  stepCircleCompleted: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  stepLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.4)",
    fontWeight: "500",
  },
  stepLabelActive: {
    color: "#FFFFFF",
  },
  stepConnector: {
    flex: 1,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.12)",
    marginBottom: 20,
    marginHorizontal: 6,
  },
  stepConnectorCompleted: {
    backgroundColor: Colors.accent,
  },
  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 24,
    ...Shadows.lg,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 20,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: Colors.error,
    fontSize: 13,
    flex: 1,
    fontWeight: "500",
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingRight: 14,
    minHeight: 52,
    overflow: "hidden",
  },
  inputWrapperError: {
    borderColor: Colors.error,
    backgroundColor: "#FEF2F2",
  },
  inputWrapperMultiline: {
    minHeight: 80,
    alignItems: "flex-start",
  },
  inputIconBg: {
    width: 52,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.divider,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    paddingLeft: 12,
    paddingVertical: 12,
  },
  inputMultiline: {
    paddingTop: 12,
    textAlignVertical: "top",
  },
  fieldErrorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 4,
    paddingHorizontal: 4,
  },
  fieldErrorText: {
    fontSize: 12,
    color: Colors.error,
    fontWeight: "500",
  },
  genderContainer: {
    marginBottom: 14,
  },
  genderLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
    marginLeft: 2,
  },
  genderPills: {
    flexDirection: "row",
    gap: 10,
  },
  genderPill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  genderPillActive: {
    borderWidth: 1.5,
  },
  genderPillText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  genderPillTextActive: {
    fontWeight: "700",
  },
  strengthCard: {
    backgroundColor: "#1E293B",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  strengthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  strengthTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.7)",
  },
  strengthBadge: {
    fontSize: 12,
    fontWeight: "700",
  },
  strengthBarRow: {
    flexDirection: "row",
    gap: 6,
    height: 5,
    marginBottom: 12,
  },
  strengthBarSegment: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  requirementsList: {
    gap: 6,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  requirementText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.45)",
  },
  requirementTextMet: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  matchIndicator: {
    marginTop: -8,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  matchTextSuccess: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: "500",
  },
  matchTextError: {
    fontSize: 12,
    color: Colors.error,
    fontWeight: "500",
  },
  eyeButton: {
    padding: 4,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 8,
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 1,
  },
  checkboxTextRow: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  checkboxText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  checkboxLink: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  prevButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 52,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  prevButtonText: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  nextButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: 14,
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonDisabled: {
    opacity: 0.6,
  },
  nextButtonText: {
    fontSize: 15,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.55)",
  },
  footerLink: {
    fontSize: 14,
    fontWeight: "700",
  },
});
