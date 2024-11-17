// public/app.js

// Event listeners for main buttons
document.getElementById('newPatientBtn').addEventListener('click', showNewPatientForm);
document.getElementById('searchRmBtn').addEventListener('click', showSearchRmForm);
document.getElementById('viewHistoryBtn').addEventListener('click', showExaminationHistory);

const contentDiv = document.getElementById('content');

function showNewPatientForm() {
  contentDiv.innerHTML = `
    <h2 class="text-xl font-bold mb-4">Register New Patient</h2>
    <form id="newPatientForm" class="space-y-4">
      <!-- Patient Information Fields -->
      <div>
        <label class="block">Name</label>
        <input type="text" id="name" class="border rounded w-full px-2 py-1" required>
      </div>
      <div>
        <label class="block">Medical Record Number (RM)</label>
        <input type="text" id="rm" class="border rounded w-full px-2 py-1" required>
      </div>
      <div>
        <label class="block">Weight (kg)</label>
        <input type="text" id="weight" class="border rounded w-full px-2 py-1" required>
      </div>
      <div>
        <label class="block">Height (cm)</label>
        <input type="text" id="height" class="border rounded w-full px-2 py-1" required>
      </div>
      <div>
        <label class="block">LVOT Diameter (cm)</label>
        <input type="text" id="lvotDiameter" class="border rounded w-full px-2 py-1" required>
      </div>
      <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded">Examine Now</button>
    </form>
  `;

  // Handle form submission
  document.getElementById('newPatientForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    // Retrieve form data
    const name = document.getElementById('name').value.trim();
    const rm = document.getElementById('rm').value.trim();
    const weight = parseLocaleNumber(document.getElementById('weight').value.trim());
    const height = parseLocaleNumber(document.getElementById('height').value.trim());
    const lvotDiameter = parseLocaleNumber(document.getElementById('lvotDiameter').value.trim());

    // Validate data
    if (!name || !rm || isNaN(weight) || isNaN(height) || isNaN(lvotDiameter)) {
      alert('Please fill in all required fields with valid data.');
      return;
    }

    // Check if RM exists
    try {
      const response = await fetch(`/api/patients/${rm}`);
      if (response.ok) {
        const patientData = await response.json();
        alert('Medical Record Number already exists. Retrieving existing patient data.');
        showPatientFormWithPrefilledData(patientData);
      } else {
        // Save new patient data
        const patientData = { name, rm, weight, height, lvotDiameter };
        await fetch('/api/patients', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(patientData)
        });
        // Proceed to hemodynamic parameter entry
        showHemodynamicForm(patientData);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });
}

function showPatientFormWithPrefilledData(patientData) {
  // Display patient form with prefilled data for editing
  contentDiv.innerHTML = `
    <h2 class="text-xl font-bold mb-4">Edit Patient Information</h2>
    <form id="editPatientForm" class="space-y-4">
      <!-- Prefilled Patient Information Fields -->
      <div>
        <label class="block">Name</label>
        <input type="text" id="name" class="border rounded w-full px-2 py-1" value="${patientData.name}" required>
      </div>
      <div>
        <label class="block">Medical Record Number (RM)</label>
        <input type="text" id="rm" class="border rounded w-full px-2 py-1" value="${patientData.rm}" required>
      </div>
      <div>
        <label class="block">Weight (kg)</label>
        <input type="text" id="weight" class="border rounded w-full px-2 py-1" value="${formatNumber(patientData.weight)}" required>
      </div>
      <div>
        <label class="block">Height (cm)</label>
        <input type="text" id="height" class="border rounded w-full px-2 py-1" value="${formatNumber(patientData.height)}" required>
      </div>
      <div>
        <label class="block">LVOT Diameter (cm)</label>
        <input type="text" id="lvotDiameter" class="border rounded w-full px-2 py-1" value="${formatNumber(patientData.lvotDiameter)}" required>
      </div>
      <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded">Examine Now</button>
    </form>
  `;

  // Handle form submission
  document.getElementById('editPatientForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    // Retrieve form data
    const name = document.getElementById('name').value.trim();
    const rm = document.getElementById('rm').value.trim();
    const weight = parseLocaleNumber(document.getElementById('weight').value.trim());
    const height = parseLocaleNumber(document.getElementById('height').value.trim());
    const lvotDiameter = parseLocaleNumber(document.getElementById('lvotDiameter').value.trim());

    // Validate data
    if (!name || !rm || isNaN(weight) || isNaN(height) || isNaN(lvotDiameter)) {
      alert('Please fill in all required fields with valid data.');
      return;
    }

    // Update patient data
    const patientData = { name, rm, weight, height, lvotDiameter };
    try {
      await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(patientData)
      });
      // Proceed to hemodynamic parameter entry
      showHemodynamicForm(patientData);
    } catch (error) {
      console.error('Error:', error);
    }
  });
}

function showSearchRmForm() {
  // Display RM search form
  contentDiv.innerHTML = `
    <h2 class="text-xl font-bold mb-4">Search Patient by RM</h2>
    <form id="searchRmForm" class="space-y-4">
      <div>
        <label class="block">Medical Record Number (RM)</label>
        <input type="text" id="rmSearch" class="border rounded w-full px-2 py-1" required>
      </div>
      <button type="submit" class="bg-green-500 text-white px-4 py-2 rounded">Search RM</button>
    </form>
  `;

  // Handle form submission
  document.getElementById('searchRmForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const rm = document.getElementById('rmSearch').value.trim();
    if (!rm) {
      alert('Please enter a Medical Record Number.');
      return;
    }

    try {
      const response = await fetch(`/api/patients/${rm}`);
      if (response.ok) {
        const patientData = await response.json();
        showPatientFormWithPrefilledData(patientData);
      } else {
        if (confirm('RM not found. Would you like to create a new patient?')) {
          showNewPatientForm();
          document.getElementById('rm').value = rm;
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });
}

async function showExaminationHistory() {
  try {
    const response = await fetch('/api/examinations');
    if (response.ok) {
      const examinations = await response.json();
      if (examinations.length > 0) {
        showHistoryWithoutRm(examinations);
      } else {
        alert('No examination history found.');
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

function showHistoryWithoutRm(examinations) {
  // Examinations are stored as an array; show the latest
  let currentIndex = 0;

  function renderExam(index) {
    const exam = examinations[index];
    if (!exam) {
      alert('No more records.');
      return;
    }
    contentDiv.innerHTML = `
      <h2 class="text-xl font-bold mb-4">Examination History</h2>
      <pre class="bg-gray-200 p-4 rounded">${exam.formattedOutput}</pre>
      <button id="copyBtn" class="bg-blue-500 text-white px-4 py-2 rounded">Copy to Clipboard</button>
      <div class="flex space-x-4 mt-4">
        <button id="prevBtn" class="bg-gray-500 text-white px-4 py-2 rounded">Previous</button>
        <button id="nextBtn" class="bg-gray-500 text-white px-4 py-2 rounded">Next</button>
      </div>
      <button id="backBtn" class="bg-red-500 text-white px-4 py-2 rounded mt-4">Back</button>
    `;

    // Handle Copy to Clipboard
    document.getElementById('copyBtn').addEventListener('click', function() {
      navigator.clipboard.writeText(exam.formattedOutput).then(function() {
        alert('Text copied to clipboard');
      }, function(err) {
        alert('Could not copy text: ', err);
      });
    });

    // Navigation buttons
    document.getElementById('prevBtn').addEventListener('click', function() {
      if (index < examinations.length - 1) {
        renderExam(index + 1);
      } else {
        alert('This is the oldest record.');
      }
    });

    document.getElementById('nextBtn').addEventListener('click', function() {
      if (index > 0) {
        renderExam(index - 1);
      } else {
        alert('This is the most recent record.');
      }
    });

    // Back button
    document.getElementById('backBtn').addEventListener('click', function() {
      // Return to main page
      contentDiv.innerHTML = '';
    });
  }

  renderExam(currentIndex);
}

function showHemodynamicForm(patientData) {
  // Display form for entering hemodynamic parameters
  contentDiv.innerHTML = `
    <h2 class="text-xl font-bold mb-4">Enter Hemodynamic Parameters</h2>
    <form id="hemodynamicForm" class="space-y-4">
      <!-- Fluid Balance Section -->
      <div>
        <label class="block">Urine Output (cc) (optional, comma-separated values)</label>
        <input type="text" id="urineOutput" class="border rounded w-full px-2 py-1">
      </div>
      <div>
        <label class="block">Urine Output Duration (hours)</label>
        <input type="text" id="urineDuration" class="border rounded w-full px-2 py-1">
      </div>
      <div>
        <label class="block">Fluid Balance (cc) (optional)</label>
        <input type="text" id="fluidBalance" class="border rounded w-full px-2 py-1">
      </div>
      <!-- Cardiac Hemodynamic Section -->
      <div>
        <label class="block">TDS (Systolic Blood Pressure) (mmHg)</label>
        <input type="text" id="tds" class="border rounded w-full px-2 py-1" required>
      </div>
      <div>
        <label class="block">TDD (Diastolic Blood Pressure) (mmHg)</label>
        <input type="text" id="tdd" class="border rounded w-full px-2 py-1" required>
      </div>
      <div>
        <label class="block">HR (Heart Rate) (bpm)</label>
        <input type="text" id="hr" class="border rounded w-full px-2 py-1" required>
      </div>
      <div>
        <label class="block">LVOT Diameter (cm)</label>
        <input type="text" id="lvotDiameter" class="border rounded w-full px-2 py-1" value="${formatNumber(patientData.lvotDiameter)}">
      </div>
      <div>
        <label class="block">LVOT VTI (cm)</label>
        <input type="text" id="lvotVti" class="border rounded w-full px-2 py-1" required>
      </div>
      <div>
        <label class="block">IVC Max (cm)</label>
        <input type="text" id="ivcMax" class="border rounded w-full px-2 py-1" required>
      </div>
      <div>
        <label class="block">IVC Min (cm)</label>
        <input type="text" id="ivcMin" class="border rounded w-full px-2 py-1" required>
      </div>
      <!-- Lung Parameter Section -->
      <div>
        <label class="block">Position</label>
        <select id="position" class="border rounded w-full px-2 py-1" required>
          <option value="">Select Position</option>
          <option value="Flat">Flat</option>
          <option value="45 degrees">45 degrees</option>
          <option value="Sitting">Sitting</option>
        </select>
      </div>
      <div>
        <label class="block">A Line</label>
        <div>
          <label><input type="radio" name="aLine" value="+"> +</label>
          <label><input type="radio" name="aLine" value="-"> -</label>
        </div>
      </div>
      <div>
        <label class="block">B Line > 3</label>
        <div>
          <label><input type="checkbox" name="bLine" value="bilateral"> Bilateral</label>
          <label><input type="checkbox" name="bLine" value="right lung"> Right Lung</label>
          <label><input type="checkbox" name="bLine" value="left lung"> Left Lung</label>
        </div>
      </div>
      <div>
        <label class="block">Right Pleural (cm)</label>
        <input type="text" id="rightPleural" class="border rounded w-full px-2 py-1" required>
      </div>
      <div>
        <label class="block">Left Pleural (cm)</label>
        <input type="text" id="leftPleural" class="border rounded w-full px-2 py-1" required>
      </div>
      <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded">Calculate and Save</button>
    </form>
  `;

  // Handle form submission
  document.getElementById('hemodynamicForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    // Collect data from the form
    let data = {
      // Use parseLocaleNumber to handle commas and dots
      urineOutput: document.getElementById('urineOutput').value.trim(),
      urineDuration: parseLocaleNumber(document.getElementById('urineDuration').value.trim()),
      fluidBalance: parseLocaleNumber(document.getElementById('fluidBalance').value.trim()),
      tds: parseLocaleNumber(document.getElementById('tds').value.trim()),
      tdd: parseLocaleNumber(document.getElementById('tdd').value.trim()),
      hr: parseLocaleNumber(document.getElementById('hr').value.trim()),
      lvotDiameter: parseLocaleNumber(document.getElementById('lvotDiameter').value.trim()),
      lvotVti: parseLocaleNumber(document.getElementById('lvotVti').value.trim()),
      ivcMax: parseLocaleNumber(document.getElementById('ivcMax').value.trim()),
      ivcMin: parseLocaleNumber(document.getElementById('ivcMin').value.trim()),
      position: document.getElementById('position').value,
      aLine: document.querySelector('input[name="aLine"]:checked') ? document.querySelector('input[name="aLine"]:checked').value : '',
      bLine: Array.from(document.querySelectorAll('input[name="bLine"]:checked')).map(cb => cb.value),
      rightPleural: parseLocaleNumber(document.getElementById('rightPleural').value.trim()),
      leftPleural: parseLocaleNumber(document.getElementById('leftPleural').value.trim()),
    };

    // Validations
    if (isNaN(data.tds) || isNaN(data.tdd) || isNaN(data.hr) || isNaN(data.lvotDiameter) || isNaN(data.lvotVti) || isNaN(data.ivcMax) || isNaN(data.ivcMin) || !data.position || isNaN(data.rightPleural) || isNaN(data.leftPleural)) {
      alert('Please fill in all required fields with valid data.');
      return;
    }

    if (data.urineOutput && isNaN(data.urineDuration)) {
      alert('Urine Output Duration is required when Urine Output is provided.');
      return;
    }

    // Perform calculations
    let calculations = performCalculations(data, patientData);

    // Generate formatted output
    let formattedOutput = generateFormattedOutput(data, calculations, patientData);

    // Save to examinations
    let examinationData = {
      timestamp: calculations.formattedDate,
      formattedOutput: formattedOutput
    };

    try {
      await fetch('/api/examinations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(examinationData)
      });
    } catch (error) {
      console.error('Error:', error);
    }

    // Display the result with Copy to Clipboard
    contentDiv.innerHTML = `
      <h2 class="text-xl font-bold mb-4">Examination Result</h2>
      <pre class="bg-gray-200 p-4 rounded">${formattedOutput}</pre>
      <button id="copyBtn" class="bg-blue-500 text-white px-4 py-2 rounded">Copy to Clipboard</button>
    `;

    // Handle Copy to Clipboard
    document.getElementById('copyBtn').addEventListener('click', function() {
      navigator.clipboard.writeText(formattedOutput).then(function() {
        alert('Text copied to clipboard');
      }, function(err) {
        alert('Could not copy text: ', err);
      });
    });
  });
}

// Function to parse numbers with commas or dots as decimal separators
function parseLocaleNumber(stringNumber) {
  if (!stringNumber) return NaN;
  // Replace commas with dots and remove any non-numeric characters except dot and minus sign
  var normalized = stringNumber.replace(/,/g, '.').replace(/[^0-9\.\-]/g, '');
  return parseFloat(normalized);
}

// Function to format numbers according to the specified rules
function formatNumber(number) {
  if (number % 1 === 0) {
    return number.toString();
  } else {
    return number.toFixed(2);
  }
}

function performCalculations(data, patientData) {
  // Implement the required formulas
  let calculations = {};

  // Urine Output per kgBW per hour
  if (data.urineOutput) {
    // Use commas as separators
    let urineOutputs = data.urineOutput.split(',').map(s => parseLocaleNumber(s.trim())).filter(n => !isNaN(n));
    let totalUrineOutput = urineOutputs.reduce((a, b) => a + b, 0);
    calculations.totalUrineOutput = formatNumber(totalUrineOutput);

    let urinePerKgPerHour = totalUrineOutput / patientData.weight / data.urineDuration;
    calculations.urinePerKgPerHour = formatNumber(urinePerKgPerHour);
  }

  calculations.fluidBalance = isNaN(data.fluidBalance) ? '0' : formatNumber(data.fluidBalance);

  // MAP
  let map = ((2 * data.tdd) + data.tds) / 3;
  calculations.map = formatNumber(map);

  // LV SV
  let lvSv = data.lvotVti * Math.pow(data.lvotDiameter, 2) * 0.785;
  calculations.lvSv = formatNumber(lvSv);

  // LV CO
  let lvCo = (lvSv * data.hr) / 1000;
  calculations.lvCo = formatNumber(lvCo);

  // IVC Collapsibility
  let ivcCollapsibility = ((data.ivcMax - data.ivcMin) / data.ivcMax) * 100;
  calculations.ivcCollapsibility = formatNumber(ivcCollapsibility);

  // eRAP
  let eRAP;
  if (data.ivcMax > 2.1 && ivcCollapsibility < 50) {
    eRAP = 20;
  } else if (data.ivcMax > 2.1 && ivcCollapsibility >= 50) {
    eRAP = 15;
  } else if (data.ivcMax >= 1.0 && data.ivcMax <= 2.1 && ivcCollapsibility < 50) {
    eRAP = 8;
  } else {
    eRAP = 3;
  }
  calculations.eRAP = formatNumber(eRAP);

  // SVR
  let svr = ((map - eRAP) / lvCo) * 80;
  calculations.svr = formatNumber(svr);

  // BSA
  let bsa = Math.sqrt((patientData.height * patientData.weight) / 3600);
  calculations.bsa = formatNumber(bsa);

  // Cardiac Index
  let ci = lvCo / bsa;
  calculations.ci = formatNumber(ci);

  // Cardiac Power Output
  let cpo = (lvCo * map) / 451;
  calculations.cpo = formatNumber(cpo);

  // Cardiac Power Index
  let cpi = cpo / bsa;
  calculations.cpi = formatNumber(cpi);

  // Pleural Effusion Estimation
  calculations.rightPleuralEffusion = formatNumber(data.rightPleural * 20);
  calculations.leftPleuralEffusion = formatNumber(data.leftPleural * 20);

  // Formatted Date
  let now = new Date();
  let formattedDate = now.getFullYear().toString() +
    ('0' + (now.getMonth() + 1)).slice(-2) +
    ('0' + now.getDate()).slice(-2) + '-' +
    ('0' + now.getHours()).slice(-2) +
    ('0' + now.getMinutes()).slice(-2);
  calculations.formattedDate = formattedDate;

  return calculations;
}

function generateFormattedOutput(data, calculations, patientData) {
  // Build the formatted text output
  let urineOutputSection = '';
  if (data.urineOutput) {
    urineOutputSection = `
Urine output:
${calculations.totalUrineOutput} / ${formatNumber(data.urineDuration)} jam (${calculations.urinePerKgPerHour} cc/kgBB/hour)
Fluid balance: ${calculations.fluidBalance} cc

`;
  } else {
    urineOutputSection = `
Urine output:
Data not provided
Fluid balance: ${calculations.fluidBalance} cc

`;
  }

  // Lung Ultrasound Section
  let lungUltrasoundSection = 'Lung Ultrasound\n';

  let aLine = data.aLine ? data.aLine : '-';
  lungUltrasoundSection += `A-Lines (${aLine}), `;

  let bLine = data.bLine.length > 0 ? '+' : '-';
  lungUltrasoundSection += `B-lines (${bLine})`;
  if (bLine === '+') {
    let locations = data.bLine.join(', ');
    lungUltrasoundSection += ` ${locations}`;
  }

  let effusionPositive = data.rightPleural > 0 || data.leftPleural > 0;
  lungUltrasoundSection += `, Efusi pleura (${effusionPositive ? '+' : '-'})`;
  if (effusionPositive) {
    let effusionLocations = [];
    if (data.rightPleural > 0) {
      effusionLocations.push(`right: ${calculations.rightPleuralEffusion} cc`);
    }
    if (data.leftPleural > 0) {
      effusionLocations.push(`left: ${calculations.leftPleuralEffusion} cc`);
    }
    lungUltrasoundSection += ` with estimation ${effusionLocations.join(', ')}`;
  }

  // Assemble the final output
  let output = `
${urineOutputSection}*Echo Hemodinamik ${patientData.name} RM ${patientData.rm} ${calculations.formattedDate}*
TD ${formatNumber(data.tds)} / ${formatNumber(data.tdd)} mmHg
MAP: ${calculations.map} mmHg
HR: ${formatNumber(data.hr)} bpm
LVOT diameter: ${formatNumber(data.lvotDiameter)} cm
LVOT VTI: ${formatNumber(data.lvotVti)} cm
LV SV: ${calculations.lvSv} ml
LV CO: ${calculations.lvCo} L/min
eRAP: ${calculations.eRAP} mmHg (${formatNumber(data.ivcMax)} / ${formatNumber(data.ivcMin)})
SVR: ${calculations.svr} dynes/sec.cm-5

BSA: ${calculations.bsa}
Cardiac Index: ${calculations.ci}
Cardiac Power Output: ${calculations.cpo}
Cardiac Power Index: ${calculations.cpi}

${lungUltrasoundSection}
`;
  return output.trim();
}
