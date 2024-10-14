import Admin from "../models/admin";


declare global {
    namespace Express {
      interface Request {

        admin?: Admin|any;
      }
    }
  }
  