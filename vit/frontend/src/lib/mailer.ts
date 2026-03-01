import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendReminderEmail = async (to: string, patientName: string, doctorName: string, date: Date) => {
    const formattedDate = date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    const formattedTime = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: "Appointment Reminder - MedSaaS",
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #2563EB; padding: 20px; text-align: center; color: white;">
          <h2 style="margin: 0;">Appointment Reminder</h2>
        </div>
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #334155;">Hello <strong>${patientName}</strong>,</p>
          <p style="font-size: 16px; color: #334155; line-height: 1.5;">This is a quick reminder about your upcoming appointment with <strong>Dr. ${doctorName}</strong>.</p>
          
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 25px 0;">
            <p style="margin: 0 0 10px 0; color: #0EA5E9; font-weight: bold;">📅 Date: <span style="color: #0f172a;">${formattedDate}</span></p>
            <p style="margin: 0; color: #0EA5E9; font-weight: bold;">⏰ Time: <span style="color: #0f172a;">${formattedTime}</span></p>
          </div>
          
          <p style="font-size: 14px; color: #64748b; margin-top: 30px;">If you need to cancel or reschedule, please log in to your dashboard.</p>
        </div>
      </div>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Reminder email sent to ${to}`);
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
};
