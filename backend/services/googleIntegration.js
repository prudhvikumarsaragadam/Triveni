const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const googleCredentialsPath = process.env.GOOGLE_CREDENTIALS_PATH;
let spreadsheetId = process.env.GOOGLE_SHEET_ID;
let driveFolderId = getDriveFolderId(process.env.GOOGLE_DRIVE_FOLDER_ID);
let sharedDriveId = getDriveFolderId(process.env.GOOGLE_SHARED_DRIVE_ID);
const integrationEmail = process.env.GOOGLE_INTEGRATION_EMAIL;
let serviceAccountCredentials = null;
const sheetHeaders = [
  'Order ID',
  'Customer Name',
  'Customer Phone',
  'Customer Email',
  'Customer Address',
  'Order Date',
  'Delivery Date',
  'Cutting Deadline',
  'Status',
  'Model/Design',
  'Cost',
  'Notes',
  'Measurements',
  'Photo Count',
  'Photo Links',
  'Google Drive Links',
  'Bill Number',
  'Created At',
  'Updated At'
];

let authClient;

function loadServiceAccountCredentials() {
  if (serviceAccountCredentials) return serviceAccountCredentials;
  if (!googleCredentialsPath) return null;

  const credentialPath = path.isAbsolute(googleCredentialsPath)
    ? googleCredentialsPath
    : path.resolve(__dirname, '..', googleCredentialsPath);

  if (!fs.existsSync(credentialPath)) {
    throw new Error(`Google credentials file not found at ${credentialPath}`);
  }

  serviceAccountCredentials = JSON.parse(fs.readFileSync(credentialPath, 'utf8'));
  return serviceAccountCredentials;
}

function getClientEmail() {
  if (process.env.GOOGLE_CLIENT_EMAIL) {
    return process.env.GOOGLE_CLIENT_EMAIL;
  }

  const creds = loadServiceAccountCredentials();
  return creds?.client_email || null;
}

function getPrivateKey() {
  if (process.env.GOOGLE_PRIVATE_KEY) {
    return process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
  }

  const creds = loadServiceAccountCredentials();
  return creds?.private_key || null;
}

function validateConfig() {
  const clientEmail = getClientEmail();
  const privateKey = getPrivateKey();
  return Boolean(clientEmail && privateKey);
}

async function getAuthClient() {
  if (authClient) return authClient;

  if (!validateConfig()) {
    throw new Error('Google integration is not configured. Please set GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY or GOOGLE_CREDENTIALS_PATH.');
  }

  authClient = new google.auth.JWT({
    email: getClientEmail(),
    key: getPrivateKey(),
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive'
    ]
  });

  await authClient.authorize();
  return authClient;
}

async function getSheets() {
  const auth = await getAuthClient();
  return google.sheets({ version: 'v4', auth });
}

async function getDrive() {
  const auth = await getAuthClient();
  return google.drive({ version: 'v3', auth });
}

function escapeEnvValue(value) {
  if (typeof value !== 'string') return value;
  if (value.includes('\n') || value.includes(' ') || value.includes('"')) {
    return `"${value.replace(/"/g, '\\"')}"`;
  }
  return value;
}

function getDriveFolderId(value) {
  if (!value || typeof value !== 'string') return value;
  const match = value.match(/[-\w]{25,}/);
  return match ? match[0] : value;
}

function normalizeDriveParentIds(parents) {
  if (!Array.isArray(parents)) return parents;
  return parents.map(parent => {
    if (!parent || typeof parent !== 'string') return parent;
    const match = parent.match(/[-\w]{25,}/);
    return match ? match[0] : parent;
  });
}

function persistEnvVar(key, value) {
  try {
    const envPath = path.resolve(__dirname, '../.env');
    let content = '';

    if (fs.existsSync(envPath)) {
      content = fs.readFileSync(envPath, 'utf8');
    }

    const line = `${key}=${escapeEnvValue(value)}`;
    const regex = new RegExp(`^${key}=.*$`, 'm');

    if (regex.test(content)) {
      content = content.replace(regex, line);
    } else {
      if (content && !content.endsWith('\n')) content += '\n';
      content += `${line}\n`;
    }

    fs.writeFileSync(envPath, content, 'utf8');
  } catch (err) {
    console.warn('Unable to persist environment variable:', key, err.message);
  }
}

async function findAccessibleSharedDriveId() {
  const drive = await getDrive();
  const response = await drive.drives.list({ pageSize: 10 });
  const drives = response.data.drives || [];
  return drives.length > 0 ? drives[0].id : null;
}

async function createSharedDrive() {
  const drive = await getDrive();
  const response = await drive.drives.create({
    requestId: `triveni-${Date.now()}`,
    requestBody: {
      name: 'Triveni Fashion World Shared Drive'
    }
  });
  return response.data.id;
}

async function getOrCreateDriveFolder() {
  const drive = await getDrive();

  if (driveFolderId) {
    try {
      const metadata = await getDriveFolderMetadata(driveFolderId);
      if (metadata.driveId) {
        return driveFolderId;
      }
      if (sharedDriveId) {
        console.warn('Configured Drive folder is not in a shared drive. Using configured shared drive ID instead.');
        driveFolderId = null;
            } else {
        console.warn('Configured Drive folder is not in a shared drive and no shared drive ID is configured. Creating a dedicated shared drive for uploads.');
        driveFolderId = null;
      }
    } catch (err) {
      console.warn('Provided Drive folder is not accessible, creating a new folder instead:', err.message);
      driveFolderId = null;
    }
  }

  let selectedSharedDriveId = sharedDriveId;
  if (!selectedSharedDriveId) {
    selectedSharedDriveId = await findAccessibleSharedDriveId();
  }

  if (!selectedSharedDriveId) {
    try {
      selectedSharedDriveId = await createSharedDrive();
    } catch (err) {
      console.warn('Unable to create shared drive:', err.message);
      selectedSharedDriveId = null;
    }
  }

  const folderMetadata = {
    name: 'Triveni Fashion World Uploads',
    mimeType: 'application/vnd.google-apps.folder'
  };

  let response;
  if (selectedSharedDriveId) {
    folderMetadata.parents = ['root'];
    response = await drive.files.create({
      requestBody: folderMetadata,
      fields: 'id',
      supportsAllDrives: true,
      driveId: selectedSharedDriveId
    });
  } else {
    const fallbackParents = driveFolderId ? [driveFolderId] : ['root'];
    folderMetadata.parents = fallbackParents;
    response = await drive.files.create({
      requestBody: folderMetadata,
      fields: 'id',
      supportsAllDrives: true
    });
    console.warn('Created a fallback folder in regular Drive, but service account uploads still require a shared drive.');
  }

  driveFolderId = response.data.id;
  persistEnvVar('GOOGLE_DRIVE_FOLDER_ID', driveFolderId);

  if (integrationEmail) {
    try {
      await drive.permissions.create({
        fileId: driveFolderId,
        requestBody: {
          role: 'reader',
          type: 'user',
          emailAddress: integrationEmail
        },
        supportsAllDrives: true
      });
    } catch (permissionError) {
      console.warn('Unable to share Drive folder:', permissionError.message);
    }
  }

  return driveFolderId;
}

async function getOrCreateSpreadsheet() {
  const sheets = await getSheets();

  if (spreadsheetId) {
    try {
      await sheets.spreadsheets.get({ spreadsheetId });
      return spreadsheetId;
    } catch (err) {
      console.warn('Provided spreadsheet ID is invalid or inaccessible. Creating a new spreadsheet:', err.message);
      spreadsheetId = null;
    }
  }

  const response = await sheets.spreadsheets.create({
    requestBody: {
      properties: {
        title: 'Triveni Fashion World Orders'
      }
    }
  });

  spreadsheetId = response.data.spreadsheetId;
  persistEnvVar('GOOGLE_SHEET_ID', spreadsheetId);

  const folderId = await getOrCreateDriveFolder();
  const drive = await getDrive();
  try {
    await drive.files.update({
      fileId: spreadsheetId,
      addParents: folderId,
      fields: 'id, parents',
      supportsAllDrives: true
    });
  } catch (updateError) {
    console.warn('Unable to move spreadsheet to Drive folder:', updateError.message);
  }

  if (integrationEmail) {
    try {
      const drive = await getDrive();
      await drive.permissions.create({
        fileId: spreadsheetId,
        requestBody: {
          role: 'writer',
          type: 'user',
          emailAddress: integrationEmail
        },
        supportsAllDrives: true
      });
    } catch (permissionError) {
      console.warn('Unable to share spreadsheet:', permissionError.message);
    }
  }

  return spreadsheetId;
}

async function ensureHeaderRow() {
  await getOrCreateSpreadsheet();

  const sheets = await getSheets();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'A1:S1'
  });

  const values = response.data.values || [];
  if (values.length === 0 || values[0][0] !== sheetHeaders[0]) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'A1:S1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [sheetHeaders]
      }
    });
  }
}

function normalizeFileLinks(fileLinks) {
  if (!Array.isArray(fileLinks)) return [];
  return fileLinks
    .map(link => {
      if (!link) return null;
      if (typeof link === 'string') return link;
      if (link.webViewLink) return link.webViewLink;
      if (link.webContentLink) return link.webContentLink;
      if (link.id) return `https://drive.google.com/file/d/${link.id}/view`;
      return null;
    })
    .filter(Boolean);
}

async function findRowIndexByOrderId(orderId) {
  const sheets = await getSheets();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'A:A'
  });

  const rows = response.data.values || [];
  const rowIndex = rows.findIndex(row => row[0] === orderId);
  return rowIndex >= 0 ? rowIndex + 1 : null;
}

function buildOrderRow(order, fileLinks) {
  const normalizedLinks = normalizeFileLinks(fileLinks);
  const measurementValue = order.measurements && typeof order.measurements !== 'string'
    ? JSON.stringify(order.measurements)
    : order.measurements || '';

  return [
    order.id || '',
    order.customer_name || order.name || '',
    order.customer_phone || order.phone || '',
    order.customer_email || order.email || '',
    order.customer_address || order.address || '',
    order.order_date || '',
    order.delivery_date || '',
    order.cutting_deadline || '',
    order.status || '',
    order.model_design || '',
    order.cost != null ? order.cost : '',
    order.notes || '',
    measurementValue,
    normalizedLinks.length,
    normalizedLinks.join(' | '),
    normalizedLinks.join(' | '),
    order.bill_number || '',
    order.created_at || '',
    order.updated_at || ''
  ];
}

async function appendOrderToSheet(order, fileLinks = []) {
  if (!validateConfig()) {
    return { success: false, message: 'Google integration environment is not configured.' };
  }

  await ensureHeaderRow();
  const sheets = await getSheets();
  const row = buildOrderRow(order, fileLinks);

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'A1:S1',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [row]
    }
  });

  return { success: true, action: 'appended', orderId: order.id };
}

async function updateOrderRow(order, fileLinks = []) {
  if (!validateConfig()) {
    return { success: false, message: 'Google integration environment is not configured.' };
  }

  const sheets = await getSheets();
  const rowIndex = await findRowIndexByOrderId(order.id);
  if (!rowIndex) {
    return appendOrderToSheet(order, fileLinks);
  }

  const row = buildOrderRow(order, fileLinks);
  const range = `A${rowIndex}:S${rowIndex}`;
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: 'RAW',
    requestBody: {
      values: [row]
    }
  });

  return { success: true, action: 'updated', orderId: order.id, rowIndex };
}

async function syncOrderToSheet(order, fileLinks = []) {
  if (!validateConfig()) {
    return { success: false, message: 'Google integration environment is not configured.' };
  }

  const existingRowIndex = await findRowIndexByOrderId(order.id);
  if (existingRowIndex) {
    return updateOrderRow(order, fileLinks);
  }
  return appendOrderToSheet(order, fileLinks);
}
async function getDriveFolderMetadata(folderId) {
  const drive = await getDrive();
  const response = await drive.files.get({
    fileId: folderId,
    fields: 'id,driveId,name,mimeType',
    supportsAllDrives: true
  });
  return response.data;
}
async function uploadFileToDrive(localFilePath, originalName, mimeType) {
  if (!validateConfig()) {
    throw new Error('Google integration environment is not configured.');
  }

  if (!fs.existsSync(localFilePath)) {
    throw new Error(`Local file does not exist: ${localFilePath}`);
  }

  const drive = await getDrive();
  const folderId = await getOrCreateDriveFolder();
  const folderMeta = await getDriveFolderMetadata(folderId);
  const isSharedDrive = Boolean(folderMeta.driveId);
  if (!isSharedDrive) {
    console.warn('Uploading file to regular Drive folder rather than a shared drive.');
  }

  const fileMetadata = {
    name: originalName || path.basename(localFilePath),
    parents: normalizeDriveParentIds([folderId])
  };
  const media = {
    mimeType: mimeType || 'application/octet-stream',
    body: fs.createReadStream(localFilePath)
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media,
    fields: 'id,webViewLink,webContentLink',
    supportsAllDrives: true
  });

  const uploadedFile = response.data;
  if (integrationEmail) {
    try {
      await drive.permissions.create({
        fileId: uploadedFile.id,
        requestBody: {
          role: 'reader',
          type: 'user',
          emailAddress: integrationEmail
        },
        supportsAllDrives: true
      });
    } catch (permissionError) {
      console.warn('Unable to create Google Drive permission for integration email:', permissionError.message);
    }
  }

  return {
    id: uploadedFile.id,
    webViewLink: uploadedFile.webViewLink || `https://drive.google.com/file/d/${uploadedFile.id}/view`,
    webContentLink: uploadedFile.webContentLink || `https://drive.google.com/uc?id=${uploadedFile.id}&export=download`
  };
}

module.exports = {
  appendOrderToSheet,
  updateOrderRow,
  findRowIndexByOrderId,
  syncOrderToSheet,
  uploadFileToDrive
};
