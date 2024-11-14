function viewPharmacist(pharmacistId) {
    window.location.href = "pharmacistUpdate.html?mode=view&pharmacistId=" + pharmacistId;
}

function editPharmacist(pharmacistId) {
    window.location.href = "pharmacistUpdate.html?mode=edit&pharmacistId=" + pharmacistId;
}

function deletePharmacist(pharmacistId) {
    window.location.href = "pharmacistUpdate.html?mode=delete&pharmacistId=" + pharmacistId;
}

function addPharmacist() {
    window.location.href = "pharmacistUpdate.html";
}

async function fetchData() {
    const mToken = localStorage.getItem('mAuthToken');

    if (!mToken) {
        alert('Session expired. Please log in again.');

            // Redirect to login page or prompt for login
            window.location.href = "mlogon.html";
    }

    const pharmacyCode = document.getElementById("pharmacyCode").value;
    const status = document.getElementById("statusSelection").value;;
    const term = document.getElementById("term").value;
    const errorContainer = document.getElementById("error");
    const tableBody = document.querySelector("#pharmacistTable tbody");

    tableBody.innerHTML = ''; // Clear previous results
    errorContainer.innerHTML = ''; // Clear any error messages

    if (!pharmacyCode) {
        errorContainer.textContent = "Please enter a pharmacy code.";
        return;
    }

    try {
        const queryParams = new URLSearchParams({
            pharmacyCode: pharmacyCode,
            status: status,
            term:term
        }).toString();

        const response = await fetch(config.apiPharmacistUrl+'?'+queryParams, {
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

        const pharmacistList = data.data.content.length ? data.data.content : [];

        if (pharmacistList.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5">No pharmacist found.</td></tr>';
            return;
        }

        // Populate table with pharmacist data
        pharmacistList.forEach(pharmacist => {
            const row = document.createElement('tr');
            row.innerHTML = `
                        <td>${pharmacist.firstName}   ${pharmacist.lastName}</td>
                        <td>${pharmacist.email}</td>
                        <td>${pharmacist.mobile}</td>
                        <td>${pharmacist.address1} <br> ${pharmacist.address2 || ''} </td>
                        <td>${pharmacist.postalCode}</td>
                        <td>${pharmacist.status}</td>
                        <td>
                            <button class='round-button'onclick=viewPharmacist('${pharmacist.pharmacistId}')>Detail</button>
                            <button class='round-button'onclick=editPharmacist('${pharmacist.pharmacistId}')>Edit</button>
                            <button class='round-button'onclick=deletePharmacist('${pharmacist.pharmacistId}')>Delete</button>
                        </td>
                    </td>
                    `;
            tableBody.appendChild(row);
        });

    } catch (error) {
        errorContainer.textContent = `Error: ${error.message}`;
    }
}

