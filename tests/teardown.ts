import fs from 'fs';
import path from 'path';

module.exports = async () => {
  // Clean up test database
  const testDbPath = path.join(__dirname, '..', 'test.db');
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
};
