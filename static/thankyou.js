

// signin & signup
const navSignin = document.querySelector("#nav-signin");
const navSignup = document.querySelector("#nav-signup");
const navBg = document.querySelector("#dialog-bg");

const dialogSignin = document.querySelector("#dialog-signin");
const closeSignin = document.querySelector("#close-signin");
const signinForm = document.querySelector("#signin-form");
const signinEmail = document.querySelector("#signin-form-email");
const signinPassword = document.querySelector("#signin-form-password");
const signinMessage = document.querySelector("#signin-message");

const dialogSignup = document.querySelector("#dialog-signup");
const closeSignup = document.querySelector("#close-signup");
const signupForm = document.querySelector("#signup-form");
const signupname = document.querySelector("#signup-form-name");
const signupEmail = document.querySelector("#signup-form-email");
const signupPassword = document.querySelector("#signup-form-password");
const signupMessage = document.querySelector("#signup-message");

const homePage = document.querySelector("#nav-left");
homePage.addEventListener("click", function () {
    window.location.href = "/";
})

function showSignin() {
    navBg.style.display = "flex";
    dialogSignup.style.display = "none";
    dialogSignin.style.display = "flex";
    signinMessage.style.display = "none";
    signinMessage.textContent = "";
    signinEmail.value = "";
    signinPassword.value = "";
}

function showSignup() {
    navBg.style.display = "flex";
    dialogSignin.style.display = "none";
    dialogSignup.style.display = "flex";
    signupMessage.style.display = "none";
    signupname.value = "";
    signupEmail.value = "";
    signupPassword.value = "";
}

function closeDialog() {
    navBg.style.display = "none";
    dialogSignin.style.display = "none";
    dialogSignup.style.display = "none";
}


navSignin.addEventListener("click", function (event) {
    showSignin()
});

navSignup.addEventListener("click", function (event) {
    showSignup()
});

closeSignin.addEventListener("click", function () {
    closeDialog()
});
closeSignup.addEventListener("click", function () {
    closeDialog()
});






signinForm.addEventListener("submit", function (event) {
    event.preventDefault()
    const email = document.querySelector("#signin-form-email");
    const password = document.querySelector("#signin-form-password");
    const message = document.querySelector("#signin-message")
    const data = {
        "email": email.value,
        "password": password.value
    }
    fetch("/api/user/auth", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })
        .then((res) => res.json())
        .then(function (response) {
            if (response["error"] == true) {
                email.value = "";
                password.value = "";
                message.style.display = "flex";
                message.textContent = response["message"];
            } else {
                const token = response["token"];
                localStorage.setItem("TOKEN", token);
                alert("登入成功！")
                location.reload();
                checkJwt();
            }
        })
        .catch((error) => console.error("Error:", error))


})

signupForm.addEventListener("submit", function (event) {
    event.preventDefault()
    const name = document.querySelector("#signup-form-name");
    const email = document.querySelector("#signup-form-email");
    const password = document.querySelector("#signup-form-password");
    const message = document.querySelector("#signup-message")
    const data = {
        "name": name.value,
        "email": email.value,
        "password": password.value
    }
    fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })
        .then((res) => res.json())
        .then(function (response) {
            if (response["error"] == true) {
                name.value = "";
                email.value = "";
                password.value = "";
                message.style.display = "flex";
                message.textContent = response["message"]
            } else if (response["ok"] == true) {
                message.style.display = "flex";
                message.textContent = "註冊成功，請登入";
            }
        })
        .catch((error) => console.error("Error:", error))

})




async function checkJwt() {
    console.log("check JWT");
    const token = localStorage.getItem("TOKEN");
    if (token) {
        console.log("have token")
        fetch("/api/user/auth", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
            .then((response) => response.json())
            .then((data) => {
                if (data["data"]) {
                    console.log(data);
                    const signup = document.querySelector("#nav-signup");
                    const signin = document.querySelector("#nav-signin");
                    const signout = document.querySelector("#nav-signout");
                    signin.style.display = "none";
                    signup.style.display = "none";
                    signout.style.display = "flex";
                }
            })
            .catch((error) => console.log(error));
    } else {
        window.location.href = "/"
    }
}

function signout() {
    localStorage.removeItem("TOKEN");
    window.location.href = "/";
}


const footer = document.querySelector("footer");
footer.style.position = "relative"
footer.style.height = "80vh";


const path = window.location.search
const orderNumber = path.replace("?number=", "");


async function getOrderdata(orderNumber) {
    if (!orderNumber) {
        return false
    }
    const TOKEN = localStorage.getItem("TOKEN")
    fetch(`api/users/${orderNumber}`, {
        method: "GET",
        headers: {
            "Contest-Type": "application/json",
            "Authorization": `Bearer ${TOKEN}`
        }
    })
        .then((res) => res.json())
        .then((function (res) {
            console.log(res)
            let status = res.data.status
            let orderNumber = res.data.number
            renderOrder(status, orderNumber)
        }))
        .catch((error) => console.log(error))
}


function renderOrder(status, orderNumber) {
    const statusText = document.querySelector("#order-status");
    const orderNumberText = document.querySelector("#order-number");
    const orderDtail = document.querySelector("#order-detail")
    if (status == 1) {
        statusText.textContent = "行程預定成功"
        statusText.style.color = "#666666"
        orderDtail.textContent = "請記住此編號，或到會員中心查詢歷史訂單"

    }
    orderNumberText.textContent = orderNumber;
}


homePage.addEventListener("click", function () {
    window.location.href = "/";
})


checkJwt()
getOrderdata(orderNumber);



const navBook = document.querySelector("#nav-booking");


navBook.addEventListener("click", function (event) {
    event.preventDefault();
    const token = localStorage.getItem("TOKEN");
    if (token == null) {
        showSignin()
    } else {
        window.location.href = "/booking/"
    }
})