import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { startNotificationWorker } from './worker/notificationWorker';

const PORT = process.env.PORT || '4000';

app.listen(PORT, () => {
  console.log(`🚀 Notification service listening on http://localhost:${PORT}`);
});

startNotificationWorker().catch((error) => {
  console.error('Worker failed to start', error);
  process.exit(1);
});
