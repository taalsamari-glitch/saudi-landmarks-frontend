// File: script.js

document.addEventListener("DOMContentLoaded", () => {
  // ===== API Configuration =====
  const API_BASE_URL = "http://127.0.0.1:8000/api/v1/landmarks"; // Assumes FastAPI is running on the same host/port

  // ===== Element References =====
  const uploadForm = document.getElementById("upload-form");
  const imageInput = document.getElementById("image-input");
  const previewWrapper = document.getElementById("preview");
  const previewImg = document.getElementById("preview-img");
  const errorBox = document.getElementById("error");
  const resultSection = document.getElementById("result");
  const landmarkNameSpan = document.getElementById("landmark-name");
  const landmarkDescP = document.getElementById("landmark-desc");
  const videoContainer = document.getElementById("video-container");

  // ===== Helper Functions =====

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

  // Reset old result and set initial loading state
  function resetAndShowLoading(name) {
    // Hide old results and errors
    resultSection.classList.add("hidden");
    clearError();

    // Show landmark info immediately
    if (landmarkNameSpan) landmarkNameSpan.textContent = name || "Recognizing...";
    if (landmarkDescP) landmarkDescP.textContent = "Fetching description...";

    // Set video container to a loading screen
    videoContainer.innerHTML = `
        <div class="flex flex-col items-center p-6 space-y-3">
            <svg class="animate-spin h-8 w-8 text-[#5B3A29]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="text-sm font-semibold text-[#5B3A29] animate-pulse">
                Generating ${name} story... (15-30 seconds wait)
            </p>
        </div>
    `;

    // Show the result section with the loading placeholder
    resultSection.classList.remove("hidden");
  }

  // Final display function
  function displayVideo(videoUrl) {
    videoContainer.innerHTML = `
        <video
            class="w-full h-full object-cover rounded-2xl"
            src="${videoUrl}"
            autoplay
            loop
            playsinline
        >
            Your browser does not support the video tag.
        </video>
    `;
    // If you need to manually display the description after polling:
    // landmarkDescP.textContent = "The full story is playing now!"; 
  }

  // ===== Polling Logic =====

  let currentPollingInterval = null;

  function stopPolling() {
    if (currentPollingInterval) {
      clearInterval(currentPollingInterval);
      currentPollingInterval = null;
    }
  }

  function startPolling(videoId, landmarkName) {
    stopPolling(); // Ensure any previous polling is stopped
    const interval = 3000; // Check every 3 seconds

    currentPollingInterval = setInterval(async () => {
      try {
        const statusResponse = await fetch(`${API_BASE_URL}/video-status/${videoId}`);
        const data = await statusResponse.json();
        const status = data.status;
        
        console.log(`Polling: Video ID ${videoId} status is ${status}`);

        if (status === 'done' && data.video_url) {
          // Success!
          stopPolling();
          displayVideo(data.video_url);

        } else if (status === 'failed') {
          // Failure!
          stopPolling();
          const errorMsg = data.error || "Generation failed due to a service error.";
          videoContainer.innerHTML = `<p class="text-red-600 text-sm p-4">${errorMsg}</p>`;
          
        } else {
          // Still processing. Keep the loading message.
        }
      } catch (error) {
        console.error('Polling connection error:', error);
        stopPolling();
        videoContainer.innerHTML = `<p class="text-red-600 text-sm p-4">Lost connection to status check API.</p>`;
      }
    }, interval);
  }


  // ===== Main Upload Handler (API Integration) =====
  if (uploadForm) {
    uploadForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      stopPolling(); // Stop any previous processes
      clearError();
      
      const file = imageInput.files[0];
      if (!file) {
        showError("Please select an image.");
        return;
      }

      showPreview(file);
      
      // 1. Prepare data and show initial loading state
      const formData = new FormData();
      formData.append("image", file);
      
      // Show generic landmark name while waiting for API
      resetAndShowLoading("Landmark"); 

      // 2. Call the starting endpoint
      try {
        const startResponse = await fetch(`${API_BASE_URL}/start-video-job`, {
          method: 'POST',
          body: formData,
        });

        // 202 ACCEPTED is the expected response for asynchronous job start
        if (startResponse.status === 202) {
          const data = await startResponse.json();
          
          // Update Landmark name and description text based on the initial response
          if (landmarkNameSpan) landmarkNameSpan.textContent = data.landmark_name;
          if (landmarkDescP) landmarkDescP.textContent = "Description and story text are being sent to the character for video synthesis...";

          // 3. Start the polling loop with the returned video ID
          startPolling(data.video_id, data.landmark_name);

        } else {
          // Handle other errors (400, 500, etc.)
          const errorData = await startResponse.json();
          showError(`API Error: ${errorData.detail || 'Could not start video job.'}`);
          videoContainer.innerHTML = `<p class="p-4">Error: See message above.</p>`;
          
        }
      } catch (error) {
        console.error('Submission error:', error);
        showError('Network error: Could not connect to the FastAPI server.');
        videoContainer.innerHTML = `<p class="p-4">Error: See message above.</p>`;
      }
    });
  }

  // ===== About slider (Slider remains unchanged) =====
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