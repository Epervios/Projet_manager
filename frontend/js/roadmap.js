let allProjects = [];
let allCategories = [];
let ganttChart = null;

document.addEventListener('DOMContentLoaded', async () => {
    await loadCategories();
    await loadProjects();

    document.getElementById('filter-category').addEventListener('change', renderRoadmap);
    document.getElementById('filter-status').addEventListener('change', renderRoadmap);
    document.getElementById('filter-priority').addEventListener('change', renderRoadmap);
});

async function loadCategories() {
    allCategories = await fetchAPI('/categories');
    const selectFilter = document.getElementById('filter-category');
    selectFilter.innerHTML = '<option value="">Toutes les catégories</option>';

    allCategories.forEach(cat => {
        const opt = new Option(cat.name, cat.id);
        selectFilter.add(opt);
    });
}

async function loadProjects() {
    // Note: To avoid N+1 queries making this too slow for a simple MVP,
    // we'll rely on the start_date and target_date fields of the project itself.
    // In a more advanced implementation, we could fetch details or create a new endpoint.
    allProjects = await fetchAPI('/projects');
    renderRoadmap();
}

function renderRoadmap() {
    const container = document.getElementById('gantt-container');
    const filterCategory = document.getElementById('filter-category').value;
    const filterStatus = document.getElementById('filter-status').value;
    const filterPriority = document.getElementById('filter-priority').value;

    container.innerHTML = '';

    const filtered = allProjects.filter(p => {
        const matchesCat = filterCategory === "" || p.category_id.toString() === filterCategory;
        const matchesStatus = filterStatus === "" || p.status === filterStatus;
        const matchesPriority = filterPriority === "" || p.priority === filterPriority;
        const matchesArchived = p.status !== "Archivé" && p.status !== "Abandonné";

        // We also need dates to plot them on a Gantt chart.
        const hasDates = p.start_date && p.target_date;

        return matchesCat && matchesStatus && matchesPriority && matchesArchived && hasDates;
    });

    if (filtered.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding: 20px;">Aucun projet planifié (avec dates de début et de fin) à afficher.</p>';
        return;
    }

    let ganttTasks = [];
    filtered.forEach(p => {
        let customClass = 'bar-task';
        if (p.status === 'Terminé') customClass = 'bar-success';
        else if (p.alert_level === 'Rouge') customClass = 'bar-danger';
        else if (p.alert_level === 'Orange') customClass = 'bar-milestone';

        ganttTasks.push({
            id: `Project_${p.id}`,
            name: p.name,
            start: p.start_date,
            end: p.target_date,
            progress: p.progress_percentage || 0,
            custom_class: customClass
        });
    });

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
            const pid = task.id.replace('Project_', '');
            window.location.href = `/project.html?id=${pid}`;
        },
        custom_popup_html: function(task) {
            return `<div class="details-container">
                      <h5>${task.name}</h5>
                      <p>Du ${task.start} au ${task.end}</p>
                      <p>Avancement: ${task.progress}%</p>
                      <p style="color:var(--primary-color); margin-top:5px; cursor:pointer;">Cliquer pour ouvrir ↗</p>
                    </div>`;
        }
    });
}

function changeGanttZoom(mode) {
    if (ganttChart) {
        ganttChart.change_view_mode(mode);
    }
}
