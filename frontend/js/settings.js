document.addEventListener('DOMContentLoaded', async () => {
    // Protect access to Admin only
    const role = localStorage.getItem('user_role');
    if (role !== 'Administrateur') {
        alert("Accès refusé. Vous devez être Administrateur.");
        window.location.href = "/";
        return;
    }

    try {
        const config = await fetchAPI('/settings/db/');
        document.getElementById('db-path').value = config.path;
    } catch (err) {
        showAlert(err.message, 'danger');
    }

    // Load users if on users tab or just load them initially
    await loadUsers();
});

let allUsers = [];

async function loadUsers() {
    try {
        allUsers = await fetchAPI('/users/');
        renderUsers();
    } catch (err) {
        console.error("Error loading users", err);
    }
}

function renderUsers() {
    const tbody = document.getElementById('users-table-body');
    tbody.innerHTML = '';

    if (allUsers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;">Aucun utilisateur trouvé</td></tr>';
        return;
    }

    allUsers.forEach(u => {
        tbody.innerHTML += `
            <tr>
                <td><strong>${escapeHTML(u.username)}</strong></td>
                <td><span class="badge badge-secondary">${escapeHTML(u.role)}</span></td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick='openEditUserModal(${JSON.stringify(u)})'>Modifier</button>
                    <button class="btn btn-sm btn-danger" onclick='deleteUser(${u.id})'>Supprimer</button>
                </td>
            </tr>
        `;
    });
}

function openNewUserModal() {
    document.getElementById('user-form').reset();
    document.getElementById('u-id').value = '';
    document.getElementById('u-password').required = true;
    document.getElementById('pwd-help').style.display = 'none';
    document.getElementById('modal-title-user').innerText = 'Nouvel Utilisateur';
    openModal('user-modal');
}

function openEditUserModal(user) {
    document.getElementById('user-form').reset();
    document.getElementById('u-id').value = user.id;
    document.getElementById('u-username').value = user.username;
    document.getElementById('u-role').value = user.role;
    document.getElementById('u-password').required = false;
    document.getElementById('pwd-help').style.display = 'block';
    document.getElementById('modal-title-user').innerText = 'Modifier Utilisateur';
    openModal('user-modal');
}

document.getElementById('user-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('u-id').value;
    const payload = {
        username: document.getElementById('u-username').value,
        role: document.getElementById('u-role').value
    };

    const pwd = document.getElementById('u-password').value;
    if (pwd) {
        payload.password = pwd;
    }

    try {
        if (id) {
            await fetchAPI(`/users/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
            showAlert('Utilisateur modifié avec succès', 'success');
        } else {
            await fetchAPI('/users/', { method: 'POST', body: JSON.stringify(payload) });
            showAlert('Utilisateur créé avec succès', 'success');
        }
        closeModal('user-modal');
        await loadUsers();
    } catch (err) {
        showAlert(err.message, 'danger');
    }
});

async function deleteUser(id) {
    if(confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) {
        try {
            await fetchAPI(`/users/${id}`, { method: 'DELETE' });
            showAlert('Utilisateur supprimé', 'success');
            await loadUsers();
        } catch (err) {
            showAlert(err.message, 'danger');
        }
    }
}

function showAlert(message, type) {
    const alertBox = document.getElementById('alert-msg');
    alertBox.textContent = message;
    alertBox.className = `alert alert-${type}`;
    alertBox.style.display = 'block';

    setTimeout(() => { alertBox.style.display = 'none'; }, 5000);
}

async function testConnection() {
    const path = document.getElementById('db-path').value;
    try {
        const res = await fetchAPI('/settings/db/test/', {
            method: 'POST',
            body: JSON.stringify({ path: path })
        });
        showAlert(res.message, 'success');
    } catch (err) {
        showAlert(err.message, 'danger');
    }
}

async function initializeDB() {
    const path = document.getElementById('db-path').value;
    if (!confirm(`Voulez-vous vraiment initialiser la base sur le chemin suivant ?\n${path}\nSi la base existe déjà, elle ne sera pas écrasée mais les tables manquantes seront créées.`)) {
        return;
    }

    try {
        const res = await fetchAPI('/settings/db/init/', {
            method: 'POST',
            body: JSON.stringify({ path: path })
        });
        showAlert(res.message, 'success');
    } catch (err) {
        showAlert(err.message, 'danger');
    }
}

document.getElementById('db-settings-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const path = document.getElementById('db-path').value;

    try {
        const res = await fetchAPI('/settings/db/', {
            method: 'PUT',
            body: JSON.stringify({ path: path })
        });
        showAlert(res.message, 'success');

        // Notify user about restart
        alert("Configuration sauvegardée.\nIMPORTANT : Vous devez redémarrer manuellement le serveur backend (FastAPI) pour que le nouveau chemin soit pris en compte !");
    } catch (err) {
        showAlert(err.message, 'danger');
    }
});
