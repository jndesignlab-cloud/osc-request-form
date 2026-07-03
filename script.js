/****************************************************
 * OSC SERVICE REQUEST FORM
 * Frontend Version: 1.2.0
 *
 * Adds live availability checking from the OSC Dashboard.
 ****************************************************/

const API_URL =
  'https://script.google.com/macros/s/AKfycbxEunaJNRhC8Awsue_m90W6w4TLcKv7JReEAfFphr1Ar2sBdHOL120WmI7VWbWOzU7e/exec';

const FORM_STATUS_API_URL =
  'https://script.google.com/macros/s/AKfycbx95aSPGw_UHjT6zgXaJ515rG4Su4l4gjAuZl0qkf3keOBop7AmRdTtcphkbjMpVa2iiA/exec';

const TRACKER_URL = 'https://bit.ly/OSC-MCR-Tracker';

const DEFAULT_CLOSED_MESSAGE =
  'We are not currently receiving requests as of now. Please check back later or contact the Office of Strategic Communications for assistance.';

const form = document.getElementById('requestForm');
const submitBtn = document.getElementById('submitBtn');
const formMessage = document.getElementById('formMessage');
const activityCard = document.getElementById('activityCard');
const serviceCard = document.getElementById('serviceCard');
const creativeCard = document.getElementById('creativeCard');

const requestTypeInputs = document.querySelectorAll(
  'input[name="requestType"]'
);

const dateNeededInput = document.querySelector(
  'input[name="dateNeeded"]'
);

const privacyModal = document.getElementById('privacyModal');
const privacyAgree = document.getElementById('privacyAgree');
const continueBtn = document.getElementById('continueBtn');

const successModal = document.getElementById('successModal');
const successRID = document.getElementById('successRID');
const newRequestBtn = document.getElementById('newRequestBtn');

const requesterIdentity = {
  type: '',
  adviserName: '',
  adviserEmail: ''
};

const requesterGate = createRequesterGate();

let currentFormStatus = {
  enabled: true,
  message: DEFAULT_CLOSED_MESSAGE
};

const formStatusScreen = createFormStatusScreen();

checkFormAvailabilityOnLoad();

/****************************************************
 * EMPLOYEE / STUDENT WELCOME MODAL
 ****************************************************/

function createRequesterGate() {
  if (!privacyModal || !privacyAgree || !continueBtn || !form) {
    return null;
  }

  const style = document.createElement('style');

  style.textContent = `
    .osc-requester-gate {
      margin: 18px 0;
      padding: 18px;
      border: 1px solid #dfe6ee;
      border-radius: 18px;
      background: #f7f9fc;
      text-align: left;
      font-family: Inter, Arial, sans-serif;
    }

    .osc-requester-gate-title {
      margin: 0 0 6px;
      color: #263f77;
      font-size: 15px;
      font-weight: 800;
    }

    .osc-requester-gate-copy {
      margin: 0 0 14px;
      color: #68788d;
      font-size: 12px;
      line-height: 1.55;
    }

    .osc-requester-role-options {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }

    .osc-requester-role-option {
      position: relative;
      display: flex;
      align-items: center;
      gap: 9px;
      min-height: 46px;
      padding: 0 13px;
      border: 1px solid #d6deea;
      border-radius: 13px;
      background: #ffffff;
      color: #263f77;
      font-size: 13px;
      font-weight: 750;
      cursor: pointer;
    }

    .osc-requester-role-option:has(input:checked) {
      border-color: #406f27;
      box-shadow: 0 0 0 2px rgba(64, 111, 39, .12);
      background: #f4f9f1;
    }

    .osc-requester-role-option input {
      margin: 0;
      accent-color: #406f27;
    }

    .osc-adviser-fields {
      display: grid;
      gap: 12px;
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #dfe6ee;
    }

    .osc-adviser-fields.hidden {
      display: none;
    }

    .osc-adviser-field label {
      display: block;
      margin: 0 0 6px;
      color: #263f77;
      font-size: 12px;
      font-weight: 800;
    }

    .osc-adviser-field input {
      width: 100%;
      min-height: 44px;
      box-sizing: border-box;
      padding: 10px 12px;
      border: 1px solid #cfd9e5;
      border-radius: 12px;
      background: #ffffff;
      color: #172b4d;
      font: inherit;
      font-size: 13px;
      outline: none;
    }

    .osc-adviser-field input:focus {
      border-color: #263f77;
      box-shadow: 0 0 0 3px rgba(38, 63, 119, .10);
    }

    .osc-requester-gate-note {
      margin: 10px 0 0;
      color: #7b8798;
      font-size: 11px;
      line-height: 1.5;
    }

    @media (max-width: 520px) {
      .osc-requester-role-options {
        grid-template-columns: 1fr;
      }
    }
  `;

  document.head.appendChild(style);

  const section = document.createElement('section');

  section.className = 'osc-requester-gate';

  section.innerHTML = `
    <h3 class="osc-requester-gate-title">
      Who is submitting this request?
    </h3>

    <p class="osc-requester-gate-copy">
      Select whether you are a Panpacific University employee or student.
    </p>

    <div class="osc-requester-role-options">
      <label class="osc-requester-role-option">
        <input
          type="radio"
          name="modalRequesterType"
          value="Employee"
        >

        <span>Employee</span>
      </label>

      <label class="osc-requester-role-option">
        <input
          type="radio"
          name="modalRequesterType"
          value="Student"
        >

        <span>Student</span>
      </label>
    </div>

    <div class="osc-adviser-fields hidden">
      <div class="osc-adviser-field">
        <label for="modalAdviserName">
          Professor / Instructor / Adviser Name
        </label>

        <input
          id="modalAdviserName"
          type="text"
          autocomplete="name"
          placeholder="Enter the full name"
        >
      </div>

      <div class="osc-adviser-field">
        <label for="modalAdviserEmail">
          Professor / Instructor / Adviser Email
        </label>

        <input
          id="modalAdviserEmail"
          type="email"
          autocomplete="email"
          placeholder="name@panpacificu.edu.ph"
        >
      </div>
    </div>

    <p class="osc-requester-gate-note">
      Student requests require an adviser name and valid adviser email.
      The adviser will be CC’d on official request emails.
    </p>
  `;

  const privacyAnchor =
    privacyAgree.closest('label') ||
    privacyAgree.parentElement ||
    continueBtn;

  if (privacyAnchor && privacyAnchor.parentNode) {
    privacyAnchor.parentNode.insertBefore(
      section,
      privacyAnchor
    );
  } else {
    privacyModal.appendChild(section);
  }

  const roleInputs = section.querySelectorAll(
    'input[name="modalRequesterType"]'
  );

  const adviserFields = section.querySelector(
    '.osc-adviser-fields'
  );

  const adviserNameInput = section.querySelector(
    '#modalAdviserName'
  );

  const adviserEmailInput = section.querySelector(
    '#modalAdviserEmail'
  );

  const hiddenRequesterType =
    createHiddenFormField('requesterType');

  const hiddenAdviserName =
    createHiddenFormField('adviserName');

  const hiddenAdviserEmail =
    createHiddenFormField('adviserEmail');

  roleInputs.forEach((input) => {
    input.addEventListener('change', () => {
      requesterIdentity.type = input.value;

      const isStudent = input.value === 'Student';

      adviserFields.classList.toggle(
        'hidden',
        !isStudent
      );

      adviserNameInput.required = isStudent;
      adviserEmailInput.required = isStudent;

      if (!isStudent) {
        requesterIdentity.adviserName = '';
        requesterIdentity.adviserEmail = '';

        adviserNameInput.value = '';
        adviserEmailInput.value = '';
      }

      syncRequesterIdentityFields();
      updatePrivacyContinueState();
    });
  });

  adviserNameInput.addEventListener('input', () => {
    requesterIdentity.adviserName =
      adviserNameInput.value.trim();

    syncRequesterIdentityFields();
    updatePrivacyContinueState();
  });

  adviserEmailInput.addEventListener('input', () => {
    requesterIdentity.adviserEmail =
      adviserEmailInput.value.trim();

    syncRequesterIdentityFields();
    updatePrivacyContinueState();
  });

  function syncRequesterIdentityFields() {
    hiddenRequesterType.value =
      requesterIdentity.type;

    hiddenAdviserName.value =
      requesterIdentity.adviserName;

    hiddenAdviserEmail.value =
      requesterIdentity.adviserEmail;
  }

  return {
    section,
    roleInputs,
    adviserFields,
    adviserNameInput,
    adviserEmailInput,
    hiddenRequesterType,
    hiddenAdviserName,
    hiddenAdviserEmail,
    sync: syncRequesterIdentityFields
  };
}

function createHiddenFormField(name) {
  let input = form.querySelector(
    `input[name="${name}"]`
  );

  if (!input) {
    input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;

    form.appendChild(input);
  }

  return input;
}

function isValidEmailAddress(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    String(value || '').trim()
  );
}

function updatePrivacyContinueState() {
  if (!continueBtn || !privacyAgree) {
    return;
  }

  const hasRole =
    requesterIdentity.type === 'Employee' ||
    requesterIdentity.type === 'Student';

  const studentDetailsValid =
    requesterIdentity.type !== 'Student' ||
    (
      requesterIdentity.adviserName.length >= 2 &&
      isValidEmailAddress(
        requesterIdentity.adviserEmail
      )
    );

  continueBtn.disabled = !(
    privacyAgree.checked &&
    hasRole &&
    studentDetailsValid
  );
}

/****************************************************
 * GENERAL FORM FUNCTIONS
 ****************************************************/

function showMessage(message, type) {
  formMessage.textContent = message;

  formMessage.className =
    'form-message ' + (type || '');
}

function getCheckedValues(name) {
  return Array.from(
    document.querySelectorAll(
      `input[name="${name}"]:checked`
    )
  )
    .map((input) => input.value)
    .join(', ');
}

function setMinimumDate() {
  if (!dateNeededInput) {
    return;
  }

  const min = new Date();

  min.setDate(min.getDate() + 3);

  const yyyy = min.getFullYear();

  const mm = String(
    min.getMonth() + 1
  ).padStart(2, '0');

  const dd = String(
    min.getDate()
  ).padStart(2, '0');

  dateNeededInput.min =
    `${yyyy}-${mm}-${dd}`;
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

/****************************************************
 * WELCOME MODAL EVENTS
 ****************************************************/

if (
  privacyAgree &&
  continueBtn &&
  privacyModal
) {
  privacyAgree.addEventListener(
    'change',
    updatePrivacyContinueState
  );

  continueBtn.addEventListener('click', () => {
    updatePrivacyContinueState();

    if (continueBtn.disabled) {
      return;
    }

    if (
      requesterGate &&
      requesterGate.sync
    ) {
      requesterGate.sync();
    }

    privacyModal.style.opacity = '0';
    privacyModal.style.pointerEvents = 'none';

    setTimeout(() => {
      privacyModal.style.display = 'none';
    }, 250);
  });

  updatePrivacyContinueState();
}

/****************************************************
 * REQUEST TYPE EVENTS
 ****************************************************/

requestTypeInputs.forEach((input) => {
  input.addEventListener('change', () => {
    handleRequestTypeChange(input.value);
  });
});

/****************************************************
 * SUCCESS MODAL
 ****************************************************/

if (newRequestBtn && successModal) {
  newRequestBtn.addEventListener('click', () => {
    successModal.classList.add('hidden');

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/****************************************************
 * FORM SUBMISSION
 ****************************************************/

form.addEventListener(
  'submit',
  async (event) => {
    event.preventDefault();

    submitBtn.disabled = true;
    submitBtn.textContent =
      'Checking availability...';

    showMessage('', '');

    try {
      const freshStatus =
        await getFormStatus();

      currentFormStatus = freshStatus;

      if (!freshStatus.enabled) {
        showClosedFormScreen(
          freshStatus.message
        );

        return;
      }

      submitBtn.textContent =
        'Submitting...';

      const formData =
        new FormData(form);

      const requestType =
        formData.get('requestType');

      const purpose =
        requestType === 'Activity-Based'
          ? formData.get('activityTitle')
          : formData.get('serviceTitle');

      const description =
        requestType === 'Activity-Based'
          ? formData.get(
              'activityDescription'
            )
          : formData.get(
              'serviceDescription'
            );

      const caption =
        requestType === 'Activity-Based'
          ? formData.get('activityCaption')
          : formData.get('serviceCaption');

      const payload = {
        email: formData.get('email'),
        lastName: formData.get('lastName'),
        firstName: formData.get('firstName'),
        office: formData.get('office'),

        requesterType:
          requesterIdentity.type,

        adviserName:
          requesterIdentity.type ===
          'Student'
            ? requesterIdentity.adviserName
            : '',

        adviserEmail:
          requesterIdentity.type ===
          'Student'
            ? requesterIdentity.adviserEmail
            : '',

        requestType,
        purpose,

        activityTitle:
          formData.get('activityTitle'),

        description,
        caption,

        startTime:
          formData.get('startTime'),

        endTime:
          formData.get('endTime'),

        startDate:
          formData.get('startDate'),

        endDate:
          formData.get('endDate'),

        where:
          formData.get('where'),

        who:
          formData.get('who'),

        sdg:
          getCheckedValues('sdg'),

        coreValue:
          getCheckedValues('coreValue'),

        proposal:
          formData.get('proposal'),

        request:
          getCheckedValues('request'),

        dateNeeded:
          formData.get('dateNeeded'),

        sizeDimensions:
          formData.get('sizeDimensions'),

        assetsDriveLink:
          formData.get('assetsDriveLink'),

        remarks:
          formData.get('remarks')
      };

      const response = await fetch(
        API_URL,
        {
          method: 'POST',
          body: JSON.stringify(payload)
        }
      );

      const result =
        await response.json();

      if (!result.success) {
        throw new Error(
          result.message ||
          'Submission failed.'
        );
      }

      successRID.textContent =
        result.requestID || 'RID000';

      successModal.classList.remove(
        'hidden'
      );

      form.reset();

      activityCard.classList.add(
        'hidden'
      );

      serviceCard.classList.add(
        'hidden'
      );

      creativeCard.classList.add(
        'hidden'
      );
    } catch (error) {
      console.error(error);

      showMessage(
        error.message ||
          'Something went wrong. Please try again.',
        'error'
      );
    } finally {
      if (currentFormStatus.enabled) {
        submitBtn.disabled = false;
        submitBtn.textContent =
          'Submit Request';
      }
    }
  }
);

/****************************************************
 * FORM AVAILABILITY
 ****************************************************/

function checkFormAvailabilityOnLoad() {
  showFormStatusLoading();

  getFormStatus()
    .then((status) => {
      currentFormStatus = status;

      if (status.enabled) {
        hideFormStatusScreen();
      } else {
        showClosedFormScreen(
          status.message
        );
      }
    })
    .catch((error) => {
      console.warn(
        'Unable to check form availability. Form will remain accessible.',
        error
      );

      hideFormStatusScreen();
    });
}

function getFormStatus() {
  return callFormStatusApi(
    'getFormStatus'
  ).then((response) => {
    if (!response.success) {
      throw new Error(
        response.message ||
        'Unable to check form availability.'
      );
    }

    return {
      enabled: Boolean(
        response.enabled
      ),

      message:
        response.message ||
        DEFAULT_CLOSED_MESSAGE
    };
  });
}

function callFormStatusApi(action) {
  return new Promise(
    (resolve, reject) => {
      const callbackName =
        `oscFormStatus_${Date.now()}_${Math.floor(
          Math.random() * 100000
        )}`;

      const script =
        document.createElement('script');

      const timeout = setTimeout(() => {
        cleanup();

        reject(
          new Error(
            'Form availability check timed out.'
          )
        );
      }, 15000);

      const params =
        new URLSearchParams({
          action,
          callback: callbackName
        });

      window[callbackName] = (data) => {
        cleanup();
        resolve(data);
      };

      script.src =
        `${FORM_STATUS_API_URL}?${params.toString()}`;

      script.async = true;

      script.onerror = () => {
        cleanup();

        reject(
          new Error(
            'Unable to connect to the form availability service.'
          )
        );
      };

      function cleanup() {
        clearTimeout(timeout);

        delete window[callbackName];

        if (script.parentNode) {
          script.parentNode.removeChild(
            script
          );
        }
      }

      document.body.appendChild(script);
    }
  );
}

/****************************************************
 * FORM STATUS SCREEN
 ****************************************************/

function createFormStatusScreen() {
  const style =
    document.createElement('style');

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

    .osc-form-status-actions {
      margin-top: 24px;
    }

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

    @keyframes oscFormSpin {
      to {
        transform: rotate(360deg);
      }
    }
  `;

  document.head.appendChild(style);

  const screen =
    document.createElement('div');

  screen.id = 'oscFormStatusScreen';

  screen.className =
    'osc-form-status-screen';

  screen.innerHTML = `
    <div class="osc-form-status-card">
      <div class="osc-form-status-loader"></div>

      <p class="osc-form-status-eyebrow">
        OSC Request System
      </p>

      <h1>
        Checking Form Availability
      </h1>

      <p class="osc-form-status-message">
        Please wait while we check whether the request form is currently accepting submissions.
      </p>
    </div>
  `;

  document.body.appendChild(screen);

  return screen;
}

function showFormStatusLoading() {
  formStatusScreen.style.display =
    'grid';

  formStatusScreen.innerHTML = `
    <div class="osc-form-status-card">
      <div class="osc-form-status-loader"></div>

      <p class="osc-form-status-eyebrow">
        OSC Request System
      </p>

      <h1>
        Checking Form Availability
      </h1>

      <p class="osc-form-status-message">
        Please wait while we check whether the request form is currently accepting submissions.
      </p>
    </div>
  `;
}

function hideFormStatusScreen() {
  formStatusScreen.style.display =
    'none';
}

function showClosedFormScreen(message) {
  currentFormStatus.enabled = false;

  if (privacyModal) {
    privacyModal.style.display =
      'none';
  }

  if (successModal) {
    successModal.classList.add(
      'hidden'
    );
  }

  const main =
    document.querySelector(
      'main.container'
    );

  if (main) {
    main.style.display = 'none';
  }

  formStatusScreen.style.display =
    'grid';

  formStatusScreen.innerHTML = `
    <div class="osc-form-status-card">
      <div class="osc-form-status-icon">
        ⏸
      </div>

      <p class="osc-form-status-eyebrow">
        OSC Request System
      </p>

      <h1>
        Requests Temporarily Closed
      </h1>

      <p class="osc-form-status-message">
        ${escapeStatusHtml(
          message ||
          DEFAULT_CLOSED_MESSAGE
        )}
      </p>

      <div class="osc-form-status-actions">
        <a
          href="${TRACKER_URL}"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open Request Tracker
        </a>
      </div>

      <p class="osc-form-status-footer">
        Office of Strategic Communications · Panpacific University
      </p>
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
