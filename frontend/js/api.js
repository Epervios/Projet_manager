const API_BASE_URL = '/api';

async function fetchAPI(endpoint, options = {}) {
    if (!endpoint.startsWith('/')) {
        endpoint = '/' + endpoint;
    }
    if (!endpoint.endsWith('/')) {
        endpoint = endpoint + '/';
    }
    const token = localStorage.getItem('access_token');
    const defaultHeaders = {
        'Content-Type': 'application/json',
    };

    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        if (response.status === 401 || response.status === 403) {
            if (window.location.pathname !== '/login.html') {
                localStorage.removeItem('access_token');
                window.location.href = '/login.html';
                return;
            }
        }

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            throw new Error(errorBody.detail || 'Erreur réseau');
        }

        return await response.json();
    } catch (error) {
        console.error(`Fetch error on ${endpoint}:`, error);
        alert(`Erreur: ${error.message}`);
        throw error;
    }
}

// Authentication Check on Page Load
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname !== '/login.html') {
        const token = localStorage.getItem('access_token');
        if (!token) {
            window.location.href = '/login.html';
        }

        // Setup User Info & Logout
        const headerNav = document.querySelector('header nav');
        if (headerNav && !document.getElementById('logout-btn')) {
            const userName = localStorage.getItem('user_name') || 'User';
            const userRole = localStorage.getItem('user_role') || 'Lecteur';

            const userInfo = document.createElement('div');
            userInfo.style.marginLeft = 'auto';
            userInfo.style.display = 'flex';
            userInfo.style.alignItems = 'center';
            userInfo.innerHTML = `
                <span style="margin-right: 15px; color: var(--secondary-color);"><strong>${userName}</strong> (${userRole})</span>
                <button id="logout-btn" class="btn btn-sm btn-secondary">Déconnexion</button>
            `;

            const header = document.querySelector('header');
            header.appendChild(userInfo);

            document.getElementById('logout-btn').addEventListener('click', () => {
                localStorage.clear();
                window.location.href = '/login.html';
            });
        }

        // Hide elements for Readers
        const role = localStorage.getItem('user_role');
        if (role === 'Lecteur') {
            document.querySelectorAll('.btn-primary, .btn-success, .btn-danger, [onclick^="openModal"], [onclick^="openNew"], [onclick^="openEdit"], [onclick^="resetMilestone"], [onclick^="resetDecision"], [onclick^="resetMeeting"], [onclick^="resetTask"], [onclick^="resetDocument"]').forEach(el => {
                el.style.display = 'none';
            });
        }
    }
});

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
