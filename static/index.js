
async function loadsAttractionsWithoutKeyword(pageNumber) {
    try {
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
}

async function loadsAttractionsByKeyword(pageNumber, keywordString) {
    try {
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
}



async function loadsAttractionsByMrt(pageNumber, keywordString) {
    try {
        let response = await fetch(`api/attractions?page=${pageNumber}&keyword=${keywordString}`);
        let data = await response.json();
        let attractions = data["data"];
        let attractionList = document.querySelector("#attractions-list")
        console.log(attractions);
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
    console.log("clear attractions")
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
        console.log("mrts")
        console.log(keyword, page);
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
console.log(attractionList)
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