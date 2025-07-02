
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



async function getAttrctionData(attractionId) {
    try {
        showLoading()
        let response = await fetch(`/api/attraction/${attractionId}`);
        let data = await response.json();
        renderAttrction(data["data"]);

    }
    catch (error) {
        console.error("Error", error);
    }
    finally {
        closeLoading()
    }
}


function renderAttrction(data) {
    document.querySelector("#content-title").textContent = data["name"];
    document.querySelector("#content-category-mrt").textContent = data["category"] + " at " + data["mrt"];
    document.querySelector("#attraction-detail").textContent = data["description"];
    document.querySelector("#attraction-address").textContent = data["address"]
    document.querySelector("#attraction-transport").textContent = data["transport"]
    imagesLoading(data["images"]);
}

function imagesLoading(imagesUrl) {
    const dotList = document.querySelector("#dot-list");
    const imageList = document.querySelector("#images-list");

    for (let index in imagesUrl) {
        let picture = document.createElement("img");
        picture.src = imagesUrl[index];
        picture.className = "images";
        picture.id = "image-" + [index];
        let dot = document.createElement("span");
        dot.id = "dot-" + [index];
        if (index == 0) {
            dot.className = "blackdot"
        } else { dot.className = "dot"; }

        imageList.appendChild(picture);
        dotList.appendChild(dot);

    }
    imageList.firstChild.classList.add("show");
}



const path = window.location.pathname;
const id = path.replace("/attraction/", "");
const price = document.querySelector("#price");
const morning = document.querySelector("#morning");
const afternoon = document.querySelector("#afternoon");
const homePage = document.querySelector("#nav-left");


checkJwt()
getAttrctionData(id)



homePage.addEventListener("click", function () {
    window.location.href = "/";
})




morning.addEventListener("click", function () {
    price.textContent = "2000"
});

afternoon.addEventListener("click", function () {
    price.textContent = "2500"
})


// calender
const time = document.querySelector('#time');
const calender = document.querySelector('#calender');

time.addEventListener('click', function () {
    this.showPicker();
});
calender.addEventListener('click', function () {
    time.showPicker();
});





// image carousel

const leftArrow = document.querySelector("#image-left");
const rightArrow = document.querySelector("#image-right");

let index = 0;

function showImage(imageIndex) {
    const dots = document.querySelectorAll(".dot, .blackdot");
    const images = document.querySelectorAll(".images");
    let length = images.length;

    if (imageIndex < 0) {
        index = length - 1;
    } else if (imageIndex >= length) {
        index = 0;
    } else {
        index = imageIndex;
    }
    images.forEach((img) => {
        if (img.id === `image-${index}`) {
            img.classList.add("show")
        } else {
            img.classList.remove("show")
        }
    });

    dots.forEach((dot) => {
        if (dot.id == `dot-${index}`) {
            dot.className = "blackdot"
        } else {
            dot.className = "dot";
        }
    });
}


leftArrow.addEventListener("click", function () {
    showImage(index - 1);
});


rightArrow.addEventListener("click", function () {
    showImage(index + 1);
});





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
    signinEmail.value = "test@test";
    signinPassword.value = "test";
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
        .finally(closeLoading())
})



async function checkJwt() {
    const token = localStorage.getItem("TOKEN");
    if (!token) { return }
    if (token) {
        fetch("/api/user/auth", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
            .then((response) => response.json())
            .then((data) => {
                if (data["message"]) {
                    localStorage.removeItem("TOKEN")
                }
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
    location.reload()

}



const bookButton = document.querySelector("#time-form-button");
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




bookButton.addEventListener("click", function (event) {
    event.preventDefault();
    const token = localStorage.getItem("TOKEN");
    if (!token) {
        showSignin()
    } else {
        let timeForTravel;
        if (!time.value) {
            alert("請選擇出遊日期")
        } else {
            if (morning.checked) {
                timeForTravel = "morning"
            }
            if (afternoon.checked) {
                timeForTravel = "afternoon"
            }
            const price = document.querySelector("#price").textContent;
            const data = {
                "attractionId": id,
                "date": time.value,
                "time": timeForTravel,
                "price": price,
            }
            fetch("/api/booking", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(data)
            })
                .then((res) => res.json())
                .then(function (res) {
                    console.log(res)
                    console.log(res["ok"])
                    if (res["ok"]) {
                        window.location.href = "/booking"
                    }
                })
                .catch((error) => console.log(error))

        }

    }
}
)

