export interface ComponentSpecs {
  maxVoltage: string;
  rdsOn: string;
  switchingTimeRise: string;
  switchingTimeFall: string;
  package: string;
  price: string;
}

export interface ComponentData {
  partNumber: string;
  specs: ComponentSpecs;
  uncertainties?: string[];
}

export interface BOMItem {
  refDes: string;
  partNumber: string;
  quantity?: number;
  description?: string;
}

export interface BOMDiff {
  status: 'added' | 'deleted' | 'changed';
  refDes: string;
  partNumber?: string;
  oldPart?: string;
  newPart?: string;
  description?: string;
}

export interface HistoryEntry {
  id: number;
  type: 'comparison' | 'bom';
  title: string;
  data: any;
  timestamp: string;
}
