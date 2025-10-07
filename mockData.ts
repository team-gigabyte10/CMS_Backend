import { User, Message, Conversation, AuditLog, USER_ROLES } from '../types';

export const mockUsers: User[] = [
  // NHQ - CNS Sectt
  {
    id: 1,
    name: "Admiral Sheikh Nazrul Islam",
    rank: "Admiral",
    service_no: "BN10001",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "CNS Sectt",
    department: "CNS",
    role: USER_ROLES.SUPER_ADMIN, // CNS has Super Admin access
    designation: "CNS",
    phone: "+880211111111",
    mobile: "+8801811111111",
    alternative_mobile: "+8801811111111",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 2,
    name: "Rear Admiral Mohammad Ali",
    rank: "Rear Admiral",
    service_no: "BN10002",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "CNS Sectt",
    department: "CNS",
    role: USER_ROLES.ADMIN, // Secretary to CNS has Admin access
    designation: "Secy to CNS",
    phone: "+880211111112",
    mobile: "+8801811111112",
    alternative_mobile: "+8801811111112",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 3,
    name: "Captain Karim Ahmed",
    rank: "Captain",
    service_no: "BN10003",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "CNS Sectt",
    department: "CNS",
    role: USER_ROLES.ADMIN, // Assistant Secretary has Admin access
    designation: "Asst. Secy",
    phone: "+880211111113",
    mobile: "+8801811111113",
    alternative_mobile: "+8801811111113",
    email: "ns@navy.mil.bd",
    status: "busy"
  },
  {
    id: 4,
    name: "Commander Fatima Khan",
    rank: "Commander",
    service_no: "BN10004",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "CNS Sectt",
    department: "CNS",
    role: USER_ROLES.USER, // Flag Lieutenant has User access
    designation: "Flag Lt",
    phone: "+880211111114",
    mobile: "+8801811111114",
    alternative_mobile: "+8801811111114",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 5,
    name: "Lt. Commander Rahman",
    rank: "Lt. Commander",
    service_no: "BN10005",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "CNS Sectt",
    department: "CNS",
    role: USER_ROLES.USER, // Protocol Officer has User access
    designation: "Protocol Offr",
    phone: "+880211111115",
    mobile: "+8801811111115",
    alternative_mobile: "+8801811111115",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 6,
    name: "Lieutenant Ahmed",
    rank: "Lieutenant",
    service_no: "BN10006",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "CNS Sectt",
    department: "CNS",
    role: USER_ROLES.USER, // Escort Officer has User access
    designation: "Escort Offr",
    phone: "+880211111116",
    mobile: "+8801811111116",
    alternative_mobile: "+8801811111116",
    email: "ns@navy.mil.bd",
    status: "offline"
  },

  // NHQ - NS
  {
    id: 7,
    name: "Vice Admiral Nazrul Islam",
    rank: "Vice Admiral",
    service_no: "BN10007",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "NS",
    department: "NS",
    role: USER_ROLES.ADMIN, // NS has Admin access
    designation: "NS",
    phone: "+8802111111117",
    mobile: "+8801811111117",
    alternative_mobile: "+8801911111117",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 8,
    name: "Captain Mohammad Ali",
    rank: "Captain",
    service_no: "BN10008",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "NS",
    department: "NS",
    role: USER_ROLES.USER, // SONA-1
    designation: "SONA-1",
    phone: "+8802111111118",
    mobile: "+8801811111118",
    alternative_mobile: "+8801911111118",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 9,
    name: "Commander Karim Ahmed",
    rank: "Commander",
    service_no: "BN10009",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "NS",
    department: "NS",
    role: USER_ROLES.USER, // SONA-1 (Tec)
    designation: "SONA-1 (Tec)",
    phone: "+880211111119",
    mobile: "+8801811111119",
    alternative_mobile: "+8801911111119",
    email: "ns@navy.mil.bd",
    status: "busy"
  },
  {
    id: 10,
    name: "Lt. Commander Fatima Begum",
    rank: "Lt. Commander",
    service_no: "BN10010",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "NS",
    department: "NS",
    role: USER_ROLES.USER, // SONA-2
    designation: "SONA-2",
    phone: "+880211111120",
    mobile: "+8801811111120",
    alternative_mobile: "+8801911111120",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 11,
    name: "Lieutenant Rashid Khan",
    rank: "Lieutenant",
    service_no: "BN10011",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "NS",
    department: "NS",
    role: USER_ROLES.USER, // SONA-2 (Plans)
    designation: "SONA-2 (Plans)",
    phone: "+880211111121",
    mobile: "+8801811111121",
    alternative_mobile: "+8801911111121",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 12,
    name: "Sub-Lieutenant Sultana Khan",
    rank: "Sub-Lieutenant",
    service_no: "BN10012",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "NS",
    department: "NS",
    role: USER_ROLES.USER, // SO Tec
    designation: "SO Tec",
    phone: "+880211111122",
    mobile: "+8801811111122",
    alternative_mobile: "+8801811111122",
    email: "ns@navy.mil.bd",
    status: "offline"
  },

  // NHQ - Drafting Authority
  {
    id: 13,
    name: "Rear Admiral Hasan Ali",
    rank: "Rear Admiral",
    service_no: "BN10013",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Drafting Authority",
    department: "Drafting Authority",
    role: USER_ROLES.ADMIN, // DA
    designation: "DA",
    phone: "+880211111123",
    mobile: "+8801811111123",
    alternative_mobile: "+8801811111123",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 14,
    name: "Captain Dr. Mohammad Ali",
    rank: "Captain",
    service_no: "BN10014",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Drafting Authority",
    department: "Drafting Authority",
    role: USER_ROLES.ADMIN, // DD Drafting
    designation: "DD Drafting",
    phone: "+880211111124",
    mobile: "+8801811111124",
    alternative_mobile: "+8801811111124",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 15,
    name: "Commander Ayesha Khan",
    rank: "Commander",
    service_no: "BN10015",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Drafting Authority",
    department: "Drafting Authority",
    role: USER_ROLES.USER, // Sec Comd-1
    designation: "Sec Comd-1",
    phone: "+880211111125",
    mobile: "+8801811111125",
    alternative_mobile: "+8801811111125",
    email: "ns@navy.mil.bd",
    status: "busy"
  },
  {
    id: 16,
    name: "Lt. Commander Nazrul Islam",
    rank: "Lt. Commander",
    service_no: "BN10016",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Drafting Authority",
    department: "Drafting Authority",
    role: USER_ROLES.USER, // Sec Comd-2
    designation: "Sec Comd-2",
    phone: "+880211111126",
    mobile: "+8801811111126",
    alternative_mobile: "+8801811111126",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 17,
    name: "Lieutenant Fatima Ahmed",
    rank: "Lieutenant",
    service_no: "BN10017",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Drafting Authority",
    department: "Drafting Authority",
    role: USER_ROLES.USER, // Sec Comd-3
    designation: "Sec Comd-3",
    phone: "+880211111127",
    mobile: "+8801811111127",
    alternative_mobile: "+8801811111127",
    email: "ns@navy.mil.bd",
    status: "offline"
  },

  // NHQ - JAG
  {
    id: 18,
    name: "Rear Admiral Karim Rahman",
    rank: "Rear Admiral",
    service_no: "BN10018",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "JAG",
    department: "JAG",
    role: USER_ROLES.ADMIN, // JAG
    designation: "JAG",
    phone: "+880211111128",
    mobile: "+8801811111128",
    alternative_mobile: "+8801811111128",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 19,
    name: "Captain Dr. Mohammad Hasan",
    rank: "Captain",
    service_no: "BN10019",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "JAG",
    department: "JAG",
    role: USER_ROLES.USER, // DD JAG
    designation: "DD JAG",
    phone: "+880211111129",
    mobile: "+8801811111129",
    alternative_mobile: "+8801811111129",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 20,
    name: "Commander Ayesha Begum",
    rank: "Commander",
    service_no: "BN10020",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "JAG",
    department: "JAG",
    role: USER_ROLES.USER, // SO (JAG)
    designation: "SO (JAG)",
    phone: "+880211111130",
    mobile: "+8801811111130",
    alternative_mobile: "+8801811111130",
    email: "ns@navy.mil.bd",
    status: "busy"
  },

  // NHQ - Operations - ACNS
  {
    id: 22,
    name: "Rear Admiral Mohammad Ali",
    rank: "Rear Admiral",
    service_no: "BN10022",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Operations",
    department: "ACNS",
    role: USER_ROLES.ADMIN, // ACNS (O)
    designation: "ACNS (O)",
    phone: "+880211111132",
    mobile: "+8801811111132",
    alternative_mobile: "+8801811111132",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 23,
    name: "Captain Karim Ahmed",
    rank: "Captain",
    service_no: "BN10023",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Operations",
    department: "ACNS",
    role: USER_ROLES.ADMIN, // Coord to ACNS(O)
    designation: "Coord to ACNS(O)",
    phone: "+880211111133",
    mobile: "+8801811111133",
    alternative_mobile: "+8801811111133",
    email: "ns@navy.mil.bd",
    status: "busy"
  },

  // NHQ - Operations - DNO
  {
    id: 24,
    name: "Rear Admiral Fatima Khan",
    rank: "Rear Admiral",
    service_no: "BN10024",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Operations",
    department: "DNO",
    role: USER_ROLES.ADMIN, // DNO
    designation: "DNO",
    phone: "+880211111134",
    mobile: "+8801811111134",
    alternative_mobile: "+8801811111134",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 25,
    name: "Captain Rahman Ali",
    rank: "Captain",
    service_no: "BN10025",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Operations",
    department: "DNO",
    role: USER_ROLES.ADMIN, // DDNO
    designation: "DDNO",
    phone: "+880211111135",
    mobile: "+8801811111135",
    alternative_mobile: "+8801811111135",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 26,
    name: "Commander Ahmed Khan",
    rank: "Commander",
    service_no: "BN10026",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Operations",
    department: "DNO",
    role: USER_ROLES.USER, // SO(O)
    designation: "SO(O)",
    phone: "+880211111136",
    mobile: "+8801811111136",
    alternative_mobile: "+8801811111136",
    email: "ns@navy.mil.bd",
    status: "busy"
  },
  {
    id: 27,
    name: "Lt. Commander Begum Khan",
    rank: "Lt. Commander",
    service_no: "BN10027",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Operations",
    department: "DNO",
    role: USER_ROLES.USER, // SO (Ops Plan)
    designation: "SO (Ops Plan)",
    phone: "+880211111137",
    mobile: "+8801811111137",
    alternative_mobile: "+8801811111137",
    email: "ns@navy.mil.bd",
    status: "online"
  },

  // Dhaka Naval Area
  {
    id: 28,
    name: "Rear Admiral Mohammad Hasan",
    rank: "Rear Admiral",
    service_no: "BN20001",
    unit: "Dhaka Naval Area",
    branch: "Dhaka Naval Area",
    role: USER_ROLES.ADMIN, // Area Commander
    designation: "Area Commander",
    phone: "+880222222222",
    mobile: "+8801812222222",
    alternative_mobile: "+8801812222222",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 29,
    name: "Captain Dr. Ayesha Khan",
    rank: "Captain",
    service_no: "BN20002",
    unit: "Dhaka Naval Area",
    branch: "Dhaka Naval Area",
    role: USER_ROLES.ADMIN, // Deputy Commander
    designation: "Deputy Commander",
    phone: "+880222222223",
    mobile: "+8801812222223",
    alternative_mobile: "+8801812222223",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 30,
    name: "Commander Nazrul Islam",
    rank: "Commander",
    service_no: "BN20003",
    unit: "Dhaka Naval Area",
    branch: "Dhaka Naval Area",
    role: USER_ROLES.USER, // Staff Officer
    designation: "Staff Officer",
    phone: "+880222222224",
    mobile: "+8801812222224",
    alternative_mobile: "+8801812222224",
    email: "ns@navy.mil.bd",
    status: "busy"
  },

  // Chittagong Naval Area
  {
    id: 31,
    name: "Rear Admiral Karim Ahmed",
    rank: "Rear Admiral",
    service_no: "BN30001",
    unit: "Chittagong Naval Area",
    branch: "Chittagong Naval Area",
    role: USER_ROLES.ADMIN, // Area Commander
    designation: "Area Commander",
    phone: "+880233333333",
    mobile: "+8801813333333",
    alternative_mobile: "+8801813333333",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 32,
    name: "Captain Fatima Begum",
    rank: "Captain",
    service_no: "BN30002",
    unit: "Chittagong Naval Area",
    branch: "Chittagong Naval Area",
    role: USER_ROLES.ADMIN, // Deputy Commander
    designation: "Deputy Commander",
    phone: "+880233333334",
    mobile: "+8801833333334",
    alternative_mobile: "+8801933333334",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 33,
    name: "Commander Mohammad Ali",
    rank: "Commander",
    service_no: "BN30003",
    unit: "Chittagong Naval Area",
    branch: "Chittagong Naval Area",
    role: USER_ROLES.USER, // Staff Officer
    designation: "Staff Officer",
    phone: "+880233333335",
    mobile: "+8801833333335",
    alternative_mobile: "+8801933333335",
    email: "ns@navy.mil.bd",
    status: "offline"
  },

  // Khulna Naval Area
  {
    id: 34,
    name: "Rear Admiral Rashid Khan",
    rank: "Rear Admiral",
    service_no: "BN40001",
    unit: "Khulna Naval Area",
    branch: "Khulna Naval Area",
    role: USER_ROLES.ADMIN, // Area Commander
    designation: "Area Commander",
    phone: "+880244444444",
    mobile: "+8801814444444",
    alternative_mobile: "+8801814444444",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 35,
    name: "Captain Sultana Khan",
    rank: "Captain",
    service_no: "BN40002",
    unit: "Khulna Naval Area",
    branch: "Khulna Naval Area",
    role: USER_ROLES.ADMIN, // Deputy Commander
    designation: "Deputy Commander",
    phone: "+880244444445",
    mobile: "+8801814444445",
    alternative_mobile: "+8801814444445",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 36,
    name: "Commander Hasan Ali",
    rank: "Commander",
    service_no: "BN40003",
    unit: "Khulna Naval Area",
    branch: "Khulna Naval Area",
    role: USER_ROLES.USER, // Staff Officer
    designation: "Staff Officer",
    phone: "+880244444446",
    mobile: "+8801814444446",
    alternative_mobile: "+8801814444446",
    email: "ns@navy.mil.bd",
    status: "busy"
  }
];

// Additional NHQ data per organizational list
mockUsers.push(
  // NHQ - Operations - DNI
  {
    id: 100,
    name: "Rear Admiral Tahmid Rahman",
    rank: "Rear Admiral",
    service_no: "BN50001",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Operations",
    department: "DNI",
    role: USER_ROLES.ADMIN, // DNI
    designation: "DNI",
    phone: "+880250000001",
    mobile: "+8801810000001",
    alternative_mobile: "+8801810000001",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 101,
    name: "Captain Mahmudul Hasan",
    rank: "Captain",
    service_no: "BN50002",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Operations",
    department: "DNI",
    role: USER_ROLES.ADMIN, // DDNI
    designation: "DDNI",
    phone: "+880250000002",
    mobile: "+8801810000002",
    alternative_mobile: "+8801810000002",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 102,
    name: "Commander Imran Kabir",
    rank: "Commander",
    service_no: "BN50003",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Operations",
    department: "DNI",
    role: USER_ROLES.USER, // SO(I)
    designation: "SO(I)",
    phone: "+880250000003",
    mobile: "+8801810000003",
    alternative_mobile: "+8801810000003",
    email: "ns@navy.mil.bd",
    status: "busy"
  },
  {
    id: 103,
    name: "Lt. Commander Shafi Chowdhury",
    rank: "Lt. Commander",
    service_no: "BN50004",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Operations",
    department: "DNI",
    role: USER_ROLES.USER, // SO (CI)
    designation: "SO (CI)",
    phone: "+880250000004",
    mobile: "+8801810000004",
    alternative_mobile: "+8801810000004",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 104,
    name: "Lieutenant Arif Rahman",
    rank: "Lieutenant",
    service_no: "BN50005",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Operations",
    department: "DNI",
    role: USER_ROLES.USER, // SO (Tec)
    designation: "SO (Tec)",
    phone: "+880250000005",
    mobile: "+8801810000005",
    alternative_mobile: "+8801810000005",
    email: "ns@navy.mil.bd",
    status: "offline"
  },
  {
    id: 105,
    name: "Sub-Lieutenant Meera Sultana",
    rank: "Sub-Lieutenant",
    service_no: "BN50006",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Operations",
    department: "DNI",
    role: USER_ROLES.USER, // SO (Media)
    designation: "SO (Media)",
    phone: "+880250000006",
    mobile: "+8801810000006",
    alternative_mobile: "+8801810000006",
    email: "ns@navy.mil.bd",
    status: "online"
  },

  // NHQ - Operations - DNP
  {
    id: 106,
    name: "Rear Admiral Nayeem Khan",
    rank: "Rear Admiral",
    service_no: "BN50007",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Operations",
    department: "DNP",
    role: USER_ROLES.ADMIN, // DNP
    designation: "DNP",
    phone: "+880250000007",
    mobile: "+8801810000007",
    alternative_mobile: "+8801810000007",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 107,
    name: "Captain Rezaul Karim",
    rank: "Captain",
    service_no: "BN50008",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Operations",
    department: "DNP",
    role: USER_ROLES.ADMIN, // DDNP
    designation: "DDNP",
    phone: "+880250000008",
    mobile: "+8801810000008",
    alternative_mobile: "+8801810000008",
    email: "ns@navy.mil.bd",
    status: "busy"
  },
  {
    id: 108,
    name: "Commander Zia Uddin",
    rank: "Commander",
    service_no: "BN50009",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Operations",
    department: "DNP",
    role: USER_ROLES.USER, // SO(Plan-1)
    designation: "SO(Plan-1)",
    phone: "+880250000009",
    mobile: "+8801810000009",
    alternative_mobile: "+8801810000009",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 109,
    name: "Lt. Commander Parvez Ahmed",
    rank: "Lt. Commander",
    service_no: "BN50010",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Operations",
    department: "DNP",
    role: USER_ROLES.USER, // SO (Plans-2)
    designation: "SO (Plans-2)",
    phone: "+880250000010",
    mobile: "+8801810000010",
    alternative_mobile: "+8801810000010",
    email: "ns@navy.mil.bd",
    status: "online"
  },

  // NHQ - Operations - D SIG
  {
    id: 110,
    name: "Rear Admiral Farhan Rahim",
    rank: "Rear Admiral",
    service_no: "BN50011",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Operations",
    department: "D SIG",
    role: USER_ROLES.ADMIN, // D SIG
    designation: "D SIG",
    phone: "+880250000011",
    mobile: "+8801810000011",
    alternative_mobile: "+8801810000011",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 111,
    name: "Captain Arman Hossain",
    rank: "Captain",
    service_no: "BN50012",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Operations",
    department: "D SIG",
    role: USER_ROLES.ADMIN, // DD Sig
    designation: "DD Sig",
    phone: "+880250000012",
    mobile: "+8801810000012",
    alternative_mobile: "+8801810000012",
    email: "ns@navy.mil.bd",
    status: "busy"
  },
  {
    id: 112,
    name: "Commander Tanvir Islam",
    rank: "Commander",
    service_no: "BN50013",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Operations",
    department: "D SIG",
    role: USER_ROLES.USER, // SO(Sig)
    designation: "SO(Sig)",
    phone: "+880250000013",
    mobile: "+8801810000013",
    alternative_mobile: "+8801810000013",
    email: "ns@navy.mil.bd",
    status: "online"
  },

  // NHQ - Operations - D Works
  {
    id: 113,
    name: "Rear Admiral Omar Siddique",
    rank: "Rear Admiral",
    service_no: "BN50014",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Operations",
    department: "D Works",
    role: USER_ROLES.ADMIN, // D Works
    designation: "D Works",
    phone: "+880250000014",
    mobile: "+8801810000014",
    alternative_mobile: "+8801810000014",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 114,
    name: "Captain Nadir Habib",
    rank: "Captain",
    service_no: "BN50015",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Operations",
    department: "D Works",
    role: USER_ROLES.ADMIN, // DD Works
    designation: "DD Works",
    phone: "+880250000015",
    mobile: "+8801810000015",
    alternative_mobile: "+8801810000015",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 115,
    name: "Commander Lubna Yasmin",
    rank: "Commander",
    service_no: "BN50016",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Operations",
    department: "D Works",
    role: USER_ROLES.USER, // SO(Works)
    designation: "SO(Works)",
    phone: "+880250000016",
    mobile: "+8801810000016",
    alternative_mobile: "+8801810000016",
    email: "ns@navy.mil.bd",
    status: "busy"
  },

  // NHQ - Operations - Naval Avn
  {
    id: 116,
    name: "Rear Admiral Yasir Mahmud",
    rank: "Rear Admiral",
    service_no: "BN50017",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Operations",
    department: "Naval Avn",
    role: USER_ROLES.ADMIN, // Naval Avn
    designation: "Naval Avn",
    phone: "+880250000017",
    mobile: "+8801810000017",
    alternative_mobile: "+8801810000017",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 117,
    name: "Captain Riaz Khan",
    rank: "Captain",
    service_no: "BN50018",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Operations",
    department: "Naval Avn",
    role: USER_ROLES.ADMIN, // DD Nav
    designation: "DD Nav",
    phone: "+880250000018",
    mobile: "+8801810000018",
    alternative_mobile: "+8801810000018",
    email: "ns@navy.mil.bd",
    status: "offline"
  },
  {
    id: 118,
    name: "Commander Sadia Alam",
    rank: "Commander",
    service_no: "BN50019",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Operations",
    department: "Naval Avn",
    role: USER_ROLES.USER, // SO (Nav)
    designation: "SO (Nav)",
    phone: "+880250000019",
    mobile: "+8801810000019",
    alternative_mobile: "+8801810000019",
    email: "ns@navy.mil.bd",
    status: "online"
  },

  // NHQ - Operations - D Hydro
  {
    id: 119,
    name: "Rear Admiral Foysal Ahmed",
    rank: "Rear Admiral",
    service_no: "BN50020",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Operations",
    department: "D Hydro",
    role: USER_ROLES.ADMIN, // D Hydro
    designation: "D Hydro",
    phone: "+880250000020",
    mobile: "+8801810000020",
    alternative_mobile: "+8801810000020",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 120,
    name: "Captain Masud Karim",
    rank: "Captain",
    service_no: "BN50021",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Operations",
    department: "D Hydro",
    role: USER_ROLES.ADMIN, // DD Hydro
    designation: "DD Hydro",
    phone: "+880250000021",
    mobile: "+8801810000021",
    alternative_mobile: "+8801810000021",
    email: "ns@navy.mil.bd",
    status: "busy"
  },
  {
    id: 121,
    name: "Commander Iqbal Hossain",
    rank: "Commander",
    service_no: "BN50022",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Operations",
    department: "D Hydro",
    role: USER_ROLES.USER, // SO (Hydro)
    designation: "SO (Hydro)",
    phone: "+880250000022",
    mobile: "+8801810000022",
    alternative_mobile: "+8801810000022",
    email: "ns@navy.mil.bd",
    status: "online"
  },

  // NHQ - Operations - D Sub
  {
    id: 122,
    name: "Captain Staff Officer",
    rank: "Captain",
    service_no: "BN50023",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Operations",
    department: "D Sub",
    role: USER_ROLES.ADMIN, // Capt Staff
    designation: "Capt Staff",
    phone: "+880250000023",
    mobile: "+8801810000023",
    alternative_mobile: "+8801810000023",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 123,
    name: "Captain Subhan Rahim",
    rank: "Captain",
    service_no: "BN50024",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Operations",
    department: "D Sub",
    role: USER_ROLES.ADMIN, // DD Sub
    designation: "DD Sub",
    phone: "+880250000024",
    mobile: "+8801810000024",
    alternative_mobile: "+8801810000024",
    email: "ns@navy.mil.bd",
    status: "busy"
  },
  {
    id: 124,
    name: "Commander Subrata Sen",
    rank: "Commander",
    service_no: "BN50025",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Operations",
    department: "D Sub",
    role: USER_ROLES.ADMIN, // DD Sub (Tec)
    designation: "DD Sub (Tec)",
    phone: "+880250000025",
    mobile: "+8801810000025",
    alternative_mobile: "+8801810000025",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 125,
    name: "Lt. Commander Jubair Hasan",
    rank: "Lt. Commander",
    service_no: "BN50026",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Operations",
    department: "D Sub",
    role: USER_ROLES.USER, // So (Sub)
    designation: "So (Sub)",
    phone: "+880250000026",
    mobile: "+8801810000026",
    alternative_mobile: "+8801810000026",
    email: "ns@navy.mil.bd",
    status: "offline"
  },

  // NHQ - Operations - D Spl Ops
  {
    id: 126,
    name: "Rear Admiral Rifat Alam",
    rank: "Rear Admiral",
    service_no: "BN50027",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Operations",
    department: "DD Spl Ops",
    role: USER_ROLES.ADMIN, // D Spl Ops
    designation: "D Spl Ops",
    phone: "+880250000027",
    mobile: "+8801810000027",
    alternative_mobile: "+8801810000027",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 127,
    name: "Commander Mahin Rahman",
    rank: "Commander",
    service_no: "BN50028",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Operations",
    department: "D Spl Ops",
    role: USER_ROLES.USER, // SO (Spl Ops)
    designation: "SO (Spl Ops)",
    phone: "+880250000028",
    mobile: "+8801810000028",
    alternative_mobile: "+8801810000028",
    email: "ns@navy.mil.bd",
    status: "busy"
  },

  // NHQ - Operations - SD & Cer
  {
    id: 128,
    name: "Rear Admiral Shaila Parvin",
    rank: "Rear Admiral",
    service_no: "BN50029",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Operations",
    department: "SD & Cer",
    role: USER_ROLES.ADMIN, // SD & Cer
    designation: "SD & Cer",
    phone: "+880250000029",
    mobile: "+8801810000029",
    alternative_mobile: "+8801810000029",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 129,
    name: "Captain Nusrat Jahan",
    rank: "Captain",
    service_no: "BN50030",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Operations",
    department: "SD & Cer",
    role: USER_ROLES.ADMIN, // DD SD & C
    designation: "DD SD & C",
    phone: "+880250000030",
    mobile: "+8801810000030",
    alternative_mobile: "+8801810000030",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 130,
    name: "Commander Afsana Islam",
    rank: "Commander",
    service_no: "BN50031",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Operations",
    department: "SD & Cer",
    role: USER_ROLES.USER, // SO (SD & C)
    designation: "SO (SD & C)",
    phone: "+880250000031",
    mobile: "+8801810000031",
    alternative_mobile: "+8801810000031",
    email: "ns@navy.mil.bd",
    status: "offline"
  },

  // NHQ - Operations - Overseas Ops
  {
    id: 131,
    name: "Rear Admiral Towhid Karim",
    rank: "Rear Admiral",
    service_no: "BN50032",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Operations",
    department: "Overseas Ops",
    role: USER_ROLES.ADMIN, // Overseas Ops
    designation: "Overseas Ops",
    phone: "+880250000032",
    mobile: "+8801810000032",
    alternative_mobile: "+8801810000032",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 132,
    name: "Captain Obaid Noor",
    rank: "Captain",
    service_no: "BN50033",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Operations",
    department: "Overseas Ops",
    role: USER_ROLES.ADMIN, // DDONO
    designation: "DDONO",
    phone: "+880250000033",
    mobile: "+8801810000033",
    alternative_mobile: "+8801810000033",
    email: "ns@navy.mil.bd",
    status: "busy"
  },
  {
    id: 133,
    name: "Commander Ovi Rahman",
    rank: "Commander",
    service_no: "BN50034",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Operations",
    department: "Overseas Ops",
    role: USER_ROLES.USER, // SO (ONO)
    designation: "SO (ONO)",
    phone: "+880250000034",
    mobile: "+8801810000034",
    alternative_mobile: "+8801810000034",
    email: "ns@navy.mil.bd",
    status: "online"
  },

  // NHQ - Personnel - ACNS
  {
    id: 134,
    name: "Vice Admiral Aminul Islam",
    rank: "Vice Admiral",
    service_no: "BN60001",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Personnel",
    department: "ACNS",
    role: USER_ROLES.ADMIN, // ACNS (O)
    designation: "ACNS (O)",
    phone: "+880260000001",
    mobile: "+8801810000001",
    alternative_mobile: "+8801810000001",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 135,
    name: "Captain Shakil Ahmed",
    rank: "Captain",
    service_no: "BN60002",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Personnel",
    department: "ACNS",
    role: USER_ROLES.ADMIN, // Coord to ACNS(O)
    designation: "Coord to ACNS(O)",
    phone: "+880260000002",
    mobile: "+8801810000002",
    alternative_mobile: "+8801810000002",
    email: "ns@navy.mil.bd",
    status: "busy"
  },

  // NHQ - Personnel - DPS
  {
    id: 136,
    name: "Rear Admiral Parvez Rahman",
    rank: "Rear Admiral",
    service_no: "BN60003",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Personnel",
    department: "DPS",
    role: USER_ROLES.ADMIN, // DPS
    designation: "DPS",
    phone: "+880260000003",
    mobile: "+8801810000003",
    alternative_mobile: "+8801810000003",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 137,
    name: "Captain Niloy Farhad",
    rank: "Captain",
    service_no: "BN60004",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Personnel",
    department: "DPS",
    role: USER_ROLES.ADMIN, // DDNPS
    designation: "DDNPS",
    phone: "+880260000004",
    mobile: "+8801810000004",
    alternative_mobile: "+8801810000004",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 138,
    name: "Commander Badhan Islam",
    rank: "Commander",
    service_no: "BN60005",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Personnel",
    department: "DPS",
    role: USER_ROLES.USER, // SO(Pers)
    designation: "SO(Pers)",
    phone: "+880260000005",
    mobile: "+8801810000005",
    alternative_mobile: "+8801810000005",
    email: "ns@navy.mil.bd",
    status: "busy"
  },

  // NHQ - Personnel - DNT
  {
    id: 139,
    name: "Rear Admiral Rubayet Karim",
    rank: "Rear Admiral",
    service_no: "BN60006",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Personnel",
    department: "DNT",
    role: USER_ROLES.ADMIN, // DNT
    designation: "DNT",
    phone: "+880260000006",
    mobile: "+8801810000006",
    alternative_mobile: "+8801810000006",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 140,
    name: "Captain Kamrul Hasan",
    rank: "Captain",
    service_no: "BN60007",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Personnel",
    department: "DNT",
    role: USER_ROLES.ADMIN, // DDNT
    designation: "DDNT",
    phone: "+880260000007",
    mobile: "+8801810000007",
    alternative_mobile: "+8801810000007",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 141,
    name: "Commander Tanjil Rahman",
    rank: "Commander",
    service_no: "BN60008",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Personnel",
    department: "DNT",
    role: USER_ROLES.USER, // SO(T-1)
    designation: "SO(T-1)",
    phone: "+880260000008",
    mobile: "+8801810000008",
    alternative_mobile: "+8801810000008",
    email: "ns@navy.mil.bd",
    status: "busy"
  },
  {
    id: 142,
    name: "Lt. Commander Rakib Hasan",
    rank: "Lt. Commander",
    service_no: "BN60009",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Personnel",
    department: "DNT",
    role: USER_ROLES.USER, // SO (T-2)
    designation: "SO (T-2)",
    phone: "+880260000009",
    mobile: "+8801810000009",
    alternative_mobile: "+8801810000009",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 143,
    name: "Lieutenant Naima Akter",
    rank: "Lieutenant",
    service_no: "BN60010",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Personnel",
    department: "DNT",
    role: USER_ROLES.USER, // SO
    designation: "SO",
    phone: "+880260000010",
    mobile: "+8801810000010",
    alternative_mobile: "+8801810000010",
    email: "ns@navy.mil.bd",
    status: "offline"
  },

  // NHQ - Personnel - D Wel
  {
    id: 144,
    name: "Rear Admiral Humayun Kabir",
    rank: "Rear Admiral",
    service_no: "BN60011",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Personnel",
    department: "D Wel",
    role: USER_ROLES.ADMIN, // D Wel
    designation: "D Wel",
    phone: "+880260000011",
    mobile: "+8801810000011",
    alternative_mobile: "+8801810000011",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 145,
    name: "Captain Farzana Hossain",
    rank: "Captain",
    service_no: "BN60012",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Personnel",
    department: "D Wel",
    role: USER_ROLES.ADMIN, // DD Wel
    designation: "DD Wel",
    phone: "+880260000012",
    mobile: "+8801810000012",
    alternative_mobile: "+8801810000012",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 146,
    name: "Commander Maria Rahman",
    rank: "Commander",
    service_no: "BN60013",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Personnel",
    department: "D Wel",
    role: USER_ROLES.USER, // SO (Wel)
    designation: "SO (Wel)",
    phone: "+880260000013",
    mobile: "+8801810000013",
    alternative_mobile: "+8801810000013",
    email: "ns@navy.mil.bd",
    status: "busy"
  },

  // NHQ - Personnel - DMS
  {
    id: 147,
    name: "Rear Admiral Khaled Mahmud",
    rank: "Rear Admiral",
    service_no: "BN60014",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Personnel",
    department: "DMS",
    role: USER_ROLES.ADMIN, // DMS
    designation: "DMS",
    phone: "+880260000014",
    mobile: "+8801810000014",
    alternative_mobile: "+8801810000014",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 148,
    name: "Captain Sazzad Khan",
    rank: "Captain",
    service_no: "BN60015",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Personnel",
    department: "DMS",
    role: USER_ROLES.ADMIN, // DDMS
    designation: "DDMS",
    phone: "+880260000015",
    mobile: "+8801810000015",
    alternative_mobile: "+8801810000015",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 149,
    name: "Commander Sabrina Akhter",
    rank: "Commander",
    service_no: "BN60016",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Personnel",
    department: "DMS",
    role: USER_ROLES.USER, // SO
    designation: "SO",
    phone: "+880260000016",
    mobile: "+8801810000016",
    alternative_mobile: "+8801810000016",
    email: "ns@navy.mil.bd",
    status: "busy"
  },

  // NHQ - Personnel - D Edn
  {
    id: 150,
    name: "Rear Admiral Javed Rahman",
    rank: "Rear Admiral",
    service_no: "BN60017",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Personnel",
    department: "D Edn",
    role: USER_ROLES.ADMIN, // D Edn
    designation: "D Edn",
    phone: "+880260000017",
    mobile: "+8801810000017",
    alternative_mobile: "+8801810000017",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 151,
    name: "Captain Monir Ahmed",
    rank: "Captain",
    service_no: "BN60018",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Personnel",
    department: "D Edn",
    role: USER_ROLES.ADMIN, // DD Edn
    designation: "DD Edn",
    phone: "+880260000018",
    mobile: "+8801810000018",
    alternative_mobile: "+8801810000018",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 152,
    name: "Commander Tasnia Rahman",
    rank: "Commander",
    service_no: "BN60019",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Personnel",
    department: "D Edn",
    role: USER_ROLES.USER, // SO (Edn)
    designation: "SO (Edn)",
    phone: "+880260000019",
    mobile: "+8801810000019",
    alternative_mobile: "+8801810000019",
    email: "ns@navy.mil.bd",
    status: "offline"
  },

  // NHQ - Personnel - D Civ Pers
  {
    id: 153,
    name: "Rear Admiral Firoz Alam",
    rank: "Rear Admiral",
    service_no: "BN60020",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Personnel",
    department: "D Civ Pers",
    role: USER_ROLES.ADMIN, // D Civ Pers
    designation: "D Civ Pers",
    phone: "+880260000020",
    mobile: "+8801810000020",
    alternative_mobile: "+8801810000020",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 154,
    name: "Captain Nafis Rahman",
    rank: "Captain",
    service_no: "BN60021",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Personnel",
    department: "D Civ Pers",
    role: USER_ROLES.ADMIN, // DD (Nav)
    designation: "DD (Nav)",
    phone: "+880260000021",
    mobile: "+8801810000021",
    alternative_mobile: "+8801810000021",
    email: "ns@navy.mil.bd",
    status: "busy"
  },
  {
    id: 155,
    name: "Commander Pritha Saha",
    rank: "Commander",
    service_no: "BN60022",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Personnel",
    department: "D Civ Pers",
    role: USER_ROLES.USER, // SO (Nav)
    designation: "SO (Nav)",
    phone: "+880260000022",
    mobile: "+8801810000022",
    alternative_mobile: "+8801810000022",
    email: "ns@navy.mil.bd",
    status: "online"
  },

  // NHQ - Material (selected departments)
  {
    id: 156,
    name: "Vice Admiral Rahat Khan",
    rank: "Vice Admiral",
    service_no: "BN70001",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Material",
    department: "ACNS",
    role: USER_ROLES.ADMIN, // ACNS (O)
    designation: "ACNS (O)",
    phone: "+880270000001",
    mobile: "+8801810000001",
    alternative_mobile: "+8801810000001",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 157,
    name: "Captain Mamun Rashid",
    rank: "Captain",
    service_no: "BN70002",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Material",
    department: "ACNS",
    role: USER_ROLES.ADMIN, // Coord to ACNS(O)
    designation: "Coord to ACNS(O)",
    phone: "+880270000002",
    mobile: "+8801810000002",
    alternative_mobile: "+8801810000002",
    email: "ns@navy.mil.bd",
    status: "busy"
  },
  {
    id: 158,
    name: "Rear Admiral Nazmul Ahsan",
    rank: "Rear Admiral",
    service_no: "BN70003",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Material",
    department: "DNO",
    role: USER_ROLES.ADMIN, // DNO
    designation: "DNO",
    phone: "+880270000003",
    mobile: "+8801810000003",
    alternative_mobile: "+8801810000003",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 159,
    name: "Captain Arifin Islam",
    rank: "Captain",
    service_no: "BN70004",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Material",
    department: "DNO",
    role: USER_ROLES.ADMIN, // DDNO
    designation: "DDNO",
    phone: "+880270000004",
    mobile: "+8801810000004",
    alternative_mobile: "+8801810000004",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 160,
    name: "Commander Taslim Uddin",
    rank: "Commander",
    service_no: "BN70005",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Material",
    department: "DNO",
    role: USER_ROLES.USER, // SO(O)
    designation: "SO(O)",
    phone: "+880270000005",
    mobile: "+8801810000005",
    alternative_mobile: "+8801810000005",
    email: "ns@navy.mil.bd",
    status: "busy"
  },
  {
    id: 161,
    name: "Rear Admiral Riaz Uddin",
    rank: "Rear Admiral",
    service_no: "BN70006",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Material",
    department: "D Works",
    role: USER_ROLES.ADMIN, // D Works
    designation: "D Works",
    phone: "+880270000006",
    mobile: "+8801810000006",
    alternative_mobile: "+8801810000006",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 162,
    name: "Captain Naimur Rahman",
    rank: "Captain",
    service_no: "BN70007",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Material",
    department: "D Works",
    role: USER_ROLES.ADMIN, // DD Works
    designation: "DD Works",
    phone: "+880270000007",
    mobile: "+8801810000007",
    alternative_mobile: "+8801810000007",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 163,
    name: "Commander Farid Ahmed",
    rank: "Commander",
    service_no: "BN70008",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Material",
    department: "D Works",
    role: USER_ROLES.USER, // SO(Works)
    designation: "SO(Works)",
    phone: "+880270000008",
    mobile: "+8801810000008",
    alternative_mobile: "+8801810000008",
    email: "ns@navy.mil.bd",
    status: "offline"
  },

  // NHQ - Logistics (selected departments)
  {
    id: 164,
    name: "Vice Admiral Rumi Rahman",
    rank: "Vice Admiral",
    service_no: "BN80001",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Logistics",
    department: "ACNS",
    role: USER_ROLES.ADMIN, // ACNS (O)
    designation: "ACNS (O)",
    phone: "+880280000001",
    mobile: "+8801810000001",
    alternative_mobile: "+8801810000001",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 165,
    name: "Captain Ayman Hasan",
    rank: "Captain",
    service_no: "BN80002",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Logistics",
    department: "ACNS",
    role: USER_ROLES.ADMIN, // Coord to ACNS(O)
    designation: "Coord to ACNS(O)",
    phone: "+880280000002",
    mobile: "+8801810000002",
    alternative_mobile: "+8801810000002",
    email: "ns@navy.mil.bd",
    status: "busy"
  },
  {
    id: 166,
    name: "Rear Admiral Milan Chowdhury",
    rank: "Rear Admiral",
    service_no: "BN80003",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Logistics",
    department: "DNO",
    role: USER_ROLES.ADMIN, // DNO
    designation: "DNO",
    phone: "+880280000003",
    mobile: "+8801810000003",
    alternative_mobile: "+8801810000003",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 167,
    name: "Captain Junaid Hasan",
    rank: "Captain",
    service_no: "BN80004",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Logistics",
    department: "DNO",
    role: USER_ROLES.ADMIN, // DDNO
    designation: "DDNO",
    phone: "+880280000004",
    mobile: "+8801810000004",
    alternative_mobile: "+8801810000004",
    email: "ns@navy.mil.bd",
    status: "online"
  },
  {
    id: 168,
    name: "Commander Shamim Reza",
    rank: "Commander",
    service_no: "BN80005",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Logistics",
    department: "DNO",
    role: USER_ROLES.USER, // SO(O)
    designation: "SO(O)",
    phone: "+880280000005",
    mobile: "+8801810000005",
    alternative_mobile: "+8801810000005",
    email: "ns@navy.mil.bd",
    status: "busy"
  },
  {
    id: 169,
    name: "Rear Admiral Borhan Uddin",
    rank: "Rear Admiral",
    service_no: "BN80006",
    unit: "Naval Headquarters",
    branch: "NHQ",
    subBranch: "Logistics",
    department: "Overseas Ops",
    role: USER_ROLES.USER, // Overseas Op
    designation: "Overseas Op",
    phone: "+880280000006",
    mobile: "+8801810000006",
    alternative_mobile: "+8801810000006",
    email: "ns@navy.mil.bd",
    status: "online"
  }
);

export const mockMessages: Message[] = [
  {
    id: 1,
    senderId: 2,
    receiverId: 1,
    content: "Admiral, the quarterly report is ready for your review.",
    timestamp: new Date(Date.now() - 3600000),
    type: "text",
    read: true
  },
  {
    id: 2,
    senderId: 1,
    receiverId: 2,
    content: "Thank you, Commander. I'll review it shortly.",
    timestamp: new Date(Date.now() - 3300000),
    type: "text",
    read: true
  },
  {
    id: 3,
    senderId: 3,
    groupId: 1,
    content: "All units report readiness status by 1800 hours.",
    timestamp: new Date(Date.now() - 7200000),
    type: "text",
    read: false
  }
];

export const mockConversations: Conversation[] = [
  {
    id: 1,
    type: "direct",
    participants: [1, 2],
    lastMessage: mockMessages[1],
    unreadCount: 0
  },
  {
    id: 2,
    type: "group",
    name: "Command Staff",
    participants: [1, 2, 3],
    lastMessage: mockMessages[2],
    unreadCount: 1
  }
];

export const mockAuditLogs: AuditLog[] = [
  {
    id: 1,
    userId: 1,
    action: "LOGIN",
    timestamp: new Date(Date.now() - 3600000),
    details: "User logged in successfully"
  },
  {
    id: 2,
    userId: 2,
    action: "UPDATE_PROFILE",
    target: "Lt. Ahmed",
    timestamp: new Date(Date.now() - 7200000),
    details: "Updated contact information"
  },
  {
    id: 3,
    userId: 1,
    action: "DELETE_USER",
    target: "Ex-Contact",
    timestamp: new Date(Date.now() - 86400000),
    details: "Removed inactive contact"
  }
];

// Login credentials (username: admin, password: admin123)
export const mockCredentials = {
  username: "admin",
  password: "admin123",
  user: mockUsers[0]
};