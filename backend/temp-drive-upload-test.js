require('dotenv').config();
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const getDriveFolderId = (value) => {
  if (!value || typeof value !== 'string') return value;
  const match = value.match(/[-\w]{25,}/);
  return match ? match[0] : value;
};
const authClient = new google.auth.JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n') : null,
  scopes: ['https://www.googleapis.com/auth/drive']
});
(async () => {
  try {
    await authClient.authorize();
    const drive = google.drive({ version: 'v3', auth: authClient });
    const folderId = getDriveFolderId(process.env.GOOGLE_DRIVE_FOLDER_ID);
    const localFile = path.resolve(__dirname, 'tmp/e2e1.png');
    if (!fs.existsSync(localFile)) {
      throw new Error('Local test file not found: ' + localFile);
    }
    const metadata = {
      name: 'drive-upload-test.png',
      parents: [folderId]
    };
    const media = {
      mimeType: 'image/png',
      body: fs.createReadStream(localFile)
    };
    const res = await drive.files.create({
      requestBody: metadata,
      media,
      fields: 'id,name,webViewLink,webContentLink,parents',
      supportsAllDrives: true
    });
    console.log('Uploaded file:', res.data);
    const list = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'files(id,name,webViewLink,parents)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true
    });
    console.log('Files now in folder:');
    list.data.files.forEach(f => console.log('-', f.id, f.name, f.webViewLink));
  } catch (err) {
    console.error('ERR', err.message);
    process.exit(1);
  }
})();