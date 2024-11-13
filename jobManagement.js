
// Set default date values: today and today + 7 days
const today = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
const nextWeek = new Date();
nextWeek.setDate(nextWeek.getDate() + 7);
const nextWeekDate = nextWeek.toISOString().split('T')[0];

document.getElementById('fromDate').value = today;
document.getElementById('toDate').value = nextWeekDate;

function viewJob(jobId) {
    window.location.href = "jobUpdate.html?mode=view&jobId=" + jobId;
}

function editJob(jobId) {
    window.location.href = "jobUpdate.html?mode=edit&jobId=" + jobId;
}

function deleteJob(jobId) {
    window.location.href = "jobUpdate.html?mode=delete&jobId=" + jobId;
}

function addJob() {
    window.location.href = "jobUpdate.html";
}

async function fetchJobs() {
    const mToken = localStorage.getItem('mAuthToken');

    if (!mToken) {
        alert('Session expired. Please log in again.');

            // Redirect to login page or prompt for login
            window.location.href = "mlogon.html";
    }

    const pharmacyCode = document.getElementById("pharmacyCode").value;
    const fromDate = document.getElementById("fromDate").value;
    const toDate = document.getElementById("toDate").value;
    const errorContainer = document.getElementById("error");
    const tableBody = document.querySelector("#jobTable tbody");

    tableBody.innerHTML = ''; // Clear previous results
    errorContainer.innerHTML = ''; // Clear any error messages

    if (!pharmacyCode) {
        errorContainer.textContent = "Please enter a pharmacy code.";
        return;
    }

    try {
        const queryParams = new URLSearchParams({
            pharmacyCode: pharmacyCode,
            startDate: fromDate,
            endDate: toDate
        }).toString();
        
        const response = await fetch(config.apiJobUrl+'?'+queryParams, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + mToken,
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (response.status === 403 || response.status === 401) {
            throw new Error('Session expired or unauthorized. Please log in again. status:' + response.status);
            localStorage.removeItem('mAuthToken');

            // Redirect to login page or prompt for login
            window.location.href = "mlogon.html";
        }

        const data = await response.json();

        if (data.status === 'error') {
            throw new Error(`Error Code: ${data.errorCode}`);
        }

        const jobList = data.data.content.length ? data.data.content : [];

        if (jobList.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="10">No jobs found for this pharmacy code and date range.</td></tr>';
            return;
        }

        // Populate table with job data
        jobList.forEach(job => {
            const row = document.createElement('tr');
            row.innerHTML = `
                        <td>${job.jobRef}</td>
                        <td>${job.branchName}</td>
                        <td>${job.jobDate} <br> ${job.jobStartTime} - ${job.jobEndTime}</td>
                        <td>${job.totalWorkHour}</td>
                        <td><b>${job.hourlyRate.toFixed(2)} / ${job.totalPaid.toFixed(2)}</td>
                        <td>${job.lunchArrangement || ''}</td>
                        <td>${job.parkingOption || ''}</td>
                        <td>${job.ratePerMile.toFixed(2)}</td>
                        <td>${job.branchAddress1} <br> ${job.branchAddress2 || ''} <br> ${job.branchPostalCode}</td>
                        <td>${job.status}</td>
                        <td>${job.pharmacistLastName || ''} ${job.pharmacistFirstName || ''}</td>
                        <td>
                            <button class='round-button'onclick=viewJob('${job.jobId}')>Detail</button>
                            <button class='round-button'onclick=editJob('${job.jobId}')>Edit</button>
                            <button class='round-button'onclick=deleteJob('${job.jobId}')>Delete</button>
                        </td>
                    </td>
                    `;
            tableBody.appendChild(row);
        });

    } catch (error) {
        errorContainer.textContent = `Error: ${error.message}`;
    }
}

