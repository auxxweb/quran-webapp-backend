import { Response } from "express";

export async function handleValidationErrors(
  res: Response,
  errorMessages: any
) {

  const simplifiedErrors: { [property: string]: string } = {};
  errorMessages.forEach((error: any) => {
    const property = error.property;
    const constraint = error.constraints
      ? Object.values(error.constraints)[0]
      : "Unknown error";
    simplifiedErrors[property] = constraint as string;
  });

  return simplifiedErrors
  
}
