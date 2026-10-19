import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { User, ViewMode, Company, CompanyDraft, CompanyProcessState, Appointment, Notification, Document, DocumentVersion, DocumentReview, BankAccountRequest, BankMessage, BankPartner,
  Modification,
} from '../types';
import { mockUsers, mockCompanies, mockNotifications, mockBankRequests, mockAppointments } from '../data/mockData';
import { banks as initialBanks } from '../data/bankData';
import { EMPTY_COMPANY_PROCESS } from '../types';
import type { DomiciliationContract } from '../data/domiciliationData';

/** Commande de branding telle que le client la passe. */
export interface BrandingOrder {
  id: string;
  createdAt: string;
  clientId?: string;
  serviceId: string;
  serviceName: string;
  projectName: string;
  description: string;
  targetAudience: string;
  preferredColors?: string;
  additionalNotes?: string;
  amount: number;
  status: 'submitted' | 'quote_sent' | 'in_progress' | 'delivered' | 'completed';
}
import {
  readJSON,
  writeJSON,
  writeJSONIfChanged,
  removeKey,
  readSession,
  writeSession,
  removeSessionKey,
  onStorageChange,
  STORAGE_KEYS,
} from '../lib/storage';
import { demarrerSession, surChangement, terminerSession } from '../lib/sync';
import { nouvelId } from '../lib/id';

/** Payload accepté par `addNotification` : `id` et `createdAt` sont produits
 *  par le provider, mais plusieurs écrans passent quand même un `createdAt`. */
type NotificationInput = Omit<Notification, 'id' | 'createdAt'> & { createdAt?: string };

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  users: User[];
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  showInitialSplash: boolean;
  setShowInitialSplash: (value: boolean) => void;
  showOnboarding: boolean;
  setShowOnboarding: (value: boolean) => void;
  showOnboardingSlides: boolean;
  setShowOnboardingSlides: (value: boolean) => void;
  hasSeenOnboarding: boolean;
  markOnboardingComplete: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  companies: Company[];
  notifications: Notification[];
  documents: Document[];
  /** `createdAt` est accepté mais ignoré : il est toujours regénéré ci-dessous. */
  addNotification: (notification: NotificationInput) => void;
  markNotificationRead: (id: string) => void;
  /** Brouillons de création, persistés dans le localStorage par utilisateur. */
  getDraftsByUser: (userId: string) => CompanyDraft[];
  getDraftById: (userId: string, draftId: string) => CompanyDraft | null;
  saveDraft: (userId: string, draft: Omit<CompanyDraft, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => string;
  deleteDraft: (userId: string, draftId: string) => void;
  /** Enregistre une société soumise par un client et la rend visible côté admin. */
  addCompany: (company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => Company;
  /** Avancement d'un dossier de création, partagé entre l'admin et le client. */
  getCompanyProcess: (companyId: string) => CompanyProcessState;
  updateCompanyProcess: (companyId: string, patch: Partial<CompanyProcessState>) => void;
  /** Rendez-vous, partagés entre le client qui les prend et l'admin qui les traite. */
  appointments: Appointment[];
  addAppointment: (appointment: Omit<Appointment, 'id'>) => Appointment;
  updateAppointmentStatus: (appointmentId: string, status: Appointment['status']) => void;
  updateCompanyStatus: (companyId: string, status: Company['status']) => void;
  updateCompanyStep: (companyId: string, step: number) => void;
  updateCompanyQuote: (companyId: string, quote: NonNullable<Company['quote']>) => void;
  getDocumentsByCompany: (companyId: string) => Document[];
  addDocument: (document: Omit<Document, 'id' | 'uploadedAt' | 'currentVersion' | 'versions' | 'reviews'>) => void;
  addDocumentVersion: (documentId: string, comment?: string) => void;
  addDocumentReview: (documentId: string, status: 'validated' | 'rejected', comment?: string) => void;
  updateDocumentStatus: (documentId: string, status: Document['status']) => void;
  bankRequests: BankAccountRequest[];
  bankAccountRequests: BankAccountRequest[]; // Alias pour compatibility
  /** Demandes de modification post-statutaire, partagées client ↔ administration. */
  modifications: Modification[];
  addModification: (modification: Omit<Modification, 'id' | 'createdAt'>) => Modification;
  updateModification: (modificationId: string, updates: Partial<Modification>) => void;
  /** Contrats de domiciliation souscrits, partagés client ↔ administration. */
  domiciliations: DomiciliationContract[];
  addDomiciliation: (contrat: Omit<DomiciliationContract, 'id' | 'createdAt' | 'updatedAt'>) => DomiciliationContract;
  updateDomiciliation: (contratId: string, updates: Partial<DomiciliationContract>) => void;
  /** Commandes de branding, partagées client ↔ administration. */
  brandingOrders: BrandingOrder[];
  addBrandingOrder: (commande: Omit<BrandingOrder, 'id' | 'createdAt'>) => BrandingOrder;
  updateBrandingOrder: (commandeId: string, updates: Partial<BrandingOrder>) => void;
  addBankRequest: (request: Omit<BankAccountRequest, 'id' | 'createdAt' | 'updatedAt'>) => BankAccountRequest;
  sendBankMessage: (requestId: string, message: Omit<BankMessage, 'id' | 'requestId' | 'timestamp' | 'read'>) => void;
  updateBankRequest: (requestId: string, updates: Partial<BankAccountRequest>) => void;
  banks: BankPartner[];
  addBank: (bank: BankPartner) => void;
  updateBank: (bank: BankPartner) => void;
  deleteBank: (bankId: string) => void;
  loginBank: (email: string, password: string) => User | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Mock documents data - will be replaced by API
const mockDocumentsData: Document[] = [
  {
    id: '1',
    companyId: '1',
    name: 'Statuts de la société',
    type: 'STATUTS',
    url: '#',
    status: 'awaiting_validation',
    uploadedAt: '2024-11-01',
    signedAt: '2024-11-02',
    currentVersion: 1,
    versions: [
      { versionNumber: 1, url: '#', uploadedAt: '2024-11-01', uploadedBy: 'admin1' }
    ],
    reviews: [],
    size: '245 KB',
    pages: 12,
    description: 'Statuts constitutifs de la société'
  },
  {
    id: '2',
    companyId: '1',
    name: 'Attestation de dépôt de capital',
    type: 'ATTESTATION',
    url: '#',
    status: 'awaiting_validation',
    uploadedAt: '2024-11-01',
    signedAt: '2024-11-02',
    currentVersion: 1,
    versions: [
      { versionNumber: 1, url: '#', uploadedAt: '2024-11-01', uploadedBy: 'admin1' }
    ],
    reviews: [],
    size: '128 KB',
    pages: 3
  },
  {
    id: '3',
    companyId: '2',
    name: 'Contrat de domiciliation',
    type: 'CONTRAT',
    url: '#',
    status: 'validated',
    uploadedAt: '2024-10-28',
    signedAt: '2024-10-29',
    currentVersion: 2,
    versions: [
      { versionNumber: 1, url: '#', uploadedAt: '2024-10-28', uploadedBy: 'admin1' },
      { versionNumber: 2, url: '#', uploadedAt: '2024-10-29', uploadedBy: 'admin1', comment: 'Correction de la date' }
    ],
    reviews: [
      { id: 'r1', documentId: '3', reviewedAt: '2024-10-29', status: 'rejected', comment: 'La date de début est incorrecte', reviewedBy: 'user1' },
      { id: 'r2', documentId: '3', reviewedAt: '2024-10-30', status: 'validated', reviewedBy: 'user1' }
    ],
    size: '89 KB',
    pages: 2
  },
];

/** Sociétés à enregistrer : celles qui s'écartent des données de référence. */
const societesAConserver = (liste: Company[]): Company[] => {
  const referenceParId = new Map(mockCompanies.map(c => [c.id, JSON.stringify(c)]));
  return liste.filter(societe => {
    const reference = referenceParId.get(societe.id);
    return reference === undefined || reference !== JSON.stringify(societe);
  });
};

/** Fusionne les sociétés enregistrées avec les données de référence. */
const fusionnerSocietes = (enregistrees: Company[]): Company[] => {
  const parId = new Map(enregistrees.map(c => [c.id, c]));
  const idsReference = new Set(mockCompanies.map(c => c.id));
  const reference = mockCompanies.map(societe => parId.get(societe.id) ?? societe);
  return [...enregistrees.filter(c => !idsReference.has(c.id)), ...reference];
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  /**
   * Session en cours, relue au montage.
   *
   * Elle ne vivait qu'en mémoire : un rafraîchissement de page renvoyait à
   * l'écran de connexion, alors que les brouillons, eux, survivaient dans le
   * localStorage. Un lien vers un dossier ou un brouillon était donc
   * inexploitable après rechargement.
   */
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const enregistre = readSession<User | null>(STORAGE_KEYS.currentUser, null);
    if (!enregistre) return null;
    // Les données de référence font foi quand l'utilisateur y figure : une
    // session ouverte hier ne doit pas figer un profil modifié depuis.
    return mockUsers.find(u => u.id === enregistre.id) ?? enregistre;
  });
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [viewMode, setViewMode] = useState<ViewMode>('mobile');
  const [showInitialSplash, setShowInitialSplash] = useState<boolean>(true);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [showOnboardingSlides, setShowOnboardingSlides] = useState<boolean>(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState(false);
  /**
   * Sociétés : données de référence, celles créées depuis l'application, et les
   * modifications apportées aux premières.
   *
   * Une société soumise pendant la séance disparaissait au premier
   * rafraîchissement, alors que son brouillon, lui, survivait. Un changement de
   * statut sur une société de démonstration disparaissait de même.
   *
   * Seul ce qui a été touché est enregistré : une société de référence laissée
   * intacte est relue depuis `mockCompanies` à chaque démarrage, donc une
   * évolution du jeu de données reste visible. Celles que l'utilisateur a
   * modifiées, elles, gardent son état — ses changements l'emportent.
   */
  const [companies, setCompanies] = useState<Company[]>(
    () => fusionnerSocietes(readJSON<Company[]>(STORAGE_KEYS.companies, [])),
  );
  const [notifications, setNotifications] = useState<Notification[]>(
    () => readJSON<Notification[]>(STORAGE_KEYS.notifications, mockNotifications),
  );
  const [documents, setDocuments] = useState<Document[]>(mockDocumentsData);
  const [modifications, setModifications] = useState<Modification[]>(
    () => readJSON<Modification[]>(STORAGE_KEYS.modifications, []),
  );
  const [domiciliations, setDomiciliations] = useState<DomiciliationContract[]>(
    () => readJSON<DomiciliationContract[]>(STORAGE_KEYS.domiciliations, []),
  );
  const [brandingOrders, setBrandingOrders] = useState<BrandingOrder[]>(
    () => readJSON<BrandingOrder[]>(STORAGE_KEYS.brandingProjects, []),
  );
  const [bankRequests, setBankRequests] = useState<BankAccountRequest[]>(
    () => readJSON<BankAccountRequest[]>(STORAGE_KEYS.bankRequests, mockBankRequests),
  );
  const [banks, setBanks] = useState<BankPartner[]>(initialBanks);
  const [appointments, setAppointments] = useState<Appointment[]>(
    () => readJSON<Appointment[]>(STORAGE_KEYS.appointments, mockAppointments),
  );
  // Relu au montage : l'avancement d'un dossier survit desormais a un
  // rechargement, la ou il repartait de zero a chaque visite.
  const [companyProcesses, setCompanyProcesses] = useState<Record<string, CompanyProcessState>>(
    () => readJSON<Record<string, CompanyProcessState>>(STORAGE_KEYS.companyProcesses, {}),
  );

  /**
   * Brouillons de création, persistés dans le localStorage.
   *
   * L'ancienne implémentation écrivait sous une clé contenant `Date.now()`,
   * qu'aucun `getItem` ne relisait : chaque « Enregistrer et quitter » créait
   * une entrée orpheline et le message « Vous pouvez reprendre plus tard »
   * était faux. La clé est désormais stable par utilisateur.
   */
  const getDraftsByUser = (userId: string): CompanyDraft[] =>
    userId ? readJSON<CompanyDraft[]>(STORAGE_KEYS.drafts(userId), []) : [];

  const getDraftById = (userId: string, draftId: string): CompanyDraft | null =>
    getDraftsByUser(userId).find(d => d.id === draftId) || null;

  /** Crée ou met à jour un brouillon, et renvoie son identifiant. */
  const saveDraft = (userId: string, draft: Omit<CompanyDraft, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): string => {
    const maintenant = new Date().toISOString();
    const brouillons = getDraftsByUser(userId);
    const id = draft.id || nouvelId('draft');
    const existant = brouillons.find(d => d.id === id);

    const enregistre: CompanyDraft = {
      ...(draft as Omit<CompanyDraft, 'id' | 'createdAt' | 'updatedAt'>),
      id,
      userId,
      createdAt: existant?.createdAt || maintenant,
      updatedAt: maintenant,
    };

    const suivants = existant
      ? brouillons.map(d => (d.id === id ? enregistre : d))
      : [enregistre, ...brouillons];

    writeJSON(STORAGE_KEYS.drafts(userId), suivants);
    return id;
  };

  const deleteDraft = (userId: string, draftId: string) => {
    const restants = getDraftsByUser(userId).filter(d => d.id !== draftId);
    writeJSON(STORAGE_KEYS.drafts(userId), restants);
  };

  const markOnboardingComplete = () => {
    setHasSeenOnboarding(true);
    setShowOnboarding(false);
    setShowOnboardingSlides(false);
    writeJSON(STORAGE_KEYS.onboardingSeen, true);
  };

  const addNotification = (notification: NotificationInput) => {
    const newNotification: Notification = {
      ...notification,
      // Deux notifications émises dans la même milliseconde partageaient leur
      // identifiant : clés dupliquées côté React, et « marquer comme lu » qui
      // en marquait deux.
      id: nouvelId('notif'),
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  /**
   * Enregistre une société créée par un client.
   *
   * Sans cette fonction, `handleSubmit` du tunnel se contentait d'un
   * `setSubmitted(true)` : la société n'entrait jamais dans `companies` et
   * n'apparaissait donc jamais côté admin. Le chaînage client → admin,
   * qui est le cœur du produit, n'existait pas.
   */
  const addCompany = (company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>): Company => {
    const maintenant = new Date().toISOString();
    const nouvelleSociete: Company = {
      ...company,
      id: nouvelId('comp'),
      createdAt: maintenant,
      updatedAt: maintenant,
    };
    setCompanies(prev => [nouvelleSociete, ...prev]);

    // L'admin doit voir arriver le dossier.
    addNotification({
      userId: '2', // admin
      title: 'Nouveau dossier de création',
      message: `${company.name} (${company.legalForm}) — dossier soumis par le client.`,
      type: 'info',
      read: false,
    });

    return nouvelleSociete;
  };

  /**
   * Avancement des dossiers de création, indexé par société.
   *
   * `AdminCompanySteps` portait tout cela dans 25 `useState` locaux : envoi des
   * statuts, validation client, rendez-vous de signature, documents officiels,
   * finalisation. Rien n'en sortait — le client ne voyait aucune de ces étapes,
   * et l'état disparaissait au démontage du composant.
   */
  const getCompanyProcess = (companyId: string): CompanyProcessState =>
    companyProcesses[companyId] ?? EMPTY_COMPANY_PROCESS;

  const updateCompanyProcess = (companyId: string, patch: Partial<CompanyProcessState>) => {
    setCompanyProcesses(prev => {
      const suivant = {
        ...prev,
        [companyId]: { ...(prev[companyId] ?? EMPTY_COMPANY_PROCESS), ...patch },
      };
      // Ecriture depuis l'updater : la valeur persistee est toujours celle qui
      // vient d'etre calculee, meme si plusieurs mises a jour s'enchainent.
      writeJSON(STORAGE_KEYS.companyProcesses, suivant);
      return suivant;
    });
  };

  /**
   * Prise de rendez-vous par un client.
   *
   * Les rendez-vous existaient en trois listes indépendantes — `data/mockData.ts`
   * lue par l'admin, et une copie locale dans chacun des deux écrans client.
   * Un rendez-vous pris par un client ne remontait donc jamais à l'admin, dont
   * les statistiques portaient sur une quatrième liste figée.
   */
  const addAppointment = (appointment: Omit<Appointment, 'id'>): Appointment => {
    const nouveau: Appointment = { ...appointment, id: nouvelId('apt') };
    setAppointments(prev => [nouveau, ...prev]);

    addNotification({
      userId: '2', // admin
      title: 'Nouveau rendez-vous',
      message: `${appointment.type} demandé pour le ${new Date(appointment.date).toLocaleDateString('fr-FR')}.`,
      type: 'info',
      read: false,
    });

    return nouveau;
  };

  const updateAppointmentStatus = (appointmentId: string, status: Appointment['status']) => {
    setAppointments(prev =>
      prev.map(apt => (apt.id === appointmentId ? { ...apt, status } : apt)),
    );
  };

  /**
   * Fait avancer un dossier dans le workflow d'administration.
   *
   * `currentStep` ne bougeait jamais : l'administration restait bloquée sur
   * « Dossier soumis » et ne pouvait donc ni établir le devis, ni rédiger les
   * statuts que le client attend à son étape 7.
   */
  const updateCompanyStep = (companyId: string, step: number) => {
    setCompanies(prev =>
      prev.map(company =>
        company.id === companyId
          ? { ...company, currentStep: step, updatedAt: new Date().toISOString() }
          : company
      )
    );
  };

  /**
   * Reporte le devis sur la fiche société.
   *
   * L'administration bloque ses étapes « Validation devis » et « Libération du
   * capital » tant que `company.quote` n'est pas validé. Le tunnel client, lui,
   * gardait cette validation pour lui : le dossier restait donc coincé avant la
   * rédaction des statuts.
   */
  const updateCompanyQuote = (companyId: string, quote: NonNullable<Company['quote']>) => {
    setCompanies(prev =>
      prev.map(company =>
        company.id === companyId
          ? { ...company, quote: { ...company.quote, ...quote }, updatedAt: new Date().toISOString() }
          : company
      )
    );
  };

  const updateCompanyStatus = (companyId: string, status: Company['status']) => {
    setCompanies(prev =>
      prev.map(company =>
        company.id === companyId
          ? { ...company, status, updatedAt: new Date().toISOString() }
          : company
      )
    );
  };

  // Document management functions
  const getDocumentsByCompany = (companyId: string): Document[] => {
    return documents.filter(doc => doc.companyId === companyId);
  };

  const addDocument = (document: Omit<Document, 'id' | 'uploadedAt' | 'currentVersion' | 'versions' | 'reviews'>) => {
    const newDocument: Document = {
      ...document,
      id: nouvelId('doc'),
      uploadedAt: new Date().toISOString(),
      currentVersion: 1,
      versions: [
        {
          versionNumber: 1,
          url: document.url,
          uploadedAt: new Date().toISOString(),
          uploadedBy: currentUser?.id || 'admin',
        }
      ],
      reviews: [],
    };
    setDocuments(prev => [...prev, newDocument]);

    // Notify client
    const company = companies.find(c => c.id === document.companyId);
    if (company) {
      addNotification({
        userId: company.clientId,
        title: 'Nouveau document disponible',
        message: `Le document "${document.name}" est prêt pour signature.`,
        type: 'info',
        read: false,
      });
    }
  };

  const addDocumentVersion = (documentId: string, comment?: string) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id === documentId) {
        const newVersion: DocumentVersion = {
          versionNumber: doc.currentVersion + 1,
          url: '#',
          uploadedAt: new Date().toISOString(),
          uploadedBy: currentUser?.id || 'admin',
          comment,
        };
        return {
          ...doc,
          currentVersion: doc.currentVersion + 1,
          versions: [...doc.versions, newVersion],
          status: 'awaiting_validation' as const,
        };
      }
      return doc;
    }));

    // Notify client
    const document = documents.find(d => d.id === documentId);
    if (document) {
      const company = companies.find(c => c.id === document.companyId);
      if (company) {
        addNotification({
          userId: company.clientId,
          title: 'Document mis à jour',
          message: `Une nouvelle version du document "${document.name}" est disponible.`,
          type: 'info',
          read: false,
        });
      }
    }
  };

  const addDocumentReview = (documentId: string, status: 'validated' | 'rejected', comment?: string) => {
    const newReview: DocumentReview = {
      id: nouvelId('review'),
      documentId,
      reviewedAt: new Date().toISOString(),
      status,
      comment,
      reviewedBy: currentUser?.id || '',
    };

    setDocuments(prev => prev.map(doc => {
      if (doc.id === documentId) {
        return {
          ...doc,
          status: status === 'validated' ? 'validated' as const : 'under_revision' as const,
          reviews: [...doc.reviews, newReview],
        };
      }
      return doc;
    }));

    // Notify admin
    const document = documents.find(d => d.id === documentId);
    if (document) {
      addNotification({
        userId: '2', // admin
        title: status === 'validated' ? 'Document validé' : 'Document rejeté',
        message: `${document.name} ${status === 'validated' ? 'a été validé' : 'nécessite des corrections'}${comment ? ` : "${comment}"` : ''}`,
        type: status === 'validated' ? 'success' : 'warning',
        read: false,
      });
    }
  };

  const updateDocumentStatus = (documentId: string, status: Document['status']) => {
    setDocuments(prev => prev.map(doc =>
      doc.id === documentId ? { ...doc, status } : doc
    ));
  };

  // Bank account functions
  /**
   * Enregistrement d'une demande de modification.
   *
   * Elle ne vivait que dans l'état de l'écran client : ni conservée à la
   * fermeture de l'onglet, ni visible de l'administration, qui travaillait sur
   * un jeu d'exemples figé.
   */
  const addModification = (modification: Omit<Modification, 'id' | 'createdAt'>): Modification => {
    const nouvelle: Modification = {
      ...modification,
      id: nouvelId('MOD'),
      createdAt: new Date().toISOString(),
    };
    setModifications(prev => [nouvelle, ...prev]);

    addNotification({
      userId: '2', // administration
      title: 'Nouvelle demande de modification',
      message: `${modification.description} — demande soumise par le client.`,
      type: 'info',
      read: false,
    });

    return nouvelle;
  };

  /**
   * Souscription d'une domiciliation.
   *
   * Le parcours allait jusqu'au paiement et annonçait « Votre domiciliation est
   * active », mais rien n'était conservé : « Mes domiciliations » n'affichait
   * que les contrats de démonstration, et l'administration ne voyait rien.
   */
  const addDomiciliation = (
    contrat: Omit<DomiciliationContract, 'id' | 'createdAt' | 'updatedAt'>,
  ): DomiciliationContract => {
    const maintenant = new Date().toISOString();
    const nouveau: DomiciliationContract = {
      ...contrat,
      id: nouvelId('DOM'),
      createdAt: maintenant,
      updatedAt: maintenant,
    };
    setDomiciliations(prev => [nouveau, ...prev]);
    addNotification({
      userId: '2',
      title: 'Nouvelle domiciliation',
      message: 'Un client vient de souscrire un contrat de domiciliation.',
      type: 'info',
      read: false,
    });
    return nouveau;
  };

  const updateDomiciliation = (contratId: string, updates: Partial<DomiciliationContract>) => {
    setDomiciliations(prev =>
      prev.map(c =>
        c.id === contratId ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c,
      ),
    );
  };

  /** Commande de branding : même constat que la domiciliation. */
  const addBrandingOrder = (commande: Omit<BrandingOrder, 'id' | 'createdAt'>): BrandingOrder => {
    const nouvelle: BrandingOrder = {
      ...commande,
      id: nouvelId('BRD'),
      createdAt: new Date().toISOString(),
    };
    setBrandingOrders(prev => [nouvelle, ...prev]);
    addNotification({
      userId: '2',
      title: 'Nouvelle commande branding',
      message: `${commande.projectName} — commande passée par le client.`,
      type: 'info',
      read: false,
    });
    return nouvelle;
  };

  const updateBrandingOrder = (commandeId: string, updates: Partial<BrandingOrder>) => {
    setBrandingOrders(prev => prev.map(c => (c.id === commandeId ? { ...c, ...updates } : c)));
  };

  const updateModification = (modificationId: string, updates: Partial<Modification>) => {
    setModifications(prev =>
      prev.map(m => (m.id === modificationId ? { ...m, ...updates } : m)),
    );
  };

  const addBankRequest = (request: Omit<BankAccountRequest, 'id' | 'createdAt' | 'updatedAt'>): BankAccountRequest => {
    const newRequest: BankAccountRequest = {
      ...request,
      id: nouvelId('req'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setBankRequests(prev => [...prev, newRequest]);

    // Notify user
    const company = companies.find(c => c.id === request.companyId);
    if (company) {
      addNotification({
        userId: company.clientId || company.userId || '',
        title: 'Demande d\'ouverture de compte',
        message: `Votre demande d'ouverture de compte bancaire a été soumise avec succès.`,
        type: 'success',
        read: false,
      });
    }

    return newRequest;
  };

  const sendBankMessage = (requestId: string, message: Omit<BankMessage, 'id' | 'requestId' | 'timestamp' | 'read'>) => {
    const request = bankRequests.find(r => r.id === requestId);
    
    setBankRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        const newMessage: BankMessage = {
          ...message,
          id: nouvelId('msg'),
          requestId,
          timestamp: new Date().toISOString(),
          read: false,
        };
        return {
          ...req,
          messages: [...req.messages, newMessage],
          updatedAt: new Date().toISOString(),
        };
      }
      return req;
    }));

    // Notifier le client quand la banque envoie un message
    if (message.sender === 'bank' && request) {
      const company = companies.find(c => c.id === request.companyId);
      if (company) {
        addNotification({
          userId: company.clientId || company.userId || '',
          title: 'Nouveau message de la banque',
          message: `${message.senderName} : ${message.message.substring(0, 100)}${message.message.length > 100 ? '...' : ''}`,
          type: 'info',
          read: false,
        });
      }
    }
  };

  const updateBankRequest = (requestId: string, updates: Partial<BankAccountRequest>) => {
    setBankRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
      return req;
    }));

    // Notify on status change
    if (updates.status) {
      const request = bankRequests.find(r => r.id === requestId);
      if (request) {
        const company = companies.find(c => c.id === request.companyId);
        if (company) {
          let message = '';
          switch (updates.status) {
            case 'documents_review':
              message = 'Vos documents sont en cours de vérification par la banque.';
              break;
            case 'approved':
              message = 'Votre demande a été approuvée ! Vous pouvez maintenant prendre rendez-vous.';
              break;
            case 'appointment_scheduled':
              message = 'Votre rendez-vous a été confirmé.';
              break;
            case 'completed':
              message = 'Votre compte bancaire a été ouvert avec succès !';
              break;
            case 'rejected':
              message = 'Votre demande a été rejetée. Veuillez contacter la banque pour plus d\'informations.';
              break;
          }

          if (message) {
            addNotification({
              userId: company.clientId || company.userId || '',
              title: 'Mise à jour demande bancaire',
              message,
              type: updates.status === 'approved' || updates.status === 'completed' ? 'success' : 'info',
              read: false,
            });
          }
        }
      }
    }
  };

  // Bank management functions
  const addBank = (bank: BankPartner) => {
    setBanks(prev => [...prev, bank]);
    
    // Créer un compte utilisateur pour la banque
    const bankUser: User = {
      id: `bank-user-${bank.id}`,
      name: bank.name,
      email: bank.email || '',
      phone: bank.contactPhone || '',
      role: 'bank',
      bankId: bank.id,
      bankPassword: bank.name.toLowerCase().substring(0, 3) + '123', // Demo password
    };
    setUsers(prev => [...prev, bankUser]);

    addNotification({
      userId: '2', // admin
      title: 'Nouvelle banque ajoutée',
      message: `${bank.name} a été ajoutée aux banques partenaires.`,
      type: 'success',
      read: false,
    });
  };

  const updateBank = (bank: BankPartner) => {
    setBanks(prev => prev.map(b => b.id === bank.id ? bank : b));
    
    // Mettre à jour l'utilisateur banque correspondant
    setUsers(prev => prev.map(u => 
      u.bankId === bank.id 
        ? { ...u, name: bank.name, email: bank.email || u.email, phone: bank.contactPhone || u.phone }
        : u
    ));
  };

  const deleteBank = (bankId: string) => {
    setBanks(prev => prev.filter(b => b.id !== bankId));
    
    // Supprimer l'utilisateur banque correspondant
    setUsers(prev => prev.filter(u => u.bankId !== bankId));

    addNotification({
      userId: '2', // admin
      title: 'Banque supprimée',
      message: 'Une banque partenaire a été supprimée.',
      type: 'info',
      read: false,
    });
  };

  const loginBank = (email: string, password: string): User | null => {
    const bankUser = users.find(u =>
      u.role === 'bank' &&
      u.email === email &&
      u.bankPassword === password
    );

    if (bankUser) {
      setCurrentUser(bankUser);
      return bankUser;
    }
    
    return null;
  };

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [darkMode]);

  React.useEffect(() => {
    // La valeur etait une chaine 'true' ; on accepte les deux formes pour ne
    // pas re-afficher l'onboarding aux utilisateurs deja passes par l'ancienne.
    const seen = readJSON<boolean | string>(STORAGE_KEYS.onboardingSeen, false);
    if (seen === true || seen === 'true') {
      setHasSeenOnboarding(true);
    }
  }, []);

  // N'est enregistré que ce qui s'écarte des données de référence : les sociétés
  // créées, et celles de démonstration que l'application a modifiées.
  React.useEffect(() => {
    writeJSONIfChanged(STORAGE_KEYS.companies, societesAConserver(companies));
  }, [companies]);

  // Les autres données partagées suivent l'état, telles quelles.
  React.useEffect(() => {
    writeJSONIfChanged(STORAGE_KEYS.notifications, notifications);
  }, [notifications]);

  React.useEffect(() => {
    writeJSONIfChanged(STORAGE_KEYS.appointments, appointments);
  }, [appointments]);

  React.useEffect(() => {
    writeJSONIfChanged(STORAGE_KEYS.bankRequests, bankRequests);
  }, [bankRequests]);

  React.useEffect(() => {
    writeJSONIfChanged(STORAGE_KEYS.modifications, modifications);
  }, [modifications]);

  React.useEffect(() => {
    writeJSONIfChanged(STORAGE_KEYS.domiciliations, domiciliations);
  }, [domiciliations]);

  React.useEffect(() => {
    writeJSONIfChanged(STORAGE_KEYS.brandingProjects, brandingOrders);
  }, [brandingOrders]);

  /**
   * Reprise des écritures faites par les autres onglets.
   *
   * L'application se prête au test de bout en bout à deux onglets — le client
   * d'un côté, l'administration de l'autre. Sans cette écoute, chaque onglet
   * gardait sa copie en mémoire : l'administration validait des pièces que le
   * client ne voyait qu'après un rechargement manuel, et le dernier onglet à
   * écrire écrasait le travail de l'autre.
   *
   * `storage` n'est émis que dans les autres onglets : aucun risque de boucle.
   */
  React.useEffect(() => {
    const relire = (cle: string) => {
      switch (cle) {
        case STORAGE_KEYS.companies:
          setCompanies(fusionnerSocietes(readJSON<Company[]>(STORAGE_KEYS.companies, [])));
          break;
        case STORAGE_KEYS.companyProcesses:
          setCompanyProcesses(
            readJSON<Record<string, CompanyProcessState>>(STORAGE_KEYS.companyProcesses, {}),
          );
          break;
        case STORAGE_KEYS.notifications:
          setNotifications(readJSON<Notification[]>(STORAGE_KEYS.notifications, mockNotifications));
          break;
        case STORAGE_KEYS.appointments:
          setAppointments(readJSON<Appointment[]>(STORAGE_KEYS.appointments, mockAppointments));
          break;
        case STORAGE_KEYS.bankRequests:
          setBankRequests(readJSON<BankAccountRequest[]>(STORAGE_KEYS.bankRequests, mockBankRequests));
          break;
        case STORAGE_KEYS.modifications:
          setModifications(readJSON<Modification[]>(STORAGE_KEYS.modifications, []));
          break;
        case STORAGE_KEYS.domiciliations:
          setDomiciliations(readJSON<DomiciliationContract[]>(STORAGE_KEYS.domiciliations, []));
          break;
        case STORAGE_KEYS.brandingProjects:
          setBrandingOrders(readJSON<BrandingOrder[]>(STORAGE_KEYS.brandingProjects, []));
          break;
      }
    };

    return onStorageChange(
      [
        STORAGE_KEYS.companies,
        STORAGE_KEYS.companyProcesses,
        STORAGE_KEYS.notifications,
        STORAGE_KEYS.appointments,
        STORAGE_KEYS.bankRequests,
        STORAGE_KEYS.modifications,
        STORAGE_KEYS.domiciliations,
        STORAGE_KEYS.brandingProjects,
      ],
      relire,
    );
    // Les setters de React sont stables : l'écoute est posée une fois pour toutes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // La session suit l'état : connexion, changement de profil, déconnexion.
  // Elle vit dans le stockage de l'onglet, pour qu'un second onglet ouvert sur
  // l'administration ne remplace pas la session cliente du premier.
  React.useEffect(() => {
    if (currentUser) writeSession(STORAGE_KEYS.currentUser, currentUser);
    else removeSessionKey(STORAGE_KEYS.currentUser);
  }, [currentUser]);

  /**
   * Session serveur, quand une API est configurée.
   *
   * Chaque changement d'utilisateur de l'onglet ouvre la session correspondante
   * et recharge ce qu'elle a le droit de voir : passer du client à
   * l'administration fait apparaître tous les dossiers, et inversement.
   * L'identifiant suffit comme dépendance : changer de profil sans changer de
   * compte ne rouvre rien.
   */
  const identifiantConnecte = currentUser?.id ?? null;
  React.useEffect(() => {
    if (!identifiantConnecte) {
      terminerSession();
      return;
    }
    demarrerSession(identifiantConnecte).catch(erreur =>
      console.warn('Serveur injoignable : l’application continue sur son cache local.', erreur),
    );
  }, [identifiantConnecte]);

  /**
   * Les brouillons sont relus à la demande (`getDraftsByUser`) : quand le
   * serveur en apporte de nouveaux, un rendu suffit à les faire apparaître.
   */
  const [, setVersionBrouillons] = useState(0);
  React.useEffect(
    () =>
      surChangement(cle => {
        if (cle.startsWith('cresus_drafts_')) setVersionBrouillons(v => v + 1);
      }),
    [],
  );

  /**
   * Première visite : présentation de l'application.
   *
   * La condition portait aussi sur un drapeau `showIntro` qui, depuis le passage
   * au routage par URL, restait à `true` sans que rien ne le rabaisse : la
   * présentation ne s'est plus jamais affichée. Être connecté dans un espace
   * suffit à savoir qu'on a quitté l'accueil.
   */
  React.useEffect(() => {
    if (!currentUser || hasSeenOnboarding) return;
    if (viewMode === 'mobile') {
      const t = setTimeout(() => setShowOnboardingSlides(true), 300);
      return () => clearTimeout(t);
    }
    if (viewMode === 'web') {
      const t = setTimeout(() => setShowOnboarding(true), 500);
      return () => clearTimeout(t);
    }
  }, [currentUser, hasSeenOnboarding, viewMode]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        viewMode,
        setViewMode,
        showInitialSplash,
        setShowInitialSplash,
        showOnboarding,
        setShowOnboarding,
        showOnboardingSlides,
        setShowOnboardingSlides,
        hasSeenOnboarding,
        markOnboardingComplete,
        darkMode,
        setDarkMode,
        companies,
        notifications,
        documents,
        addNotification,
        markNotificationRead,
        getDraftsByUser,
        getDraftById,
        saveDraft,
        deleteDraft,
        addCompany,
        getCompanyProcess,
        updateCompanyProcess,
        appointments,
        addAppointment,
        updateAppointmentStatus,
        updateCompanyStatus,
        updateCompanyStep,
        updateCompanyQuote,
        getDocumentsByCompany,
        addDocument,
        addDocumentVersion,
        addDocumentReview,
        updateDocumentStatus,
        bankRequests,
        bankAccountRequests: bankRequests, // Alias
        modifications,
        addModification,
        updateModification,
        domiciliations,
        addDomiciliation,
        updateDomiciliation,
        brandingOrders,
        addBrandingOrder,
        updateBrandingOrder,
        addBankRequest,
        sendBankMessage,
        updateBankRequest,
        banks,
        addBank,
        updateBank,
        deleteBank,
        loginBank,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
