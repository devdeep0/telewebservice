const express = require('express');
const app = express();

const port = process.env.PORT || 3000; // Default to 3000 for local development

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
