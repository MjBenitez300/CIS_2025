// Check login
const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
if (!loggedInUser) {
  alert("Please login first.");
  window.location.href = "index.html";
}

const recordsTable = document.getElementById("recordsTable");
const printBtn = document.getElementById("printBtn");
const exportBtn = document.getElementById("exportBtn");
const deleteAllBtn = document.getElementById("deleteAllBtn");
const backBtn = document.getElementById("backBtn");

backBtn.addEventListener("click", () => {
  window.location.href = "dashboard.html";
});

// Define all possible fields (employee fields first for full header)
const employeeExtraFields = [
  { id: "patientID", label: "Patient ID" },
  { id: "civilStatus", label: "Civil Status" },
  { id: "department", label: "Department" },
];
const commonFields = [
  { id: "patientName", label: "Patient Name" },
  { id: "patientAge", label: "Age" },
  { id: "sex", label: "Sex" },
  { id: "patientAddress", label: "Address" },
  { id: "walkInDate", label: "Walk-in Date" },
  { id: "chiefComplaint", label: "Chief Complaint" },
  { id: "history", label: "History of Past Illness" },
  { id: "medication", label: "Medication" },
];

const allFields = [...employeeExtraFields, ...commonFields];

// Load all patients (guest + employee) saved by logged-in user
function loadPatients() {
  const allPatients = JSON.parse(localStorage.getItem("patients")) || [];
  return allPatients.filter(p => p.savedBy === loggedInUser.username);
}

// Render header
function renderTableHeader() {
  recordsTable.innerHTML = "";
  const thead = recordsTable.createTHead();
  const row = thead.insertRow();

  allFields.forEach(f => {
    const th = document.createElement("th");
    th.textContent = f.label;
    row.appendChild(th);
  });

  ["Patient Type", "Timestamp", "Actions"].forEach(txt => {
    const th = document.createElement("th");
    th.textContent = txt;
    row.appendChild(th);
  });
}

// Render table rows
function renderRecords() {
  renderTableHeader();
  const patients = loadPatients();
  const tbody = recordsTable.createTBody();

  patients.forEach(p => {
    const row = tbody.insertRow();

    allFields.forEach(f => {
      const cell = row.insertCell();
      if (f.id === "sex") {
        cell.textContent = p.sex === "M" ? "Male" : p.sex === "F" ? "Female" : "";
      } else {
        cell.textContent = p[f.id] || "";
      }
    });

    // Patient type
    const cellType = row.insertCell();
    cellType.textContent = p.type.charAt(0).toUpperCase() + p.type.slice(1);

    // Timestamp
    const cellTimestamp = row.insertCell();
    cellTimestamp.textContent = p.timestamp || "";

    // Actions (Delete button)
    const cellActions = row.insertCell();
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.style.color = "red";
    delBtn.onclick = () => {
      if (confirm("Are you sure you want to delete this record?")) {
        deletePatient(p.id);
      }
    };
    cellActions.appendChild(delBtn);
  });
}

function deletePatient(id) {
  let allPatients = JSON.parse(localStorage.getItem("patients")) || [];
  allPatients = allPatients.filter(p => p.id !== id);
  localStorage.setItem("patients", JSON.stringify(allPatients));
  renderRecords();
}

deleteAllBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to delete ALL records?")) {
    let allPatients = JSON.parse(localStorage.getItem("patients")) || [];
    // Delete only records saved by logged in user
    allPatients = allPatients.filter(p => p.savedBy !== loggedInUser.username);
    localStorage.setItem("patients", JSON.stringify(allPatients));
    renderRecords();
  }
});

printBtn.addEventListener("click", () => {
  window.print();
});

exportBtn.addEventListener("click", () => {
  const patients = loadPatients();
  if (patients.length === 0) {
    alert("No records to export.");
    return;
  }

  // Prepare CSV headers
  const headers = [...allFields.map(f => f.label), "Patient Type", "Timestamp"];

  const rows = patients.map(p => {
    return [
      p.patientID || "",
      p.civilStatus || "",
      p.department || "",
      p.patientName || "",
      p.patientAge || "",
      p.sex === "M" ? "Male" : p.sex === "F" ? "Female" : "",
      p.patientAddress || "",
      p.walkInDate || "",
      p.chiefComplaint || "",
      p.history || "",
      p.medication || "",
      p.type.charAt(0).toUpperCase() + p.type.slice(1),
      p.timestamp || "",
    ];
  });

  let csvContent = headers.join(",") + "\n";
  rows.forEach(r => {
    csvContent += r.map(cell => `"${cell.replace(/"/g, '""')}"`).join(",") + "\n";
  });

  // Download CSV
  const blob = new Blob([csvContent], {type: "text/csv;charset=utf-8;"});
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "patient_records.csv";
  link.click();
});

renderRecords();
