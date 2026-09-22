import type { WorkOrder } from "@/data/types";

export const workOrders: WorkOrder[] = [
  {
    id: "WO-00142",
    customerId: "CUS-00124",
    deviceId: "DEV-00087",
    issue: "No HDMI output",
    status: "Repairing",
    description:
      "PlayStation 5 powers on but produces no HDMI output. Initial inspection indicates a possible HDMI port or HDMI circuit issue.",
    diagnosis:
      "The HDMI port and surrounding HDMI circuitry require further inspection. Repair is currently in progress.",
    technicianNotes:
      "Initial inspection completed. HDMI port area is being inspected and tested.",
    createdAt: "2025-03-14T11:00:00",
    updatedAt: "2025-03-14T12:18:00",
  },
  {
    id: "WO-00141",
    customerId: "CUS-00123",
    deviceId: "DEV-00091",
    issue: "Intermittent HDMI signal",
    status: "Testing",
    description: "PlayStation 5 intermittently loses HDMI signal during use.",
    diagnosis:
      "HDMI connection and signal path inspected. Console is currently undergoing extended video output testing.",
    technicianNotes: "Signal currently stable. Extended testing in progress.",
    createdAt: "2025-03-12T15:00:00",
    updatedAt: "2025-03-14T11:50:00",
  },
  {
    id: "WO-00140",
    customerId: "CUS-00122",
    deviceId: "DEV-00076",
    issue: "Console does not power on",
    status: "Waiting",
    description:
      "Xbox Series X does not power on when the power button is pressed.",
    diagnosis:
      "Initial power supply checks completed. Further diagnostic work requires customer approval.",
    technicianNotes: "Diagnosis paused pending customer approval.",
    createdAt: "2025-03-13T09:30:00",
    updatedAt: "2025-03-14T11:00:00",
  },
  {
    id: "WO-00139",
    customerId: "CUS-00121",
    deviceId: "DEV-00063",
    issue: "USB-C charging port replacement",
    status: "Completed",
    description: "Nintendo Switch OLED has a damaged USB-C charging connector.",
    diagnosis:
      "USB-C connector was physically damaged and required replacement.",
    technicianNotes:
      "USB-C connector replaced. Charging, docking, and data functionality tested successfully.",
    createdAt: "2025-03-08T17:30:00",
    updatedAt: "2025-03-13T15:45:00",
  },
  {
    id: "WO-00138",
    customerId: "CUS-00120",
    deviceId: "DEV-00038",
    issue: "Overheating",
    status: "Completed",
    description:
      "PlayStation 4 Pro becomes excessively hot during extended gameplay.",
    diagnosis:
      "Heavy dust accumulation and degraded thermal material were found during inspection.",
    technicianNotes:
      "Internal cleaning and thermal maintenance completed. Console tested successfully.",
    createdAt: "2025-03-05T12:00:00",
    updatedAt: "2025-03-13T10:30:00",
  },
  {
    id: "WO-00137",
    customerId: "CUS-00122",
    deviceId: "DEV-00044",
    issue: "Stick drift",
    status: "Completed",
    description:
      "DualSense controller registers unwanted movement from the left analog stick.",
    diagnosis:
      "Left analog stick module showed inconsistent centering and unwanted movement.",
    technicianNotes:
      "Analog stick module replaced and controller tested successfully.",
    createdAt: "2025-02-18T12:30:00",
    updatedAt: "2025-02-20T16:00:00",
  },
  {
    id: "WO-00136",
    customerId: "CUS-00120",
    deviceId: "DEV-00029",
    issue: "No display",
    status: "Repairing",
    description: "Nintendo Switch powers on but does not produce video output.",
    diagnosis: "Display output circuitry requires further inspection.",
    technicianNotes: "Board-level inspection in progress.",
    createdAt: "2025-03-11T14:00:00",
    updatedAt: "2025-03-14T09:20:00",
  },
  {
    id: "WO-00135",
    customerId: "CUS-00124",
    deviceId: "DEV-00052",
    issue: "Stick drift",
    status: "Completed",
    description:
      "DualSense controller reports unwanted movement from the analog stick.",
    diagnosis:
      "Analog stick module showed excessive drift and inconsistent centering.",
    technicianNotes:
      "Stick module replaced and controller tested successfully.",
    createdAt: "2025-03-01T10:00:00",
    updatedAt: "2025-03-05T15:30:00",
  },
  {
    id: "WO-00134",
    customerId: "CUS-00120",
    deviceId: "DEV-00038",
    issue: "Disc drive issue",
    status: "Completed",
    description: "PlayStation 4 Pro intermittently fails to read game discs.",
    diagnosis: "Disc drive mechanism required cleaning and alignment.",
    technicianNotes: "Drive cleaned and tested with multiple discs.",
    createdAt: "2025-02-10T11:30:00",
    updatedAt: "2025-02-12T14:00:00",
  },
  {
    id: "WO-00133",
    customerId: "CUS-00123",
    deviceId: "DEV-00091",
    issue: "Fan noise",
    status: "Completed",
    description: "PlayStation 5 produces excessive fan noise during operation.",
    diagnosis: "Dust accumulation was found around the cooling system.",
    technicianNotes: "Cooling system cleaned and console tested under load.",
    createdAt: "2025-02-01T09:15:00",
    updatedAt: "2025-02-03T13:45:00",
  },
  {
    id: "WO-00121",
    customerId: "CUS-00124",
    deviceId: "DEV-00087",
    issue: "Overheating",
    status: "Completed",
    description:
      "PlayStation 5 was experiencing excessive heat during extended gameplay.",
    diagnosis:
      "Dust accumulation and degraded thermal material were found during inspection.",
    technicianNotes:
      "Internal cleaning and thermal maintenance completed. Console tested successfully.",
    createdAt: "2025-01-15T10:00:00",
    updatedAt: "2025-01-20T14:30:00",
  },
];
