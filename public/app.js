const API = "/api";
const $ = id => document.getElementById(id);
const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, ch => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[ch]));

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
}

function showMessage(id, message, isError = false) {
  $(id).textContent = message;
  $(id).style.color = isError ? "#be123c" : "#15803d";
}

async function loadJobs() {
  try {
    const jobs = await request("/jobs");
    $("jobCount").textContent = jobs.filter(job => job.isActive).length;
    $("jobsList").innerHTML = jobs.length ? jobs.map(job => `
      <article class="job-card">
        <h3>${escapeHtml(job.title)}</h3>
        <div class="company">${escapeHtml(job.companyName)} · ${escapeHtml(job.location)}</div>
        <p>${escapeHtml(job.description)}</p>
        <div>${(job.skills || []).map(skill => `<span class="tag">${escapeHtml(skill)}</span>`).join("")}</div>
        <p><b>${escapeHtml(job.employmentType)}</b> · ${escapeHtml(job.salary || "Not disclosed")} · ${job.applicationCount || 0} application(s)</p>
        <div class="job-actions">
          <button class="secondary" onclick="editJob('${job._id}')">Edit</button>
          <button class="danger" onclick="deleteJob('${job._id}')">Delete</button>
        </div>
      </article>`).join("") : '<p class="muted">No jobs added yet. Use the form above to create one.</p>';
    $("applicationJob").innerHTML = '<option value="">Choose a job</option>' +
      jobs.filter(job => job.isActive).map(job =>
        `<option value="${job._id}">${escapeHtml(job.title)} — ${escapeHtml(job.companyName)}</option>`
      ).join("");
  } catch (error) {
    $("jobsList").innerHTML = `<p class="muted">${escapeHtml(error.message)}</p>`;
  }
}

async function editJob(id) {
  try {
    const job = await request(`/jobs/${id}`);
    $("jobId").value = job._id;
    $("title").value = job.title;
    $("companyName").value = job.companyName;
    $("location").value = job.location;
    $("employmentType").value = job.employmentType;
    $("salary").value = job.salary || "";
    $("skills").value = (job.skills || []).join(", ");
    $("description").value = job.description;
    $("jobFormHeading").textContent = "Edit job";
    $("jobSubmit").textContent = "Update job";
    $("cancelEdit").hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) { showMessage("jobMessage", error.message, true); }
}

function resetJobForm() {
  $("jobForm").reset();
  $("jobId").value = "";
  $("jobFormHeading").textContent = "Add a job";
  $("jobSubmit").textContent = "Save job";
  $("cancelEdit").hidden = true;
}

async function deleteJob(id) {
  if (!confirm("Delete this job and all applications linked to it?")) return;
  try {
    await request(`/jobs/${id}`, { method: "DELETE" });
    showMessage("jobMessage", "Job deleted.");
    await Promise.all([loadJobs(), loadApplications()]);
  } catch (error) { showMessage("jobMessage", error.message, true); }
}

$("jobForm").addEventListener("submit", async event => {
  event.preventDefault();
  const id = $("jobId").value;
  const payload = {
    title: $("title").value.trim(),
    companyName: $("companyName").value.trim(),
    location: $("location").value.trim(),
    employmentType: $("employmentType").value,
    salary: $("salary").value.trim() || "Not disclosed",
    skills: $("skills").value.split(",").map(s => s.trim()).filter(Boolean),
    description: $("description").value.trim()
  };
  try {
    await request(id ? `/jobs/${id}` : "/jobs", {
      method: id ? "PUT" : "POST", body: JSON.stringify(payload)
    });
    resetJobForm();
    showMessage("jobMessage", id ? "Job updated successfully." : "Job created successfully.");
    await loadJobs();
  } catch (error) { showMessage("jobMessage", error.message, true); }
});
$("cancelEdit").addEventListener("click", resetJobForm);

$("applicationForm").addEventListener("submit", async event => {
  event.preventDefault();
  const payload = {
    job: $("applicationJob").value,
    applicantName: $("applicantName").value.trim(),
    email: $("email").value.trim(),
    phone: $("phone").value.trim(),
    resumeUrl: $("resumeUrl").value.trim(),
    coverLetter: $("coverLetter").value.trim()
  };
  try {
    await request("/applications", { method: "POST", body: JSON.stringify(payload) });
    $("applicationForm").reset();
    showMessage("applicationMessage", "Application submitted successfully.");
    await Promise.all([loadJobs(), loadApplications()]);
  } catch (error) { showMessage("applicationMessage", error.message, true); }
});

async function loadApplications() {
  try {
    const applications = await request("/applications");
    $("applicationCount").textContent = applications.length;
    $("applicationsList").innerHTML = applications.length ? applications.map(app => `
      <tr>
        <td>${escapeHtml(app.applicantName)}</td>
        <td>${escapeHtml(app.job?.title || "Job unavailable")}</td>
        <td>${escapeHtml(app.email)}</td>
        <td><select class="status-select" onchange="updateApplication('${app._id}', this.value)">
          ${["Applied","Under Review","Shortlisted","Rejected","Hired"].map(status =>
            `<option ${app.status === status ? "selected" : ""}>${status}</option>`).join("")}
        </select></td>
        <td><button class="danger" onclick="deleteApplication('${app._id}')">Delete</button></td>
      </tr>`).join("") : '<tr><td colspan="5" class="muted">No applications submitted yet.</td></tr>';
  } catch (error) {
    $("applicationsList").innerHTML = `<tr><td colspan="5">${escapeHtml(error.message)}</td></tr>`;
  }
}

async function updateApplication(id, status) {
  try {
    await request(`/applications/${id}`, { method: "PUT", body: JSON.stringify({ status }) });
    showMessage("applicationMessage", "Application status updated.");
  } catch (error) { showMessage("applicationMessage", error.message, true); }
}

async function deleteApplication(id) {
  if (!confirm("Delete this application?")) return;
  try {
    await request(`/applications/${id}`, { method: "DELETE" });
    await Promise.all([loadJobs(), loadApplications()]);
  } catch (error) { showMessage("applicationMessage", error.message, true); }
}

$("refreshJobs").addEventListener("click", loadJobs);
$("refreshApplications").addEventListener("click", loadApplications);
loadJobs();
loadApplications();
