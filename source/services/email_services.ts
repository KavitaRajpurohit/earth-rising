import { Client } from "@sendgrid/client";
import sgMail from "@sendgrid/mail";
import handlebars from "handlebars";
import fs from "fs";
import path from "path";
let BASE_PATH: any;
BASE_PATH = __dirname.split('/');
BASE_PATH.splice(-1, 1);
BASE_PATH = BASE_PATH.join('/');
// Test setClient() method
sgMail.setClient(new Client());

// Test setApiKey() method
sgMail.setApiKey("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");

// Test setSubstitutionWrappers() method
sgMail.setSubstitutionWrappers("{{", "}}")

// Test send() method
function sendEmail(params: any) {
    sgMail.send({
        from: "hosting@zudu.co.uk",
        to: params.to,
        subject: params.subject,
        html: params.html
    }).then(result => {
        console.log("Sent email");
    }, err => {
        console.error(err);
    });
}
function sendVerifyEmail(params: any) {
    let subject = 'Verification code send sucessfully'
    let html = fs.readFileSync(path.join(BASE_PATH, "/public/template/verifyAccount.html"), { encoding: "utf-8" });
    const templete = handlebars.compile(html);
    const htmlToSend = templete({
        name: "hello",

    })

    sendEmail({ to: params.sEmail, html: htmlToSend, subject: subject })

}
function sendForgotPasswordEmail(sEmail: String, user: any, tokens: any) {
    let subject = 'Forgot Password '
    let html = fs.readFileSync(path.join(BASE_PATH, "/public/template/ResetPassword.html"), { encoding: "utf-8" });
    var url = user.sUserRole === "User" ? `${process.env.HOST}/resetpassword?token=${tokens}` : `${process.env.HOST}/admin/resetpassword?token=${tokens}`;
    const template = handlebars.compile(html);
    const htmlToSend = template({
        name: 'hello',
        url,
    });
    sendEmail({ to: sEmail, html: htmlToSend, subject: subject })
};
function sendVerifyUserEmail(sEmail: String, user: String, tokens: any) {
    let subject = 'Verification code send sucessfully'
    let html = fs.readFileSync(path.join(BASE_PATH, "/public/template/VerifyAccount.html"), { encoding: "utf-8" });
    var url = `${process.env.HOST}/checkemail?token=${tokens}`;
    const template = handlebars.compile(html);
    const htmlToSend = template({
        name: 'hi',
        url,
    });
    sendEmail({ to: sEmail, html: htmlToSend, subject: subject })

}

export default {
    sendVerifyEmail,
    sendForgotPasswordEmail,
    sendVerifyUserEmail
}