const form = document.getElementById("adminForm");
const email = document.getElementById("email");
const password = document.getElementById("password");
const message = document.getElementById("messages");

const isValidEmail = email => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function validateInput() {
    const emailValue = email.value;
    const passwordValue = password.value;


    if (emailValue === "") {
        message.innerHTML = "<p>Email is required.</p>"
    }
    if (!isValidEmail(emailValue)) {
        message.innerHTML = "<p>Please provide a valid email.</p>"
    }

    if (passwordValue === "") {
        message.innerHTML = "<p>Please provide correct password.</p>"
    }
}