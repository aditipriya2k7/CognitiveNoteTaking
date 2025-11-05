// Fix: Add ambient declarations for Google APIs to resolve TypeScript errors.
// These are loaded from script tags and are available in the global scope at runtime.
declare namespace google {
  namespace accounts {
    namespace oauth2 {
      interface TokenClient {
        requestAccessToken: (overrideConfig: {
          prompt: string;
          callback?: (tokenResponse: TokenResponse | null) => void;
        }) => void;
      }
      interface TokenResponse {
        access_token: string;
      }
      function initTokenClient(config: {
        client_id: string;
        scope: string;
        callback: (response: TokenResponse) => void;
      }): TokenClient;
    }
  }

  namespace picker {
    class View {
      constructor(viewId: string);
      setMimeTypes(mimeTypes: string): this;
    }
    const ViewId: {
      DOCS: string;
    };
    class PickerBuilder {
      setAppId(appId: string): this;
      setOAuthToken(token: string): this;
      addView(view: View): this;
      setDeveloperKey(key: string): this;
      setCallback(callback: (data: ResponseObject) => void): this;
      build(): Picker;
    }
    interface Picker {
      setVisible(visible: boolean): void;
    }
    interface DocumentObject {
      id: string;
      name: string;
    }
    interface ResponseObject {
      [key: string]: any;
    }
    const Response: {
      ACTION: string;
      DOCUMENTS: string;
    };
    const Action: {
      PICKED: string;
    };
  }
}
declare const gapi: any;

// IMPORTANT: To use the Google Drive import feature, you need to create a project
// in the Google Cloud Platform console, enable the "Google Drive API" and
// "Google Picker API", and create OAuth 2.0 credentials (for a web application).
// Replace the placeholder values below with your actual credentials.
const GOOGLE_API_KEY = 'YOUR_GOOGLE_API_KEY'; // Replace with your API Key
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'; // Replace with your Client ID

const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

let tokenClient: google.accounts.oauth2.TokenClient | null = null;
let gapiInited = false;
let gisInited = false;
let onApiReadyCallback: (() => void) | null = null;
let areScriptsLoading = false;

/**
 * Called once the GAPI script (api.js) is loaded.
 * It then loads the specific 'client' and 'picker' modules.
 */
function onGapiScriptLoad() {
  gapi.load('client:picker', () => {
    gapiInited = true;
    checkIfReady();
  });
}

/**
 * Called once the GIS script (gsi/client) is loaded.
 * It then initializes the token client.
 */
function onGisScriptLoad() {
  if (GOOGLE_CLIENT_ID.startsWith('YOUR_GOOGLE_CLIENT_ID')) return;

  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: SCOPES,
    callback: () => {}, // The actual callback is handled when requesting a token
  });
  gisInited = true;
  checkIfReady();
}

/**
 * Checks if both APIs are loaded and initialized. If so, calls the
 * application's ready callback.
 */
function checkIfReady() {
    if (gapiInited && gisInited && onApiReadyCallback) {
        onApiReadyCallback();
    }
}

/**
 * Initializes the Google Drive service by dynamically loading the required scripts.
 * This should be called once from the main App component.
 */
export function initGoogleDrive(onReady: () => void) {
  if (GOOGLE_API_KEY === 'YOUR_GOOGLE_API_KEY' || GOOGLE_CLIENT_ID.startsWith('YOUR_GOOGLE_CLIENT_ID')) {
    const errorMsg = 'Google Drive import is not configured. Please replace placeholder credentials in services/googleDriveService.ts';
    console.error(errorMsg);
    alert(errorMsg);
    return;
  }

  onApiReadyCallback = onReady;

  if (areScriptsLoading) {
    checkIfReady();
    return;
  }
  
  areScriptsLoading = true;

  const gapiScript = document.createElement('script');
  gapiScript.src = 'https://apis.google.com/js/api.js';
  gapiScript.async = true;
  gapiScript.defer = true;
  gapiScript.onload = onGapiScriptLoad;
  document.body.appendChild(gapiScript);

  const gisScript = document.createElement('script');
  gisScript.src = 'https://accounts.google.com/gsi/client';
  gisScript.async = true;
  gisScript.defer = true;
  gisScript.onload = onGisScriptLoad;
  document.body.appendChild(gisScript);
}


/**
 * Prompts the user to sign in and authorize the application.
 */
export function handleAuthClick(callback: (tokenResponse: google.accounts.oauth2.TokenResponse | null) => void) {
  if (!tokenClient) {
    console.error("Google token client is not initialized.");
    return;
  }
  tokenClient.requestAccessToken({ prompt: 'consent', callback });
}

/**
 * Creates and displays the Google Picker interface to allow the user to select a file.
 */
function createPicker(callback: (doc: google.picker.DocumentObject) => void) {
  const token = gapi.client.getToken();
  if (!token) {
    console.error("Authentication token not available for Google Picker.");
    alert("Could not authenticate with Google. Please try signing in again.");
    return;
  }

  const view = new google.picker.View(google.picker.ViewId.DOCS);
  view.setMimeTypes("application/vnd.google-apps.document");

  const picker = new google.picker.PickerBuilder()
    .setAppId(GOOGLE_CLIENT_ID.split('.').shift()!)
    .setOAuthToken(token.access_token)
    .addView(view)
    .setDeveloperKey(GOOGLE_API_KEY)
    .setCallback((data: google.picker.ResponseObject) => {
      if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
        const doc = data[google.picker.Response.DOCUMENTS][0];
        callback(doc);
      }
    })
    .build();
  picker.setVisible(true);
}

/**
 * Fetches the content of a Google Doc by its file ID.
 */
async function getFileContent(fileId: string): Promise<string> {
  try {
    const res = await gapi.client.drive.files.export({
      fileId: fileId,
      mimeType: 'text/plain',
    });
    return res.body;
  } catch (err) {
    console.error('Error fetching file content:', err);
    return 'Could not load content.';
  }
}

/**
 * Handles the full import flow: shows the picker, and upon selection,
 * fetches the file content and calls the onNoteImported callback.
 */
export async function handleFileImport(onNoteImported: (note: {title: string, content: string}) => void) {
  if (!gapiInited || !gisInited) {
    alert("Google API is not ready yet. Please try again in a moment.");
    return;
  }
  
  await gapi.client.load('https://www.googleapis.com/discovery/v1/apis/drive/v3/rest');
  
  createPicker(async (doc) => {
    if (doc.id) {
      const content = await getFileContent(doc.id);
      onNoteImported({ title: doc.name, content });
    }
  });
}