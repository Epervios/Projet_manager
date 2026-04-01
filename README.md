# Projet Manager

Une application web interne autonome de suivi de portefeuille projets. Conçue pour être légère, robuste, et exploitable en local ou sur un réseau intranet sans dépendance au cloud.

## Objectif
Permettre la gestion d'un portefeuille de 30 à 100 projets de façon centralisée. L'application stocke les métadonnées de projets, les jalons, les décisions, les réunions, les tâches, et référence des documents stockés sur un réseau local ou un répertoire de partage.

## Stack Technique
- **Backend** : Python 3.9+ avec FastAPI, SQLAlchemy, Pydantic, Passlib (Bcrypt), Python-Jose (JWT).
- **Base de données** : SQLite (fichier local `database/projet_manager.db`).
- **Frontend** : Vanilla HTML, CSS, JavaScript (avec Fetch API) et UI dynamique.
- **Sécurité** : JWT stockés en LocalStorage, routes protégées par rôles (`Administrateur`, `Éditeur`, `Lecteur`).

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
   *Ce script va créer la base SQLite, insérer les catégories initiales, et créer l'utilisateur Administrateur par défaut.*
   - **Utilisateur par défaut** : `admin`
   - **Mot de passe** : `admin`

5. **Démarrer l'application**
   ```bash
   uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
   ```

6. **Accéder à l'application**
   Ouvrez un navigateur et accédez à : [http://localhost:8000](http://localhost:8000). Vous serez redirigé vers `/login.html`.

## Structure du projet

- `/backend/` : Code de l'API FastAPI, définition des modèles SQLAlchemy, authentification et schémas Pydantic.
- `/frontend/` : Interface utilisateur (fichiers statiques HTML, CSS, JS).
- `/database/` : Dossier destiné à contenir le fichier SQLite `projet_manager.db`.
- `/scripts/` : Scripts utilitaires (`seed.py`).
- `/docs/` : Documentation d'architecture et de modèle de données.

## Fonctionnalités Disponibles V1
- **Authentification Locale** : Login simple avec gestion de rôles.
- **Tableau de Bord** : Vue synthétique des projets et alertes.
- **Portefeuille de Projets** : Liste des projets avec recherche texte, filtres multi-critères (statut, priorité, responsable, archivés) et tris dynamiques.
- **Fiche Projet détaillée** : Vue 360 avec onglets pour Synthèse, Jalons, Décisions, Séances, Tâches, Documents et Historique.
- **CRUD complet** : Possibilité de créer, éditer et supprimer tous les éléments (si l'on possède les droits Administrateur ou Éditeur).
- **Historisation** : Journal d'activité minimal consignant les opérations de mise à jour par utilisateur ou "System".

## Limites Connues de la V1
- Pas de fonctionnalité native de récupération de mot de passe (à gérer en base de données manuellement pour le moment).
- Les documents sont référencés par chemin d'accès réseau local (URI/Filepath), il n'y a pas d'upload de fichiers direct dans la base de données afin de la garder légère.
