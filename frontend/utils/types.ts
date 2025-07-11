export interface Control {
  id: string;
  description: string;
  details: string;
  status: string | null;
  notes?: string;
  files?: File[];
  file?: File;
}

export interface Assessment {
  id: number;
  name: string;
  createdAt: string;
  status: string;
  data?: string;
}

export interface MaturityLevel {
  id: string;
  name: string;
  controls: string;
  controls_data?: Control[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  maturityLevels: MaturityLevel[];
}

export interface AssessmentStats {
  implemented: number;
  partial: number;
  notImplemented: number;
  notApplicable: number;
}

export interface Question {
  id: number;
  ismControl: string;
  maturityLevel: string;
  question: string;
  controlId: number;
}

export interface AssessmentData {
  // stats(arg0: string, stats: any): unknown;
  // categories: {
  //   maturityLevels: {
  //     controls_data: {
  //       status: "implemented" | "partial" | "not-implemented";
  //     }[];
  //   }[];
  // }[];
  controls: Control[];
  stats: {
    implemented: number;
    partial: number;
    notImplemented: number;
    progress: number;
  };
}
