        async function fetchJobs() {
            const mToken = localStorage.getItem('mAuthToken');
            
            if (!mToken) {
                alert('Session expired. Please log in again.');
                return;
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
                        'Authorization': mToken,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({'id':3, 'phamacyCode': pharmacyCode}),
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

                const jobList = data.jobs.length ? data.jobs : [];

                if (jobList.length === 0) {
                    tableBody.innerHTML = '<tr><td colspan="10">No jobs found for this pharmacy code and date range.</td></tr>';
                    return;
                }

                // Populate table with job data
                jobList.forEach(job => {
                    const row = document.createElement('tr');
                    const row2 = document.createElement('tr');
//                    row.innerHTML = `
//                        <td>${job.jobRef}</td>
//                        <td>${job.branchName}</td>
//                        <td>${job.jobDate} <br> ${job.jobStartTime} - ${job.jobEndTime}</td>
//                        <td>${job.totalPaidHour}</td>
//                        <td><b>${job.originalHourlyRate} / ${job.originalTotalPaid}</td>
//                        <td style=color:red><b>${job.purposedHourlyRate} / ${job.purposedTotalPaid}</td>
//                        <td style=color:green><b>${job.counterHourlyRate} / ${job.counterTotalPaid}</td>
//                        <td>${job.lunchArrangement}</td>
//                        <td>${job.ratePerMile.toFixed(2)}</td>
//                        <td>${job.address} <br> ${job.postalCode}</td>
//                        <td>${job.status}</td>
//                        <td>
//<button class='round-button'onclick=acceptJob('${job.jobRef}')>Accept</button>
//<button class='round-button'onclick=counterJob('${job.jobRef}')>Counter propose</button></td>
//                    `;
//                    tableBody.appendChild(row);
                    
                    const jobRefCell = document.createElement('td');
                    jobRefCell.textContent = job.jobRef;

                    const branchNameCell = document.createElement('td');
                    branchNameCell.textContent = job.branchName;

                    const jobDateCell = document.createElement('td');
                    jobDateCell.innerHTML = job.jobDate + '<br>' + job.jobStartTime + " - " + job.jobEndTime;
                    
                    const totalPaidHourCell = document.createElement('td');
                    totalPaidHourCell.textContent = job.totalPaidHour;

                    const originalCell = document.createElement('td');
                    originalCell.textContent = job.originalHourlyRate + " / " + job.originalTotalPaid;

                    const purposedCell = document.createElement('td');
                    purposedCell.classList.add('redText');
                    purposedCell.textContent = job.purposedHourlyRate + " / " + job.purposedTotalPaid;

                    const counterCell = document.createElement('td');
                    counterCell.classList.add('greenText');
                    counterCell.textContent = job.counterHourlyRate + " / " + job.counterTotalPaid;

                    const lunchArrangementCell = document.createElement('td');
                    lunchArrangementCell.textContent = job.lunchArrangement;

                    const parkingCell = document.createElement('td');
                    parkingCell.textContent = job.parkingOption;

                    const ratePerMileCell = document.createElement('td');
                    ratePerMileCell.textContent = job.ratePerMile.toFixed(2);

                    const addressCell = document.createElement('td');
                    addressCell.innerHTML = job.address + '<br>' + job.postalCode;
                    
                    const statusCell = document.createElement('td');
                    statusCell.textContent = job.status;
                    
                    const reasonCell = document.createElement('td');
                    reasonCell.classList.add('job-negotiate-reason');
                    reasonCell.innerHTML = '<b>Reason:</b><br>' + job.negReason;
                    
                    let actionButton; // Variable for the action button
                    switch (job.statusCode) {
                        case 'N':
                            actionButton = '<button class="round-button" onclick="acceptJob(' + job.jobId + ')">Accept</button><button class="round-button" onclick="counterJob(' + job.jobId + ')">Counter<br>propose</button>';
                            break;
//                        case 'A':
//                            actionButton = '<button class="round-button" onclick="counterJob(' + job.jobId + ')">View Detail</button>';
//                            break;
                        default:
                            actionButton = ''; // No button for other statuses
                    }
                    

                    // Create a new cell for the action button
                    const actionCell = document.createElement('td');
                    actionCell.rowSpan=2;
                    actionCell.innerHTML = actionButton; // Set innerHTML to add the button

                    // Append cells to the row
                    row.appendChild(jobRefCell);
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

                    reasonCell.colSpan=12;
                    row2.appendChild(reasonCell);
                    
                    // Append the row to the tbody
                    tableBody.appendChild(row);
                    tableBody.appendChild(row2);
                });

            } catch (error) {
                errorContainer.textContent = `Error: ${error.message}`;
            }
        }


	function editJob(jobId) {
            window.location.href = "editJob.html?jobId="+jobId;
	}
        function acceptJob(jobId) {
            window.location.href = "editJob.html?mode=accept&jobId="+jobId;
        }
        function counterJob(jobId) {
            window.location.href = "editJob.html?mode=counter&jobId="+jobId;
        }