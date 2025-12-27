import { db } from './firebaseConfig';
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";

const CONFIG_DOC_PATH = "metadata/configs";
const TICKET_OPTIONS_DOC_PATH = "metadata/ticketOptions";

// Default Ticket Options
const defaultTicketOptions = {
  types: ['Incident', 'Request', 'Maintenance'],
  statuses: ['Open', 'Pending', 'Succeed', 'Closed'],
  severities: ['Low', 'Medium', 'High', 'Critical'],
  categories: ['Network', 'Server', 'Application', 'Database', 'Security'],
  subCategories: ['Router', 'Switch', 'Firewall', 'VM', 'API', 'CDN', 'DNS', 'Storage']
};

export const configService = {
  // Subscribe to real-time updates for main configs
  subscribeConfigs: (callback) => {
    return onSnapshot(doc(db, CONFIG_DOC_PATH), (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data());
      } else {
        // Initial defaults if doc doesn't exist
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
          ]
        };
        callback(defaults);
      }
    });
  },

  getConfigs: async () => {
    const snap = await getDoc(doc(db, CONFIG_DOC_PATH));
    if (snap.exists()) return snap.data();
    return null;
  },

  updateConfigs: async (data) => {
    return await setDoc(doc(db, CONFIG_DOC_PATH), data, { merge: true });
  },

  // =================== TICKET OPTIONS ===================

  // Subscribe to real-time updates for ticket options
  subscribeTicketOptions: (callback) => {
    return onSnapshot(doc(db, TICKET_OPTIONS_DOC_PATH), (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data());
      } else {
        // Return defaults if doc doesn't exist
        callback(defaultTicketOptions);
      }
    });
  },

  // Get ticket options once
  getTicketOptions: async () => {
    const snap = await getDoc(doc(db, TICKET_OPTIONS_DOC_PATH));
    if (snap.exists()) return snap.data();
    return defaultTicketOptions;
  },

  // Update ticket options
  updateTicketOptions: async (data) => {
    return await setDoc(doc(db, TICKET_OPTIONS_DOC_PATH), data, { merge: true });
  },

  // Get default ticket options
  getDefaultTicketOptions: () => defaultTicketOptions
};
