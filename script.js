const API_URL = "https://script.google.com/macros/s/AKfycbx1zQFBhYR2FWf9oqDM7-Vs0ElDmiu1WhZe0zI_LqXm5x0qkkqvrnyHVFCs11JB9ukdOA/exec";

/* ========================================
ELEMENTS
======================================== */

const form =
  document.getElementById("requestForm");

const submitBtn =
  document.getElementById("submitBtn");

const formMessage =
  document.getElementById("formMessage");

const activityCard =
  document.getElementById("activityCard");

const creativeCard =
  document.getElementById("creativeCard");

const requestTypeInputs =
  document.querySelectorAll(
    'input[name="requestType"]'
  );

const dateNeededInput =
  document.querySelector(
    'input[name="dateNeeded"]'
  );

/* ========================================
PRIVACY MODAL
======================================== */

const privacyModal =
  document.getElementById("privacyModal");

const privacyAgree =
  document.getElementById("privacyAgree");

const continueBtn =
  document.getElementById("continueBtn");

privacyAgree.addEventListener("change", () => {

  continueBtn.disabled =
    !privacyAgree.checked;

});

continueBtn.addEventListener("click", () => {

  privacyModal.style.opacity = "0";

  privacyModal.style.pointerEvents =
    "none";

  setTimeout(() => {

    privacyModal.style.display = "none";

  }, 250);

});

/* ========================================
SUCCESS MODAL
======================================== */

const successModal =
  document.getElementById("successModal");

const successRID =
  document.getElementById("successRID");

const newRequestBtn =
  document.getElementById("newRequestBtn");

newRequestBtn.addEventListener("click", () => {

  successModal.classList.add("hidden");

  window.scrollTo({

    top: 0,

    behavior: "smooth"

  });

});

/* ========================================
MESSAGES
======================================== */

function showMessage(message, type) {

  formMessage.textContent = message;

  formMessage.className =
    "form-message " + type;

}

/* ========================================
GET CHECKBOX VALUES
======================================== */

function getCheckedValues(name) {

  return Array.from(

    document.querySelectorAll(
      `input[name="${name}"]:checked`
    )

  )

  .map(input => input.value)

  .join(", ");

}

/* ========================================
MINIMUM DATE
======================================== */

function setMinimumDate() {

  const min = new Date();

  min.setDate(min.getDate() + 3);

  const yyyy =
    min.getFullYear();

  const mm =
    String(min.getMonth() + 1)
    .padStart(2, "0");

  const dd =
    String(min.getDate())
    .padStart(2, "0");

  dateNeededInput.min =
    `${yyyy}-${mm}-${dd}`;

}

/* ========================================
REQUEST TYPE HANDLER
======================================== */

function handleRequestTypeChange(value) {

  activityCard.classList.add("hidden");

  creativeCard.classList.remove("hidden");

  if (value === "Activity-Based") {

    activityCard.classList.remove("hidden");

  }

}

requestTypeInputs.forEach(input => {

  input.addEventListener("change", () => {

    handleRequestTypeChange(
      input.value
    );

  });

});

/* ========================================
FORM SUBMIT
======================================== */

form.addEventListener("submit", async (e) => {

  e.preventDefault();

  submitBtn.disabled = true;

  submitBtn.textContent =
    "Submitting...";

  showMessage("", "");

  try {

    const formData =
      new FormData(form);

    const requestType =
      formData.get("requestType");

    const payload = {

      email:
        formData.get("email"),

      lastName:
        formData.get("lastName"),

      firstName:
        formData.get("firstName"),

      office:
        formData.get("office"),

      requestType:
        requestType,

      activityTitle:
        formData.get("activityTitle"),

      description:
        formData.get("description"),

      startTime:
        formData.get("startTime"),

      endTime:
        formData.get("endTime"),

      startDate:
        formData.get("startDate"),

      endDate:
        formData.get("endDate"),

      where:
        formData.get("where"),

      who:
        formData.get("who"),

      coreValue:
        getCheckedValues("coreValue"),

      request:
        getCheckedValues("request"),

      dateNeeded:
        formData.get("dateNeeded"),

      sizeDimensions:
        formData.get("sizeDimensions"),

      assetsDriveLink:
        formData.get("assetsDriveLink"),

      remarks:
        formData.get("remarks")

    };

    const response =
      await fetch(API_URL, {

        method: "POST",

        body: JSON.stringify(payload)

      });

    const result =
      await response.json();

    if (result.success) {

      successRID.textContent =
        result.requestID || "RID000";

      successModal.classList.remove(
        "hidden"
      );

      form.reset();

      activityCard.classList.add(
        "hidden"
      );

      creativeCard.classList.add(
        "hidden"
      );

    }

    else {

      showMessage(

        result.message ||
        "Submission failed.",

        "error"

      );

    }

  }

  catch (error) {

    console.error(error);

    showMessage(

      "Something went wrong. Please try again.",

      "error"

    );

  }

  finally {

    submitBtn.disabled = false;

    submitBtn.textContent =
      "Submit Request";

  }

});

/* ========================================
INIT
======================================== */

setMinimumDate();
