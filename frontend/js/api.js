const API_BASE_URL = '/api';

async function fetchAPI(endpoint, options = {}) {
    if (!endpoint.startsWith('/')) {
        endpoint = '/' + endpoint;
    }
    if (!endpoint.endsWith('/')) {
        endpoint = endpoint + '/';
    }
    const defaultHeaders = {
        'Content-Type': 'application/json',
    };

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(errorBody.detail || 'Erreur réseau');
        }

        return await response.json();
    } catch (error) {
        console.error(`Fetch error on ${endpoint}:`, error);
        alert(`Erreur: ${error.message}`);
        throw error;
    }
}

// Utility functions for Modals
function openModal(id) {
    document.getElementById(id).style.display = "block";
}

function closeModal(id) {
    document.getElementById(id).style.display = "none";
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = "none";
    }
}

// Tabs
function openTab(evt, tabName) {
    let i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablink");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

// Format date
function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR');
}
