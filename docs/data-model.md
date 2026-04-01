# Modèle de Données (Projet Manager V1)

Le modèle s'appuie sur une structure relationnelle où l'entité centrale est `Project`. Les éléments annexes gravitent en relation One-To-Many ou Many-To-One autour de celle-ci.

## Entités Principales

### `users`
- `id` (PK)
- `username` (Unique)
- `hashed_password` (Bcrypt)
- `role` (Administrateur, Éditeur, Lecteur)

### `project_categories`
- `id` (PK)
- `name` (Unique)

### `projects`
- `id` (PK)
- `code` (Unique)
- `name`
- `category_id` (FK vers `project_categories`)
- `status`, `priority`, `alert_level` (Enums sous forme de chaîne par défaut)
- `progress_percentage` (Float)
- Dates : `start_date`, `target_date`, `created_at`, `updated_at`, `archived_at`
- Méta-données : `description`, `objective`, `scope`, `sponsor`, `manager`, `stakeholders`, `general_comment`

## Sous-Entités de Projet

### `milestones`
- `id` (PK)
- `project_id` (FK)
- `title`, `description`, `planned_date`, `actual_date`
- `status`, `comment`, `display_order`

### `meetings`
- `id` (PK)
- `project_id` (FK)
- `date`, `time`, `title`, `meeting_type`
- `participants`, `agenda`, `summary`, `decisions_made`, `actions_decided`, `comment`

### `decisions`
- `id` (PK)
- `project_id` (FK)
- `meeting_id` (FK optionnel)
- `decision_date`, `title`, `description`
- `decision_type`, `origin`, `decider`, `impact`
- `implementation_status`

### `tasks`
- `id` (PK)
- `project_id` (FK)
- `meeting_id` (FK optionnel)
- `decision_id` (FK optionnel)
- `title`, `description`, `assignee`
- `created_at`, `due_date`, `priority`, `status`, `origin`, `comment`

### `documents`
- `id` (PK)
- `project_id` (FK)
- `title`, `document_type`, `file_path`, `version`
- `date`, `author`, `comment`

### `activity_logs`
- `id` (PK)
- `project_id` (FK)
- `user`, `action`, `details`, `timestamp`

*Note : la suppression d'un `Project` entraîne la suppression en cascade de toutes ses sous-entités (milestones, decisions, meetings, tasks, documents, activity logs).*
