# API Structura

Document de référence des endpoints backend pour la plateforme Structura.

## 1. Conventions générales

Base URL :
- `/api`

Format :
- toutes les requêtes et réponses utilisent `application/json`
- upload de fichiers : `multipart/form-data`

Authentification :
- `Bearer token` ou session HTTP selon l’implémentation retenue
- les endpoints protégés nécessitent un utilisateur connecté

Rôles :
- `PUBLIC`
- `CLIENT`
- `EMPLOYEE`
- `ADMIN`

Réponse succès type :

```json
{
  "success": true,
  "data": {}
}
```

Réponse erreur type :

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request payload"
  }
}
```

Pagination type :

```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "totalItems": 120,
      "totalPages": 6
    }
  }
}
```

Paramètres de liste recommandés :
- `page`
- `pageSize`
- `search`
- `sortBy`
- `sortOrder`

## 2. Règles métier importantes

- une `project request` devient un `project` uniquement après acceptation client
- un employé a un seul `employee type`
- un document de demande peut être copié vers les documents projet
- visibilité `ALL` : visible admin + équipe + client
- visibilité `TEAM_ONLY` : visible admin + équipe uniquement

## 3. Enums exposés par l’API

### `UserRole`
- `CLIENT`
- `EMPLOYEE`
- `ADMIN`

### `ProjectRequestStatus`
- `DRAFT`
- `SUBMITTED`
- `PENDING`
- `UNDER_REVIEW`
- `REFUSED`
- `WAITING_CLIENT_ACCEPTANCE`
- `APPROVED`
- `CANCELLED`

### `ProjectStatus`
- `NOT_STARTED`
- `IN_PROGRESS`
- `ON_HOLD`
- `COMPLETED`
- `CANCELLED`

### `TimelineLogVisibility`
- `ALL`
- `TEAM_ONLY`

### `ProjectDocumentVisibility`
- `ALL`
- `TEAM_ONLY`

## 4. Authentification

### `POST /api/auth/login`
Rôle :
- `PUBLIC`

Description :
- authentifier un utilisateur

Body :

```json
{
  "email": "client@example.com",
  "password": "secret"
}
```

Réponse :
- utilisateur connecté
- token/session

### `POST /api/auth/logout`
Rôle :
- `CLIENT | EMPLOYEE | ADMIN`

Description :
- fermer la session courante

### `GET /api/auth/me`
Rôle :
- `CLIENT | EMPLOYEE | ADMIN`

Description :
- récupérer l’utilisateur connecté

### `POST /api/auth/register/client`
Rôle :
- `PUBLIC`

Description :
- créer un compte client

### `POST /api/auth/verify-email`
Rôle :
- `PUBLIC`

Description :
- confirmer l’adresse email si le workflow est activé

### `POST /api/auth/forgot-password`
Rôle :
- `PUBLIC`

Description :
- demander une réinitialisation du mot de passe

### `POST /api/auth/refresh`
Rôle :
- `CLIENT | EMPLOYEE | ADMIN`

Description :
- rafraîchir le token/session si nécessaire

### `POST /api/auth/session/check`
Rôle :
- `PUBLIC`

Description :
- vérifier si l’utilisateur est connecté avant checkout panier/demande

## 5. Site public et contenu

### `GET /api/public/site-content/home`
Rôle :
- `PUBLIC`

Description :
- récupérer le contenu dynamique de la page d’accueil

### `GET /api/public/site-content/:sectionKey`
Rôle :
- `PUBLIC`

Description :
- récupérer une section publique précise

### `GET /api/public/settings`
Rôle :
- `PUBLIC`

Description :
- récupérer les paramètres publics globaux du site

### `GET /api/public/settings/contact`
Rôle :
- `PUBLIC`

Description :
- récupérer email, téléphone et informations de contact publiques

### `GET /api/public/testimonials`
Rôle :
- `PUBLIC`

Description :
- récupérer les témoignages ou réalisations publiés

### `GET /api/admin/site-content`
Rôle :
- `ADMIN`

Description :
- récupérer les blocs éditables du site

### `PUT /api/admin/site-content/:sectionKey`
Rôle :
- `ADMIN`

Description :
- modifier une section publique

### `POST /api/admin/site-content/assets`
Rôle :
- `ADMIN`

Description :
- téléverser un asset de contenu

## 6. Services et catégories

### `GET /api/public/services`
Rôle :
- `PUBLIC`

Description :
- lister les services actifs

Query :
- `category`
- `search`
- `page`
- `pageSize`

### `GET /api/public/services/featured`
Rôle :
- `PUBLIC`

Description :
- lister les services mis en avant

### `GET /api/public/services/:serviceId`
Rôle :
- `PUBLIC`

Description :
- récupérer le détail d’un service

### `GET /api/public/services/:serviceId/examples`
Rôle :
- `PUBLIC`

Description :
- récupérer les exemples/livrables d’un service

### `GET /api/public/service-categories`
Rôle :
- `PUBLIC`

Description :
- lister les catégories de services

### `GET /api/services`
Rôle :
- `ADMIN`

Description :
- lister tous les services

### `POST /api/services`
Rôle :
- `ADMIN`

Description :
- créer un service

### `GET /api/services/:id`
Rôle :
- `ADMIN`

Description :
- récupérer le détail d’un service

### `PUT /api/services/:id`
Rôle :
- `ADMIN`

Description :
- modifier un service

### `PATCH /api/services/:id/status`
Rôle :
- `ADMIN`

Description :
- activer ou désactiver un service

### `PUT /api/services/:id/categories`
Rôle :
- `ADMIN`

Description :
- remplacer les catégories d’un service

Body :

```json
{
  "categoryIds": [1, 2, 3]
}
```

### `GET /api/service-categories`
Rôle :
- `ADMIN`

Description :
- lister les catégories

### `POST /api/service-categories`
Rôle :
- `ADMIN`

Description :
- créer une catégorie

### `PUT /api/service-categories/:id`
Rôle :
- `ADMIN`

Description :
- modifier une catégorie

### `PATCH /api/service-categories/reorder`
Rôle :
- `ADMIN`

Description :
- réordonner les catégories

### `DELETE /api/service-categories/:id`
Rôle :
- `ADMIN`

Description :
- supprimer une catégorie

## 7. Panier projet

### `GET /api/cart`
Rôle :
- `PUBLIC | CLIENT`

Description :
- récupérer le panier courant

### `POST /api/cart/items`
Rôle :
- `PUBLIC | CLIENT`

Description :
- ajouter un service au panier

Body :

```json
{
  "serviceId": 12,
  "quantity": 1,
  "notes": "Option paysagisme moderne"
}
```

### `PUT /api/cart/items/:itemId`
Rôle :
- `PUBLIC | CLIENT`

Description :
- modifier un élément du panier

### `DELETE /api/cart/items/:itemId`
Rôle :
- `PUBLIC | CLIENT`

Description :
- supprimer un élément du panier

### `POST /api/cart/merge`
Rôle :
- `CLIENT`

Description :
- fusionner le panier invité avec le panier du compte connecté

## 8. Demandes de projet

### `GET /api/project-request-statuses`
Rôle :
- `CLIENT | ADMIN`

Description :
- lister les statuts de demandes utilisables par l’UI

### `POST /api/project-requests`
Rôle :
- `CLIENT`

Description :
- créer une demande de projet

Body minimal :

```json
{
  "title": "Villa moderne",
  "description": "Construction + design intérieur",
  "location": "Tunis",
  "requestedStartDate": "2026-09-01",
  "requestedBudget": 250000,
  "serviceIds": [1, 2, 4],
  "mode": "DRAFT"
}
```

### `POST /api/project-requests/from-cart/preview`
Rôle :
- `CLIENT`

Description :
- générer le pré-remplissage d’une demande à partir du panier

### `GET /api/project-requests`
Rôle :
- `CLIENT | ADMIN`

Description :
- lister les demandes

Règles :
- `CLIENT` : uniquement ses demandes avec `scope=mine`
- `ADMIN` : toutes les demandes

Query :
- `scope`
- `status`
- `clientId`
- `serviceId`
- `search`
- `page`
- `pageSize`

### `GET /api/project-requests/:id`
Rôle :
- `CLIENT | ADMIN`

Description :
- récupérer le détail d’une demande

### `PUT /api/project-requests/:id`
Rôle :
- `CLIENT`

Description :
- modifier un brouillon de demande

### `POST /api/project-requests/:id/submit`
Rôle :
- `CLIENT`

Description :
- soumettre une demande brouillon

### `POST /api/project-requests/:id/cancel`
Rôle :
- `CLIENT`

Description :
- annuler une demande si autorisé

### `POST /api/project-requests/:id/respond`
Rôle :
- `CLIENT`

Description :
- accepter ou refuser une proposition admin

Body :

```json
{
  "decision": "ACCEPT",
  "note": "J'accepte la proposition"
}
```

ou

```json
{
  "decision": "REJECT",
  "note": "Budget trop élevé"
}
```

### `PATCH /api/project-requests/:id/review`
Rôle :
- `ADMIN`

Description :
- revoir la demande et mettre à jour le statut, la note et les propositions admin

Body :

```json
{
  "status": "WAITING_CLIENT_ACCEPTANCE",
  "adminReviewNote": "Etude validée",
  "adminProposedBudget": 280000,
  "adminProposedStartDate": "2026-10-01"
}
```

### `POST /api/project-requests/:id/transition-to-project`
Rôle :
- `ADMIN`

Description :
- créer le projet après acceptation client

### `GET /api/project-requests/:id/services`
Rôle :
- `CLIENT | ADMIN`

Description :
- récupérer les services liés à la demande

### `GET /api/project-requests/:id/documents`
Rôle :
- `CLIENT | ADMIN`

Description :
- récupérer les documents d’une demande

### `POST /api/project-requests/:id/documents`
Rôle :
- `CLIENT | ADMIN`

Description :
- téléverser un document de demande

Format :
- `multipart/form-data`

Champs :
- `file`
- `documentType`

### `DELETE /api/project-requests/:id/documents/:documentId`
Rôle :
- `CLIENT | ADMIN`

Description :
- supprimer un document de demande si autorisé

### `POST /api/project-requests/:id/documents/:documentId/copy-to-project`
Rôle :
- `ADMIN`

Description :
- copier un document de demande vers un projet

### `GET /api/project-requests/:id/status-history`
Rôle :
- `CLIENT | ADMIN`

Description :
- récupérer l’historique des statuts de demande

### `POST /api/project-requests/:id/comments`
Rôle :
- `CLIENT | ADMIN`

Description :
- ajouter un commentaire/note de traitement ou réponse

## 9. Projets

### `GET /api/project-statuses`
Rôle :
- `CLIENT | EMPLOYEE | ADMIN`

Description :
- lister les statuts projet pour l’UI

### `GET /api/projects`
Rôle :
- `CLIENT | EMPLOYEE | ADMIN`

Description :
- lister les projets

Règles :
- `CLIENT` : `scope=mine`
- `EMPLOYEE` : `scope=assigned`
- `ADMIN` : tous les projets

Query :
- `scope`
- `status`
- `employeeId`
- `search`
- `page`
- `pageSize`

### `GET /api/projects/:id`
Rôle :
- `CLIENT | EMPLOYEE | ADMIN`

Description :
- récupérer le détail général d’un projet

### `PATCH /api/projects/:id`
Rôle :
- `ADMIN`

Description :
- modifier les informations générales du projet

### `PATCH /api/projects/:id/status`
Rôle :
- `ADMIN`

Description :
- modifier le statut du projet

### `PATCH /api/projects/:id/progress`
Rôle :
- `EMPLOYEE | ADMIN`

Description :
- modifier l’avancement du projet

Body :

```json
{
  "progress": 65
}
```

### `GET /api/projects/:id/progress`
Rôle :
- `CLIENT | EMPLOYEE | ADMIN`

Description :
- récupérer l’avancement courant si endpoint séparé

### `GET /api/projects/:id/status-history`
Rôle :
- `CLIENT | EMPLOYEE | ADMIN`

Description :
- récupérer l’historique des statuts projet

## 10. Affectations projet

### `GET /api/projects/:id/assignments`
Rôle :
- `CLIENT | EMPLOYEE | ADMIN`

Description :
- récupérer l’équipe affectée au projet

### `POST /api/projects/:id/assignments`
Rôle :
- `ADMIN`

Description :
- affecter un employé à un projet

Body :

```json
{
  "employeeUserId": 14,
  "assignmentRole": "Architecte principal",
  "isLead": true
}
```

### `PATCH /api/projects/:id/assignments/:assignmentId`
Rôle :
- `ADMIN`

Description :
- modifier le rôle d’affectation ou le lead

### `DELETE /api/projects/:id/assignments/:assignmentId`
Rôle :
- `ADMIN`

Description :
- retirer une affectation

## 11. Timeline and logs

### `GET /api/projects/:id/timeline-logs`
Rôle :
- `CLIENT | EMPLOYEE | ADMIN`

Description :
- récupérer la timeline du projet selon visibilité et permissions

Règles :
- `CLIENT` : seulement `ALL`
- `EMPLOYEE` et `ADMIN` : `ALL` + `TEAM_ONLY`

Query :
- `visibility`
- `page`
- `pageSize`

### `POST /api/projects/:id/timeline-logs`
Rôle :
- `EMPLOYEE | ADMIN`

Description :
- ajouter un log projet

Body :

```json
{
  "logType": "COMMENT",
  "message": "Le gros oeuvre est terminé",
  "visibility": "ALL",
  "progressValue": 55
}
```

### `PATCH /api/projects/:id/timeline-logs/:logId`
Rôle :
- `EMPLOYEE | ADMIN`

Description :
- modifier un log si autorisé

### `DELETE /api/projects/:id/timeline-logs/:logId`
Rôle :
- `EMPLOYEE | ADMIN`

Description :
- supprimer un log si autorisé

### `GET /api/project-timeline-logs`
Rôle :
- `EMPLOYEE`

Description :
- récupérer les derniers logs sur les projets assignés

Query :
- `scope=assigned`
- `limit`

## 12. Documents

### `GET /api/projects/:id/documents`
Rôle :
- `CLIENT | EMPLOYEE | ADMIN`

Description :
- lister les documents d’un projet selon permissions

### `POST /api/projects/:id/documents`
Rôle :
- `EMPLOYEE | ADMIN`

Description :
- téléverser un document projet

Format :
- `multipart/form-data`

Champs :
- `file`
- `documentType`
- `visibility`

### `GET /api/projects/:id/documents/:documentId/download`
Rôle :
- `CLIENT | EMPLOYEE | ADMIN`

Description :
- télécharger un document si visible par le rôle courant

### `DELETE /api/projects/:id/documents/:documentId`
Rôle :
- `EMPLOYEE | ADMIN`

Description :
- supprimer un document si autorisé

## 13. Utilisateurs

### `GET /api/users`
Rôle :
- `ADMIN`

Description :
- lister les utilisateurs

Query :
- `role`
- `search`
- `page`
- `pageSize`

### `POST /api/users`
Rôle :
- `ADMIN`

Description :
- créer un utilisateur

### `GET /api/users/:id`
Rôle :
- `ADMIN`

Description :
- récupérer le détail d’un utilisateur

### `PUT /api/users/:id`
Rôle :
- `ADMIN`

Description :
- modifier un utilisateur

### `PATCH /api/users/:id/status`
Rôle :
- `ADMIN`

Description :
- activer ou désactiver un compte

### `POST /api/users/:id/reset-password`
Rôle :
- `ADMIN`

Description :
- réinitialiser le mot de passe d’un utilisateur

### `GET /api/users/me`
Rôle :
- `CLIENT | EMPLOYEE | ADMIN`

Description :
- récupérer le profil courant

### `PUT /api/users/me`
Rôle :
- `CLIENT | EMPLOYEE | ADMIN`

Description :
- modifier les informations personnelles

### `PATCH /api/users/me/password`
Rôle :
- `CLIENT | EMPLOYEE | ADMIN`

Description :
- changer son mot de passe

### `PATCH /api/users/me/email`
Rôle :
- `CLIENT`

Description :
- modifier l’adresse email si workflow séparé

## 14. Employés et types d’employés

### `GET /api/employee-types`
Rôle :
- `ADMIN`

Description :
- lister les types d’employés

### `POST /api/employee-types`
Rôle :
- `ADMIN`

Description :
- créer un type d’employé

### `PUT /api/employee-types/:id`
Rôle :
- `ADMIN`

Description :
- modifier un type d’employé

### `DELETE /api/employee-types/:id`
Rôle :
- `ADMIN`

Description :
- supprimer un type non utilisé

### `GET /api/employees/:userId/profile`
Rôle :
- `ADMIN`

Description :
- récupérer le profil employé détaillé

### `PUT /api/employees/:userId/profile`
Rôle :
- `ADMIN`

Description :
- modifier le type, la spécialité ou les notes

### `GET /api/employees/me/profile`
Rôle :
- `EMPLOYEE`

Description :
- récupérer le profil métier de l’employé connecté

### `GET /api/employee/dashboard/summary`
Rôle :
- `EMPLOYEE`

Description :
- récupérer les indicateurs du dashboard employé

## 15. Dashboard client et admin

### `GET /api/client/dashboard/summary`
Rôle :
- `CLIENT`

Description :
- récupérer les indicateurs et résumés du dashboard client

### `GET /api/admin/dashboard/summary`
Rôle :
- `ADMIN`

Description :
- récupérer les indicateurs et résumés du dashboard admin

## 16. Notifications

### `GET /api/notifications`
Rôle :
- `CLIENT | EMPLOYEE | ADMIN`

Description :
- lister les notifications de l’utilisateur connecté

Query :
- `scope=mine`
- `limit`
- `page`
- `pageSize`

### `PATCH /api/notifications/:id/read`
Rôle :
- `CLIENT | EMPLOYEE | ADMIN`

Description :
- marquer une notification comme lue

### `PATCH /api/notifications/read-all`
Rôle :
- `CLIENT | EMPLOYEE | ADMIN`

Description :
- tout marquer comme lu

### `DELETE /api/notifications/:id`
Rôle :
- `CLIENT | EMPLOYEE | ADMIN`

Description :
- masquer/supprimer une notification si ce comportement est retenu

## 17. Messages de contact

### `POST /api/public/contact-messages`
Rôle :
- `PUBLIC`

Description :
- envoyer un message via le formulaire de contact

### `GET /api/contact-messages`
Rôle :
- `ADMIN`

Description :
- lister les messages de contact

Query :
- `status`
- `search`
- `page`
- `pageSize`

### `GET /api/contact-messages/:id`
Rôle :
- `ADMIN`

Description :
- récupérer le détail d’un message

### `PATCH /api/contact-messages/:id/status`
Rôle :
- `ADMIN`

Description :
- changer le statut du message

### `POST /api/contact-messages/:id/reply-note`
Rôle :
- `ADMIN`

Description :
- enregistrer une note de réponse admin

## 18. Paramètres plateforme

### `GET /api/admin/platform-settings`
Rôle :
- `ADMIN`

Description :
- récupérer les paramètres généraux de la plateforme

### `PUT /api/admin/platform-settings`
Rôle :
- `ADMIN`

Description :
- modifier les paramètres généraux

### `GET /api/admin/document-settings`
Rôle :
- `ADMIN`

Description :
- récupérer la configuration liée aux documents

### `PUT /api/admin/document-settings`
Rôle :
- `ADMIN`

Description :
- modifier les règles documentaires

## 19. Matrice rapide page -> API

Références utiles :
- les écrans et parcours sont documentés dans [pages.md](/Users/omar/Desktop/projects/stage%20copine%20sana%20/structura-main/documentation/pages.md:1)
- ce document centralise les endpoints indépendamment des écrans

