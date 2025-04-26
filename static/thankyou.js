
let loadingTimeout;

function showLoading() {
    loadingTimeout = setTimeout(() => {
        document.getElementById("for-loading").style.display = "flex";
    }, 500);
}

function closeLoading() {
    clearTimeout(loadingTimeout);
    document.getElementById("for-loading").style.display = "none";
}

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


function showSignin() {
    signinMessage.textContent = "";
    signinEmail.value = "";
    signinPassword.value = "";
    signinMessage.style.display = "none";
    navBg.style.display = "flex";
    dialogSignup.classList.remove("show")
    dialogSignup.style.display = "none";
    dialogSignin.style.display = "flex";
    dialogSignin.classList.add("show");


}

function showSignup() {
    signupMessage.textContent = "";
    signupname.value = "";
    signupEmail.value = "";
    signupPassword.value = "";
    signupMessage.style.display = "none";

    navBg.style.display = "flex";
    dialogSignin.classList.remove("show")
    dialogSignin.style.display = "none";
    dialogSignup.style.display = "flex";
    dialogSignup.classList.add("show");

}

function closeDialog(item) {
    item.classList.remove("show");
    navBg.classList.remove("show");

    setTimeout(() => {
        item.style.display = "none";
        navBg.style.display = "none";
    }, 300);
}




navSignin.addEventListener("click", function () {
    showSignin()
});

navSignup.addEventListener("click", function () {
    showSignup()
});

closeSignin.addEventListener("click", function () {
    closeDialog(dialogSignin)
});
closeSignup.addEventListener("click", function () {
    closeDialog(dialogSignup)
});





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
    if (email.value.trim() === "" || password.value.trim() === "") {
        alert("資料不得為空");
        return;
    }
    message.textContent = "";
    const data = {
        "email": email.value,
        "password": password.value
    }
    showLoading()
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
        .finally(() => { closeLoading() })


})

signupForm.addEventListener("submit", function (event) {
    event.preventDefault()
    const name = document.querySelector("#signup-form-name");
    const email = document.querySelector("#signup-form-email");
    const password = document.querySelector("#signup-form-password");
    const message = document.querySelector("#signup-message")
    if (name.value.trim() === "" || email.value.trim() === "" || password.value.trim() === "") {
        alert("資料不得為空");
        return;
    }
    message.textContent = "";
    const data = {
        "name": name.value,
        "email": email.value,
        "password": password.value
    }
    showLoading()
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
        .finally(() => { closeLoading() })
})

async function checkJwt() {
    console.log("check JWT");
    const token = localStorage.getItem("TOKEN");
    if (token) {
        fetch("/api/user/auth", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
            .then((response) => response.json())
            .then((data) => {
                if (data["data"]) {
                    const signup = document.querySelector("#nav-signup");
                    const signin = document.querySelector("#nav-signin");
                    const memberCenter = document.querySelector("#member-center");
                    signin.style.display = "none";
                    signup.style.display = "none";
                    memberCenter.style.display = "flex";
                }
            })
            .catch((error) => console.log(error));
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
    showLoading()
    fetch(`api/users/${orderNumber}`, {
        method: "GET",
        headers: {
            "Contest-Type": "application/json",
            "Authorization": `Bearer ${TOKEN}`
        }
    })
        .then((res) => res.json())
        .then((function (res) {
            let status = res.data.status
            let orderNumber = res.data.number
            renderOrder(status, orderNumber)
        }))
        .catch((error) => console.log(error))
        .finally(() => { closeLoading() })
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


const homePage = document.querySelector("#nav-left");

homePage.addEventListener("click", function () {
    window.location.href = "/";
})
checkJwt()
getOrderdata(orderNumber);
window.addEventListener("DOMContentLoaded", () => {
    document.body.style.opacity = "1";
});

window.addEventListener("beforeunload", () => {
    document.body.style.opacity = "0";
});

window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
        document.body.style.opacity = "1";
    }
});


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