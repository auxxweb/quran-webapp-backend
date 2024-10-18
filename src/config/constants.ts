import dotenv from "dotenv";
dotenv.config();
import jwt, { Secret } from "jsonwebtoken";
import nodemailer from 'nodemailer'
export const generateToken = (id: any,expiresTime:any) => {
  const secret: Secret = process.env.JWT_SECRET as Secret;
  return jwt.sign({ id }, secret, { expiresIn: expiresTime });
};

export const judgeGenerateToken = (id: any,expiresTime:any) => {
  const secret: Secret = process.env.JWT_SECRET_JUDGE as Secret;
  return jwt.sign({ id }, secret, { expiresIn: expiresTime });
};

export const createVerificationCode = () => {
  const otp = Math.floor(100000 + Math.random() * 900000); 
  return otp.toString().padStart(6, '0');
};

export const sendEmail = async ({  to, subject, html = '', attachments = [] }:any) => {
  const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.User,
        pass: process.env.AppPassword,
      },
    });
  
    transporter.verify();


  const mailOptions = {
    from:process.env.User,
    to,
    subject,
    html,
    attachments
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};