async function getAttrctionData(attractionId) {
    try {
        let response = await fetch(`/api/attraction/${attractionId}`);
        let data = await response.json();
        renderAttrction(data["data"]);
    }
    catch (error) {
        console.error("Error", error);
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
    price.textContent = "新台幣 2000 元"
});

afternoon.addEventListener("click", function () {
    price.textContent = "新台幣 2500 元"
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
            img.style.display = "block"
        } else {
            img.style.display = "none"
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

const dialogSignup = document.querySelector("#dialog-signup");
const closeSignup = document.querySelector("#close-signup");
const signupForm = document.querySelector("#signup-form");


function showSignin() {
    navBg.style.display = "flex";
    dialogSignup.style.display = "none";
    dialogSignin.style.display = "flex";
}

function showSignup() {
    navBg.style.display = "flex";
    dialogSignin.style.display = "none";
    dialogSignup.style.display = "flex";

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
    const email = document.querySelector("#signin-form-email").value;
    const password = document.querySelector("#signin-form-password").value;
    const data = {
        "email": email,
        "password": password
    }
    console.log(email)
    console.log(password)
    fetch("/api/user/auth", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })
        .then((res) => res.json())
        .then(function (response) {
            if (response["error"] == true) {
                const message = document.querySelector("#error-message")
                if (!message) {
                    const node = document.createElement("p");
                    node.textContent = response["message"];
                    node.id = "error-message";
                    node.style.color = "red";
                    signinForm.appendChild(node);
                }
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
    const name = document.querySelector("#signup-form-name").value;
    const email = document.querySelector("#signup-form-email").value;
    const password = document.querySelector("#signup-form-password").value;
    const data = {
        "name": name,
        "email": email,
        "password": password
    }
    fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })
        .then((res) => res.json())
        .then(function (response) {
            if (response["error"] == true) {
                const message = document.querySelector("#error-message")
                if (!message) {
                    const node = document.createElement("p");
                    node.textContent = response["message"];
                    node.id = "error-message";
                    node.style.color = "red";
                    signupForm.appendChild(node);
                }
            } else {
                const message = document.querySelector("#error-message")
                if (!message) {
                    const node = document.createElement("p");
                    node.textContent = "註冊成功，請登入";
                    node.id = "error-message";
                    node.style.color = "red";
                    signupForm.appendChild(node);
                }
                else {
                    message.textContent = "註冊成功，請登入";
                }
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
    location.reload()

}