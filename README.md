# Projet Manager

Une application web interne autonome de suivi de portefeuille projets, pensée pour le pilotage d'une trentaine à une centaine de projets. Conçue pour être légère, robuste, et exploitable en local ou sur un réseau intranet (notamment sous environnement Windows) sans dépendance au cloud.

## Objectif & Périmètre
L'application permet de centraliser et d'historiser le suivi de projets :
- Métadonnées complètes de chaque projet (statut, priorité, alertes, dates).
- Jalons et tâches, planifiables et consultables sur des Roadmaps type Gantt.
- Décisions et séances de pilotage, reliées aux projets.
- Référencement de documents (stockage réseau externe).
- Tableau de bord de synthèse et Roadmap Globale de pilotage du portefeuille.

## Stack Technique Réelle
- **Backend** : Python (3.9+) avec le framework FastAPI.
- **Base de données** : SQLite géré via SQLAlchemy. Le chemin est configurable dynamiquement.
- **Authentification** : Gestion par JWT stockés en `localStorage`. Rôles : `Administrateur`, `Éditeur`, `Lecteur`.
- **Frontend** : Vanilla HTML, CSS, JavaScript (Fetch API). Aucune étape de build requise (pas de Node.js ni Webpack).
- **Gantt Charts** : Intégration de la bibliothèque légère `frappe-gantt` via CDN.

## Pré-requis
- Python 3.9 ou supérieur installé et disponible dans le PATH de la machine hôte.

## Installation et démarrage sous Windows

Ouvrez **PowerShell** et suivez ces instructions :

1. **Cloner ou télécharger le dépôt**
   ```powershell
   git clone <url_du_repo>
   cd Projet_manager
   ```

2. **Créer et activer un environnement virtuel**
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```
   *(Si l'exécution de scripts est bloquée sous PowerShell, lancez au préalable : `Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process`)*

3. **Installer les dépendances requises**
   ```powershell
   pip install -r requirements.txt
   ```

4. **Initialiser la base de données par défaut**
   ```powershell
   python scripts\seed.py
   ```
   *Ce script va créer la base SQLite initiale dans `database/projet_manager.db`, y insérer les catégories de base, et générer l'utilisateur administrateur de secours.*
   - **Utilisateur par défaut** : `admin`
   - **Mot de passe** : `admin`

5. **Démarrer le serveur API (Backend)**
   ```powershell
   $env:PYTHONPATH="."
   uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
   ```

6. **Accéder à l'application**
   Ouvrez votre navigateur web et accédez à : [http://localhost:8000](http://localhost:8000). Vous serez redirigé vers la page de connexion.

## Configuration & Base de Données

Le chemin d'accès au fichier `.db` SQLite n'est pas figé dans le code.
- Par défaut, l'application tentera de créer ou lire la base sur le chemin `./database/projet_manager.db`.
- **Page Paramètres** : Uniquement visible et accessible pour les utilisateurs `Administrateur`. Elle permet de modifier l'emplacement de la base SQLite et de tester la connexion.
- **Configuration locale** : Ce paramètre est sauvegardé dans le fichier `config/settings.json`.
- **IMPORTANT** : Après avoir sauvegardé un nouveau chemin via la page des paramètres, vous devez **arrêter et redémarrer manuellement** le processus `uvicorn` (FastAPI) dans votre console PowerShell pour que le nouveau fichier soit chargé par SQLAlchemy.

## Fonctionnalités Disponibles V1
- **Authentification Locale** : Login simple par nom d'utilisateur/mot de passe avec droits applicatifs.
- **Tableau de Bord** : Indicateurs clés (nombre de projets, tâches en retard, alertes).
- **Portefeuille de Projets** : Liste des projets avec recherche texte, filtres multi-critères et tris de colonnes.
- **Roadmap Globale (Portefeuille)** : Vue chronologique (Gantt) de l'ensemble du portefeuille projet. Permet de filtrer l'affichage (par statut, manager, etc.) et de visualiser **les bornes des projets ainsi que leurs jalons majeurs** sur une vue Semaine, Mois, ou Trimestre/Année.
- **Fiche Projet détaillée** : Espace dédié à un projet contenant : Synthèse, Jalons, Décisions, Séances, Tâches, Référencement de Documents et Historique d'activités.
- **Roadmap Projet** : Vue chronologique ciblée sur un projet affichant ses tâches et jalons (avec possibilité d'éditer via clics directs sur les barres).
- **CRUD complet** : Possibilité de créer, modifier, archiver et supprimer tous les éléments (selon les droits `Éditeur` ou `Administrateur`).

## Limites Connues (MVP V1)
- Il n'y a pas de fonctionnalité d'envoi d'e-mail de réinitialisation de mot de passe (à traiter via la base de données en direct).
- L'application ne stocke pas physiquement de documents ou de pièces jointes. L'onglet Document attend que l'utilisateur saisisse un chemin réseau (ex: `\\serveur\partage\doc.pdf`) ou une URL pour conserver la légèreté de la base SQLite.
- Les jalons et tâches sans date ne s'affichent naturellement pas sur les vues Roadmap (Gantt).