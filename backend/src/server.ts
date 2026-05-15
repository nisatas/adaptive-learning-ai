import { createApp } from './app';
import { env } from './config/env';
import { logStartupDiagnostics } from './utils/runtimeDiagnostics';

const app = createApp();

app.listen(env.port, () => {
  logStartupDiagnostics();
  console.log(`NeuroAdapt backend running on http://localhost:${env.port}`);
});
