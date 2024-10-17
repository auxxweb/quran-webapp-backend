declare module 'multer-s3-transform' {
    import { StorageEngine } from 'multer';
    import { S3 } from 'aws-sdk';
    import { Options as SharpOptions } from 'sharp';
  
    interface Transform {
      id: string;
      key?: (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, key?: string) => void) => void;
      transform: (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, transform?: SharpOptions) => void) => void;
    }
  
    interface Options {
      s3: S3;
      bucket?: any;
      acl?: string;
      cacheControl?: string;
      contentType?: (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, mime?: string) => void) => void;
      shouldTransform?: (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, transform?: boolean) => void) => void;
      transforms?: Transform[];
      key?: (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, key?: string) => void) => void;
    }
  
    function s3Storage(options?: Options): StorageEngine;
  
    export = s3Storage;
  }
  