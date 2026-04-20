# ROADMAP Structura

Roadmap de développement de l’application Structura, découpée en phases de mise en oeuvre.

Références :
- pages : [pages.md](/Users/omar/Desktop/projects/stage%20copine%20sana%20/structura-main/documentation/pages.md:1)
- API : [API.md](/Users/omar/Desktop/projects/stage%20copine%20sana%20/structura-main/documentation/API.md:1)
- base de données : [schema.prisma](/Users/omar/Desktop/projects/stage%20copine%20sana%20/structura-main/server/prisma/schema.prisma:1)

## Vue d’ensemble

Flux métier cible :
- visiteur consulte les services
- il ajoute des services au panier projet
- le client crée une demande de projet
- l’admin étudie la demande et propose une réponse
- le client accepte ou refuse
- si accepté, la demande devient un projet
- l’admin assigne une équipe
- l’équipe exécute le projet via timeline/logs et documents

## Ordre recommandé

1. Phase 1. Fondations techniques
2. Phase 2. Authentification et rôles
3. Phase 3. Site public et catalogue services
4. Phase 4. Panier projet et création de demande
5. Phase 6. Back-office admin demandes
6. Phase 5. Espace client demandes
7. Phase 7. Transformation demande en projet
8. Phase 8. Gestion des employés et types
9. Phase 9. Affectation équipe projet
10. Phase 10. Espace employé et exécution projet
11. Phase 11. Timeline, logs et visibilité
12. Phase 12. Documents projet
13. Phase 13. Notifications
14. Phase 14. Contenu admin du site public
15. Phase 15. Qualité, sécurité et finalisation

---

## Phase 1. Fondations techniques

Objectif :
- brancher PostgreSQL et Prisma
- mettre en place une architecture backend propre
- sortir de `db.json`

Tables concernées :
- toutes les tables du schéma Prisma

APIs concernées :
- aucune API métier finale
- endpoints techniques de healthcheck éventuellement

Interfaces concernées :
- aucune interface métier

Tâches :
- configurer `DATABASE_URL`
- installer Prisma côté backend
- générer le client Prisma
- créer la première migration
- organiser le backend en `routes`, `controllers`, `services`, `middlewares`
- définir le format standard de réponse API
- mettre en place la gestion des erreurs

Critères de validation :
- la base PostgreSQL est accessible
- Prisma génère correctement le client
- la migration s’applique sans erreur
- le backend démarre sans dépendre de `db.json`

---

## Phase 2. Authentification et rôles

Objectif :
- sécuriser l’accès et contrôler les rôles `CLIENT`, `EMPLOYEE`, `ADMIN`

Tables concernées :
- `users`
- `employee_profiles`

APIs concernées :
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/register/client`
- `POST /api/auth/verify-email`
- `POST /api/auth/forgot-password`
- `POST /api/auth/refresh`
- `GET /api/users/me`
- `PUT /api/users/me`
- `PATCH /api/users/me/password`

Interfaces concernées :
- `Connexion`
- `Inscription client`
- `Profil client`
- `Profil employé`

Tâches :
- hasher les mots de passe
- créer le login/logout
- ajouter middleware d’authentification
- ajouter middleware d’autorisation par rôle
- créer l’inscription client
- créer récupération du profil courant

Critères de validation :
- un client peut s’inscrire et se connecter
- un admin ne peut pas accéder aux routes client sans session valide
- les rôles sont bien vérifiés sur les routes protégées

---

## Phase 3. Site public et catalogue services

Objectif :
- rendre le site public fonctionnel avec services réels en base

Tables concernées :
- `services`
- `service_categories`
- `service_category_items`
- `contact_messages`

APIs concernées :
- `GET /api/public/site-content/home`
- `GET /api/public/settings`
- `GET /api/public/settings/contact`
- `GET /api/public/testimonials`
- `GET /api/public/services`
- `GET /api/public/services/featured`
- `GET /api/public/services/:serviceId`
- `GET /api/public/services/:serviceId/examples`
- `GET /api/public/service-categories`
- `POST /api/public/contact-messages`

Interfaces concernées :
- `Accueil`
- `Catalogue des services`
- `Détail d’un service`
- `Contact`

Tâches :
- brancher les pages publiques sur les données backend
- créer CRUD admin des services en back-office ultérieurement
- rendre les filtres catégories opérationnels
- enregistrer les messages de contact

Critères de validation :
- les services affichés viennent de la base
- les filtres par catégorie fonctionnent
- un message de contact est bien enregistré

---

## Phase 4. Panier projet et création de demande

Objectif :
- permettre au client de sélectionner des services et créer une demande

Tables concernées :
- `project_requests`
- `project_request_services`
- `project_request_documents`
- `services`

APIs concernées :
- `GET /api/cart`
- `POST /api/cart/items`
- `PUT /api/cart/items/:itemId`
- `DELETE /api/cart/items/:itemId`
- `POST /api/cart/merge`
- `POST /api/project-requests/from-cart/preview`
- `POST /api/project-requests`
- `PUT /api/project-requests/:id`
- `POST /api/project-requests/:id/documents`
- `DELETE /api/project-requests/:id/documents/:documentId`
- `POST /api/project-requests/:id/submit`

Interfaces concernées :
- `Panier projet`
- `Panier projet client`
- `Créer une demande de projet`

Tâches :
- définir le stockage du panier
- transformer le panier en pré-remplissage de demande
- créer brouillon et soumission
- implémenter upload de documents

Critères de validation :
- un utilisateur peut ajouter des services au panier
- le panier peut être modifié et vidé
- une demande complète peut être créée avec documents

---

## Phase 5. Espace client demandes

Objectif :
- permettre au client de suivre ses demandes et répondre aux propositions admin

Tables concernées :
- `project_requests`
- `project_request_services`
- `project_request_documents`
- `project_request_status_history`
- `notifications`

APIs concernées :
- `GET /api/client/dashboard/summary`
- `GET /api/project-requests?scope=mine`
- `GET /api/project-request-statuses`
- `GET /api/project-requests/:id`
- `GET /api/project-requests/:id/services`
- `GET /api/project-requests/:id/documents`
- `GET /api/project-requests/:id/status-history`
- `POST /api/project-requests/:id/cancel`
- `POST /api/project-requests/:id/respond`
- `POST /api/project-requests/:id/comments`

Interfaces concernées :
- `Dashboard client`
- `Mes demandes de projet`
- `Détail d’une demande de projet`
- `Notifications client`

Tâches :
- afficher les demandes client
- afficher comparaison valeur client / valeur admin
- implémenter acceptation/refus proposition admin
- brancher les notifications client

Critères de validation :
- un client voit toutes ses demandes
- l’historique de statut est visible
- une proposition admin peut être acceptée ou refusée

---

## Phase 6. Back-office admin demandes

Objectif :
- permettre à l’admin de traiter les demandes entrantes

Tables concernées :
- `project_requests`
- `project_request_services`
- `project_request_documents`
- `project_request_status_history`
- `users`

APIs concernées :
- `GET /api/admin/dashboard/summary`
- `GET /api/project-requests`
- `GET /api/project-requests/:id`
- `GET /api/project-requests/:id/services`
- `GET /api/project-requests/:id/documents`
- `GET /api/project-requests/:id/status-history`
- `PATCH /api/project-requests/:id/review`

Interfaces concernées :
- `Dashboard admin`
- `Gestion des demandes de projet`
- `Détail d’une demande admin`

Tâches :
- lister et filtrer les demandes
- implémenter revue admin
- proposer budget/date
- changer les statuts métier
- enregistrer notes d’étude et historique

Critères de validation :
- l’admin peut consulter une demande complète
- l’admin peut passer une demande à `UNDER_REVIEW`
- l’admin peut proposer budget et date au client

---

## Phase 7. Transformation demande en projet

Objectif :
- créer un projet réel à partir d’une demande acceptée

Tables concernées :
- `project_requests`
- `projects`
- `project_services`
- `project_documents`

APIs concernées :
- `POST /api/project-requests/:id/transition-to-project`
- `POST /api/project-requests/:id/documents/:documentId/copy-to-project`
- `GET /api/projects`
- `GET /api/projects/:id`

Interfaces concernées :
- `Détail d’une demande admin`
- `Gestion des projets`
- `Mes projets`

Tâches :
- vérifier la condition d’acceptation client
- créer le projet et copier les données métier
- copier les services choisis
- recopier certains documents si requis

Critères de validation :
- une demande acceptée crée un projet unique
- la demande n’apparaît plus parmi les demandes actives
- le projet apparaît dans les listes projet

---

## Phase 8. Gestion des employés et types d’employés

Objectif :
- gérer les profils employés et leurs types

Tables concernées :
- `users`
- `employee_types`
- `employee_profiles`

APIs concernées :
- `GET /api/employee-types`
- `POST /api/employee-types`
- `PUT /api/employee-types/:id`
- `DELETE /api/employee-types/:id`
- `GET /api/users?role=EMPLOYEE`
- `POST /api/users`
- `GET /api/employees/:userId/profile`
- `PUT /api/employees/:userId/profile`

Interfaces concernées :
- `Gestion des types d’employés`
- `Gestion des employés`
- `Gestion des utilisateurs`

Tâches :
- créer les types d’employés
- créer les comptes employés
- rattacher chaque employé à un type unique
- afficher les spécialités

Critères de validation :
- un admin peut créer un type d’employé
- un employé possède un profil rattaché à un type
- la liste des employés est exploitable pour affectations

---

## Phase 9. Affectation équipe projet

Objectif :
- permettre à l’admin d’assigner une équipe à un projet

Tables concernées :
- `project_assignments`
- `projects`
- `users`

APIs concernées :
- `GET /api/projects/:id/assignments`
- `POST /api/projects/:id/assignments`
- `PATCH /api/projects/:id/assignments/:assignmentId`
- `DELETE /api/projects/:id/assignments/:assignmentId`
- `GET /api/users?role=EMPLOYEE`
- `GET /api/employee-types`

Interfaces concernées :
- `Affectation équipe projet`
- `Détail projet admin`
- `Détail projet client`
- `Détail projet employé`

Tâches :
- ajouter/supprimer des affectations
- gérer rôle d’affectation et lead
- afficher l’équipe projet

Critères de validation :
- plusieurs employés peuvent être assignés
- un lead peut être défini
- un employé assigné voit ensuite le projet dans son espace

---

## Phase 10. Espace employé et exécution projet

Objectif :
- donner aux employés les outils de travail sur leurs projets

Tables concernées :
- `projects`
- `project_assignments`
- `project_timeline_logs`
- `project_documents`

APIs concernées :
- `GET /api/employee/dashboard/summary`
- `GET /api/projects?scope=assigned`
- `GET /api/projects/:id`
- `GET /api/projects/:id/assignments`
- `GET /api/projects/:id/documents`
- `PATCH /api/projects/:id/progress`
- `POST /api/projects/:id/timeline-logs`
- `POST /api/projects/:id/documents`

Interfaces concernées :
- `Dashboard employé`
- `Mes projets employés`
- `Détail projet employé`

Tâches :
- limiter la vue aux projets assignés
- permettre mise à jour progression
- afficher documents et équipe

Critères de validation :
- un employé ne voit que ses projets
- il peut mettre à jour le progress
- il peut interagir avec les logs si autorisé

---

## Phase 11. Timeline, logs et visibilité

Objectif :
- mettre en place le journal projet collaboratif avec contrôle de visibilité

Tables concernées :
- `project_timeline_logs`
- `project_status_history`
- `projects`

APIs concernées :
- `GET /api/projects/:id/timeline-logs`
- `POST /api/projects/:id/timeline-logs`
- `PATCH /api/projects/:id/timeline-logs/:logId`
- `DELETE /api/projects/:id/timeline-logs/:logId`
- `GET /api/projects/:id/status-history`
- `PATCH /api/projects/:id/status`

Interfaces concernées :
- `Timeline and Logs`
- `Détail projet admin`
- `Détail projet employé`
- `Détail projet client`

Tâches :
- différencier `ALL` et `TEAM_ONLY`
- enregistrer commentaires, requêtes, mises à jour
- afficher historique de statuts

Critères de validation :
- le client ne voit jamais les logs `TEAM_ONLY`
- l’équipe voit les logs internes
- l’ajout de logs met à jour la timeline en temps réel ou au refresh

---

## Phase 12. Documents projet

Objectif :
- gérer les documents projet après création et pendant exécution

Tables concernées :
- `project_documents`
- `project_request_documents`

APIs concernées :
- `GET /api/projects/:id/documents`
- `POST /api/projects/:id/documents`
- `GET /api/projects/:id/documents/:documentId/download`
- `DELETE /api/projects/:id/documents/:documentId`

Interfaces concernées :
- `Détail projet admin`
- `Détail projet employé`
- `Détail projet client`
- `Documents projet employé`

Tâches :
- upload de documents projet
- téléchargement sécurisé
- visibilité `ALL` / `TEAM_ONLY`

Critères de validation :
- un document visible `ALL` est consultable par le client
- un document `TEAM_ONLY` n’est visible que pour admin + équipe
- les permissions de téléchargement sont respectées

---

## Phase 13. Notifications

Objectif :
- informer chaque rôle des événements importants

Tables concernées :
- `notifications`

APIs concernées :
- `GET /api/notifications`
- `PATCH /api/notifications/:id/read`
- `PATCH /api/notifications/read-all`
- `DELETE /api/notifications/:id`

Interfaces concernées :
- `Notifications client`
- `Notifications admin`
- `Notifications`

Tâches :
- générer notifications sur changements métier
- afficher la liste par utilisateur
- marquer comme lues

Critères de validation :
- un changement de statut crée une notification
- un utilisateur peut marquer une notification comme lue
- les notifications sont isolées par utilisateur

---

## Phase 14. Contenu admin du site public

Objectif :
- permettre à l’admin d’éditer le contenu public du site

Tables concernées :
- selon implémentation :
  - table de contenu dédiée ou structure JSON

APIs concernées :
- `GET /api/admin/site-content`
- `PUT /api/admin/site-content/:sectionKey`
- `POST /api/admin/site-content/assets`
- `GET /api/public/site-content/:sectionKey`

Interfaces concernées :
- `Gestion du contenu du site`
- `Accueil`
- `Catalogue des services`

Tâches :
- éditer sections texte
- gérer bannières et assets
- relier contenu admin aux pages publiques

Critères de validation :
- une modification admin est visible côté public
- les assets uploadés sont correctement liés au contenu

---

## Phase 15. Qualité, sécurité et finalisation

Objectif :
- fiabiliser l’application et préparer une version propre

Tables concernées :
- toutes

APIs concernées :
- toutes

Interfaces concernées :
- toutes

Tâches :
- validations backend complètes
- vérification des permissions par route
- tests des flux critiques
- seed de données de démonstration
- états vides / erreurs UI
- nettoyage du code
- documentation finale

Critères de validation :
- les parcours principaux fonctionnent sans erreur :
  - service -> panier -> demande
  - demande -> étude admin -> proposition
  - acceptation client -> création projet
  - affectation équipe -> suivi employé
- aucun endpoint sensible n’est accessible sans autorisation
- la démonstration est stable

---

## MVP recommandé

Pour une première version solide :
- Phase 1
- Phase 2
- Phase 3
- Phase 4
- Phase 5
- Phase 6
- Phase 7
- Phase 8
- Phase 9
- Phase 10
- Phase 11

Ce MVP couvre déjà :
- site public
- panier projet
- demandes de projet
- traitement admin
- transformation en projet
- affectation équipe
- suivi employé
- timeline/logs

## Dépendances clés

- Phase 2 dépend de Phase 1
- Phase 4 dépend de Phase 3 et Phase 2
- Phase 5 dépend de Phase 4
- Phase 6 dépend de Phase 4
- Phase 7 dépend de Phase 5 et Phase 6
- Phase 9 dépend de Phase 8 et Phase 7
- Phase 10 dépend de Phase 9
- Phase 11 dépend de Phase 10
- Phase 12 dépend de Phase 7
- Phase 13 dépend de Phases 5, 6, 7, 10, 11
- Phase 14 dépend de Phase 3
- Phase 15 dépend de toutes les précédentes
