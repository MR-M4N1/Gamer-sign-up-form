const form = document.querySelector("#signupForm");

const callsignInput = document.querySelector("#callsign");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const confirmPasswordInput = document.querySelector("#confirmPassword");
const termsInput = document.querySelector("#terms");

const fields = {
    callsign: {
        input: callsignInput,
        error: document.querySelector("#callsignError"),
        validate: validateCallsign
    },
    email: {
        input: emailInput,
        error: document.querySelector("#emailError"),
        validate: validateEmail
    },
    password: {
        input: passwordInput,
        error: document.querySelector("#passwordError"),
        validate: validatePassword
    },
    confirmPassword: {
        input: confirmPasswordInput,
        error: document.querySelector("#confirmPasswordError"),
        validate: validateConfirmPassword
    }
};

const hasBeenValidated = {
    callsign: false,
    email: false,
    password: false,
    confirmPassword: false,
    terms: false
};

const termsError = document.querySelector("#termsError");
const formFeedback = document.querySelector("#formFeedback");
const submitButton = form.querySelector(".submitButton");

const strengthMeter = document.querySelector(".strengthMeter");
const strengthLabel = document.querySelector("#strengthLabel");

const statusElements = document.querySelectorAll(".statusRow .fieldStatus");
const progressElements = document.querySelectorAll(
    ".desktopInputUpdate, .MobileInputUpdate"
);

const operatorUpdate = document.querySelector(".operatorUpdate");

const formContent = document.querySelector(".formContent");
const successContent = document.querySelector(".successContent");
const successTitle = document.querySelector("#successTitle");
const successCallsign = document.querySelector("#successCallsign");

let isSubmitting = false;

function validateCallsign() {
    const value = callsignInput.value.trim();

    if (!value) {
        return "Callsign cannot be empty.";
    }

    if (value.length < 3 || value.length > 20) {
        return "Callsign must be 3–20 characters long.";
    }

    if (!/^[A-Za-z0-9_-]+$/.test(value)) {
        return "Use only letters, numbers, underscores, or hyphens.";
    }

    return "";
}


function validateEmail() {
    const value = emailInput.value.trim();

    if (!value) {
        return "Email cannot be empty.";
    }

    if (!emailInput.validity.valid) {
        return "Please enter a valid email address.";
    }

    return "";
}


function validatePassword() {
    const value = passwordInput.value;

    if (!value) {
        return "Password cannot be empty.";
    }

    if (value.length < 8) {
        return "Password must be at least 8 characters.";
    }

    return "";
}


function validateConfirmPassword() {
    const value = confirmPasswordInput.value;

    if (!value) {
        return "Please confirm your password.";
    }

    if (value !== passwordInput.value) {
        return "Passwords do not match.";
    }

    return "";
}

function updateFieldUI(fieldName, errorMessage) {
    const field = fields[fieldName];
    const { input, error } = field;

    const isValid = errorMessage === "";

    error.textContent = errorMessage;
    error.hidden = isValid;

    const warningContent = error.closest(".warningContent");

    if (warningContent) {
        warningContent.hidden = isValid;
    }

    input.setAttribute("aria-invalid", String(!isValid));

    const statusIcon = input.parentElement.querySelector(".inputStatusIcon");

    if (statusIcon) {
        statusIcon.hidden = !isValid;
    }
}

function validateField(fieldName) {
    const field = fields[fieldName];
    const errorMessage = field.validate();

    hasBeenValidated[fieldName] = true;

    updateFieldUI(fieldName, errorMessage);

    return errorMessage === "";
}

function getPasswordStrength(value) {
    if (!value) {
        return {
            score: 0,
            label: "",
            level: ""
        };
    }

    if (value.length < 8) {
        return {
            score: 1,
            label: "Weak",
            level: "weak"
        };
    }

    let score = 1;

    if (value.length >= 12) {
        score++;
    }

    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) {
        score++;
    }

    if (/[0-9]/.test(value)) {
        score++;
    }

    if (/[^A-Za-z0-9]/.test(value)) {
        score++;
    }

    score = Math.min(score, 4);

    const levels = {
        1: { label: "Weak", level: "weak" },
        2: { label: "Fair", level: "fair" },
        3: { label: "Good", level: "good" },
        4: { label: "Strong", level: "strong" }
    };

    return {
        score,
        ...levels[score]
    };
}

function updatePasswordStrength() {
    const value = passwordInput.value;
    const strength = getPasswordStrength(value);

    if (!value) {
        strengthMeter.removeAttribute("data-strength");
        strengthLabel.removeAttribute("data-strength");

        strengthMeter.setAttribute("aria-valuenow", "0");
        strengthMeter.setAttribute(
            "aria-valuetext",
            "No password entered"
        );

        strengthLabel.textContent = "";
        strengthLabel.hidden = true;

        return;
    }

    strengthMeter.dataset.strength = strength.level;
    strengthLabel.dataset.strength = strength.level;

    strengthMeter.setAttribute(
        "aria-valuenow",
        String(strength.score)
    );

    strengthMeter.setAttribute(
        "aria-valuetext",
        strength.label
    );

    strengthLabel.textContent = strength.label;
    strengthLabel.hidden = false;
}

function updateProgress() {
    let readyCount = 0;

    const fieldNames = Object.keys(fields);

    fieldNames.forEach((fieldName, index) => {
        const field = fields[fieldName];
        const isValid = field.validate() === "";

        const statusElement = statusElements[index];

        if (isValid) {
            readyCount++;
            updateStatusElement(statusElement, "Ready", "is-ok");
        } else if (hasBeenValidated[fieldName]) {
            updateStatusElement(statusElement, "Error", "is-error");
        } else {
            updateStatusElement(statusElement, "Pending", "");
        }
    });

    if (termsInput.checked) {
        readyCount++;
        updateStatusElement(statusElements[4], "Ready", "is-ok");
    } else if (hasBeenValidated.terms && !termsError.hidden) {
        updateStatusElement(statusElements[4], "Error", "is-error");
    } else {
        updateStatusElement(statusElements[4], "Required", "is-required");
    }

    progressElements.forEach(element => {
        element.textContent = `[${readyCount}]/5 ready`;
    });

    updateOperatorID();
}


function updateStatusElement(element, text, className) {
    element.textContent = text;

    element.classList.remove(
        "is-ok",
        "is-required",
        "is-error",
        "is-locked"
    );

    if (className) {
        element.classList.add(className);
    }
}


function updateOperatorID() {
    const value = callsignInput.value.trim();

    if (validateCallsign() === "") {
        operatorUpdate.textContent = value;
    } else {
        operatorUpdate.textContent = "Unassigned";
    }
}

function handleFieldInput(fieldName) {
    if (hasBeenValidated[fieldName]) {
        validateField(fieldName);
    }

    if (fieldName === "password") {
        updatePasswordStrength();

        if (hasBeenValidated.confirmPassword) {
            validateField("confirmPassword");
        }
    }

    formFeedback.textContent = "";

    updateProgress();
}


function handleFieldBlur(fieldName) {
    const input = fields[fieldName].input;

    if (fieldName === "callsign") {
        input.value = input.value.trim();
    }

    const hasContent = input.value.length > 0;

    if (hasContent) {
        validateField(fieldName);
    }

    updateProgress();
}

Object.keys(fields).forEach(fieldName => {
    const input = fields[fieldName].input;

    input.addEventListener("input", () => {
        handleFieldInput(fieldName);
    });

    input.addEventListener("blur", () => {
        handleFieldBlur(fieldName);
    });
});

function validateTerms() {
    const isValid = termsInput.checked;

    hasBeenValidated.terms = true;

    termsError.textContent = isValid
        ? ""
        : "Accept the terms and privacy policy.";

    termsError.closest(".warningContent").hidden = isValid;

    termsInput.setAttribute("aria-invalid", String(!isValid));

    return isValid;
}


termsInput.addEventListener("change", () => {
    termsError.textContent = "";
    termsError.closest(".warningContent").hidden = true;
    termsInput.setAttribute("aria-invalid", "false");

    hasBeenValidated.terms = false;

    formFeedback.textContent = "";

    updateProgress();
});

function setupPasswordToggles() {
    const toggles = document.querySelectorAll(".passwordToggle");

    toggles.forEach(toggle => {
        const controlledInput = document.getElementById(
            toggle.getAttribute("aria-controls")
        );

        toggle.addEventListener("click", () => {
            const shouldShow = controlledInput.type === "password";

            controlledInput.type = shouldShow ? "text" : "password";

            const eyeIcon = toggle.querySelector(".eyeIcon");

            eyeIcon.src = shouldShow
                ? "./assets/images/icon-eye-off.svg"
                : "./assets/images/icon-eye.svg";

            toggle.setAttribute(
                "aria-label",
                shouldShow ? "Hide password" : "Show password"
            );

            toggle.setAttribute(
                "aria-pressed",
                String(shouldShow)
            );
        });
    });
}


function resetPasswordVisibility() {
    const toggles = document.querySelectorAll(".passwordToggle");

    toggles.forEach(toggle => {
        const controlledInput = document.getElementById(
            toggle.getAttribute("aria-controls")
        );

        controlledInput.type = "password";
        const eyeIcon = toggle.querySelector(".eyeIcon");
        eyeIcon.src = "./assets/images/icon-eye.svg";
        toggle.setAttribute("aria-label", "Show password");
        toggle.setAttribute("aria-pressed", "false");
    });
}

async function startProvisioning() {
    isSubmitting = true;

    resetPasswordVisibility();

    submitButton.disabled = true;
    submitButton.textContent = "Transmitting_";

    form.querySelectorAll("input, button").forEach(control => {
        control.disabled = true;
    });

    statusElements.forEach(element => {
        updateStatusElement(element, "Locked", "is-locked");
    });

    formFeedback.textContent = "All checks passed. Finalizing...";

    await new Promise(resolve => setTimeout(resolve, 1000));

    showSuccessScreen();
}


function showSuccessScreen() {
    successCallsign.textContent = callsignInput.value.trim();

    formContent.hidden = true;
    successContent.hidden = false;

    successTitle.focus();
}

async function handleFormSubmit(event) {
    event.preventDefault();

    if (isSubmitting) {
        return;
    }

    callsignInput.value = callsignInput.value.trim();

    const invalidFields = [];

    Object.keys(fields).forEach(fieldName => {
        const isValid = validateField(fieldName);

        if (!isValid) {
            invalidFields.push(fieldName);
        }
    });

    const isTermsValid = validateTerms();

    if (!isTermsValid) {
        invalidFields.push("terms");
    }

    updateProgress();

    if (invalidFields.length > 0) {
        formFeedback.textContent =
            `Please review ${invalidFields.length} field(s) before continuing.`;

        const firstInvalidField = invalidFields[0];

        if (firstInvalidField === "terms") {
            termsInput.focus();
        } else {
            fields[firstInvalidField].input.focus();
        }

        return;
    }

    formFeedback.textContent = "";

    await startProvisioning();
}


form.addEventListener("submit", handleFormSubmit);

setupPasswordToggles();

updatePasswordStrength();
updateProgress();