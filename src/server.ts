import './app/config/env.js';

import app from './app.js';
import { runSeed } from './app/database/seed.js';


const port = process.env.PORT || 3000;

async function bootstrap() {
  try {
    await runSeed()

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();

process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION:', error);
  process.exit(1);
});