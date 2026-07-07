// ✅ Global Window Extension
declare interface Window {
  SpeechRecognition: any;
  webkitSpeechRecognition: any;
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