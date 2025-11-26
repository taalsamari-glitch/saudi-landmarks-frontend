document.addEventListener("DOMContentLoaded", () => {
  // ===== Upload elements =====
  const uploadForm = document.getElementById("upload-form");
  const imageInput = document.getElementById("image-input");
  const previewWrapper = document.getElementById("preview");
  const previewImg = document.getElementById("preview-img");
  const errorBox = document.getElementById("error");
  const resultSection = document.getElementById("result");
  const landmarkNameSpan = document.getElementById("landmark-name");
  const landmarkDescP = document.getElementById("landmark-desc");
  const videoContainer = document.getElementById("video-container");

  // Helper: show preview
  function showPreview(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImg.src = e.target.result;
      previewWrapper.classList.remove("hidden");
    };
    reader.readAsDataURL(file);
  }

  // Helpers: error
  function showError(msg) {
    if (!errorBox) return;
    errorBox.textContent = msg;
    errorBox.classList.remove("hidden");
  }
  function clearError() {
    if (!errorBox) return;
    errorBox.classList.add("hidden");
  }

  // Reset old result
  function resetResult() {
    if (resultSection) resultSection.classList.add("hidden");
    if (landmarkNameSpan) landmarkNameSpan.textContent = "";
    if (landmarkDescP) landmarkDescP.textContent = "";
    if (videoContainer) {
      videoContainer.innerHTML =
        "The generated video will appear here after the backend is connected.";
    }
  }

  // Convert normal YouTube URL to embed URL
  function getYouTubeEmbedUrl(url) {
  try {
    const u = new URL(url);
    let id = "";

    // youtu.be short link
    if (u.hostname.includes("youtu.be")) {
      id = u.pathname.slice(1);
    }
    // youtube.com/watch?v=xxxx
    else if (u.hostname.includes("youtube.com")) {
      id = u.searchParams.get("v") || "";
    }

    if (!id) return url;

    // clean embed with minimal branding
    return `https://www.youtube.com/embed/${id}?modestbranding=1&rel=0&showinfo=0&controls=1`;
  } catch {
    return url;
  }
}


  // ===== Upload handler =====
  if (uploadForm) {
  uploadForm.addEventListener("submit", (e) => {
    e.preventDefault();
    clearError();
    resetResult();

    const file = imageInput.files[0];
    if (!file) {
      showError("Please select an image.");
      return;
    }

    // Preview
    showPreview(file);

    // Mock response (test only)
    const data = {
      landmark_name: "Almasmak",
      description: "Historic district in Riyadh, known for its traditional buildings.",
      youtube_url: "https://www.youtube.com/watch?v=vDfGxQQ589sj7VfD"
    };

    // Text result
    if (landmarkNameSpan) {
      landmarkNameSpan.textContent = data.landmark_name;
    }
    if (landmarkDescP) {
      landmarkDescP.textContent = data.description;
    }

    // YouTube video
    if (videoContainer) {
      const embedUrl = getYouTubeEmbedUrl(data.youtube_url);
      videoContainer.innerHTML = `
        <iframe
          src="${embedUrl}"
          class="w-full h-full rounded-2xl"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      `;
    }

    if (resultSection) resultSection.classList.remove("hidden");
  });
}

  // ===== About slider (if you have slides) =====
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
