export type CardType = 'credit' | 'debit' | 'wallet';

export interface Card {
  id: string;
  name: string;
  bank: string;
  type: CardType;
  color: string;
  shortName: string;
}

export const CARDS: Card[] = [
  { id: 'hdfc_infinia', name: 'Infinia Metal', bank: 'HDFC Bank', type: 'credit', color: '#003087', shortName: 'HDFC' },
  { id: 'hdfc_regalia', name: 'Regalia Gold', bank: 'HDFC Bank', type: 'credit', color: '#003087', shortName: 'HDFC' },
  { id: 'axis_magnus', name: 'Magnus', bank: 'Axis Bank', type: 'credit', color: '#800000', shortName: 'AXIS' },
  { id: 'axis_ace', name: 'ACE', bank: 'Axis Bank', type: 'credit', color: '#800000', shortName: 'AXIS' },
  { id: 'axis_flipkart', name: 'Flipkart Axis', bank: 'Axis Bank', type: 'credit', color: '#800000', shortName: 'AXIS' },
  { id: 'icici_amazon', name: 'Amazon Pay', bank: 'ICICI Bank', type: 'credit', color: '#C41E3A', shortName: 'ICICI' },
  { id: 'sbi_cashback', name: 'Cashback', bank: 'SBI Card', type: 'credit', color: '#CC0000', shortName: 'SBI' },
  { id: 'kotak_811', name: '811 #DreamDifferent', bank: 'Kotak Bank', type: 'credit', color: '#EF4444', shortName: 'KTK' },
  { id: 'idfc_wealth', name: 'Wealth', bank: 'IDFC First', type: 'credit', color: '#7C3AED', shortName: 'IDFC' },
  { id: 'hdfc_millennia', name: 'Millennia', bank: 'HDFC Bank', type: 'debit', color: '#003087', shortName: 'HDFC' },
  { id: 'sbi_simplysave', name: 'SimplyClick', bank: 'SBI', type: 'debit', color: '#CC0000', shortName: 'SBI' },
  { id: 'paytm_wallet', name: 'Paytm Wallet', bank: 'One97 Comms', type: 'wallet', color: '#00BAF2', shortName: 'PAY' },
  { id: 'amazon_pay', name: 'Amazon Pay', bank: 'Amazon', type: 'wallet', color: '#FF9900', shortName: 'APay' },
  { id: 'phonepe_wallet', name: 'PhonePe Wallet', bank: 'PhonePe', type: 'wallet', color: '#5F259F', shortName: 'PhPe' },
];
