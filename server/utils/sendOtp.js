import nodemailer from 'nodemailer'
export const sendOtp = async (email, otpcode) => {
  //transporter
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.email,
      pass: process.env.password,
    },
  });
  await transporter.sendMail({
    from: process.env.email,
    to: email,
    subject: `Otp for your MuscleX app`,
    text: `Your otp for the registration is ${otpcode}.It will expire in 10minutes`,
  });
};
