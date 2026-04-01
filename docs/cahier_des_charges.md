# Cahier des Charges - Projet Manager

## OBJECTIF
Développer une application interne de suivi de portefeuille projets, utilisable sans cloud, accessible via navigateur sur réseau interne, permettant de gérer environ 30 à 100 projets avec une structure homogène.

## CONTEXTE
L’organisation ne dispose pas de Microsoft 365 collaboratif exploitable ni de solution cloud de partage. L’application doit donc être autonome, légère, robuste, maintenable, et adaptée à un usage intranet.

## ORIENTATION TECHNIQUE IMPOSÉE
- Frontend : HTML, CSS, JavaScript (Vanilla ou framework très léger)
- Backend : Python avec FastAPI
- Base de données : SQLite
- Documents : fichiers stockés hors base, avec stockage en base uniquement des métadonnées et chemins
- API REST locale
- Pas de dépendance cloud, ni SaaS
- Pas de microservices
- Pas de Docker obligatoire pour la V1

## PÉRIMÈTRE FONCTIONNEL V1
1. Portefeuille projets (Vue liste, recherche, filtres, tri)
2. Fiche projet (Synthèse, Roadmap, Décisions, Séances, Tâches, Documents, Historique)
3. Catégories de projets (Projet comité, Projet Cap, Projet GEM, Projet Spontis, Projet Services-Div, Projet TeCo)
4. Jalons / Roadmap
5. Décisions
6. Séances
7. Tâches
8. Documents (Métadonnées)
9. Tableau de bord
10. Archivage

## UTILISATEURS
Rôles : Administrateur, Éditeur, Lecteur. Authentification simple ou base préparée pour cela.
