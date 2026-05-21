const API_URL = "YOUR_APPS_SCRIPT_WEB_APP_URL";

const form = document.getElementById("requestForm");
const submitBtn = document.getElementById("submitBtn");
const formMessage = document.getElementById("formMessage");

function showMessage(message, type) {
  formMessage.textContent = message;
  formMessage.className = "form-message " + type;
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const base64 = reader.result.split(",")[1];

      resolve({
        name: file.name,
        type: file.type,
        data: base64
      });
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function filesToBase64(fileList) {
  const files = Array.from(fileList || []);
  return Promise.all(files.map(fileToBase64));
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting...";
  showMessage("", "");

  try {
    const formData = new FormData(form);

    const designPegFiles = await filesToBase64(document.getElementById("designPegFiles").files);
    const assetsFiles = await filesToBase64(document.getElementById("assetsFiles").files);

    const payload = {
      email: formData.get("email"),
      lastName: formData.get("lastName"),
      firstName: formData.get("firstName"),
      office: formData.get("office"),
      requestType: formData.get("requestType"),
      purpose: formData.get("purpose"),
      activityTitle: formData.get("activityTitle"),
      description: formData.get("description"),
      startTime: formData.get("startTime"),
      endTime: formData.get("endTime"),
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
      where: formData.get("where"),
      who: formData.get("who"),
      sdg: formData.get("sdg"),
      coreValue: formData.get("coreValue"),
      proposal: formData.get("proposal"),
      request: formData.get("request"),
      dateNeeded: formData.get("dateNeeded"),
      sizeDimensions: formData.get("sizeDimensions"),
      remarks: formData.get("remarks"),
      caption: formData.get("caption"),
      designPegFiles,
      assetsFiles
    };

    const response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.success) {
      showMessage("Request submitted successfully!", "success");
      form.reset();
    } else {
      showMessage(result.message || "Submission failed.", "error");
    }

  } catch (error) {
    console.error(error);
    showMessage("Something went wrong. Please try again.", "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Request";
  }
});