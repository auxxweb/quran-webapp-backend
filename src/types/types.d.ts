import Admin from "../models/admin";


declare global {
    namespace Express {
      interface Request {
        judge?: any;
        admin?: Admin|any;
      }
    }
  }
  