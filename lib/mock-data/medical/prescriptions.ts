import type { MedicalPrescription } from "@/lib/types/medical";

export const medicalPrescriptions: MedicalPrescription[] = [
  {
    id: "mrx-001",
    customerId: "mc-002",
    customerName: "Rohan Mehta",
    doctorName: "Dr. Anil Kapoor",
    date: "2026-09-10",
    medicines: [
      { medicineId: "mm-002", medicineName: "Amoxicillin 500mg Capsules", quantity: 20 },
      { medicineId: "mm-006", medicineName: "Omeprazole 20mg Capsules", quantity: 14 },
    ],
    status: "fulfilled",
    fulfilledBySaleId: "msa-002",
  },
  {
    id: "mrx-002",
    customerId: "mc-005",
    customerName: "Neha Kapoor",
    doctorName: "Dr. Sunita Rao",
    date: "2026-09-11",
    medicines: [
      { medicineId: "mm-007", medicineName: "Metformin 500mg Tablets", quantity: 60 },
      { medicineId: "mm-008", medicineName: "Atorvastatin 10mg Tablets", quantity: 30 },
    ],
    status: "pending",
  },
  {
    id: "mrx-003",
    customerId: "mc-004",
    customerName: "Arjun Nair",
    doctorName: "Dr. Rajesh Gupta",
    date: "2026-09-12",
    medicines: [{ medicineId: "mm-012", medicineName: "Insulin Glargine Injection 10ml", quantity: 3 }],
    status: "pending",
  },
  {
    id: "mrx-004",
    customerId: "mc-001",
    customerName: "Priya Sharma",
    doctorName: "Dr. Anil Kapoor",
    date: "2026-09-08",
    medicines: [{ medicineId: "mm-010", medicineName: "Azithromycin 250mg Tablets", quantity: 6 }],
    status: "fulfilled",
  },
  {
    id: "mrx-005",
    customerId: "mc-003",
    customerName: "Ayesha Khan",
    doctorName: "Dr. Sunita Rao",
    date: "2026-09-13",
    medicines: [
      { medicineId: "mm-002", medicineName: "Amoxicillin 500mg Capsules", quantity: 14 },
      { medicineId: "mm-003", medicineName: "Cetirizine 10mg Tablets", quantity: 10 },
    ],
    status: "pending",
  },
];
