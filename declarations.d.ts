// ✅ Global Window Extension
declare interface Window {
  SpeechRecognition: any;
  webkitSpeechRecognition: any;
}
export type TargetErpModuleCode = 
  | "SYS-DB"
  | "SYS-ADM"
  | "HRM-EMP"
  | "HRM-LIST"
  | "HRM-ATT"
  | "HRM-PRO"
  | "HRM-DIS"
  | "HRM-IDC"
  | "PRC-CTR";

interface Window {
  // এখানে আপনার উইন্ডো ইন্টারফেসের অন্য কোনো কোড থাকলে তা থাকবে
}
// ✅ Custom Module Declarations (if error comes)
declare module "*.jpg";
declare module "*.png";
declare module "*.svg";
declare module "*.jpeg";
declare module "*.css";
// ✅ JSON Import Fix (optional)
declare module "*.json" {
  const value: any;
  export default value;
}

// ✅ Environment Variables (Next.js)
declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_API_URL: string;
    NEXT_PUBLIC_APP_NAME: string;

  }
}

// ✅ Custom Global Types (ERP System Example)
type Employee = {
  id: string;
  name: string;
  role: string;
  salary: number;
  image?: string;
};
type PayrollWorker = {
  employeeId: string;
  [key: string]: any;
};
type Attendance = {
  name: string;
  date: string;
  time: string;
};

// ✅ API Response Standard
type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
};