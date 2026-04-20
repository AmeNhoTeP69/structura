Voici la liste détaillée des pages/interfaces, organisée par type d’utilisateur, pour correspondre à ton besoin métier.

**1. Visiteur public**

### `Accueil`
Permet de :
- découvrir la société
- voir la proposition de valeur
- accéder aux services
- accéder à la page contact
- accéder à la connexion / inscription

Contenu conseillé :
- bannière principale
- présentation société
- services mis en avant
- étapes de fonctionnement
- témoignages / réalisations
- CTA vers services et contact

API :
- `GET /api/public/site-content/home` : récupérer le contenu dynamique de la page d’accueil
- `GET /api/public/services/featured` : récupérer les services mis en avant
- `GET /api/public/testimonials` : récupérer témoignages / réalisations publiés
- `GET /api/public/settings` : récupérer les informations publiques globales du site

---

### `Catalogue des services`
Permet de :
- consulter tous les services
- filtrer par catégorie
- voir les détails d’un service
- ajouter un service au `panier projet`

Contenu conseillé :
- cartes services
- filtres catégories
- bouton `ajouter au panier projet`
- résumé panier visible

API :
- `GET /api/public/services` : lister tous les services actifs
- `GET /api/public/service-categories` : lister les catégories de services
- `GET /api/public/services?category=:slug&search=:term` : filtrer/rechercher les services
- `GET /api/cart` : récupérer le contenu du panier projet courant
- `POST /api/cart/items` : ajouter un service au panier projet
- `PUT /api/cart/items/:itemId` : modifier quantité ou note d’un service dans le panier
- `DELETE /api/cart/items/:itemId` : retirer un service du panier

---

### `Détail d’un service`
Permet de :
- lire la description complète
- voir les bénéfices du service
- voir exemples / livrables
- ajouter au panier projet

API :
- `GET /api/public/services/:serviceId` : récupérer le détail complet d’un service
- `GET /api/public/services/:serviceId/examples` : récupérer exemples / livrables du service
- `POST /api/cart/items` : ajouter ce service au panier projet
- `GET /api/cart` : rafraîchir le résumé panier après ajout

---

### `Panier projet`
Permet de :
- voir les services sélectionnés
- retirer un service
- modifier éventuellement quantité ou note
- continuer vers connexion / espace client
- commencer la création d’une demande

Important :
- si utilisateur non connecté, on peut l’obliger à se connecter avant validation

API :
- `GET /api/cart` : récupérer le panier projet courant
- `PUT /api/cart/items/:itemId` : modifier quantité ou note d’un service
- `DELETE /api/cart/items/:itemId` : retirer un service du panier
- `POST /api/cart/merge` : fusionner un panier invité avec le panier du compte connecté
- `POST /api/auth/session/check` : vérifier si l’utilisateur est connecté avant de poursuivre vers la demande

---

### `Contact`
Permet de :
- envoyer un message à l’administrateur
- demander des informations
- poser une question commerciale

Champs :
- nom
- email
- téléphone
- sujet
- message

API :
- `POST /api/public/contact-messages` : envoyer un message de contact
- `GET /api/public/settings/contact` : récupérer email, téléphone et infos de contact publiques

---

### `Connexion`
Permet de :
- se connecter comme client, employé ou admin

API :
- `POST /api/auth/login` : authentifier un utilisateur
- `POST /api/auth/logout` : fermer la session
- `GET /api/auth/me` : récupérer l’utilisateur connecté et son rôle
- `POST /api/auth/forgot-password` : démarrer la réinitialisation du mot de passe
- `POST /api/auth/refresh` : rafraîchir le token ou la session si nécessaire

---

### `Inscription client`
Permet de :
- créer un compte client
- accéder ensuite à son espace personnel

API :
- `POST /api/auth/register/client` : créer un compte client
- `POST /api/auth/verify-email` : vérifier l’adresse email si activé
- `GET /api/auth/me` : récupérer le profil après inscription/connexion automatique

---

**2. Client**

### `Dashboard client`
Permet de :
- voir un résumé de ses demandes de projet
- voir un résumé de ses projets en cours
- voir les dernières notifications
- accéder rapidement à :
  - panier projet
  - nouvelle demande
  - demandes existantes
  - projets actifs

Widgets conseillés :
- nombre de demandes en attente
- nombre de projets actifs
- dernières modifications admin
- notifications non lues

API :
- `GET /api/client/dashboard/summary` : récupérer les indicateurs du dashboard client
- `GET /api/project-requests?scope=mine&limit=5` : récupérer les dernières demandes du client
- `GET /api/projects?scope=mine&limit=5` : récupérer les projets du client
- `GET /api/notifications?scope=mine&limit=10` : récupérer les notifications récentes
- `GET /api/cart` : récupérer le panier projet pour le raccourci panier

---

### `Panier projet client`
Permet de :
- retrouver les services choisis
- modifier la sélection
- lancer la création d’une demande de projet

API :
- `GET /api/cart` : récupérer le panier du client connecté
- `PUT /api/cart/items/:itemId` : modifier les éléments du panier
- `DELETE /api/cart/items/:itemId` : supprimer un service du panier
- `POST /api/project-requests/from-cart/preview` : préparer le pré-remplissage de la demande à partir du panier

---

### `Créer une demande de projet`
Permet de :
- transformer le panier en demande réelle

Champs :
- titre de la demande
- description du travail demandé
- emplacement du projet
- budget souhaité
- date de début souhaitée
- services choisis
- documents à fournir

Documents :
- design maison
- droit de construction
- plan terrain
- autres fichiers

Actions :
- enregistrer brouillon
- soumettre la demande

API :
- `GET /api/cart` : récupérer les services choisis à injecter dans le formulaire
- `POST /api/project-requests` : créer une demande de projet en brouillon ou soumise
- `PUT /api/project-requests/:id` : mettre à jour un brouillon existant
- `POST /api/project-requests/:id/documents` : téléverser les documents de la demande
- `DELETE /api/project-requests/:id/documents/:documentId` : supprimer un document avant soumission
- `POST /api/project-requests/:id/submit` : soumettre officiellement la demande
- `GET /api/public/services` : récupérer les services pour affichage/récapitulatif

---

### `Mes demandes de projet`
Permet de :
- voir toutes les demandes du client
- filtrer par statut
- rechercher une demande
- ouvrir le détail d’une demande

Statuts visibles :
- `draft`
- `submitted`
- `pending`
- `under_review`
- `refused`
- `waiting_client_acceptance`
- `approved`
- `cancelled`

API :
- `GET /api/project-requests?scope=mine` : lister les demandes du client
- `GET /api/project-requests?scope=mine&status=:status&search=:term` : filtrer/rechercher les demandes
- `GET /api/project-request-statuses` : récupérer la liste des statuts disponibles pour filtres

---

### `Détail d’une demande de projet`
Permet de :
- voir les services choisis
- voir les informations saisies
- voir les documents envoyés
- suivre l’état d’étude du dossier
- voir l’historique des changements de statut
- voir la comparaison entre :
  - valeur client
  - valeur proposée par l’admin

Exemple d’affichage :
- budget demandé par client
- budget proposé par admin
- date souhaitée par client
- date proposée par admin

Actions possibles selon statut :
- modifier brouillon si `draft`
- annuler demande si autorisé
- accepter proposition admin
- refuser proposition admin
- ajouter un commentaire/réponse

API :
- `GET /api/project-requests/:id` : récupérer le détail complet de la demande
- `GET /api/project-requests/:id/services` : récupérer les services choisis
- `GET /api/project-requests/:id/documents` : récupérer les documents de la demande
- `GET /api/project-requests/:id/status-history` : récupérer l’historique des statuts
- `PUT /api/project-requests/:id` : modifier un brouillon
- `POST /api/project-requests/:id/cancel` : annuler une demande si autorisé
- `POST /api/project-requests/:id/respond` : accepter ou refuser la proposition admin
- `POST /api/project-requests/:id/comments` : ajouter une note ou réponse client

---

### `Mes projets`
Permet de :
- voir les projets validés
- accéder au détail de chaque projet
- suivre leur progression

API :
- `GET /api/projects?scope=mine` : lister les projets du client
- `GET /api/projects?scope=mine&status=:status&search=:term` : filtrer/rechercher les projets
- `GET /api/project-statuses` : récupérer la liste des statuts projet pour filtres

---

### `Détail projet client`
Permet de :
- voir les infos générales du projet
- voir l’équipe assignée
- voir l’avancement global
- voir les documents visibles au client
- voir la rubrique `timeline and logs`
- voir uniquement les logs `ALL`

Onglets conseillés :
- aperçu
- équipe
- documents
- timeline and logs

Le client ne doit pas voir :
- les logs `TEAM_ONLY`

API :
- `GET /api/projects/:id` : récupérer le détail général du projet
- `GET /api/projects/:id/assignments` : récupérer l’équipe assignée
- `GET /api/projects/:id/documents?visibility=ALL` : récupérer les documents visibles au client
- `GET /api/projects/:id/timeline-logs?visibility=ALL` : récupérer uniquement les logs visibles au client
- `GET /api/projects/:id/status-history` : récupérer l’historique du projet
- `GET /api/projects/:id/progress` : récupérer l’état d’avancement si séparé du détail principal

---

### `Notifications client`
Permet de :
- voir les changements d’état
- voir les nouvelles propositions admin
- voir les nouveaux commentaires visibles
- marquer comme lu

API :
- `GET /api/notifications?scope=mine` : lister les notifications du client
- `PATCH /api/notifications/:id/read` : marquer une notification comme lue
- `PATCH /api/notifications/read-all` : tout marquer comme lu
- `DELETE /api/notifications/:id` : supprimer/masquer une notification si autorisé

---

### `Profil client`
Permet de :
- modifier ses informations personnelles
- changer mot de passe
- gérer téléphone, email, etc.

API :
- `GET /api/users/me` : récupérer le profil du client connecté
- `PUT /api/users/me` : modifier les informations personnelles
- `PATCH /api/users/me/password` : changer le mot de passe
- `PATCH /api/users/me/email` : mettre à jour l’email si workflow séparé

---

**3. Administrateur**

### `Dashboard admin`
Permet de :
- voir la vue globale plateforme
- voir statistiques demandes/projets/utilisateurs
- voir notifications importantes
- accéder rapidement aux modules

Widgets :
- nombre de nouvelles demandes
- demandes en étude
- demandes en attente de réponse client
- projets actifs
- employés assignés
- messages contact non lus

API :
- `GET /api/admin/dashboard/summary` : récupérer les indicateurs globaux d’administration
- `GET /api/project-requests?status=PENDING&limit=5` : récupérer les nouvelles demandes
- `GET /api/project-requests?status=UNDER_REVIEW&limit=5` : récupérer les demandes en étude
- `GET /api/projects?limit=5` : récupérer les projets récents
- `GET /api/contact-messages?status=NEW&limit=5` : récupérer les messages non lus
- `GET /api/notifications?scope=mine&limit=10` : récupérer les notifications admin

---

### `Gestion des demandes de projet`
C’est une interface dédiée séparée des projets.

Permet de :
- voir toutes les demandes clients
- filtrer par statut
- rechercher par client, référence, service, date
- ouvrir une demande en détail

C’est l’un des écrans les plus importants.

API :
- `GET /api/project-requests` : lister toutes les demandes
- `GET /api/project-requests?status=:status&clientId=:clientId&serviceId=:serviceId&search=:term` : filtrer/rechercher les demandes
- `GET /api/project-request-statuses` : récupérer les statuts pour filtres
- `GET /api/services` : récupérer les services pour filtres avancés
- `GET /api/users?role=CLIENT` : récupérer les clients pour filtres

---

### `Détail d’une demande admin`
Permet de :
- consulter toutes les infos envoyées par le client
- voir les services choisis
- voir les documents fournis
- voir les valeurs client
- proposer :
  - budget admin
  - date admin
- changer le statut
- ajouter une note d’étude

Actions clés :
- passer à `under_review`
- refuser
- proposer une offre au client via `waiting_client_acceptance`
- une fois acceptée par le client, générer ou confirmer le passage en `project`

Important :
- quand la demande devient projet, elle ne doit plus apparaître dans la liste des demandes actives
- elle passe dans l’interface projets

API :
- `GET /api/project-requests/:id` : récupérer le détail complet de la demande
- `GET /api/project-requests/:id/services` : récupérer les services choisis
- `GET /api/project-requests/:id/documents` : récupérer les documents fournis
- `GET /api/project-requests/:id/status-history` : récupérer l’historique de traitement
- `PATCH /api/project-requests/:id/review` : mettre à jour statut, note admin, budget proposé et date proposée
- `POST /api/project-requests/:id/transition-to-project` : créer le projet après acceptation client
- `POST /api/project-requests/:id/documents/:documentId/copy-to-project` : recopier un document vers le projet si nécessaire

---

### `Gestion des projets`
Permet de :
- voir tous les projets validés
- filtrer par statut
- filtrer par employé
- rechercher
- ouvrir le détail projet

API :
- `GET /api/projects` : lister tous les projets
- `GET /api/projects?status=:status&employeeId=:employeeId&search=:term` : filtrer/rechercher les projets
- `GET /api/project-statuses` : récupérer les statuts projet
- `GET /api/users?role=EMPLOYEE` : récupérer les employés pour filtres

---

### `Détail projet admin`
Permet de :
- voir les infos globales
- voir le lien avec la demande d’origine
- gérer les affectations
- modifier statut projet
- modifier budget/date fin si nécessaire
- ajouter documents
- écrire dans timeline and logs
- choisir visibilité :
  - `ALL`
  - `TEAM_ONLY`

Onglets conseillés :
- aperçu
- équipe
- documents
- timeline and logs
- historique statuts

API :
- `GET /api/projects/:id` : récupérer le détail général du projet
- `GET /api/projects/:id/assignments` : récupérer les affectations de l’équipe
- `GET /api/projects/:id/documents` : récupérer tous les documents du projet selon permissions admin
- `GET /api/projects/:id/timeline-logs` : récupérer tous les logs du projet
- `GET /api/projects/:id/status-history` : récupérer l’historique des statuts
- `PATCH /api/projects/:id` : modifier les informations globales du projet
- `PATCH /api/projects/:id/status` : modifier le statut du projet
- `PATCH /api/projects/:id/progress` : modifier le pourcentage d’avancement
- `POST /api/projects/:id/documents` : ajouter un document
- `POST /api/projects/:id/timeline-logs` : ajouter une entrée timeline/log
- `GET /api/project-requests/:requestId` : récupérer la demande d’origine liée

---

### `Affectation équipe projet`
Peut être un onglet ou un écran dédié.

Permet de :
- assigner un ou plusieurs employés
- choisir un rôle d’affectation
- définir le lead
- retirer une affectation

API :
- `GET /api/projects/:id/assignments` : récupérer les affectations existantes
- `GET /api/users?role=EMPLOYEE` : récupérer la liste des employés assignables
- `GET /api/employee-types` : récupérer les types d’employés pour filtrage
- `POST /api/projects/:id/assignments` : assigner un employé au projet
- `PATCH /api/projects/:id/assignments/:assignmentId` : modifier rôle ou lead
- `DELETE /api/projects/:id/assignments/:assignmentId` : retirer une affectation

---

### `Gestion des utilisateurs`
Permet de :
- créer client, employé, admin
- modifier profil
- activer/désactiver compte
- réinitialiser mot de passe

API :
- `GET /api/users` : lister les utilisateurs
- `GET /api/users?role=:role&search=:term` : filtrer/rechercher les utilisateurs
- `POST /api/users` : créer un utilisateur
- `GET /api/users/:id` : récupérer le détail d’un utilisateur
- `PUT /api/users/:id` : modifier un utilisateur
- `PATCH /api/users/:id/status` : activer/désactiver un compte
- `POST /api/users/:id/reset-password` : réinitialiser le mot de passe

---

### `Gestion des types d’employés`
Permet de :
- créer les types d’employés
- modifier les types
- supprimer les types non utilisés

Exemples :
- architecte
- designer intérieur
- ingénieur structure
- paysagiste

API :
- `GET /api/employee-types` : lister les types d’employés
- `POST /api/employee-types` : créer un type d’employé
- `PUT /api/employee-types/:id` : modifier un type d’employé
- `DELETE /api/employee-types/:id` : supprimer un type non utilisé

---

### `Gestion des employés`
Permet de :
- créer comptes employés
- affecter un type
- voir spécialité
- voir projets assignés

API :
- `GET /api/users?role=EMPLOYEE` : lister les employés
- `GET /api/employee-types` : récupérer les types d’employés
- `POST /api/users` : créer un compte employé
- `GET /api/employees/:userId/profile` : récupérer le profil employé détaillé
- `PUT /api/employees/:userId/profile` : modifier le type, la spécialité ou les notes
- `GET /api/projects?employeeId=:userId` : récupérer les projets assignés à un employé

---

### `Gestion des services`
Permet de :
- créer un service
- modifier un service
- activer/désactiver un service
- lier à des catégories

API :
- `GET /api/services` : lister tous les services
- `POST /api/services` : créer un service
- `GET /api/services/:id` : récupérer le détail d’un service
- `PUT /api/services/:id` : modifier un service
- `PATCH /api/services/:id/status` : activer/désactiver un service
- `PUT /api/services/:id/categories` : lier un service à ses catégories

---

### `Gestion des catégories de services`
Permet de :
- créer catégories
- modifier catégories
- ordonner les catégories

API :
- `GET /api/service-categories` : lister les catégories
- `POST /api/service-categories` : créer une catégorie
- `PUT /api/service-categories/:id` : modifier une catégorie
- `PATCH /api/service-categories/reorder` : réordonner les catégories
- `DELETE /api/service-categories/:id` : supprimer une catégorie

---

### `Gestion des messages de contact`
Permet de :
- voir les messages envoyés par le site public
- les marquer lus
- les archiver
- noter qu’une réponse a été faite

API :
- `GET /api/contact-messages` : lister les messages de contact
- `GET /api/contact-messages?status=:status&search=:term` : filtrer/rechercher les messages
- `GET /api/contact-messages/:id` : récupérer le détail d’un message
- `PATCH /api/contact-messages/:id/status` : changer le statut d’un message
- `POST /api/contact-messages/:id/reply-note` : enregistrer une note de réponse admin

---

### `Gestion du contenu du site`
Si tu veux aller jusqu’au bout du besoin admin.

Permet de :
- modifier texte accueil
- modifier sections publiques
- gérer services mis en avant
- gérer bannières, contenu marketing

Ce module peut venir plus tard si besoin.

API :
- `GET /api/admin/site-content` : récupérer tous les blocs de contenu éditables
- `PUT /api/admin/site-content/:sectionKey` : modifier une section publique
- `GET /api/public/site-content/:sectionKey` : prévisualiser le rendu public d’une section
- `POST /api/admin/site-content/assets` : téléverser une bannière ou média de contenu

---

### `Notifications admin`
Permet de :
- voir nouvelles demandes
- voir réponse client à une proposition
- voir nouveaux logs importants
- voir uploads documents

API :
- `GET /api/notifications?scope=mine` : lister les notifications admin
- `PATCH /api/notifications/:id/read` : marquer une notification comme lue
- `PATCH /api/notifications/read-all` : tout marquer comme lu
- `DELETE /api/notifications/:id` : supprimer/masquer une notification

---

### `Paramètres plateforme`
Permet de :
- paramètres généraux
- types d’employés
- statuts affichables
- configuration documents
- éventuellement règles métier

API :
- `GET /api/admin/platform-settings` : récupérer la configuration globale
- `PUT /api/admin/platform-settings` : modifier les paramètres généraux
- `GET /api/employee-types` : récupérer les types d’employés liés aux paramètres
- `GET /api/admin/document-settings` : récupérer la configuration documentaire
- `PUT /api/admin/document-settings` : modifier les règles liées aux documents

---

**4. Employé**

### `Dashboard employé`
Permet de :
- voir uniquement les projets qui lui sont assignés
- voir résumé de ses tâches/projets
- voir dernières mises à jour
- accéder rapidement à ses projets

API :
- `GET /api/employee/dashboard/summary` : récupérer les indicateurs du dashboard employé
- `GET /api/projects?scope=assigned&limit=5` : récupérer les projets assignés récents
- `GET /api/notifications?scope=mine&limit=10` : récupérer les notifications de l’employé
- `GET /api/project-timeline-logs?scope=assigned&limit=10` : récupérer les dernières activités sur ses projets

---

### `Mes projets employés`
Permet de :
- voir la liste de ses projets assignés uniquement
- filtrer par statut
- rechercher

API :
- `GET /api/projects?scope=assigned` : lister les projets assignés à l’employé
- `GET /api/projects?scope=assigned&status=:status&search=:term` : filtrer/rechercher les projets
- `GET /api/project-statuses` : récupérer les statuts disponibles

---

### `Détail projet employé`
Permet de :
- voir informations du projet
- voir équipe assignée
- voir documents accessibles
- interagir avec `timeline and logs`
- mettre à jour le progress
- ajouter commentaire ou requête
- choisir visibilité :
  - `ALL`
  - `TEAM_ONLY`

L’employé ne doit agir que sur les projets auxquels il est affecté.

API :
- `GET /api/projects/:id` : récupérer le détail du projet si l’employé y est affecté
- `GET /api/projects/:id/assignments` : récupérer l’équipe du projet
- `GET /api/projects/:id/documents` : récupérer les documents accessibles à l’équipe
- `GET /api/projects/:id/timeline-logs` : récupérer les logs visibles à l’équipe
- `PATCH /api/projects/:id/progress` : mettre à jour le progress du projet
- `POST /api/projects/:id/timeline-logs` : ajouter un commentaire, une requête ou une note
- `POST /api/projects/:id/documents` : ajouter un document projet si autorisé

---

### `Timeline and Logs`
Peut être un onglet dans détail projet.

Permet de :
- poster un commentaire
- poster une requête
- enregistrer une mise à jour de progression
- préciser visibilité

Exemples :
- `ALL` : visible admin + équipe + client
- `TEAM_ONLY` : visible admin + équipe seulement

API :
- `GET /api/projects/:id/timeline-logs` : récupérer la timeline complète visible par l’employé
- `POST /api/projects/:id/timeline-logs` : créer une nouvelle entrée
- `PATCH /api/projects/:id/timeline-logs/:logId` : modifier une entrée si l’auteur peut l’éditer
- `DELETE /api/projects/:id/timeline-logs/:logId` : supprimer une entrée si autorisé

---

### `Documents projet employé`
Permet de :
- consulter documents du projet
- ajouter certains documents
- voir les documents liés à l’exécution

API :
- `GET /api/projects/:id/documents` : lister les documents accessibles
- `POST /api/projects/:id/documents` : ajouter un document d’exécution
- `GET /api/projects/:id/documents/:documentId/download` : télécharger un document
- `DELETE /api/projects/:id/documents/:documentId` : supprimer un document si autorisé

---

### `Profil employé`
Permet de :
- voir ses infos
- modifier certaines informations personnelles
- changer mot de passe

API :
- `GET /api/users/me` : récupérer le profil de l’employé connecté
- `PUT /api/users/me` : modifier les informations personnelles
- `PATCH /api/users/me/password` : changer le mot de passe
- `GET /api/employees/me/profile` : récupérer le profil métier employé si séparé du profil utilisateur

---

**5. Interfaces transversales importantes**

### `Notifications`
Chaque rôle peut avoir son écran de notifications.

API :
- `GET /api/notifications?scope=mine` : lister les notifications de l’utilisateur connecté
- `PATCH /api/notifications/:id/read` : marquer une notification comme lue
- `PATCH /api/notifications/read-all` : tout marquer comme lu

---

### `Page 403 / accès refusé`
Permet de :
- bloquer l’accès à une interface non autorisée

---

### `Page 404`
Permet de :
- gérer les pages inexistantes

---

## Résumé des écrans minimum par rôle

### Visiteur
- Accueil
- Catalogue services
- Détail service
- Panier projet
- Contact
- Connexion
- Inscription

### Client
- Dashboard
- Panier projet
- Créer demande
- Mes demandes
- Détail demande
- Mes projets
- Détail projet
- Notifications
- Profil

### Admin
- Dashboard
- Gestion demandes
- Détail demande
- Gestion projets
- Détail projet
- Affectation équipe
- Gestion utilisateurs
- Gestion types employés
- Gestion employés
- Gestion services
- Gestion catégories
- Messages contact
- Contenu site
- Notifications
- Paramètres

### Employé
- Dashboard
- Mes projets
- Détail projet
- Timeline and logs
- Documents projet
- Profil
