# Projet Manager

Une application web interne autonome de suivi de portefeuille projets. Conçue pour être légère, robuste, et exploitable en local ou sur un réseau intranet sans dépendance au cloud.

## Objectif

Permettre la gestion d'un portefeuille de 30 à 100 projets de façon centralisée. L'application stocke les métadonnées de projets, les jalons, les décisions, les réunions, les tâches, et référence des documents stockés sur un réseau local ou un répertoire de partage.

## Architecture

- **Backend** : Python 3.9+ avec FastAPI et SQLAlchemy. Fournit une API RESTful propre, légère et rapide.
- **Base de données** : SQLite (fichier local `database/projet_manager.db`) permettant une portabilité et une gestion aisée des sauvegardes.
- **Frontend** : Vanilla HTML, CSS, JavaScript. Pas de framework lourd. Complètement autonome. L'interface communique avec le backend via l'API REST.

## Pré-requis

- Python 3.9 ou supérieur

## Installation et démarrage

1. **Cloner ou récupérer le dépôt**

2. **Créer un environnement virtuel (optionnel mais recommandé)**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Sur Windows: venv\Scripts\activate
   ```

3. **Installer les dépendances**
   ```bash
   pip install -r requirements.txt
   ```

4. **Initialiser la base de données et les données de référence (seed)**
   ```bash
   python scripts/seed.py
   ```

5. **Démarrer l'application**
   ```bash
   uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
   ```

6. **Accéder à l'application**
   Ouvrez un navigateur et accédez à : [http://localhost:8000](http://localhost:8000)

## Structure du projet

- `/backend/` : Code de l'API FastAPI, définition des modèles SQLAlchemy et des schémas Pydantic.
- `/frontend/` : Interface utilisateur (fichiers statiques HTML, CSS, JS).
- `/database/` : Dossier destiné à contenir le fichier SQLite `projet_manager.db`.
- `/scripts/` : Scripts utilitaires (ex: `seed.py` pour l'initialisation de la DB).
- `/docs/` : Documentation (ex: Cahier des charges).

## Utilisation

- **Tableau de Bord** : Vue synthétique des projets.
- **Projets** : Liste des projets. Bouton "+ Nouveau Projet" pour créer.
- **Fiche Projet** : Cliquez sur une ligne de la liste de projets pour accéder à ses détails, y compris les jalons, décisions, tâches, et documents référencés.

## Évolutions futures

- Authentification via JWT et login des utilisateurs (la table `users` existe déjà dans la DB).
- Upload de fichiers (si le besoin évolue, pour l'instant seul le chemin est référencé).
- Vues avancées (ex: timeline de Gantt pour les jalons).
