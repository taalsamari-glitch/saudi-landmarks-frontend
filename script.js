document.addEventListener("DOMContentLoaded", () => {
  // ===== Upload Elements =====
  const uploadForm = document.getElementById("upload-form");
  const imageInput = document.getElementById("image-input");
  const previewWrapper = document.getElementById("preview");
  const previewImg = document.getElementById("preview-img");
  const errorBox = document.getElementById("error");
  const resultSection = document.getElementById("result");
  const landmarkNameSpan = document.getElementById("landmark-name");
  const landmarkDescP = document.getElementById("landmark-desc");
  const videoContainer = document.getElementById("video-container");

  // Show preview
  function showPreview(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImg.src = e.target.result;
      previewWrapper.classList.remove("hidden");
    };
    reader.readAsDataURL(file);
  }

  // Error helpers
  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.classList.remove("hidden");
  }
  function clearError() {
    errorBox.classList.add("hidden");
  }

  // Reset old result
  function resetResult() {
    resultSection.classList.add("hidden");
    landmarkNameSpan.textContent = "";
    landmarkDescP.textContent = "";
    videoContainer.innerHTML =
      "The generated video will appear here after the backend is connected.";
  }

  // ===== Upload Handler =====
  if (uploadForm) {
    uploadForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearError();
      resetResult();

      const file = imageInput.files[0];
      if (!file) return showError("Please select an image.");

      showPreview(file);

      const formData = new FormData();
      formData.append("image", file);

      // Replace with your backend URL
      const API_URL = "https://your-backend.com/api/classify-and-generate";

      try {
        const res = await fetch(API_URL, { method: "POST", body: formData });
        if (!res.ok) throw new Error();

        const data = await res.json();

        // Show text results
        landmarkNameSpan.textContent = data.landmark_name || "";
        landmarkDescP.textContent = data.description || "";

        // Show video
        if (data.video_url) {
          videoContainer.innerHTML = `
            <video controls class="w-full h-full rounded-2xl">
              <source src="${data.video_url}" type="video/mp4" />
            </video>
          `;
        }

        resultSection.classList.remove("hidden");
      } catch (err) {
        showError("Backend error. Try again.");
      }
    });
  }

  // ===== About Slider =====
  const slides = document.querySelectorAll(".about-slide");
  const dots = document.querySelectorAll(".about-dot");
  const prevBtn = document.getElementById("about-prev");
  const nextBtn = document.getElementById("about-next");

  if (slides.length > 0) {
    let index = 0;
    let auto = null;

    function show(i) {
      slides.forEach((s, n) => (s.style.opacity = n === i ? "1" : "0"));
      dots.forEach((d, n) => (d.style.opacity = n === i ? "1" : "0.5"));
      index = i;
    }

    function next() {
      show((index + 1) % slides.length);
    }

    function prev() {
      show((index - 1 + slides.length) % slides.length);
    }

    function start() {
      stop();
      auto = setInterval(next, 3500);
    }

    function stop() {
      if (auto) clearInterval(auto);
    }

    show(0);
    start();

    if (nextBtn) nextBtn.onclick = () => {
      next();
      start();
    };

    if (prevBtn) prevBtn.onclick = () => {
      prev();
      start();
    };
  }
});
