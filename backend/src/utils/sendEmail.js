import nodemailer from 'nodemailer';

const sendEmail = async (options) => {

    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    })

    // Define email options
    const mailOptions = {
        from: options.from || 'SkillSync <no-reply@skillsync.com>',
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html 
    };

    const info = await transporter.sendMail(mailOptions);

    return info;
};

export default sendEmail;