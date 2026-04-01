# Architecture

## Principes Directeurs
L'application **Projet Manager** est conçue selon un paradigme de Monolithe Modulaire.
- **Frontend Stateless** : Le client charge des ressources statiques (HTML, CSS, JS) et effectue des appels AJAX vers l'API. L'état d'authentification est maintenu via un token JWT dans le `localStorage`.
- **Backend API RESTful** : Fournit un accès standardisé aux données.
- **Base de données intégrée** : SQLite a été choisi pour éliminer toute dépendance à un SGBD externe, facilitant le déploiement sur intranet.

## Composants
1. **Couche de Présentation (Frontend)** : Interface web adaptative et réactive, sans framework lourd pour garantir la pérennité.
2. **Couche de Service (Backend/FastAPI)** : Gère le routage, la validation des entrées (Pydantic) et la logique métier. Elle s'occupe de l'authentification et de l'autorisation (OAuth2PasswordBearer).
3. **Couche de Données (Backend/SQLAlchemy)** : Abstraction ORM qui traduit les opérations objets en requêtes SQL.

## Flux de Données Typique (Ex: Création de Jalon)
1. L'utilisateur clique sur "Ajouter Jalon" dans `project.html`.
2. Le script JS intercepte le formulaire, construit un objet JSON et l'envoie à `/api/milestones/` avec le header `Authorization: Bearer <token>`.
3. Le backend (`api.py`) intercepte la requête, valide le token via `auth.py`, et vérifie que l'utilisateur possède le rôle requis (`Administrateur` ou `Éditeur`).
4. Si valide, Pydantic vérifie la structure du payload JSON (`schemas.MilestoneCreate`).
5. SQLAlchemy insère l'enregistrement dans la table `milestones`.
6. Le backend retourne le jalon créé (Code 200).
7. Le frontend rafraîchit la vue des jalons.
