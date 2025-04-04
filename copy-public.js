const fse = require('fs-extra');
const path = require('path');

const src = path.join(__dirname, 'public');
const dest = path.join(__dirname, 'build');

fse.copy(src, dest)
  .then(() => console.log('✅ public → build 복사 완료'))
  .catch(err => {
    console.error('❌ 복사 실패:', err);
    process.exit(1);
  });

  const fs = require('fs');

const envContent = `
window.env = {
  FIREBASE_API_KEY: "${process.env.FIREBASE_API_KEY}",
  AUTH_DOMAIN: "${process.env.AUTH_DOMAIN}",
  PROJECT_ID: "${process.env.PROJECT_ID}"
};
`;

fs.writeFileSync(path.join(dest, 'env.js'), envContent);
