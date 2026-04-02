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
    document.getElementById('new-milestone-form').addEventListener('submit', handleMilestoneSubmit);
    document.getElementById('new-decision-form').addEventListener('submit', handleDecisionSubmit);
    document.getElementById('new-meeting-form').addEventListener('submit', handleMeetingSubmit);
    document.getElementById('new-task-form').addEventListener('submit', handleTaskSubmit);
    document.getElementById('new-document-form').addEventListener('submit', handleDocumentSubmit);
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
        document.getElementById('p-cat').textContent = projectData.category ? projectData.category.name : '-';
        document.getElementById('p-manager').textContent = projectData.manager || '-';
        document.getElementById('p-sponsor').textContent = projectData.sponsor || '-';
        document.getElementById('p-priority').textContent = projectData.priority || '-';
        document.getElementById('p-progress').textContent = projectData.progress_percentage !== null ? projectData.progress_percentage : '-';
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
        document.getElementById('edit-manager').value = projectData.manager || '';
        document.getElementById('edit-desc').value = projectData.description || '';
        document.getElementById('edit-obj').value = projectData.objective || '';
        document.getElementById('edit-scope').value = projectData.scope || '';
        document.getElementById('edit-sponsor').value = projectData.sponsor || '';
        document.getElementById('edit-stakeholders').value = projectData.stakeholders || '';
        document.getElementById('edit-priority').value = projectData.priority || 'Moyenne';
        document.getElementById('edit-start').value = projectData.start_date || '';
        document.getElementById('edit-target').value = projectData.target_date || '';
        document.getElementById('edit-comment').value = projectData.general_comment || '';

        // Populate Tables
        renderMilestones();
        renderDecisions();
        renderMeetings();
        renderTasks();
        renderDocuments();
        renderHistory();
        renderProjectRoadmap();
    } catch (e) {
        console.error("Error loading project details", e);
    }
}

let ganttChart = null;

function renderProjectRoadmap() {
    const container = document.getElementById('gantt-container');
    const filter = document.getElementById('gantt-filter').value;
    container.innerHTML = '';

    let ganttTasks = [];

    if (filter === 'all' || filter === 'tasks' || filter === 'hide_completed') {
        projectData.tasks.forEach(t => {
            if(!t.due_date) return; // Need at least an end date
            if (filter === 'hide_completed' && t.status === 'Terminée') return;

            // Generate pseudo start date if missing
            const start = t.created_at ? t.created_at.split('T')[0] : t.due_date;
            const end = t.due_date;

            let customClass = 'bar-task';
            if (t.status === 'Terminée') customClass = 'bar-success';
            else if (new Date(end) < new Date()) customClass = 'bar-danger';

            const progress = t.status === 'Terminée' ? 100 : (t.status === 'En cours' ? 50 : 0);

            ganttTasks.push({
                id: `Task_${t.id}`,
                name: `${t.title} (${t.assignee || 'Non assigné'})`,
                start: start,
                end: end,
                progress: progress,
                custom_class: customClass
            });
        });
    }

    if (filter === 'all' || filter === 'milestones' || filter === 'hide_completed') {
        projectData.milestones.forEach(m => {
            if(!m.planned_date) return;
            if (filter === 'hide_completed' && m.status === 'Réalisé') return;
            ganttTasks.push({
                id: `Milestone_${m.id}`,
                name: m.title,
                start: m.planned_date,
                end: m.planned_date,
                progress: m.status === 'Réalisé' ? 100 : 0,
                custom_class: 'bar-milestone',
                dependencies: ''
            });
        });
    }

    if (ganttTasks.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding: 20px;">Aucune donnée (avec dates) à afficher sur la roadmap.</p>';
        return;
    }

    // Create new wrapper
    const svgWrapper = document.createElement('svg');
    svgWrapper.id = "gantt-svg";
    container.appendChild(svgWrapper);

    const zoomLevel = document.getElementById('gantt-zoom').value;

    ganttChart = new Gantt("#gantt-svg", ganttTasks, {
        header_height: 50,
        column_width: 30,
        step: 24,
        view_modes: ['Quarter Day', 'Half Day', 'Day', 'Week', 'Month'],
        bar_height: 20,
        bar_corner_radius: 3,
        arrow_curve: 5,
        padding: 18,
        view_mode: zoomLevel,
        date_format: 'YYYY-MM-DD',
        on_click: function (task) {
            if (checkAccess(['Administrateur', 'Éditeur'])) {
                if (task.id.startsWith('Task_')) {
                    const taskId = parseInt(task.id.replace('Task_', ''));
                    const t = projectData.tasks.find(x => x.id === taskId);
                    if(t) editTask(t);
                } else if (task.id.startsWith('Milestone_')) {
                    const mId = parseInt(task.id.replace('Milestone_', ''));
                    const m = projectData.milestones.find(x => x.id === mId);
                    if(m) editMilestone(m);
                }
            }
        },
        custom_popup_html: function(task) {
            const end_date = task.end;
            return `<div class="details-container">
                      <h5>${escapeHTML(task.name)}</h5>
                      <p>Échéance: ${end_date}</p>
                      <p>${task.progress}% terminé</p>
                      ${checkAccess(['Administrateur', 'Éditeur']) ? '<p style="color:var(--primary-color); margin-top:5px; cursor:pointer;">Cliquer pour éditer ↗</p>' : ''}
                    </div>`;
        }
    });
}

function changeGanttZoom(mode) {
    if (ganttChart) {
        ganttChart.change_view_mode(mode);
    }
}

function checkAccess(roles) {
    const role = localStorage.getItem('user_role');
    return roles.includes(role);
}

function renderMilestones() {
    const tbody = document.getElementById('milestones-table-body');
    tbody.innerHTML = '';
    if(projectData.milestones.length === 0) { tbody.innerHTML = '<tr><td colspan="4">Aucun jalon</td></tr>'; return; }

    // Sort chronological
    const sorted = [...projectData.milestones].sort((a,b) => {
        if (!a.planned_date) return 1;
        if (!b.planned_date) return -1;
        return new Date(a.planned_date) - new Date(b.planned_date);
    });

    sorted.forEach(m => {
        const isLate = m.status !== 'Réalisé' && m.status !== 'Annulé' && m.planned_date && new Date(m.planned_date) < new Date();
        const rowClass = isLate ? 'style="color: var(--danger-color); font-weight:bold;"' : '';
        const actions = checkAccess(['Administrateur', 'Éditeur']) ?
            `<button onclick='editMilestone(${JSON.stringify(m).replace(/'/g, "&apos;")})' class="btn btn-sm btn-secondary">Editer</button>
             <button onclick='deleteEntity("milestones", ${m.id})' class="btn btn-sm btn-danger">Suppr</button>` : '';
        tbody.innerHTML += `<tr ${rowClass}><td>${escapeHTML(m.title)}</td><td>${formatDate(m.planned_date)}</td><td>${escapeHTML(m.status)}</td><td>${actions}</td></tr>`;
    });
}

function renderDecisions() {
    const tbody = document.getElementById('decisions-table-body');
    tbody.innerHTML = '';
    if(projectData.decisions.length === 0) { tbody.innerHTML = '<tr><td colspan="5">Aucune décision</td></tr>'; return; }
    projectData.decisions.forEach(d => {
        const actions = checkAccess(['Administrateur', 'Éditeur']) ?
            `<button onclick='editDecision(${JSON.stringify(d).replace(/'/g, "&apos;")})' class="btn btn-sm btn-secondary">Editer</button>
             <button onclick='deleteEntity("decisions", ${d.id})' class="btn btn-sm btn-danger">Suppr</button>` : '';
        tbody.innerHTML += `<tr><td>${formatDate(d.decision_date)}</td><td>${escapeHTML(d.title)}</td><td>${escapeHTML(d.decider || '-')}</td><td>${escapeHTML(d.implementation_status)}</td><td>${actions}</td></tr>`;
    });
}

function renderMeetings() {
    const tbody = document.getElementById('meetings-table-body');
    tbody.innerHTML = '';
    if(projectData.meetings.length === 0) { tbody.innerHTML = '<tr><td colspan="5">Aucune séance</td></tr>'; return; }
    projectData.meetings.forEach(m => {
        const actions = checkAccess(['Administrateur', 'Éditeur']) ?
            `<button onclick='editMeeting(${JSON.stringify(m).replace(/'/g, "&apos;")})' class="btn btn-sm btn-secondary">Editer</button>
             <button onclick='deleteEntity("meetings", ${m.id})' class="btn btn-sm btn-danger">Suppr</button>` : '';
        tbody.innerHTML += `<tr><td>${formatDate(m.date)}</td><td>${escapeHTML(m.time || '-')}</td><td>${escapeHTML(m.title)}</td><td>${escapeHTML(m.meeting_type || '-')}</td><td>${actions}</td></tr>`;
    });
}

function renderTasks() {
    const tbody = document.getElementById('tasks-table-body');
    tbody.innerHTML = '';
    if(projectData.tasks.length === 0) { tbody.innerHTML = '<tr><td colspan="5">Aucune tâche</td></tr>'; return; }
    projectData.tasks.forEach(t => {
        const isLate = t.status !== 'Terminée' && t.status !== 'Annulée' && t.due_date && new Date(t.due_date) < new Date();
        const rowClass = isLate ? 'style="color: var(--danger-color); font-weight:bold;"' : '';
        const actions = checkAccess(['Administrateur', 'Éditeur']) ?
            `<button onclick='editTask(${JSON.stringify(t).replace(/'/g, "&apos;")})' class="btn btn-sm btn-secondary">Editer</button>
             <button onclick='deleteEntity("tasks", ${t.id})' class="btn btn-sm btn-danger">Suppr</button>` : '';
        tbody.innerHTML += `<tr ${rowClass}><td>${escapeHTML(t.title)}</td><td>${escapeHTML(t.assignee || '-')}</td><td>${formatDate(t.due_date)}</td><td>${escapeHTML(t.status)}</td><td>${actions}</td></tr>`;
    });
}

function renderDocuments() {
    const tbody = document.getElementById('documents-table-body');
    tbody.innerHTML = '';
    if(projectData.documents.length === 0) { tbody.innerHTML = '<tr><td colspan="4">Aucun document</td></tr>'; return; }
    projectData.documents.forEach(d => {
        const actions = checkAccess(['Administrateur', 'Éditeur']) ?
            `<button onclick='editDocument(${JSON.stringify(d).replace(/'/g, "&apos;")})' class="btn btn-sm btn-secondary">Editer</button>
             <button onclick='deleteEntity("documents", ${d.id})' class="btn btn-sm btn-danger">Suppr</button>` : '';
        tbody.innerHTML += `<tr><td>${escapeHTML(d.title)}</td><td>${escapeHTML(d.document_type || '-')}</td><td><a href="${escapeHTML(d.file_path)}" target="_blank">${escapeHTML(d.file_path)}</a></td><td>${actions}</td></tr>`;
    });
}

function renderHistory() {
    const tbody = document.getElementById('history-table-body');
    tbody.innerHTML = '';
    if(!projectData.activity_logs || projectData.activity_logs.length === 0) { tbody.innerHTML = '<tr><td colspan="4">Aucun historique</td></tr>'; return; }

    const sorted = [...projectData.activity_logs].sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
    sorted.forEach(log => {
        tbody.innerHTML += `<tr><td>${new Date(log.timestamp).toLocaleString('fr-FR')}</td><td>${escapeHTML(log.user || 'System')}</td><td>${escapeHTML(log.action)}</td><td>${escapeHTML(log.details || '-')}</td></tr>`;
    });
}

async function deleteEntity(endpoint, id) {
    if(confirm("Confirmer la suppression ?")) {
        try {
            await fetchAPI(`/${endpoint}/${id}`, { method: 'DELETE' });
            await loadProjectDetails();
        } catch(e) { console.error(e); }
    }
}

// Reset functions
function resetMilestoneForm() { document.getElementById('new-milestone-form').reset(); document.getElementById('m-id').value = ''; document.getElementById('modal-title-milestone').innerText = 'Nouveau Jalon'; openModal('new-milestone-modal'); }
function resetDecisionForm() { document.getElementById('new-decision-form').reset(); document.getElementById('d-id').value = ''; document.getElementById('modal-title-decision').innerText = 'Nouvelle Décision'; openModal('new-decision-modal'); }
function resetMeetingForm() { document.getElementById('new-meeting-form').reset(); document.getElementById('mt-id').value = ''; document.getElementById('modal-title-meeting').innerText = 'Nouvelle Séance'; openModal('new-meeting-modal'); }
function resetTaskForm() { document.getElementById('new-task-form').reset(); document.getElementById('t-id').value = ''; document.getElementById('modal-title-task').innerText = 'Nouvelle Tâche'; openModal('new-task-modal'); }
function resetDocumentForm() { document.getElementById('new-document-form').reset(); document.getElementById('doc-id').value = ''; document.getElementById('modal-title-document').innerText = 'Nouveau Document'; openModal('new-document-modal'); }

// Edit prepopulators
function editMilestone(m) {
    document.getElementById('m-id').value = m.id;
    document.getElementById('m-title').value = m.title;
    document.getElementById('m-date').value = m.planned_date;
    document.getElementById('m-status').value = m.status;
    document.getElementById('modal-title-milestone').innerText = 'Modifier Jalon';
    openModal('new-milestone-modal');
}
function editDecision(d) {
    document.getElementById('d-id').value = d.id;
    document.getElementById('d-date').value = d.decision_date;
    document.getElementById('d-title').value = d.title;
    document.getElementById('d-decider').value = d.decider || '';
    document.getElementById('d-desc').value = d.description || '';
    document.getElementById('d-status').value = d.implementation_status;
    document.getElementById('modal-title-decision').innerText = 'Modifier Décision';
    openModal('new-decision-modal');
}
function editMeeting(m) {
    document.getElementById('mt-id').value = m.id;
    document.getElementById('mt-date').value = m.date;
    document.getElementById('mt-time').value = m.time || '';
    document.getElementById('mt-title').value = m.title;
    document.getElementById('mt-type').value = m.meeting_type || '';
    document.getElementById('mt-summary').value = m.summary || '';
    document.getElementById('modal-title-meeting').innerText = 'Modifier Séance';
    openModal('new-meeting-modal');
}
function editTask(t) {
    document.getElementById('t-id').value = t.id;
    document.getElementById('t-title').value = t.title;
    document.getElementById('t-assignee').value = t.assignee || '';
    document.getElementById('t-date').value = t.due_date;
    document.getElementById('t-status').value = t.status;
    document.getElementById('modal-title-task').innerText = 'Modifier Tâche';
    openModal('new-task-modal');
}
function editDocument(d) {
    document.getElementById('doc-id').value = d.id;
    document.getElementById('doc-title').value = d.title;
    document.getElementById('doc-type').value = d.document_type || '';
    document.getElementById('doc-path').value = d.file_path || '';
    document.getElementById('modal-title-document').innerText = 'Modifier Document';
    openModal('new-document-modal');
}

function openEditProjectModal() { openModal('edit-project-modal'); }

async function updateProject(e) {
    e.preventDefault();
    const payload = {
        code: projectData.code,
        name: projectData.name,
        category_id: projectData.category_id,
        manager: document.getElementById('edit-manager').value,
        progress_percentage: parseFloat(document.getElementById('edit-progress').value),
        status: document.getElementById('edit-status').value,
        alert_level: document.getElementById('edit-alert').value,
        description: document.getElementById('edit-desc').value,
        objective: document.getElementById('edit-obj').value,
        scope: document.getElementById('edit-scope').value,
        sponsor: document.getElementById('edit-sponsor').value,
        stakeholders: document.getElementById('edit-stakeholders').value,
        priority: document.getElementById('edit-priority').value,
        start_date: document.getElementById('edit-start').value || null,
        target_date: document.getElementById('edit-target').value || null,
        general_comment: document.getElementById('edit-comment').value
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

async function archiveProject() {
    if(confirm("Voulez-vous vraiment archiver ce projet ?")) {
        try {
            await fetchAPI(`/projects/${projectId}`, { method: 'DELETE' });
            window.location.href = '/projects.html';
        } catch (e) { console.error("Archiving error", e); }
    }
}

async function handleMilestoneSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('m-id').value;
    const payload = {
        project_id: parseInt(projectId),
        title: document.getElementById('m-title').value,
        planned_date: document.getElementById('m-date').value || null,
        status: document.getElementById('m-status').value
    };

    try {
        if(id) await fetchAPI(`/milestones/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        else await fetchAPI('/milestones/', { method: 'POST', body: JSON.stringify(payload) });
        closeModal('new-milestone-modal');
        await loadProjectDetails();
    } catch (e) { console.error("Milestone error", e); }
}

async function handleDecisionSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('d-id').value;
    const payload = {
        project_id: parseInt(projectId),
        decision_date: document.getElementById('d-date').value,
        title: document.getElementById('d-title').value,
        decider: document.getElementById('d-decider').value,
        description: document.getElementById('d-desc').value,
        implementation_status: document.getElementById('d-status').value
    };

    try {
        if(id) await fetchAPI(`/decisions/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        else await fetchAPI('/decisions/', { method: 'POST', body: JSON.stringify(payload) });
        closeModal('new-decision-modal');
        await loadProjectDetails();
    } catch (e) { console.error(e); }
}

async function handleMeetingSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('mt-id').value;
    const payload = {
        project_id: parseInt(projectId),
        date: document.getElementById('mt-date').value,
        time: document.getElementById('mt-time').value,
        title: document.getElementById('mt-title').value,
        meeting_type: document.getElementById('mt-type').value,
        summary: document.getElementById('mt-summary').value
    };

    try {
        if(id) await fetchAPI(`/meetings/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        else await fetchAPI('/meetings/', { method: 'POST', body: JSON.stringify(payload) });
        closeModal('new-meeting-modal');
        await loadProjectDetails();
    } catch (e) { console.error(e); }
}

async function handleTaskSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('t-id').value;
    const payload = {
        project_id: parseInt(projectId),
        title: document.getElementById('t-title').value,
        assignee: document.getElementById('t-assignee').value,
        due_date: document.getElementById('t-date').value || null,
        status: document.getElementById('t-status').value
    };

    try {
        if(id) await fetchAPI(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        else await fetchAPI('/tasks/', { method: 'POST', body: JSON.stringify(payload) });
        closeModal('new-task-modal');
        await loadProjectDetails();
    } catch (e) { console.error(e); }
}

async function handleDocumentSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('doc-id').value;
    const payload = {
        project_id: parseInt(projectId),
        title: document.getElementById('doc-title').value,
        document_type: document.getElementById('doc-type').value,
        file_path: document.getElementById('doc-path').value
    };

    try {
        if(id) await fetchAPI(`/documents/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        else await fetchAPI('/documents/', { method: 'POST', body: JSON.stringify(payload) });
        closeModal('new-document-modal');
        await loadProjectDetails();
    } catch (e) { console.error(e); }
}
