function adjust(){
    var flexbox = document.getElementById("flexbox");
    var profile = document.getElementById("profile");
    if (profile.clientWidth / flexbox.clientWidth > 0.4) {
        flexbox.style.flexDirection = "column";
        profile.style.marginTop = "30px";
    }
}

document.onload = adjust();