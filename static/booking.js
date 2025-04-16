

checkJwt()
getBooking()

async function getBooking() {
    const token = localStorage.getItem("TOKEN");
    fetch("/api/booking", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
    })
        .then((res) => res.json())
        .then((data) => {
            renderBooking(data["data"])
        })
        .catch((error) => console.log(error))
}


async function deleteBooking() {
    const token = localStorage.getItem("TOKEN");
    fetch("api/booking", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
    })
        .then((res) => res.json())
        .then((data) => {
            if (data["ok"]) {
                window.location.reload()
            }
        })
        .catch((error) => console.log(error))
}


function renderBooking(data) {
    console.log(data)
    if (!data) {
        const allSection = document.querySelectorAll("section");
        const allHr = document.querySelectorAll("hr");

        allSection.forEach((item) => item.remove())
        allHr.forEach(function (item) {
            if (item.id != "seperator") { item.remove() }
        })

        const noBooking = document.querySelector("#with-no-data");
        const footer = document.querySelector("footer");
        noBooking.style.display = "flex";
        footer.style.position = "relative"
        footer.style.height = "80vh";



    } else {
        const picture = document.querySelector("#booking-content-image");
        const name = document.querySelector("#booking-content-name");
        const date = document.querySelector("#booking-content-date");
        const time = document.querySelector("#booking-content-time");
        const addres = document.querySelector("#booking-content-address");
        const price = document.querySelector("#booking-content-price");
        const totalPrice = document.querySelector("#booking-total-price");

        picture.src = data["attraction"]["image"]
        name.textContent = data["attraction"]["name"]
        addres.textContent = data["attraction"]["address"]
        date.textContent = data["date"]
        price.textContent = data["price"]
        totalPrice.textContent = data["price"]
        if (data["time"] == "morning") {
            time.textContent = "早上九點到下午四點";
        } else if (data["time"] == "afternoon") {
            time.textContent = "下午兩點到晚上九點";
        }

    }

}


const deleteButton = document.querySelector("#booking-delete-button");


deleteButton.addEventListener("click", function (event) {
    event.preventDefault();
    deleteBooking();
})






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
    }
}

function signout() {
    localStorage.removeItem("TOKEN");
    window.location.href = "/";
}


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
                    const signout = document.querySelector("#nav-signout");
                    const username = document.querySelector("#booking-user-name")
                    username.textContent = data["data"]["name"];
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



