import { SPREADSHEET_ID, SPREADSHEET_NAME } from './../config.js';

import {google} from 'googleapis';
import fs from 'fs';
import readline from 'readline';
import {promisify} from 'util';
// import { MAX_ACCESS_BOUNDARY_RULES_COUNT } from 'google-auth-library/build/src/auth/downscopedclient';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = 'token.json';

// Load client secrets from a file, which you obtained in step 2.
const readFileAsync = promisify(fs.readFile);

export async function createSpreadsheet(jsonData) {
  try {
    // Load client secrets from a file.
    const content = await readFileAsync('oauth.json');
    const credentials = JSON.parse(content);

    // Authorize a client with the loaded credentials.
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    let token;
    try {
      token = await readFileAsync(TOKEN_PATH);
      oAuth2Client.setCredentials(JSON.parse(token));
    } catch (error) {
      await getNewToken(oAuth2Client);
    }

    // Create a new instance of Google Sheets API.
    const sheets = google.sheets({ version: 'v4', auth: oAuth2Client });

    // Prepare the data to be written to the spreadsheet.
    const rows = jsonData.map((item) => [item.quote, item.speaker, item.in, item.out]);

    // Define the range where the data will be written.
    const range = `${SPREADSHEET_NAME}!A1:D${jsonData.length + 1}`;

    // Write the data to the spreadsheet.
    await sheets.spreadsheets.values.update({
      SPREADSHEET_ID,
      range,
      valueInputOption: 'RAW',
      resource: {
        values: rows,
      },
    });

    console.log('Data written to the spreadsheet successfully.');
  } catch (error) {
    console.error('Error writing data to the spreadsheet:', error);
  }
}

// If modifying these scopes, delete the token.json file.
async function getNewToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this URL:', authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Enter the code from that page here: ', async (code) => {
    rl.close();
    try {
      const { tokens } = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(tokens);
      // Store the token to disk for later program executions.
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
      console.log('Token stored to', TOKEN_PATH);
    } catch (error) {
      console.error('Error getting token:', error);
    }
  });
}
