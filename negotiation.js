async function fetchJobs() {
    const mToken = localStorage.getItem('mAuthToken');

    if (!mToken) {
        alert('Session expired. Please log in again.');

            // Redirect to login page or prompt for login
            window.location.href = "mlogon.html";
    }

    const pharmacyCode = document.getElementById("pharmacyCode").value;
    const errorContainer = document.getElementById("error");
    const tableBody = document.querySelector("#jobTable tbody");

    tableBody.innerHTML = ''; // Clear previous results
    errorContainer.innerHTML = ''; // Clear any error messages

    try {
        const response = await fetch(config.apiNegJobUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + mToken,
            },
            body: JSON.stringify({'id': 3, 'phamacyCode': pharmacyCode}),
        });


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
            const row2 = document.createElement('tr');

            const jobRefCell = document.createElement('td');
            jobRefCell.textContent = job.jobRef;

            const jobPharmacistCell = document.createElement('td');
            jobPharmacistCell.textContent = job.pharmacistLastName + ' ' + job.pharmacistFirstName

            const branchNameCell = document.createElement('td');
            branchNameCell.textContent = job.branchName;

            const jobDateCell = document.createElement('td');
            jobDateCell.innerHTML = job.jobDate + '<br>' + job.jobStartTime + " - " + job.jobEndTime;

            const totalPaidHourCell = document.createElement('td');
            totalPaidHourCell.textContent = job.totalWorkHour;

            const originalCell = document.createElement('td');
            originalCell.textContent = job.originalHourlyRate.toFixed(2) + " / " + job.originalTotalPaid.toFixed(2);

            const purposedCell = document.createElement('td');
            purposedCell.classList.add('redText');
            purposedCell.textContent = (job.purposedHourlyRate != null ? job.purposedHourlyRate.toFixed(2) : "0.00") + " / " + (job.purposedTotalPaid != null ? job.purposedTotalPaid.toFixed(2) : "0.00");

            const counterCell = document.createElement('td');
            counterCell.classList.add('greenText');
            counterCell.textContent = (job.counterHourlyRate != null ? job.counterHourlyRate.toFixed(2) : "0.00") + " / " + (job.counterTotalPaid != null ? job.counterTotalPaid.toFixed(2) : "0.00");

            const lunchArrangementCell = document.createElement('td');
            lunchArrangementCell.textContent = job.lunchArrangement;

            const parkingCell = document.createElement('td');
            parkingCell.textContent = job.parkingOption;

            const ratePerMileCell = document.createElement('td');
            ratePerMileCell.textContent = job.ratePerMile.toFixed(2);

            const addressCell = document.createElement('td');
            addressCell.innerHTML = job.branchAddress1 + '<br>' + (job.branchAddress2 != null ? job.branchAddress2 : "") + '<br>' + job.branchPostalCode;

            const statusCell = document.createElement('td');
            statusCell.textContent = job.status;

            const reasonCell = document.createElement('td');
            reasonCell.classList.add('job-negotiate-reason');
            reasonCell.innerHTML = '<b>Reason:</b><br>' + job.reason;

            let actionButton; // Variable for the action button
            switch (job.status) {
                case 'New':
                    actionButton = '<button class="round-button" onclick="acceptNegotiate(' + job.negotiationId 
                            + ')">Accept</button><button class="round-button" onclick="editNegotiate(' + job.negotiationId 
                            + ')">Edit</button><button class="round-button" onclick="counterNegotiate(' + job.negotiationId 
                            + ')">Counter propose</button><button class="round-button" onclick="rejectNegotiate(' + job.negotiationId 
                            + ')">Reject</button>';
                    break;
                case 'Admin Accepted':
                case 'Counter Purposed':
                case 'Pharmacist Accepted':
                case 'Admin Rejected':
                case 'Job Picked by others':
                default:
                    actionButton = ''; // No button for other statuses
            }


            // Create a new cell for the action button
            const actionCell = document.createElement('td');
            actionCell.rowSpan = 2;
            actionCell.innerHTML = actionButton; // Set innerHTML to add the button

            // Append cells to the row
            row.appendChild(jobRefCell);
            row.appendChild(jobPharmacistCell);
            row.appendChild(branchNameCell);
            row.appendChild(jobDateCell);
            row.appendChild(totalPaidHourCell);
            row.appendChild(originalCell);
            row.appendChild(purposedCell);
            row.appendChild(counterCell);
            row.appendChild(lunchArrangementCell);
            row.appendChild(parkingCell);
            row.appendChild(ratePerMileCell);
            row.appendChild(addressCell);
            row.appendChild(statusCell);
            row.appendChild(actionCell); // Append the action cell to the row

            reasonCell.colSpan = 13;
            row2.appendChild(reasonCell);

            // Append the row to the tbody
            tableBody.appendChild(row);
            tableBody.appendChild(row2);
        });

    } catch (error) {
        errorContainer.textContent = `Error: ${error.message}`;
    }
}

function editNegotiate(negotiateId) {
    window.location.href = "negotiateUpdate.html?mode=Edit&negotiateId=" + negotiateId;
}
function acceptNegotiate(negotiateId) {
    window.location.href = "negotiateUpdate.html?mode=AdminAccept&negotiateId=" + negotiateId;
}
function rejectNegotiate(negotiateId) {
    window.location.href = "negotiateUpdate.html?mode=AdminReject&negotiateId=" + negotiateId;
}
function counterNegotiate(negotiateId) {
    window.location.href = "negotiateUpdate.html?mode=Counter&negotiateId=" + negotiateId;
}