document.addEventListener('DOMContentLoaded', async () => {
    try {
        const stats = await fetchAPI('/dashboard');

        // Update stats
        document.getElementById('stat-total-projects').textContent = stats.total_projects;
        document.getElementById('stat-overdue-tasks').textContent = stats.overdue_tasks;
        document.getElementById('stat-upcoming-milestones').textContent = stats.upcoming_milestones;

        // Populate Categories
        const catList = document.getElementById('list-categories');
        catList.innerHTML = '';
        for (const [category, count] of Object.entries(stats.projects_by_category)) {
            const li = document.createElement('li');
            li.innerHTML = `<span>${escapeHTML(category)}</span> <strong>${count}</strong>`;
            catList.appendChild(li);
        }

        // Populate Recent Decisions
        const decList = document.getElementById('list-decisions');
        decList.innerHTML = '';
        if(stats.recent_decisions.length === 0) {
            decList.innerHTML = '<li>Aucune décision récente</li>';
        } else {
            stats.recent_decisions.forEach(dec => {
                const li = document.createElement('li');
                li.innerHTML = `<span>${escapeHTML(dec.title)}</span> <small>${formatDate(dec.decision_date)}</small>`;
                decList.appendChild(li);
            });
        }

    } catch (e) {
        console.error("Dashboard error", e);
    }
});
