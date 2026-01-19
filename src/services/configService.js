import { db } from './firebaseConfig';
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { throwFriendlyError } from "../utils/firebaseErrorHandler";

const CONFIG_DOC_PATH = "metadata/configs";
const TICKET_OPTIONS_DOC_PATH = "metadata/ticketOptions";
const TEAM_DOC_PATH = "metadata/team";
const PROJECTS_DOC_PATH = "metadata/projects";

// Default Ticket Options
const defaultTicketOptions = {
  types: ['Incident', 'Request', 'Maintenance'],
  statuses: ['Open', 'Pending', 'Succeed', 'Closed'],
  severities: ['Low', 'Medium', 'High', 'Critical'],
  categories: ['Network', 'Server', 'Application', 'Database', 'Security'],
  subCategories: ['Router', 'Switch', 'Firewall', 'VM', 'API', 'CDN', 'DNS', 'Storage'],
  responsibilities: [],
  assignees: []
};

export const configService = {
  // Subscribe to real-time updates for main configs (Leagues, Channels, CDNs)
  subscribeConfigs: (callback) => {
    return onSnapshot(doc(db, CONFIG_DOC_PATH), (snapshot) => {
      const defaults = {
        leagues: ["Premier League", "Thai League 1", "EFL", "UEFA European"],
        channels: ["Sport 1", "Sport 2", "Thaileague", "Sport-T 101", "Sport-T 102"],
        cdnOptions: [
          { id: 'AWS', label: 'AWS', color: 'bg-orange-500' },
          { id: 'Tencent', label: 'Tencent', color: 'bg-blue-500' },
          { id: 'Huawei', label: 'Huawei', color: 'bg-red-500' },
          { id: 'BytePlus', label: 'BytePlus', color: 'bg-cyan-500' },
          { id: 'Wangsu', label: 'Wangsu', color: 'bg-indigo-500' },
          { id: 'Akamai', label: 'Akamai', color: 'bg-blue-600' },
          { id: 'Multi CDN', label: 'Multi', color: 'bg-purple-600' }
        ],
        ticketSync: {
          autoSync: false,
          syncTime: '08:00',
          lastSync: null
        }
      };

      if (snapshot.exists()) {
        const data = snapshot.data();
        // Merge with defaults to ensure all fields (especially arrays) exist
        callback({
          ...defaults,
          ...data,
          leagues: data.leagues || defaults.leagues,
          channels: data.channels || defaults.channels,
          cdnOptions: data.cdnOptions || defaults.cdnOptions
        });
      } else {
        callback(defaults);
      }
    });
  },

  updateConfigs: async (data) => {
    try {
      return await setDoc(doc(db, CONFIG_DOC_PATH), data, { merge: true });
    } catch (error) { throwFriendlyError(error); }
  },

  // =================== TICKET OPTIONS ===================

  subscribeTicketOptions: (callback) => {
    return onSnapshot(doc(db, TICKET_OPTIONS_DOC_PATH), (snapshot) => {
      const data = snapshot.exists() ? snapshot.data() : defaultTicketOptions;
      // Ensure specific arrays exist even if DB doc is partial
      callback({
        ...defaultTicketOptions,
        ...data,
        responsibilities: data.responsibilities || defaultTicketOptions.responsibilities,
        assignees: data.assignees || defaultTicketOptions.assignees
      });
    });
  },

  updateTicketOptions: async (data) => {
    try {
      return await setDoc(doc(db, TICKET_OPTIONS_DOC_PATH), data, { merge: true });
    } catch (error) { throwFriendlyError(error); }
  },

  // =================== TEAM MEMBERS ===================

  subscribeTeam: (callback) => {
    return onSnapshot(doc(db, TEAM_DOC_PATH), (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data().members || []);
      } else {
        const defaults = [
          { id: 'NOC-1', name: 'Mekin S.', role: 'NOC Lead' },
          { id: 'NOC-2', name: 'Akkapol P.', role: 'NOC Engineer' },
          { id: 'NOC-3', name: 'Nawapat R.', role: 'NOC Engineer' },
          { id: 'NOC-4', name: 'Watcharapol P.', role: 'NOC Engineer' }
        ];
        callback(defaults);
      }
    });
  },

  updateTeam: async (members) => {
    try {
      return await setDoc(doc(db, TEAM_DOC_PATH), { members }, { merge: true });
    } catch (error) { throwFriendlyError(error); }
  },

  // =================== PROJECTS REGISTRY ===================

  subscribeProjects: (callback) => {
    return onSnapshot(doc(db, PROJECTS_DOC_PATH), (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data().list || []);
      } else {
        const defaults = ["MONOMAX", "MONO29", "MONO CHANNEL", "3BB GIGATV", "E-Service"];
        callback(defaults);
      }
    });
  },

  updateProjects: async (list) => {
    try {
      return await setDoc(doc(db, PROJECTS_DOC_PATH), { list }, { merge: true });
    } catch (error) { throwFriendlyError(error); }
  },

  getDefaultTicketOptions: () => defaultTicketOptions
};
