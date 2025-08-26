let imageInput = document.getElementById("imageInput");
let imageOverlay = document.getElementById("imageOverlay");
let overlayImage = document.getElementById("overlayImage");
let closeOverlay = document.getElementById("closeOverlay");
let changeOverlay = document.getElementById("changeOverlay");
let opacitySlider = document.getElementById("opacitySlider");

imageInput.addEventListener("change", handleImageSelect);
closeOverlay.addEventListener("click", hideOverlay);
changeOverlay.addEventListener("click", () => imageInput.click());
opacitySlider.addEventListener("input", updateOverlayOpacity);

function handleImageSelect(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(event) {
    overlayImage.src = event.target.result;
    imageOverlay.classList.remove("hidden");
    localStorage.setItem("overlayImage", event.target.result);
  };
  reader.readAsDataURL(file);
}

function hideOverlay() {
  imageOverlay.classList.add("hidden");
  imageInput.value = "";
  localStorage.removeItem("overlayImage");
}

function updateOverlayOpacity() {
  overlayImage.style.opacity = opacitySlider.value;
  localStorage.setItem("overlayOpacity", opacitySlider.value);
}

const savedImage = localStorage.getItem("overlayImage");
if (savedImage) {
  overlayImage.src = savedImage;
  imageOverlay.classList.remove("hidden");
}

const savedOpacity = localStorage.getItem("overlayOpacity");
if (savedOpacity) {
  opacitySlider.value = savedOpacity;
  overlayImage.style.opacity = savedOpacity;
}
