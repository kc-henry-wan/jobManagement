function editBranch(branchId) {
    window.location.href = "branchUpdate.html?mode=edit&branchId=" + branchId;
}

function deleteBranch(branchId) {
    window.location.href = "branchUpdate.html?mode=delete&branchId=" + branchId;
}

function addBranch() {
    window.location.href = "branchUpdate.html";
}

async function fetchData() {
    const mToken = localStorage.getItem('mAuthToken');

    if (!mToken) {
        alert('Session expired. Please log in again.');
        return;
    }

    const pharmacyCode = document.getElementById("pharmacyCode").value;
    const status = document.getElementById("statusSelection").value;
    const errorContainer = document.getElementById("error");
    const tableBody = document.querySelector("#branchTable tbody");

    tableBody.innerHTML = ''; // Clear previous results
    errorContainer.innerHTML = ''; // Clear any error messages

    if (!pharmacyCode) {
        errorContainer.textContent = "Please enter a pharmacy code.";
        return;
    }

    try {
        const queryParams = new URLSearchParams({
            pharmacyCode: pharmacyCode,
            status: status
        }).toString();

        const response = await fetch(config.apiBranchUrl+'?'+queryParams, {
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

        const branchList = data.data.content.length ? data.data.content : [];

        if (branchList.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5">No branchs found.</td></tr>';
            return;
        }

        // Populate table with branch data
        branchList.forEach(branch => {
            const row = document.createElement('tr');
            row.innerHTML = `
                        <td>${branch.branchName}</td>
                        <td>${branch.address1} <br> ${branch.address2 || ''} </td>
                        <td>${branch.postalCode}</td>
                        <td>${branch.status}</td>
                        <td>
                            <button class='round-button'onclick=editBranch('${branch.branchId}')>Edit</button>
                            <button class='round-button'onclick=deleteBranch('${branch.branchId}')>Delete</button>
                        </td>
                    </td>
                    `;
            tableBody.appendChild(row);
        });

    } catch (error) {
        errorContainer.textContent = `Error: ${error.message}`;
    }
}

