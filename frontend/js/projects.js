let allProjects = [];
let allCategories = [];

document.addEventListener('DOMContentLoaded', async () => {
    await loadCategories();
    await loadProjects();

    document.getElementById('search-input').addEventListener('input', renderTable);
    document.getElementById('filter-category').addEventListener('change', renderTable);
    document.getElementById('filter-status').addEventListener('change', renderTable);
    document.getElementById('filter-priority').addEventListener('change', renderTable);
    document.getElementById('filter-manager').addEventListener('input', renderTable);
    document.getElementById('filter-archived').addEventListener('change', renderTable);
    document.getElementById('sort-by').addEventListener('change', renderTable);

    document.getElementById('new-project-form').addEventListener('submit', createProject);
});

async function loadCategories() {
    allCategories = await fetchAPI('/categories');
    const selectFilter = document.getElementById('filter-category');
    const selectModal = document.getElementById('project-category');

    selectFilter.innerHTML = '<option value="">Toutes les catégories</option>';
    selectModal.innerHTML = '';

    allCategories.forEach(cat => {
        const opt = new Option(cat.name, cat.id);
        selectFilter.add(opt);
        selectModal.add(new Option(cat.name, cat.id));
    });
}

async function loadProjects() {
    allProjects = await fetchAPI('/projects');
    renderTable();
}

function renderTable() {
    const tbody = document.querySelector('#projects-table tbody');
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const filterCategory = document.getElementById('filter-category').value;
    const filterStatus = document.getElementById('filter-status').value;
    const filterPriority = document.getElementById('filter-priority').value;
    const filterManager = document.getElementById('filter-manager').value.toLowerCase();
    const showArchived = document.getElementById('filter-archived').checked;
    const sortBy = document.getElementById('sort-by').value;

    tbody.innerHTML = '';

    let filtered = allProjects.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm) || p.code.toLowerCase().includes(searchTerm);
        const matchesCat = filterCategory === "" || p.category_id.toString() === filterCategory;
        const matchesStatus = filterStatus === "" || p.status === filterStatus;
        const matchesPriority = filterPriority === "" || p.priority === filterPriority;
        const matchesManager = filterManager === "" || p.manager.toLowerCase().includes(filterManager);
        const matchesArchived = showArchived || p.status !== "Archivé";

        return matchesSearch && matchesCat && matchesStatus && matchesPriority && matchesManager && matchesArchived;
    });

    // Sorting
    filtered.sort((a, b) => {
        if(sortBy === 'date_desc') return new Date(b.created_at) - new Date(a.created_at);
        if(sortBy === 'date_asc') return new Date(a.created_at) - new Date(b.created_at);
        if(sortBy === 'status') return a.status.localeCompare(b.status);
        if(sortBy === 'priority') {
            const pMap = {'Basse': 1, 'Moyenne': 2, 'Haute': 3, 'Critique': 4};
            return (pMap[b.priority] || 0) - (pMap[a.priority] || 0);
        }
        if(sortBy === 'category') {
            const catA = allCategories.find(c => c.id === a.category_id)?.name || '';
            const catB = allCategories.find(c => c.id === b.category_id)?.name || '';
            return catA.localeCompare(catB);
        }
        return 0;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">Aucun projet trouvé</td></tr>';
        return;
    }

    filtered.forEach(p => {
        const categoryName = allCategories.find(c => c.id === p.category_id)?.name || 'Inconnue';

        const tr = document.createElement('tr');
        tr.onclick = () => window.location.href = `/project.html?id=${p.id}`;

        tr.innerHTML = `
            <td><strong>${p.code}</strong></td>
            <td>${p.name}</td>
            <td>${categoryName}</td>
            <td>${p.manager}</td>
            <td><span class="badge badge-status">${p.status}</span></td>
            <td>${p.priority}</td>
            <td>
                <div style="background:#e9ecef; border-radius:10px; height:8px; width:100%;">
                    <div style="background:var(--primary-color); height:8px; border-radius:10px; width:${p.progress_percentage}%"></div>
                </div>
                <small>${p.progress_percentage}%</small>
            </td>
            <td><span style="display:inline-block; width:12px; height:12px; border-radius:50%; background-color:${getAlertColor(p.alert_level)}"></span></td>
        `;
        tbody.appendChild(tr);
    });
}

function getAlertColor(alert) {
    if (alert === 'Vert') return 'var(--success-color)';
    if (alert === 'Orange') return 'var(--warning-color)';
    if (alert === 'Rouge') return 'var(--danger-color)';
    return 'var(--secondary-color)';
}

function openNewProjectModal() {
    openModal('new-project-modal');
}

async function createProject(e) {
    e.preventDefault();
    const payload = {
        code: document.getElementById('project-code').value,
        name: document.getElementById('project-name').value,
        category_id: parseInt(document.getElementById('project-category').value),
        manager: document.getElementById('project-manager').value,
        status: document.getElementById('project-status').value,
        priority: document.getElementById('project-priority').value,
        sponsor: document.getElementById('project-sponsor').value || null,
        stakeholders: document.getElementById('project-stakeholders').value || null,
        alert_level: document.getElementById('project-alert').value,
        progress_percentage: parseFloat(document.getElementById('project-progress').value) || 0,
        start_date: document.getElementById('project-start').value || null,
        target_date: document.getElementById('project-target').value || null,
        description: document.getElementById('project-desc').value || null,
        objective: document.getElementById('project-obj').value || null,
        scope: document.getElementById('project-scope').value || null,
        general_comment: document.getElementById('project-comment').value || null,
    };

    try {
        const response = await fetchAPI('/projects/', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        closeModal('new-project-modal');
        document.getElementById('new-project-form').reset();

        // Redirect directly to the new project detail view
        if(response && response.id) {
            window.location.href = `/project.html?id=${response.id}`;
        } else {
            await loadProjects();
        }
    } catch (err) {
        console.error("Erreur de création", err);
    }
}
