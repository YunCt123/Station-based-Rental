export interface ReturnTransaction {
  id: string;
  deliveryTransactionId: string;
  returnDate: string;
  vehicleId: string;
  vehicleName: string;
  vehicleImage: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  toStation: string;
  staffName: string;
  scheduledReturnTime: string;
  actualReturnTime: string;
  status:
    | "completed"
    | "late"
    | "damaged"
    | "missing_items"
    | "pending_inspection";
  rentalDuration: string;
  totalCost: number;
  extraCharges: number;
  refundAmount: number;
  fuelLevel: number;
  batteryLevel: number;
  mileage: {
    start: number;
    end: number;
  };
  condition: {
    exterior: "good" | "minor_damage" | "major_damage";
    interior: "good" | "minor_damage" | "major_damage";
    mechanical: "good" | "minor_issue" | "major_issue";
  };
  inspection: {
    completed: boolean;
    inspector: string;
    issues: string[];
    photos: string[];
  };
  penalties: {
    lateFee: number;
    damageFee: number;
    cleaningFee: number;
    otherFees: number;
  };
  notes?: string;
}
