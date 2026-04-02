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
});

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
