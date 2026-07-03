export type ZakatRecord = {
  _id: string;
  name: string;
  assets: number;
  liabilities: number;
  zakatDue: number;
  createdAt: string;
};

export const records: ZakatRecord[] = [];