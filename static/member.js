
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
                    const signout = document.querySelector("#nav-signout");
                    const memberName = document.querySelector("#member-name");
                    const memberEmail = document.querySelector("#member-email");
                    memberEmail.value = data['data']['email']
                    memberName.value = data['data']['name']
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
    alert("你已成功登出！");
    window.location.href = "/";
}

const homePage = document.querySelector("#nav-left");

homePage.addEventListener("click", function () {
    window.location.href = "/";
})




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




async function fetchOrderData() {
    const token = localStorage.getItem("TOKEN");
    fetch("/api/member", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
    })
        .then((res) => res.json())
        .then((data) => {
            if (data["true"] == "ok") {
                renderOrder(data['data']);
            }
        })

}

async function loadUserdata() {
    const token = localStorage.getItem("TOKEN");
    fetch("/api/user/", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
    })
        .then((res) => res.json())
        .then((data) => {
            if (data["ok"] == true) {
                document.querySelector("#member-name").value = data['data'][0];
                document.querySelector("#member-email").value = data['data'][1];
            }
        })
}


async function getOrderDetail(orderNumber) {
    document.querySelector("#detail-container").style.display = "flex";
    let token = localStorage.getItem("TOKEN")
    fetch(`api/users/${orderNumber}`, {
        method: "GET",
        headers: {
            "Contest-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    })
        .then((res) => res.json())
        .then(((data) => {
            showOrderDetail(data["data"])
        }))
        .catch((error) => console.log(error))
}


function showOrderDetail(data) {
    const detailContainer = document.querySelector(".detail-container");

    document.querySelector("#detail-img").src = data["trip"]["attraction"]["image"];
    document.querySelector("#trip-name").textContent = data["trip"]["attraction"]["name"];
    document.querySelector("#trip-date").textContent = data["trip"]["date"];
    document.querySelector("#trip-time").textContent = data["trip"]["time"];
    document.querySelector("#trip-price").textContent = data["price"];

    document.querySelector("#detail-contact-name").textContent = data["contact"]["name"];
    document.querySelector("#detail-contact-email").textContent = data["contact"]["email"];
    document.querySelector("#detail-contact-phone").textContent = data["contact"]["phone"];




    return
}



function renderOrder(data) {
    const orderList = document.querySelector(".order-list");

    data.reverse().forEach(element => {
        let orderItem = document.createElement("tr");
        let orderNumber = document.createElement("td");
        let orderStatus = document.createElement("td");
        let orderlink = document.createElement("td");
        let link = document.createElement("a");

        orderNumber.classList.add('order-number');
        orderlink.classList.add('order-link');
        link.classList.add("order-detail")
        link.onclick = () => getOrderDetail(element["number"]);
        orderStatus.classList.add('order-status');
        orderItem.classList.add("order-item");
        orderItem.id = element["id"]

        orderNumber.textContent = element["number"];
        link.textContent = "點擊詳情"


        if (element["paid"] == 1) {
            orderStatus.textContent = "已付款"

        } else if (element["paid"] == 0) {
            orderStatus.textContent = "未付款"
            orderStatus.style.color = "#FF6363"

        }
        orderlink.appendChild(link);
        orderItem.appendChild(orderNumber);
        orderItem.appendChild(orderStatus);
        orderItem.appendChild(orderlink);
        orderList.appendChild(orderItem);

    });

}


const editButton = document.querySelector("#edit-button");
const checkContainer = document.querySelector('#check-container');
const reviseButton = document.querySelector("#revise-button");
const cancleButton = document.querySelector("#cancle-button");
const memberName = document.querySelector('#member-name');
const memberEmail = document.querySelector('#member-email');

editButton.addEventListener("click", function () {
    memberName.removeAttribute("disabled");
    memberEmail.removeAttribute("disabled");
    memberName.style.border = "#E8E8E8 1px solid";
    memberEmail.style.border = "#E8E8E8 1px solid";
    checkContainer.style.display = "flex";
})

cancleButton.addEventListener("click", function () {
    memberName.setAttribute("disabled", "true");;
    memberEmail.setAttribute("disabled", "true");
    memberName.style.border = "none";
    memberEmail.style.border = "none";
    checkContainer.style.display = "none";
})

reviseButton.addEventListener("click", function () {
    const token = localStorage.getItem("TOKEN")
    if (memberName.value.trim() == "" || memberEmail.value.trim() == "") {
        alert("資料不得為空")
        return
    }
    const data = {
        "name": memberName.value,
        "email": memberEmail.value,
    }
    console.log("revise")
    fetch("/api/user", {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
    })
        .then((res) => res.json())
        .then((data) => {
            console.log(data)
            if (data["ok"] == true) {
                alert("修改成功")
                window.location.reload()
            } else {
                alert("修改失敗！")
            }
        })
})


const detailButton = document.querySelector("#detail-button");

detailButton.addEventListener("click", function () {
    document.querySelector("#detail-container").style.display = "none";
})


const editPicture = document.querySelector("#edit-picture");
const uploadsPicture = document.getElementById("file-uploads");
const uploadsButton = document.querySelector("#uploads-button");
const uploadsCancle = document.querySelector("#uploads-cancle-button");
const uploadsPreview = document.querySelector("#uploads-preview");


editPicture.addEventListener("click", function () {
    document.querySelector("#uploads-container").style.display = "flex";
})

uploadsCancle.addEventListener("click", function () {
    document.querySelector("#uploads-container").style.display = "none";
    uploadsPicture.value = "";
    uploadsPreview.src = "";
    uploadsPreview.display = "none";
})




uploadsPicture.addEventListener("change", function () {
    const file = uploadsPicture.files[0];
    console.log(file)
    if (file) {
        const imageURL = URL.createObjectURL(file);
        uploadsPreview.src = imageURL;
        uploadsPreview.style.display = "block";
    }
});



uploadsButton.addEventListener("click", function () {
    const file = uploadsPicture.files[0];
    if (!file) {
        alert("尚未選擇相片");
        return;
    }

    const formData = new FormData();
    console.log(file)
    formData.append("photo", file);
    const token = localStorage.getItem("TOKEN");

    fetch("/api/uploads", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`
        },
        body: formData
    })
        .then(res => res.json())
        .then(data => {
            alert("圖片上傳成功！");
            console.log(data["path"]);
            document.querySelector("#uploads-container").style.display = "none";
            document.querySelector("#member-picture").style.backgroundImage = `url(${data["path"]})`

        })
        .catch(err => {
            alert("圖片上傳失敗");
            console.error(err);
        });
});


async function getUserImage() {
    const token = localStorage.getItem("TOKEN")
    fetch("/api/uploads", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        },
    })
        .then(res => res.json())
        .then(data => {
            if (data["data"]) {
                document.querySelector("#member-picture").style.backgroundImage = `url(${data["data"][2]})`
            }
        })
        .catch(err => {
            console.error(err);
        });

}

checkJwt()
fetchOrderData()
loadUserdata()
getUserImage()