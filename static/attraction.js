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

    dots.forEach((dot, i) => {
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
});

signupForm.addEventListener("submit", function (event) {
    event.preventDefault()
});


