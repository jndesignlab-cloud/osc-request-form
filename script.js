/****************************************************
 * OSC SERVICE REQUEST FORM
 * Frontend Version: 1.1.0
 *
 * Adds live availability checking from the OSC Dashboard.
 ****************************************************/

const API_URL = 'https://script.google.com/macros/s/AKfycbx1zQFBhYR2FWf9oqDM7-Vs0ElDmiu1WhZe0zI_LqXm5x0qkkqvrnyHVFCs11JB9ukdOA/exec';
const FORM_STATUS_API_URL = 'https://script.google.com/macros/s/AKfycbx95aSPGw_UHjT6zgXaJ515rG4Su4l4gjAuZl0qkf3keOBop7AmRdTtcphkbjMpVa2iiA/exec';
const TRACKER_URL = 'https://bit.ly/OSC-MCR-Tracker';

const DEFAULT_CLOSED_MESSAGE =
  'We are not currently receiving requests as of now. Please check back later or contact the Office of Strategic Communications for assistance.';

const form = document.getElementById('requestForm');
const submitBtn = document.getElementById('submitBtn');
const formMessage = document.getElementById('formMessage');
const activityCard = document.getElementById('activityCard');
const serviceCard = document.getElementById('serviceCard');
const creativeCard = document.getElementById('creativeCard');
const requestTypeInputs = document.querySelectorAll('input[name="requestType"]');
const dateNeededInput = document.querySelector('input[name="dateNeeded"]');
const privacyModal = document.getElementById('privacyModal');
const privacyAgree = document.getElementById('privacyAgree');
const continueBtn = document.getElementById('continueBtn');
const successModal = document.getElementById('successModal');
const successRID = document.getElementById('successRID');
const newRequestBtn = document.getElementById('newRequestBtn');

let currentFormStatus = {
  enabled: true,
  message: DEFAULT_CLOSED_MESSAGE
};

const formStatusScreen = createFormStatusScreen();
checkFormAvailabilityOnLoad();

function showMessage(message, type) {
  formMessage.textContent = message;
  formMessage.className = 'form-message ' + (type || '');
}

function getCheckedValues(name) {
  return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
    .map((input) => input.value)
    .join(', ');
}

function setMinimumDate() {
  if (!dateNeededInput) return;

  const min = new Date();
  min.setDate(min.getDate() + 3);

  const yyyy = min.getFullYear();
  const mm = String(min.getMonth() + 1).padStart(2, '0');
  const dd = String(min.getDate()).padStart(2, '0');

  dateNeededInput.min = `${yyyy}-${mm}-${dd}`;
}

function handleRequestTypeChange(value) {
  activityCard.classList.add('hidden');
  serviceCard.classList.add('hidden');
  creativeCard.classList.remove('hidden');

  if (value === 'Activity-Based') {
    activityCard.classList.remove('hidden');
  }

  if (value === 'Service-Based') {
    serviceCard.classList.remove('hidden');
  }
}

if (privacyAgree && continueBtn && privacyModal) {
  privacyAgree.addEventListener('change', () => {
    continueBtn.disabled = !privacyAgree.checked;
  });

  continueBtn.addEventListener('click', () => {
    privacyModal.style.opacity = '0';
    privacyModal.style.pointerEvents = 'none';

    setTimeout(() => {
      privacyModal.style.display = 'none';
    }, 250);
  });
}

requestTypeInputs.forEach((input) => {
  input.addEventListener('change', () => {
    handleRequestTypeChange(input.value);
  });
});

if (newRequestBtn && successModal) {
  newRequestBtn.addEventListener('click', () => {
    successModal.classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  submitBtn.disabled = true;
  submitBtn.textContent = 'Checking availability...';
  showMessage('', '');

  try {
    const freshStatus = await getFormStatus();
    currentFormStatus = freshStatus;

    if (!freshStatus.enabled) {
      showClosedFormScreen(freshStatus.message);
      return;
    }

    submitBtn.textContent = 'Submitting...';

    const formData = new FormData(form);
    const requestType = formData.get('requestType');

    const purpose = requestType === 'Activity-Based'
      ? formData.get('activityTitle')
      : formData.get('serviceTitle');

    const description = requestType === 'Activity-Based'
      ? formData.get('activityDescription')
      : formData.get('serviceDescription');

    const caption = requestType === 'Activity-Based'
      ? formData.get('activityCaption')
      : formData.get('serviceCaption');

    const payload = {
      email: formData.get('email'),
      lastName: formData.get('lastName'),
      firstName: formData.get('firstName'),
      office: formData.get('office'),
      requestType,
      purpose,
      activityTitle: formData.get('activityTitle'),
      description,
      caption,
      startTime: formData.get('startTime'),
      endTime: formData.get('endTime'),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      where: formData.get('where'),
      who: formData.get('who'),
      sdg: getCheckedValues('sdg'),
      coreValue: getCheckedValues('coreValue'),
      proposal: formData.get('proposal'),
      request: getCheckedValues('request'),
      dateNeeded: formData.get('dateNeeded'),
      sizeDimensions: formData.get('sizeDimensions'),
      assetsDriveLink: formData.get('assetsDriveLink'),
      remarks: formData.get('remarks')
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Submission failed.');
    }

    successRID.textContent = result.requestID || 'RID000';
    successModal.classList.remove('hidden');

    form.reset();
    activityCard.classList.add('hidden');
    serviceCard.classList.add('hidden');
    creativeCard.classList.add('hidden');
  } catch (error) {
    console.error(error);
    showMessage(error.message || 'Something went wrong. Please try again.', 'error');
  } finally {
    if (currentFormStatus.enabled) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Request';
    }
  }
});

function checkFormAvailabilityOnLoad() {
  showFormStatusLoading();

  getFormStatus()
    .then((status) => {
      currentFormStatus = status;

      if (status.enabled) {
        hideFormStatusScreen();
      } else {
        showClosedFormScreen(status.message);
      }
    })
    .catch((error) => {
      console.warn('Unable to check form availability. Form will remain accessible.', error);
      hideFormStatusScreen();
    });
}

function getFormStatus() {
  return callFormStatusApi('getFormStatus').then((response) => {
    if (!response.success) {
      throw new Error(response.message || 'Unable to check form availability.');
    }

    return {
      enabled: Boolean(response.enabled),
      message: response.message || DEFAULT_CLOSED_MESSAGE
    };
  });
}

function callFormStatusApi(action) {
  return new Promise((resolve, reject) => {
    const callbackName = `oscFormStatus_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const script = document.createElement('script');
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('Form availability check timed out.'));
    }, 15000);

    const params = new URLSearchParams({
      action,
      callback: callbackName
    });

    window[callbackName] = (data) => {
      cleanup();
      resolve(data);
    };

    script.src = `${FORM_STATUS_API_URL}?${params.toString()}`;
    script.async = true;
    script.onerror = () => {
      cleanup();
      reject(new Error('Unable to connect to the form availability service.'));
    };

    function cleanup() {
      clearTimeout(timeout);
      delete window[callbackName];
      if (script.parentNode) script.parentNode.removeChild(script);
    }

    document.body.appendChild(script);
  });
}

function createFormStatusScreen() {
  const style = document.createElement('style');
  style.textContent = `
    .osc-form-status-screen {
      position: fixed;
      inset: 0;
      z-index: 999999;
      display: grid;
      place-items: center;
      padding: 22px;
      background: #f4f7fb;
      font-family: Inter, Arial, sans-serif;
    }

    .osc-form-status-card {
      width: min(520px, 100%);
      background: #ffffff;
      border: 1px solid #dfe6ee;
      border-radius: 24px;
      box-shadow: 0 18px 50px rgba(25, 39, 68, 0.12);
      padding: 34px 30px;
      text-align: center;
    }

    .osc-form-status-icon {
      width: 68px;
      height: 68px;
      margin: 0 auto 18px;
      border-radius: 22px;
      display: grid;
      place-items: center;
      background: #edf2fb;
      color: #263f77;
      font-size: 30px;
    }

    .osc-form-status-eyebrow {
      margin: 0 0 8px;
      color: #406f27;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: .08em;
      text-transform: uppercase;
    }

    .osc-form-status-card h1 {
      margin: 0 0 12px;
      color: #263f77;
      font-size: clamp(25px, 6vw, 34px);
      line-height: 1.15;
    }

    .osc-form-status-message {
      margin: 0 auto;
      max-width: 420px;
      color: #68788d;
      font-size: 15px;
      line-height: 1.7;
    }

    .osc-form-status-actions { margin-top: 24px; }

    .osc-form-status-actions a {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 46px;
      padding: 0 18px;
      border-radius: 999px;
      background: #263f77;
      color: #ffffff;
      font-size: 13px;
      font-weight: 800;
      text-decoration: none;
    }

    .osc-form-status-footer {
      margin: 22px 0 0;
      color: #8a98aa;
      font-size: 11px;
      line-height: 1.5;
    }

    .osc-form-status-loader {
      width: 34px;
      height: 34px;
      margin: 0 auto 18px;
      border: 3px solid #dfe6ee;
      border-top-color: #263f77;
      border-radius: 50%;
      animation: oscFormSpin .8s linear infinite;
    }

    @keyframes oscFormSpin { to { transform: rotate(360deg); } }
  `;

  document.head.appendChild(style);

  const screen = document.createElement('div');
  screen.id = 'oscFormStatusScreen';
  screen.className = 'osc-form-status-screen';
  screen.innerHTML = `
    <div class="osc-form-status-card">
      <div class="osc-form-status-loader"></div>
      <p class="osc-form-status-eyebrow">OSC Request System</p>
      <h1>Checking Form Availability</h1>
      <p class="osc-form-status-message">Please wait while we check whether the request form is currently accepting submissions.</p>
    </div>
  `;

  document.body.appendChild(screen);
  return screen;
}

function showFormStatusLoading() {
  formStatusScreen.style.display = 'grid';
  formStatusScreen.innerHTML = `
    <div class="osc-form-status-card">
      <div class="osc-form-status-loader"></div>
      <p class="osc-form-status-eyebrow">OSC Request System</p>
      <h1>Checking Form Availability</h1>
      <p class="osc-form-status-message">Please wait while we check whether the request form is currently accepting submissions.</p>
    </div>
  `;
}

function hideFormStatusScreen() {
  formStatusScreen.style.display = 'none';
}

function showClosedFormScreen(message) {
  currentFormStatus.enabled = false;

  if (privacyModal) privacyModal.style.display = 'none';
  if (successModal) successModal.classList.add('hidden');

  const main = document.querySelector('main.container');
  if (main) main.style.display = 'none';

  formStatusScreen.style.display = 'grid';
  formStatusScreen.innerHTML = `
    <div class="osc-form-status-card">
      <div class="osc-form-status-icon">⏸</div>
      <p class="osc-form-status-eyebrow">OSC Request System</p>
      <h1>Requests Temporarily Closed</h1>
      <p class="osc-form-status-message">${escapeStatusHtml(message || DEFAULT_CLOSED_MESSAGE)}</p>
      <div class="osc-form-status-actions">
        <a href="${TRACKER_URL}" target="_blank" rel="noopener noreferrer">Open Request Tracker</a>
      </div>
      <p class="osc-form-status-footer">Office of Strategic Communications · Panpacific University</p>
    </div>
  `;
}

function escapeStatusHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

setMinimumDate();
