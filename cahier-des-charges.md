📋 CAHIER DES CHARGES POUR LLM : Plugin Logseq DB Calendar Sync

CONTEXTE :
Tu es un développeur expert en TypeScript, spécialisé dans la création de plugins pour l'écosystème Logseq, avec une maîtrise parfaite de la nouvelle architecture Logseq DB (base de données SQLite, abandon du Markdown plat au profit d'entités structurées).
Ton objectif est de développer un plugin Logseq permettant la synchronisation unidirectionnelle (Logseq ➔ Calendrier) des tâches vers Google Calendar ou Microsoft Outlook.
1. STACK TECHNIQUE ET OUTILS

    Langage : TypeScript (Strict mode activé).

    Build Tool : Vite (utilisation du template officiel de plugin Logseq).

    Logseq API : @logseq/libs (version >= 0.3.0, compatible avec Logseq DB).

    APIs Distantes : Google Calendar API REST et/ou Microsoft Graph API (Outlook).

    Architecture : Clean Architecture. Le code doit être modulaire, testable, et séparer la logique métier de l'interface utilisateur.

2. CONTRAINTES STRICTES LIÉES À LOGSEQ DB

Ceci est la règle d'or du projet. L'application cible est Logseq DB, ce qui implique :

    Interdiction stricte du parsing textuel (Regex) : Tu ne dois JAMAIS lire ou modifier le contenu brut en Markdown pour extraire des statuts (TODO), des dates (SCHEDULED) ou injecter des propriétés.

    Utilisation exclusive des APIs natives : * Les requêtes doivent être faites en Datalog (logseq.DB.datascriptQuery) en ciblant le nouveau dictionnaire de données unifié.

        L'extraction des dates de SCHEDULED ou DEADLINE doit se faire via les attributs de la base de données.

        L'ajout de l'ID du calendrier généré (cal-event-id) doit se faire via les fonctions de modification de propriétés natives de l'API (ex: logseq.Editor.upsertBlockProperty), pour que cela soit enregistré proprement dans la DB et non comme une chaîne de caractères injectée au forceps.

3. PÉRIMÈTRE DU MVP (Minimum Viable Product)

Pour cette première version, le plugin se limitera à :

    Bouton manuel : Un bouton dans la barre d'outils Logseq pour déclencher la synchronisation (pas de background sync pour le moment).

    Sens unique : Logseq ➔ Calendrier cible.

    Filtre : Ne récupérer que les blocs ayant un statut de tâche (TODO, DOING, etc.) ET une date associée (SCHEDULED ou DEADLINE).

    Provider : Commencer par implémenter l'adaptateur pour Google Calendar (Outlook sera ajouté plus tard via la même interface).

4. ARCHITECTURE ET DESIGN PATTERNS

Le code doit être organisé pour être hautement maintenable. Tu devras structurer le projet autour d'interfaces claires.

A. L'Interface ICalendarProvider
Doit définir un contrat strict pour que le moteur de synchronisation soit agnostique du calendrier final.

    authenticate(): Promise<boolean>

    createEvent(eventData: SyncEvent): Promise<string> (retourne l'ID généré)

    updateEvent(eventId: string, eventData: SyncEvent): Promise<void>

    deleteEvent(eventId: string): Promise<void>

B. Le modèle de données interne (SyncEvent)
Une classe ou interface TypeScript commune représentant la tâche Logseq normalisée :

    logseqBlockId (UUID)

    title (Texte du bloc expurgé des tags de statut)

    startDate & endDate (ISO 8601)

    status (TODO, DONE, etc.)

    remoteEventId (L'ID du calendrier, s'il existe déjà)

C. Le moteur de synchronisation (SyncEngine)
L'algorithme de synchronisation lors du clic sur le bouton :

    Requête DB : Récupérer toutes les tâches datées.

    Itération : Pour chaque tâche :

        Si remoteEventId est absent : Appeler createEvent() ➔ récupérer le nouvel ID ➔ appeler l'API Logseq pour ajouter la propriété cal-event-id au bloc.

        Si remoteEventId est présent : Comparer le contenu actuel du bloc avec l'événement distant (ou forcer l'update local ➔ distant) via updateEvent().

        Si la tâche est marquée DONE : Mettre à jour l'événement distant pour refléter la complétion (ou le supprimer, selon la configuration).

5. GESTION DE L'AUTHENTIFICATION (OAuth)

    Isoler la logique OAuth dans un module dédié (auth/).

    Pour le MVP, implémenter un flux OAuth 2.0 PKCE ou permettre à l'utilisateur de saisir un token dans les paramètres du plugin (Logseq Settings API). Le LLM devra proposer la solution la plus élégante à implémenter dans une app locale Electron/Web.

6. INSTRUCTIONS DE GÉNÉRATION POUR LE LLM

Tu vas agir en tant qu'assistant de développement interactif.
Règle absolue : Ne génère pas tout le code d'un seul coup.

Procède étape par étape selon cette séquence :

    Étape 1 : Confirme ta compréhension du cahier des charges (notamment les contraintes Logseq DB) et propose une arborescence de fichiers (structure des dossiers src/). Attends ma validation.

    Étape 2 : Rédige les Interfaces TypeScript (ICalendarProvider, SyncEvent) et le modèle de données. Attends ma validation.

    Étape 3 : Rédige les requêtes Datalog adaptées à Logseq DB pour extraire les tâches. Attends ma validation.

    Étape 4 : Rédige le SyncEngine et le Provider Google Calendar.

    Étape 5 : Rédige le point d'entrée du plugin (main.ts) et l'interface utilisateur.

À chaque étape, ajoute des commentaires JSDoc détaillés sur chaque fonction et gère les erreurs (try/catch) de manière explicite (ex: console.error clair ou notification UI via logseq.UI.showMsg).


7. REGLES COMPLEMENTAIRES

* Documente suivant les meilleures méthodes
* La langue de rédation / commentaires est l'anglais
* Utilise git intensivement. Suis le git flow autant que possible.
* J'ai accès au discord communautairede logseq. SI TU NE SAIS PAS, FORMULE UNE QUESTION et je la poserai. Ne reste pas bloqué sur un problème.
* voila le lien du remote à utiliser : `git@github.com:jbfrys-baribal-tech/logseq-task-to-calendar.git`
