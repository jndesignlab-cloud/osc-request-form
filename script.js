const API_URL = "https://script.google.com/macros/s/AKfycbx1zQFBhYR2FWf9oqDM7-Vs0ElDmiu1WhZe0zI_LqXm5x0qkkqvrnyHVFCs11JB9ukdOA/exec";

const form = document.getElementById("requestForm");
const submitBtn = document.getElementById("submitBtn");
const formMessage = document.getElementById("formMessage");

const activityCard = document.getElementById("activityCard");
const serviceCard = document.getElementById("serviceCard");
const creativeCard = document.getElementById("creativeCard");

const requestTypeInputs = document.querySelectorAll('input[name="requestType"]');
const dateNeededInputs = document.querySelectorAll(
  'input[name="dateNeeded"], input[name="dateNeededCreative"]'
);

function showMessage(message, type) {
  formMessage.textContent = message;
  formMessage.className = "form-message " + type;
}

function setMinimumDate() {
  const min = new Date();
  min.setDate(min.getDate() + 3);

  const yyyy = min.getFullYear();
  const mm = String(min.getMonth() + 1).padStart(2, "0");
  const dd = String(min.getDate()).padStart(2, "0");

  const minDate = `${yyyy}-${mm}-${dd}`;

  dateNeededInputs.forEach(input => {
    input.min = minDate;
  });
}

function handleRequestTypeChange(value) {
  activityCard.classList.add("hidden");
  serviceCard.classList.add("hidden");
  creativeCard.classList.remove("hidden");

  if (value === "Activity-Based") {
    activityCard.classList.remove("hidden");
  }

  if (value === "Service-Based") {
    serviceCard.classList.remove("hidden");
  }
}

requestTypeInputs.forEach(input => {
  input.addEventListener("change", () => {
    handleRequestTypeChange(input.value);
  });
});

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve({
        name: file.name,
        type: file.type,
        data: reader.result.split(",")[1]
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
    const requestType = formData.get("requestType");

    const designPegFiles = await filesToBase64(
      document.getElementById("designPegFiles").files
    );

    const dateNeeded =
      formData.get("dateNeededCreative") ||
      formData.get("dateNeeded");

    const description =
      requestType === "Activity-Based"
        ? formData.get("description")
        : formData.get("descriptionService");

    const who =
      requestType === "Activity-Based"
        ? formData.get("who")
        : formData.get("whoService");

    const payload = {
      email: formData.get("email"),
      lastName: formData.get("lastName"),
      firstName: formData.get("firstName"),
      office: formData.get("office"),
      requestType: requestType,
      purpose: formData.get("purpose") || formData.get("activityTitle"),
      activityTitle: formData.get("activityTitle"),
      description: description,
      startTime: formData.get("startTime"),
      endTime: formData.get("endTime"),
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
      where: formData.get("where"),
      who: who,
      sdg: formData.get("sdg"),
      coreValue: formData.get("coreValue"),
      proposal: formData.get("proposal"),
      request: formData.get("request"),
      requestedService: formData.get("requestedService"),
      dateNeeded: dateNeeded,
      sizeDimensions: formData.get("sizeDimensions"),
      remarks: formData.get("remarks"),
      caption: formData.get("caption"),
      assetsDriveLink: formData.get("assetsDriveLink"),
      designPegFiles: designPegFiles
    };

    const response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.success) {
      showMessage(`Request submitted successfully! Your Request ID is ${result.requestID}.`, "success");
      form.reset();
      activityCard.classList.add("hidden");
      serviceCard.classList.add("hidden");
      creativeCard.classList.add("hidden");
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

setMinimumDate();
