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

Cette procédure est optimisée pour les environnements Windows d'entreprise verrouillés (où l'exécution de scripts PowerShell comme `Activate.ps1` peut être bloquée). Ouvrez **PowerShell** et lancez les commandes suivantes :

```powershell
cd C:\Projet_Manager
python -m venv venv
venv\Scripts\python.exe -m pip install -r requirements.txt
venv\Scripts\python.exe scripts\seed.py
$env:PYTHONPATH="."
venv\Scripts\python.exe -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

*Note : Le script de base de données (seed.py) créera la base initiale et un utilisateur administrateur de secours (`admin` / `admin`).*

Puis accès via :
**[http://localhost:8000](http://localhost:8000)**

*(Note : Si vous disposez des droits nécessaires et préférez activer l'environnement de façon standard, vous pouvez utiliser `.\venv\Scripts\Activate.ps1` puis omettre le préfixe `venv\Scripts\` pour les commandes suivantes).*

## Configuration & Base de Données

Le chemin d'accès au fichier `.db` SQLite n'est pas figé dans le code et la configuration initiale de l'application a été sécurisée.
- **Premier Lancement** : Si aucune base SQLite configurée n'est détectée ou exploitable, l'écran de login se transforme automatiquement en un écran de configuration sécurisé. Celui-ci permet soit de relier l'application à un `.db` existant, soit d'initialiser une nouvelle base locale tout en créant simultanément votre compte Administrateur de façon autonome, le tout sans erreur technique bloquante.
- **Page Paramètres** : Uniquement visible et accessible pour les rôles `Administrateur`. Elle permet de :
  - Modifier dynamiquement l'emplacement de la base SQLite et tester la connexion.
  - Créer, modifier ou supprimer des utilisateurs de l'application (`Administrateur`, `Éditeur`, `Lecteur`), ainsi que réinitialiser leurs mots de passe.
- **Configuration locale** : Ce paramètre de chemin est sauvegardé dans le fichier `config/settings.json`.
- **IMPORTANT** : Après l'initialisation ou la sauvegarde d'un nouveau chemin de base, vous devez **arrêter et redémarrer manuellement** le processus `uvicorn` (FastAPI) dans votre console PowerShell pour que le changement soit chargé par le backend.

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