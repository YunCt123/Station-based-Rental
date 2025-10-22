export interface DeliveryTransaction {
  id: string;
  transactionDate: string;
  vehicleId: string;
  vehicleName: string;
  vehicleImage: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  licenseNumber: string;
  fromStation: string;
  toStation?: string;
  staffName: string;
  deliveryTime: string;
  returnDueTime: string;
  status: "completed" | "delayed" | "issue_reported" | "overdue";
  rentalType: "hourly" | "daily" | "weekly";
  rentalDuration: string;
  totalCost: number;
  depositAmount: number;
  paymentMethod: "cash" | "card" | "online" | "bank_transfer";
  paymentStatus: "paid" | "partial" | "pending" | "refunded";
  documents: {
    contract: boolean;
    license: boolean;
    insurance: boolean;
    inspection: boolean;
  };
  notes?: string;
}
