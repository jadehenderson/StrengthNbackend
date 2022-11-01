# StrengthNbackend

## Project Summary

Strength^N (strengthen) is a scheduling application used to build connections by generating meetings between individuals within an organization. Individuals oftentimes have trouble getting the conversation started and struggle to meet new people. Strength^N seeks to solve this issue by using a randomization algorithm to create subgroups of users who then meet in real life. Users input their availability, and the app then superimposes these times to find common availability within the group. Users are then notified of their meetings and can discuss in-app with their new connections about meeting logistics.

Groups are then re-randomized, avoiding previous combinations, to create new groups that can then form even more connections and have even more conversations. Strength^N provides an easy, low-stress way of introducing people to one another by taking out the hassle of scheduling and group formation.

The goal of this project is to create a user interface to allow scheduling with your new combination, visualizing your growing network of meaningful connections, and message your group members.

## Getting Started

### Prerequisites

- Svelte install (steps below)
- Copy repo from Github

```javascript
// install npm packages
npm i

```

- Running locally:

```javascript
// run local svelte env
npm run dev

```

> Note: the `@next` is temporary

### Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```javascript
npm run dev

// or start the server and open the app in a new browser tab
npm run dev -- --open
```

### Building

Before creating a production version of your app, install an [adapter](https://kit.svelte.dev/docs#adapters) for your target environment. Then:

```bash
npm run build
```

> You can preview the built app with `npm run preview`, regardless of whether you installed an adapter. This should _not_ be used to serve your app in production.

## Testing

We use Jest as our testing platform. We have tests for the back-end analyzing the core capibilties of the project. The command "npm run test" will run the tests while "npm test --coverage" will dispaly a detailed coverage report

## Deployment

**Note that the current version of Strength^N is in the process of moving from Heroku to Carolina Cloud Apps and the information below will soon be deprecated.** 

In order to deploy out project, we hooked our repo up to Heroku and created a Procfile that runs a command to serve up a build on heroku servers

Where does the production system live? How would a new developer get access to it? Lives on Github and deployed with Heroku. Front-end and back-end run in different repos

Are there any staging or pre-production environments that developers can use? No just main

What are the various pieces that the fully deployed software uses? For example, with Heroku, what addons does the app use?

Uses Heroku Postgres for cloud database

Is continuous integration or continuous deployment enabled? If so, where does it live?
Yes, everytime you push to main Heroku restarts build

## Technologies used

- Heroku
- Svelte
- Postgre
- Google OAuth
- Nodemailer
- G6 Graph Visualization Engine

ADRs are in root of repo

## Google Oauth Consent Screen

NodeMailer is configured using Google Oauth in order to send automated emails from the app.

If NodeMailer is no longer working and emails are no longer being sent, it is due to the Google Oauth refresh token expiring. 

The main reasons a token expires are due to:
* The user has revoked your app's access
* The refresh token has not been used for 6 months
* The user changed passwords and the refresh token contains Gmail scopes
* The user account has exceeded a max number of live refresh tokens
* The application has a status of 'Testing' and the consent screen is configured for an external user type, causing the token to expire in 7 days

Strengthn is already configure to be in 'Production' status. 

In order to change configuration settings, log into https://console.cloud.google.com with the email orginally used to configured the consent screen.

Under the "APIs and Services" navigate to the "Credentials" section to view the Oauth 2.0 Client ID associated with strengthn. Here you can view the client ID and client secret associated with the app.
* To generate a new refresh token for the app, click on the strengthn page within the "Credentials" section and notice at the top of the page the "Reset Secret" icon.
* Click this icon to generate a new client secret for the app, the client ID will always remain same 
* Next, navigate to https://developers.google.com/oauthplayground
* In the top right click on the gear icon to begin configuring your personal Oauth Consent screen 
* Under the drop down after clicking the gear icon click "Use your own Oauth credentials" 
* Now copy paste your client ID and client Secret from the "Credentials" section in Google Cloud
* Next, under step 1 "Select and authorize APIs" enter "https://mail.google.com" and click "authorize APIs"
* Under step 2 "Exchange authorization code for tokens" click the button to exchange for your new **refresh** token
* Now, update the backend code base .env file to use the new **client secret and refresh token** 

Also under the "APIs and Services" tab is the "Oauth Consent Screen" section which shows the status of the app, reconfigure any of these setting by simply clicking "edit app".
Note that changes made to the Oauth Consent Screen within GCP, such as adding a logo, will require the app to undergo the Google verification process. 

For more info refer to the Google Documentation: https://github.com/googleapis/google-api-nodejs-client#readme

## Further Documentation 

For further insights and details about design decisions, video tutorials, and diagrams please reference our [project page.](https://tarheels.live/comp523teamjrme/) 
