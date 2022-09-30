const nodemailer = require('nodemailer');
require("dotenv").config();
const {google} = require('googleapis');

// fill in unique id, secret, and token values from with GCP Oauth setup
// note that the refresh token will expire after 7 days if within the GCP setup
// the application has 'testing' rather than 'production' status and
// the Oauth consent screen is set to external rather than internal users

const CLIENT_ID = ''
const CLIENT_SECRET = ''
const REDIRECT_URI = ''
const REFRESH_TOKEN = ''

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN })

async function sendMail() {
    try {
        const accessToken = await oAuth2Client.getAccessToken()

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: '',
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken
            }
        })

        const mailOptions = {
            from: '',
            to: '',
            subject: "hello testing nodemailer",
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