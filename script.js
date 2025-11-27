
document.addEventListener("DOMContentLoaded", () => {

  const uploadForm = document.getElementById("upload-form");
  const imageInput = document.getElementById("image-input");
  const preview = document.getElementById("preview");
  const previewImg = document.getElementById("preview-img");
  const errorMsg = document.getElementById("error");
  const resultBox = document.getElementById("result");
  const landmarkName = document.getElementById("landmark-name");
  const landmarkDesc = document.getElementById("landmark-desc");
  const videoContainer = document.getElementById("video-container");

  // When user selects an image → show preview
  imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      previewImg.src = e.target.result;
      preview.classList.remove("hidden");
    };
    reader.readAsDataURL(file);
  });

  // Send to backend
  uploadForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const file = imageInput.files[0];
    if (!file) {
      errorMsg.textContent = "Please select an image.";
      errorMsg.classList.remove("hidden");
      return;
    }

    errorMsg.classList.add("hidden");

    const formData = new FormData();
    formData.append("image", file);

    // ⚠️ IMPORTANT — Put your backend endpoint here
    const BACKEND_URL = "https://your-backend-url.com/upload";

    try {
      const res = await fetch(BACKEND_URL, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Backend error");

      const data = await res.json();

      // Example expected backend response:
      // { name: "Albalad – Jeddah", description: "...", videoUrl: "https://..." }

      landmarkName.textContent = data.name;
      landmarkDesc.textContent = data.description;

      // Display video
      videoContainer.innerHTML = `
        <video controls class="w-full h-full rounded-xl">
          <source src="${data.videoUrl}" type="video/mp4" />
          Your browser does not support video playback.
        </video>
      `;

      resultBox.classList.remove("hidden");

    } catch (err) {
      errorMsg.textContent = "Failed to connect to server.";
      errorMsg.classList.remove("hidden");
      console.error(err);
    }
  });

  // ==================================================
  // ABOUT US — AUTO SLIDER
  // ==================================================

  const slides = document.querySelectorAll(".about-slide");
  const dots = document.querySelectorAll(".about-dot");
  const prevBtn = document.getElementById("about-prev");
  const nextBtn = document.getElementById("about-next");

  if (slides.length > 0) {
    let currentIndex = 0;
    let autoplayId = null;

    function showSlide(index) {
      slides.forEach((slide, i) => {
        slide.style opacity = i === index ? "1" : "0";
      });
      dots.forEach((dot, i) => {
        dot.style.opacity = i === index ? "1" : "0.4";
      });
      currentIndex = index;
    }

    function nextSlide() {
      const nextIndex = (currentIndex + 1) % slides.length;
      showSlide(nextIndex);
    }

    function prevSlideFun() {
      const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
      showSlide(prevIndex);
    }

    function startAutoplay() {
      stopAutoplay();
      autoplayId = setInterval(nextSlide, 3500);
    }

    function stopAutoplay() {
      if (autoplayId) clearInterval(autoplayId);
    }

    showSlide(0);
    startAutoplay();

    nextBtn?.addEventListener("click", () => {
      nextSlide();
      startAutoplay();
    });

    prevBtn?.addEventListener("click", () => {
      prevSlideFun();
      startAutoplay();
    });
  }
});
