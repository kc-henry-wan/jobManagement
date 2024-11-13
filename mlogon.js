
// Validation function for email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email pattern
    return emailRegex.test(email);
}

// Validation function for password
function isValidPassword(password) {
    return password.length >= 8 && password.length <= 20;
}

// Validation function for pharmacy code
function isValidPharmacyCode(code) {
    return code.length === 3;
}

async function login() {
    // Clear previous error messages
    const errorMessage = document.getElementById("error-message");
    errorMessage.innerHTML = "";

    // Get form values
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const pharmacyCode = document.getElementById("pharmacyCode").value;


    // Validate input fields
    if (!isValidEmail(email)) {
        errorMessage.innerHTML = "Please enter a valid email address.";
        return;
    }

    if (!isValidPassword(password)) {
        errorMessage.innerHTML = "Password must be between 8 and 20 characters long.";
        return;
    }

    if (!isValidPharmacyCode(pharmacyCode)) {
        errorMessage.innerHTML = "Pharmacy code must be exactly 3 characters long.";
        return;
    }


    // Prepare the API request payload
    const requestData = {
        'id':1,
        'username': email,
        'password': password,
        'phamacyCode': pharmacyCode
    };

    try {
        // Make the API request using the URL from config.js
        const response = await fetch(config.apiMLogonUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        // Parse the response JSON
        const result = await response.json();

        if (response.ok && result.apiStatus === "Success") {
//            alert("Login successful! Token: " + result.data.accessToken);

            localStorage.setItem("mAuthToken", result.data.accessToken);
            window.location.href = "jobManagement.html";
        } else {
            // Handle login errors
            errorMessage.innerHTML = "Login failed: " + (result.message || "Invalid credentials");
        }
    } catch (error) {
        // Handle network or server errors
        errorMessage.innerHTML = "An error occurred. Please try again later.";
        console.error("Error logging in:", error);
    }
}
