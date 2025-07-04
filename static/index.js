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


async function loadsAttractionsWithoutKeyword(pageNumber) {

    try {
        showLoading();
        let response = await fetch(`/api/attractions?page=${pageNumber}`);
        let data = await response.json();
        let attractions = data["data"];
        page = data["nextPage"];
        let attractionList = document.querySelector("#attractions-list")
        for (let attraction of attractions) {
            renderAttraction(attraction, attractionList);
        }
    }
    catch (error) {
        console.error("Error", error);
    }
    finally {
        closeLoading();
    }
}

async function loadsAttractionsByKeyword(pageNumber, keywordString) {
    try {
        showLoading()
        let response = await fetch(`api/attractions?page=${pageNumber}&keyword=${keywordString}`);
        let data = await response.json();
        let attractions = data["data"];
        let attractionList = document.querySelector("#attractions-list")
        console.log(attractions);
        if (attractions.length !== 0) {
            page = data["nextPage"];
            for (let attraction of attractions) {
                renderAttraction(attraction, attractionList);
            }
        } else {
            alert("查無相關資料。")
        }

    }
    catch (error) {
        console.error("Error", error);
    }
    finally {
        closeLoading()
    }

}

async function loadsAttractionsByMrt(pageNumber, keywordString) {
    try {
        showLoading()

        let response = await fetch(`api/attractions?page=${pageNumber}&keyword=${keywordString}`);
        let data = await response.json();
        let attractions = data["data"];
        let attractionList = document.querySelector("#attractions-list")
        if (attractions.length !== 0) {
            page = data["nextPage"];
            for (let attraction of attractions) {
                if (attraction["mrt"] === keywordString) {
                    renderAttraction(attraction, attractionList);
                }
            }
        } else {
            alert("查無相關資料。")
        }

    }
    catch (error) {
        console.error("Error", error);
    }
    finally {
        closeLoading()

    }
}

async function loasdMrts() {
    try {
        let response = await fetch(`api/mrts`);
        let data = await response.json();
        let mrts = data["data"];

        let mrtsList = document.querySelector("#mrts-list")
        for (let mrt of mrts) {
            let mrtNode = document.createElement("li");
            mrtNode.className = "mrt-name";
            mrtNode.textContent = mrt;
            mrtsList.appendChild(mrtNode);
        }
    }
    catch (error) {
        console.error("Error", error);
    }
}



function clearAttraction() {
    let attractionList = document.querySelector("#attractions-list");
    while (attractionList.firstChild) {
        attractionList.removeChild(attractionList.firstChild);
    }
}

function renderAttraction(dict, node) {

    let category = document.createElement("div");
    category.className = "category";

    let attractionMrt = document.createElement("p");
    attractionMrt.className = "attraction-mrt";
    attractionMrt.textContent = dict["mrt"]

    let attractionCategory = document.createElement("div");
    attractionCategory.className = "attraction-category";
    attractionCategory.textContent = dict["category"]

    let attractionForName = document.createElement("div");
    attractionForName.className = "attraction-for-name";

    let attractionName = document.createElement("p")
    attractionName.className = "attraction-name";
    attractionName.textContent = dict["name"];


    let attractionImage = document.createElement("div");
    attractionImage.className = "attraction-images";
    attractionImage.style.backgroundImage = `url(${dict["images"][0]})`


    let attractionNode = document.createElement("div");
    attractionNode.className = "attraction";
    attractionNode.id = dict["id"];


    category.appendChild(attractionMrt);
    category.appendChild(attractionCategory);

    attractionForName.append(attractionName)
    attractionImage.append(attractionForName);


    attractionNode.appendChild(attractionImage);
    attractionNode.appendChild(category);


    node.appendChild(attractionNode);

}

function scrollPage(pageNumber) {
    if (isLoading) return;
    isLoading = true;
    const attractionList = document.querySelector("#attractions-list");
    const attractRect = attractionList.getBoundingClientRect();
    const buffer = 100;
    if (attractRect.bottom <= window.innerHeight + window.scrollY + buffer) {
        if (searchWay == "withoutKeyword") {
            console.log("page=" + pageNumber)
            loadsAttractionsWithoutKeyword(pageNumber).then(() => {
                isLoading = false;
            });
        } else if (searchWay == "keyword") {
            console.log("page=" + pageNumber)
            loadsAttractionsByKeyword(page, keyword).then(() => {
                isLoading = false;
            });
        } else if (searchWay == "mrt") {
            console.log("page=" + pageNumber)
            loadsAttractionsByMrt(page, keyword).then(() => {
                isLoading = false;
            });
        }
    } else {
        isLoading = false;
    }
}



let page;
let keyword;
let searchWay = "withoutKeyword";
let isLoading = false;
const searchForm = document.querySelector("#search-bar");
const searchKeyword = document.querySelector("#search-bar-input");
const leftArrow = document.querySelector("#arrow-left");
const rightArrow = document.querySelector("#arrow-right");
const mrtsForm = document.querySelector("#mrts-form");
const mrtsList = document.querySelector("#mrts-list");
const homePage = document.querySelector("#nav-left");


checkJwt()
loasdMrts();
loadsAttractionsWithoutKeyword(0);


homePage.addEventListener("click", function () {
    window.location.href = "/";
})


// reander attractions section

window.addEventListener("scroll", function () {
    if (page && !isLoading) {
        scrollPage(page)
    }
});


searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    keyword = searchKeyword.value;
    if (keyword) {
        searchWay = "keyword";
        page = 0;
        clearAttraction();
        loadsAttractionsByKeyword(page, keyword)
    } else {
        alert("請輸入景點名稱。")
    }
})


mrtsList.addEventListener("click", function (event) {
    if (event.target.classList.contains("mrt-name")) {
        keyword = event.target.textContent;
        page = 0;
        searchWay = "mrt";
        clearAttraction();
        loadsAttractionsByMrt(page, keyword);
    }
})




//  mrt move

rightArrow.addEventListener("mouseenter", function () {
    rightArrow.firstElementChild.style.backgroundImage = 'url("static/images/rightArrowHovered.png")'
})
rightArrow.addEventListener("mouseover", function () {
    rightArrow.firstElementChild.style.backgroundImage = 'url("static/images/rightArrowDefault.png")'
})

leftArrow.addEventListener("mouseenter", function () {
    leftArrow.firstElementChild.style.backgroundImage = 'url("static/images/leftArrowHovered.png")'
})
leftArrow.addEventListener("mouseover", function () {
    leftArrow.firstElementChild.style.backgroundImage = 'url("static/images/leftArrowDefault.png")'
})



rightArrow.addEventListener("click", function (event) {
    const mrts = document.querySelectorAll(".mrt-name");
    const lastMrt = mrts[mrts.length - 1];
    if (lastMrt.getBoundingClientRect().right >= mrtsForm.getBoundingClientRect().right) {
        mrts.forEach((element) => {
            let currentTransForm = element.style.transform;
            let transFormValue = 0;
            if (currentTransForm) {
                console.log("TRUE")
                console.log("currentTransForm :" + currentTransForm);
                currentTransForm = currentTransForm.replace("translateX(", "").replace("px)", "")
                console.log("currentTransForm :" + currentTransForm);
                currentTransForm = parseInt(currentTransForm);
            } else {
                console.log("False")
                currentTransForm = 0;
            }
            transFormValue = parseInt(currentTransForm - 50);
            element.style.transform = `translateX(${transFormValue}px)`;
        })
    } else {
        alert("資料到底")
    }
});

leftArrow.addEventListener("click", function (event) {
    console.log("right-arrow");
    const mrts = document.querySelectorAll(".mrt-name");
    const lastMrt = mrts[0];

    if (lastMrt.getBoundingClientRect().right <= mrtsForm.getBoundingClientRect().left) {
        mrts.forEach((element) => {
            let currentTransForm = element.style.transform;
            let transFormValue = 0;
            if (currentTransForm) {
                currentTransForm = currentTransForm.replace("translateX(", "").replace("px)", "")
                currentTransForm = parseInt(currentTransForm);
            } else {
                currentTransForm = 0;
            }
            transFormValue = parseInt(currentTransForm + 50);
            element.style.transform = `translateX(${transFormValue}px)`;
        });
    } else {
        alert("資料到底")
    }
});

// trans Attraction/id
let attractionId;
const attractionList = document.querySelector("#attractions-list");
attractionList.addEventListener("click", function (event) {
    attractionId = event.target.closest(".attraction").id;
    window.location.href = `attraction/${attractionId}`;
}
);


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
    location.reload()

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

