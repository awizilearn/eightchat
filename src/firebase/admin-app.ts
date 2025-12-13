import { initializeApp, getApps, App, cert } from 'firebase-admin/app';

function getServiceAccount() {
  const key = process.env.SERVICE_ACCOUNT_KEY_PATH || process.env.SERVICE_ACCOUNT_KEY;
  if (!key) {
    throw new Error('SERVICE_ACCOUNT_KEY or SERVICE_ACCOUNT_KEY_PATH environment variable must be set.');
  }

  try {
    if (process.env.SERVICE_ACCOUNT_KEY_PATH) {
      // If it's a path, require it.
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return require(key);
    } else {
      // If it's a string, parse it.
      return JSON.parse(key);
    }
  } catch (error) {
    console.error('Failed to parse or require service account key:', error);
    throw new Error('Could not load service account key. Check if the environment variable is set correctly.');
  }
}

export function initializeAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccount = getServiceAccount();

  return initializeApp({
    credential: cert(serviceAccount),
    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
  });
}
