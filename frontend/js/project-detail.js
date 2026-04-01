const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get('id');
let projectData = {};

document.addEventListener('DOMContentLoaded', async () => {
    if (!projectId) {
        alert("ID de projet manquant");
        window.location.href = '/projects.html';
        return;
    }

    await loadProjectDetails();
    document.getElementById('edit-project-form').addEventListener('submit', updateProject);
    document.getElementById('new-milestone-form').addEventListener('submit', createMilestone);
});

async function loadProjectDetails() {
    try {
        projectData = await fetchAPI(`/projects/${projectId}`);

        // Populate Header
        document.getElementById('project-title').textContent = `${projectData.code} - ${projectData.name}`;
        document.getElementById('project-badge-status').textContent = projectData.status;
        document.getElementById('project-badge-alert').textContent = `Alerte: ${projectData.alert_level}`;

        // Populate Synthese
        document.getElementById('p-code').textContent = projectData.code;
        document.getElementById('p-cat').textContent = projectData.category.name;
        document.getElementById('p-manager').textContent = projectData.manager;
        document.getElementById('p-sponsor').textContent = projectData.sponsor || '-';
        document.getElementById('p-priority').textContent = projectData.priority;
        document.getElementById('p-progress').textContent = projectData.progress_percentage;
        document.getElementById('p-start').textContent = formatDate(projectData.start_date);
        document.getElementById('p-target').textContent = formatDate(projectData.target_date);

        document.getElementById('p-desc').textContent = projectData.description || '-';
        document.getElementById('p-obj').textContent = projectData.objective || '-';
        document.getElementById('p-scope').textContent = projectData.scope || '-';
        document.getElementById('p-stakeholders').textContent = projectData.stakeholders || '-';
        document.getElementById('p-comment').textContent = projectData.general_comment || '-';

        // Pre-fill Edit Modal
        document.getElementById('edit-progress').value = projectData.progress_percentage;
        document.getElementById('edit-status').value = projectData.status;
        document.getElementById('edit-alert').value = projectData.alert_level;
        document.getElementById('edit-desc').value = projectData.description || '';

        // Populate Tables
        renderMilestones();
        renderDecisions();
        renderMeetings();
        renderTasks();
        renderDocuments();
    } catch (e) {
        console.error("Error loading project details", e);
    }
}

function renderMilestones() {
    const tbody = document.getElementById('milestones-table-body');
    tbody.innerHTML = '';
    if(projectData.milestones.length === 0) { tbody.innerHTML = '<tr><td colspan="3">Aucun jalon</td></tr>'; return; }
    projectData.milestones.forEach(m => {
        tbody.innerHTML += `<tr><td>${m.title}</td><td>${formatDate(m.planned_date)}</td><td>${m.status}</td></tr>`;
    });
}

function renderDecisions() {
    const tbody = document.getElementById('decisions-table-body');
    tbody.innerHTML = '';
    if(projectData.decisions.length === 0) { tbody.innerHTML = '<tr><td colspan="4">Aucune décision</td></tr>'; return; }
    projectData.decisions.forEach(d => {
        tbody.innerHTML += `<tr><td>${formatDate(d.decision_date)}</td><td>${d.title}</td><td>${d.decider || '-'}</td><td>${d.implementation_status}</td></tr>`;
    });
}

function renderMeetings() {
    const tbody = document.getElementById('meetings-table-body');
    tbody.innerHTML = '';
    if(projectData.meetings.length === 0) { tbody.innerHTML = '<tr><td colspan="4">Aucune séance</td></tr>'; return; }
    projectData.meetings.forEach(m => {
        tbody.innerHTML += `<tr><td>${formatDate(m.date)}</td><td>${m.time || '-'}</td><td>${m.title}</td><td>${m.meeting_type || '-'}</td></tr>`;
    });
}

function renderTasks() {
    const tbody = document.getElementById('tasks-table-body');
    tbody.innerHTML = '';
    if(projectData.tasks.length === 0) { tbody.innerHTML = '<tr><td colspan="4">Aucune tâche</td></tr>'; return; }
    projectData.tasks.forEach(t => {
        tbody.innerHTML += `<tr><td>${t.title}</td><td>${t.assignee || '-'}</td><td>${formatDate(t.due_date)}</td><td>${t.status}</td></tr>`;
    });
}

function renderDocuments() {
    const tbody = document.getElementById('documents-table-body');
    tbody.innerHTML = '';
    if(projectData.documents.length === 0) { tbody.innerHTML = '<tr><td colspan="3">Aucun document</td></tr>'; return; }
    projectData.documents.forEach(d => {
        tbody.innerHTML += `<tr><td>${d.title}</td><td>${d.document_type || '-'}</td><td><a href="file://${d.file_path}" target="_blank">${d.file_path}</a></td></tr>`;
    });
}

function openEditProjectModal() { openModal('edit-project-modal'); }

async function updateProject(e) {
    e.preventDefault();
    const payload = {
        code: projectData.code,
        name: projectData.name,
        category_id: projectData.category_id,
        manager: projectData.manager,
        progress_percentage: document.getElementById('edit-progress').value,
        status: document.getElementById('edit-status').value,
        alert_level: document.getElementById('edit-alert').value,
        description: document.getElementById('edit-desc').value
    };

    try {
        await fetchAPI(`/projects/${projectId}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        });
        closeModal('edit-project-modal');
        await loadProjectDetails();
    } catch (e) { console.error("Update error", e); }
}

async function createMilestone(e) {
    e.preventDefault();
    const payload = {
        project_id: parseInt(projectId),
        title: document.getElementById('m-title').value,
        planned_date: document.getElementById('m-date').value || null
    };

    try {
        await fetchAPI('/milestones/', { method: 'POST', body: JSON.stringify(payload) });
        closeModal('new-milestone-modal');
        document.getElementById('new-milestone-form').reset();
        await loadProjectDetails();
    } catch (e) { console.error("Milestone error", e); }
}
