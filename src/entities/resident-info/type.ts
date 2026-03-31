export type residentInfoType = {
  userId: string;
  id: string;
  building: string;
  unitNumber: string;
  name: string;
  contact: string;
  approvalStatus: string;
  isHouseholder?: 'HOUSEHOLDER' | 'MEMBER';
  isRegistered?: boolean;
  email?: string;
};
