
        // Set default date values: today and today + 7 days
        const today = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        const nextWeekDate = nextWeek.toISOString().split('T')[0];

        document.getElementById('fromDate').value = today;
        document.getElementById('toDate').value = nextWeekDate;

        async function fetchJobs() {
            const mToken = localStorage.getItem('mAuthToken');
            
            if (!mToken) {
                alert('Session expired. Please log in again.');
                return;
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
                const response = await fetch(config.apiJobUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({'id':2, 'phamacyCode': pharmacyCode, 'startDate': fromDate, 'endDate': toDate }),
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

                const jobList = data.jobs.length ? data.jobs : [];

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
                        <td>${job.totalPaidHour}</td>
                        <td><b>${job.hourlyRate} / ${job.totalPaid}</td>
                        <td>${job.lunchArrangement}</td>
                        <td>${job.parkingOption}</td>
                        <td>${job.ratePerMile.toFixed(2)}</td>
                        <td>${job.address} <br> ${job.postalCode}</td>
                        <td>${job.status}</td>
                        <td><button class='round-button'onclick=editJob('${job.jobId}')>Edit</button></td>
                    `;
                    tableBody.appendChild(row);
                });

            } catch (error) {
                errorContainer.textContent = `Error: ${error.message}`;
            }
        }


	function editJob(jobID) {
            window.location.href = "editJob.html?jobID="+jobID;
	}