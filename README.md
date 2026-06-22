# OSC Request Form Availability Update

Replace only `script.js` in the `jndesignlab-cloud/osc-request-form` repository.

The updated script:

- Checks the Dashboard Apps Script `getFormStatus` endpoint when the page opens
- Shows a full closed notice when submissions are disabled
- Checks again immediately before submission
- Keeps the current request form fields and submission endpoint

No `index.html` or `style.css` replacement is required.
