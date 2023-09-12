const { google } = require('googleapis');
const fs = require('fs');
const readline = require('readline');
const { promisify } = require('util');
const { MAX_ACCESS_BOUNDARY_RULES_COUNT } = require('google-auth-library/build/src/auth/downscopedclient');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = 'token.json';

// Load client secrets from a file, which you obtained in step 2.
const readFileAsync = promisify(fs.readFile);

async function Do(jsonData, spreadsheetId, sheetName) {
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
    const range = `${sheetName}!A1:D${jsonData.length + 1}`;

    // Write the data to the spreadsheet.
    await sheets.spreadsheets.values.update({
      spreadsheetId,
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

// Replace these values with your own.
const jsonData = [
  {
    quote: 'el voto fue a favor por un solo voto, por el voto de calidad, también de María Emilia Casas, que era la presidenta',
    speaker: 'Albert',
    in: 2221.46,
    out: 2230.82,
  },
  // Add more data objects as needed.
];

module.exports = Do;
