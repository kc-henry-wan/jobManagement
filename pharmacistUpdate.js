
const pharmacistId = new URLSearchParams(window.location.search).get('pharmacistId');
const actionMode = new URLSearchParams(window.location.search).get('mode');

// Function to go back to the previous page
function goBack() {
    window.history.back();
}

// When the page loads, get the action from the URL and update the button label
window.onload = function () {
    const actionButton = document.getElementById('actionButton');
    const pageTitle = document.getElementById('pageTitle');

    if (actionMode.toUpperCase() === 'EDIT') {
        pageTitle.textContent = "Edit Pharmacist";
        actionButton.textContent = 'Submit';
    } else if (actionMode.toUpperCase() === 'DELETE') {
        pageTitle.textContent = "Delete Pharmacist";
        actionButton.textContent = 'Delete';
        document.querySelectorAll('input').forEach(input => {
            input.setAttribute('disabled', true);
        });
    } else {
        actionButton.hidden = true;
        document.querySelectorAll('input').forEach(input => {
            input.setAttribute('disabled', true);
        });
    }
};

document.addEventListener('DOMContentLoaded', function () {
    if (pharmacistId) {
        loadPharmacistData(pharmacistId);
        loadPharmacistImageList(pharmacistId);
    }

    document.getElementById('pharmacistForm').addEventListener('submit', handleFormSubmit);
});

async function loadPharmacistData(pharmacistId) {
    const mToken = localStorage.getItem('mAuthToken');
    const errorContainer = document.getElementById("error");
    errorContainer.innerHTML = ''; // Clear any error messages

    //                try {
    if (!mToken) {
        alert('Session expired. Please log in again.');
        return;
    }

    const response = await fetch(config.apiPharmacistDetailUrl + '?' + pharmacistId, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + mToken
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

    const responseBody = await response.json();

    if (responseBody.status === 'error') {
        throw new Error(`Error Code: ${responseBody.errorCode}`);
    }

    const pharmacistData = responseBody.data;

    Object.keys(pharmacistData).forEach(key => {
        const input = document.getElementById(key);
        if (input && pharmacistData[key] !== undefined && pharmacistData[key] !== null) {
            input.value = pharmacistData[key];
        }
    });

    //                } catch (error) {
    //                    errorContainer.textContent = 'Failed to load pharmacist data: ' + error;
    //                }
}

async function loadPharmacistImageList(pharmacistId) {
    const mToken = localStorage.getItem('mAuthToken');
    const errorContainer = document.getElementById("error");
    errorContainer.innerHTML = ''; // Clear any error messages

    //                try {
    if (!mToken) {
        alert('Session expired. Please log in again.');
        return;
    }

    const response = await fetch(config.apiPharmacistImageListUrl + '?' + pharmacistId, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + mToken
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

    const responseBody = await response.json();

    if (responseBody.status === 'error') {
        throw new Error(`Error Code: ${responseBody.errorCode}`);
    }

    const imageListData = responseBody.data;

    if (imageListData.length > 0) {
        displayImages(imageListData);
    }

    //                } catch (error) {
    //                    errorContainer.textContent = 'Failed to load pharmacist data: ' + error;
    //                }
}

// Display images using the viewImage API
function displayImages(imageListData) {
    const galleryContainer = document.querySelector('.gallery-container');

    imageListData.forEach(image => {

        const galleryItem = document.createElement('div');
        galleryItem.classList.add('gallery-item');

        // Create the image title
        const imageTitle = document.createElement('div');
        imageTitle.classList.add('image-title');
        imageTitle.textContent = image.imageType;

        // Create the thumbnail image
        const thumbnail = document.createElement('img');
        thumbnail.classList.add('thumbnail');
        thumbnail.src = config.apiPharmacistImageUrl + image.imageId;

        // Append the title and thumbnail to the gallery-item
        galleryItem.appendChild(imageTitle);
        galleryItem.appendChild(thumbnail);

        galleryContainer.appendChild(galleryItem);
    });
}

async function handleFormSubmit(event) {
    const mToken = localStorage.getItem('mAuthToken');
    const errorContainer = document.getElementById("error");
    errorContainer.innerHTML = ''; // Clear any error messages
    //                try {

    if (!mToken) {
        alert('Session expired. Please log in again.');
        return;
    }

    event.preventDefault();

    const pharmacistData = {
        id: 8,
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        mobile: document.getElementById('mobile').value,
        address1: document.getElementById('address1').value,
        address2: document.getElementById('address2').value,
        postalCode: document.getElementById('postalCode').value,
        updatedAt: document.getElementById('updatedAt').value
    };

    const method = pharmacistId ? 'POST' : 'POST';
    const url = pharmacistId ? config.apiPharmacistUpdateUrl + '?' + document.getElementById('pharmacistId').value : config.apiPharmacistAddUrl;

    const response = await fetch(url, {
        method: method,
        headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + mToken},
        body: JSON.stringify(pharmacistData)
    });

    if (response.ok) {
        alert('Pharmacist record has been saved successfully.');
        window.location.href = 'pharmacist.html';
    } else {
        alert('Failed to save pharmacist record.');
    }
    //                } catch (error) {
    //                    errorContainer.textContent = 'Failed to load pharmacist data: ' + error;
    //                }
}


document.querySelectorAll('.gallery-item').forEach(item => {
    const thumbnail = item.querySelector('.thumbnail');
    const fullImageSrc = thumbnail.getAttribute('src');
    const overlay = document.getElementById('image-overlay');
    const fullImage = document.getElementById('full-image');
    const closeBtn = document.getElementById('close-overlay');

    // Show the full image when clicking on the thumbnail
    thumbnail.addEventListener('click', () => {
        fullImage.src = fullImageSrc; // Set the full image source
        overlay.style.display = 'flex'; // Show the overlay
    });

    // Close the overlay when clicking on the close button
    closeBtn.addEventListener('click', () => {
        overlay.style.display = 'none'; // Hide the overlay
        fullImage.src = ''; // Clear the image source
    });

    // Close the overlay when clicking anywhere outside the image
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.style.display = 'none'; // Hide the overlay
            fullImage.src = ''; // Clear the image source
        }
    });
});
