# Guide Windows PowerShell

Ce document explique comment :

- télécharger le projet depuis le dépôt GitHub
- installer les dépendances
- configurer PostgreSQL
- lancer le frontend et le backend
- tester un processus complet de bout en bout :
  - visiteur / client
  - administrateur
  - employé
  - retour client

Le guide est prévu pour une machine **Windows** avec **PowerShell**.

## 1. Prérequis

Installe les outils suivants :

- `Git`
- `Node.js 20+`
- `PostgreSQL 15+`

Vérifie ensuite dans PowerShell :

```powershell
git --version
node --version
npm --version
psql --version
```

Si PowerShell bloque l’exécution de certains scripts, ouvre PowerShell en administrateur et exécute :

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 2. Cloner le dépôt

Dans PowerShell :

```powershell
cd $HOME\Desktop
git clone https://github.com/AmeNhoTeP69/structura.git
cd .\structura
```

Si tu veux travailler sur la branche `dev` :

```powershell
git checkout dev
```

## 3. Installer les dépendances

### Frontend

À la racine du projet :

```powershell
npm install
```

### Backend

Dans le dossier `server` :

```powershell
cd .\server
npm install
cd ..
```

## 4. Configurer PostgreSQL

Le backend attend une base PostgreSQL nommée `structura`.

### 4.1 Créer le fichier `.env`

Depuis la racine du projet :

```powershell
Copy-Item .\server\.env.example .\server\.env
```

Le contenu attendu est :

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/structura?schema=public"
```

Adapte :

- `postgres`
- le mot de passe
- le port

si ta configuration PostgreSQL est différente.

### 4.2 Créer la base

Dans `server` :

```powershell
cd .\server
npm run db:create
```

### 4.3 Générer Prisma et appliquer les migrations

Toujours dans `server` :

```powershell
npm run prisma:generate
npm run prisma:deploy
```

### 4.4 Injecter les données initiales

Toujours dans `server` :

```powershell
npm run db:seed
npm run db:seed:services
```

Puis reviens à la racine :

```powershell
cd ..
```

## 5. Lancer l’application

Il faut **2 terminaux PowerShell**.

### Terminal 1 : backend

```powershell
cd "C:\Users\TON_UTILISATEUR\Desktop\structura\server"
npm run start
```

Résultat attendu :

```text
Server running on http://localhost:5001
```

### Terminal 2 : frontend

```powershell
cd "C:\Users\TON_UTILISATEUR\Desktop\structura"
npm run dev
```

Résultat attendu :

- Vite démarre
- le frontend est accessible sur `http://localhost:3000`

## 6. Vérifications rapides avant test métier

### Vérification frontend TypeScript

À la racine :

```powershell
npx tsc --noEmit
```

### Vérification backend smoke test

Dans `server` :

```powershell
npm run qa:smoke
```

Résultat attendu :

```text
Smoke tests passed.
```

## 7. Comptes de test disponibles

Après le seed initial, tu as déjà des comptes.

### Admin

- email : `admin@structura.com`
- mot de passe : `password123`

### Employés

- `jane@structura.com` / `password123`
- `mike@structura.com` / `password123`

### Clients

- `robert@client.com` / `password123`
- `contact@acme.com` / `password123`

Tu peux aussi créer un **nouveau client** depuis l’interface publique.

## 8. Processus complet à tester

Le scénario ci-dessous couvre le flux métier principal :

1. visiteur / client consulte les services
2. crée une demande
3. admin étudie la demande
4. client accepte la proposition
5. admin convertit la demande en projet
6. admin assigne un employé
7. employé publie des mises à jour
8. client voit l’avancement

## 9. Test complet pas à pas

### Étape A. Visiteur ou nouveau client

Ouvre :

- `http://localhost:3000`

Actions :

1. Va sur `Services`
2. Ouvre quelques services
3. Clique sur `Add to Basket` sur 1 ou plusieurs services
4. Va sur `Project Basket`

Tu as ensuite 2 possibilités :

- soit te connecter avec un client existant
- soit cliquer sur `Register`

### Étape B. Créer un nouveau client

Si tu veux tester l’inscription :

1. Va sur `Register`
2. Crée un compte client
3. Une fois connecté, retourne sur `Services` si nécessaire
4. Vérifie que le panier contient encore les services choisis

### Étape C. Créer une demande de projet côté client

Depuis le compte client :

1. Va sur `Project Basket`
2. Clique sur `Proceed`
3. Tu arrives sur `New Request`
4. Remplis les champs :

- `Title`
- `Description`
- `Location`
- `Requested start date`
- `Requested budget`

5. Ajoute quelques documents simulés

Exemple :

- `HOUSE_DESIGN`
- `BUILDING_PERMIT`

6. Enregistre directement en `submitted`

Résultat attendu :

- la demande apparaît dans `My Requests`
- son statut est `submitted`
- le client peut ouvrir le détail

### Étape D. Admin traite la demande

Connecte-toi avec :

- `admin@structura.com`
- `password123`

Actions :

1. Va sur `Project Requests`
2. Ouvre la demande créée par le client
3. Consulte :

- services choisis
- budget demandé
- date demandée
- localisation
- documents

4. Mets à jour la demande avec par exemple :

- `status = waiting-client-acceptance`
- `adminProposedBudget = 135000`
- `adminProposedStartDate = 2026-06-01`
- une note admin

Résultat attendu :

- la demande passe en attente de réponse client
- le client reçoit une notification

### Étape E. Client accepte la proposition

Reconnecte-toi avec le client.

Actions :

1. Va sur `Notifications`
2. Ouvre la notification liée à la demande
3. Va dans `My Requests`
4. Ouvre le détail de la demande
5. Vérifie que tu vois :

- budget demandé par le client
- budget proposé par l’admin
- date souhaitée par le client
- date proposée par l’admin

6. Clique sur `Accept`

Résultat attendu :

- la demande passe en `approved`
- l’admin reçoit une notification

### Étape F. Admin convertit la demande en projet

Reconnecte-toi comme admin.

Actions :

1. Va sur `Project Requests`
2. Ouvre la demande approuvée
3. Clique sur `Convert To Project`

Résultat attendu :

- la demande reçoit un `projectId`
- elle ne doit plus être traitée comme une demande active
- le projet apparaît dans `Project Control`

### Étape G. Admin assigne un employé

Toujours comme admin :

1. Va sur `Project Control`
2. Ouvre le projet
3. Dans l’onglet équipe / assignation, ajoute un employé

Exemple :

- `jane@structura.com`

4. Définis éventuellement :

- rôle d’assignation
- `isLead = true`

Résultat attendu :

- l’employé reçoit une notification
- le projet devient visible dans son espace

### Étape H. Employé met à jour le projet

Connecte-toi avec un employé.

Exemple :

- `jane@structura.com`
- `password123`

Actions :

1. Va sur `Dashboard`
2. Ouvre le projet assigné
3. Va dans l’interface de mise à jour projet
4. Publie une mise à jour visible `ALL`

Exemple :

- `logType = progress-update`
- `message = Foundation work started`
- `progress = 25`
- `status = in-progress`
- `visibility = all`

5. Publie ensuite une note interne

Exemple :

- `logType = note`
- `message = Need additional supplier confirmation`
- `visibility = team-only`

6. Ajoute un document projet

Exemple :

- `documentType = REPORT`
- `fileName = weekly-site-report.pdf`
- `visibility = all`

Résultat attendu :

- le projet passe à `in-progress`
- le client voit la mise à jour visible `ALL`
- le client ne voit pas la note `TEAM_ONLY`
- le document `ALL` est visible au client

### Étape I. Client suit le projet

Reconnecte-toi en client.

Actions :

1. Va sur `Notifications`
2. Va sur `Dashboard`
3. Va sur `My Projects`
4. Ouvre le projet

Vérifie :

- le statut du projet
- le pourcentage d’avancement
- la timeline visible au client
- les documents visibles au client

Tu dois voir :

- la mise à jour publique
- le document public

Tu ne dois pas voir :

- les logs `TEAM_ONLY`
- les documents internes

## 10. Test optionnel du contenu public admin

Ce test couvre aussi la phase 14.

Connecte-toi en admin.

Actions :

1. Va sur `Site Content`
2. Modifie :

- `heroTitle`
- `heroDescription`
- `supportEmail`
- `supportPhone`

3. Enregistre
4. Retourne sur la page publique `Home`
5. Retourne sur `Contact`

Résultat attendu :

- la homepage utilise les nouvelles valeurs
- la page contact affiche les nouvelles coordonnées

## 11. Test optionnel de la messagerie de contact

Depuis l’espace public :

1. Va sur `Contact`
2. Envoie un message

Puis côté admin :

1. Va sur `Site Content`
2. Dans `Contact Inbox`, vérifie que le message apparaît
3. Change son statut :

- `new`
- `read`
- `replied`
- `archived`

## 12. Commandes utiles de maintenance

### Relancer proprement les dépendances frontend

```powershell
cd .\structura
npm install
```

### Relancer proprement les dépendances backend

```powershell
cd .\structura\server
npm install
```

### Régénérer Prisma

```powershell
cd .\structura\server
npm run prisma:generate
```

### Réappliquer les migrations

```powershell
cd .\structura\server
npm run prisma:deploy
```

### Réinjecter les données de base

```powershell
cd .\structura\server
npm run db:seed
npm run db:seed:services
```

## 13. Réinitialisation locale complète

Si tu veux repartir d’une base propre.

### Option simple

Dans `server` :

```powershell
npx prisma migrate reset --force
npm run db:seed
npm run db:seed:services
```

Attention :

- cette commande supprime les données de la base locale

## 14. Dépannage

### `npm` non reconnu

Ferme et rouvre PowerShell après installation de Node.js.

Puis vérifie :

```powershell
node --version
npm --version
```

### `psql` non reconnu

Ajoute PostgreSQL au `PATH` Windows ou utilise le terminal fourni par PostgreSQL.

### Port `5001` déjà occupé

Trouve le processus :

```powershell
netstat -ano | findstr :5001
```

Puis termine-le :

```powershell
taskkill /PID <PID> /F
```

### Le frontend ne charge pas les données backend

Vérifie :

- backend lancé sur `http://localhost:5001`
- frontend lancé sur `http://localhost:3000`
- base PostgreSQL accessible

### Les comptes seed ne fonctionnent pas

Relance :

```powershell
cd .\server
npm run db:seed
```

## 15. Résultat attendu final

Si tout fonctionne :

- le visiteur peut consulter les services
- le client peut créer une demande
- l’admin peut étudier et proposer une réponse
- le client peut accepter
- l’admin peut convertir en projet
- l’admin peut assigner un employé
- l’employé peut publier une mise à jour
- le client peut suivre le projet final

Autrement dit, tu dois pouvoir démontrer le cycle complet :

`visiteur -> client -> admin -> client -> admin -> employé -> client`
