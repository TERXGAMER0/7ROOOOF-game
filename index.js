const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// خدمة الملفات الثابتة من المجلد الحالي
app.use(express.static(path.join(__dirname)));

app.listen(port, () => {
  console.log(`التطبيق يعمل على http://localhost:${port}`);
});
