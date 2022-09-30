const nodemailer = require('nodemailer');
require("dotenv").config();
const {google} = require('googleapis');

// fill in unique id, secret, and token values from with GCP Oauth setup
// note that the refresh token will expire after 7 days if within the GCP setup
// the application has 'testing' rather than 'production' status and
// the Oauth consent screen is set to external rather than internal users

const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REDIRECT_URI = process.env.REDIRECT_URI
const REFRESH_TOKEN = process.env.REFRESH_TOKEN

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN })

async function sendMail() {
    try {
        const accessToken = await oAuth2Client.getAccessToken()

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: 'jadehenderson16@gmail.com',
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken
            }
        })

        const mailOptions = {
            from: 'jadehenderson16@gmail.com',
            to: 'sunnysidejade@gmail.com',
            subject: "why",
            text: 'hiya',
            // html: optional
        };

        const result = await transporter.sendMail(mailOptions)
        return result;

    } catch (error) {
        return error;
    }
}

sendMail().then(result=> console.log('Email sent!', result)).catch(error=> console.log(error.message));