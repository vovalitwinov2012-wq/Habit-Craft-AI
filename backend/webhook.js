const express = require('express');
const bodyParser = require('body-parser');
const { handleMessage } = require('./habitController');

const app = express();
app.use(bodyParser.json());

app.post('/webhook', async (req, res) => {
  try {
    await handleMessage(req.body);
    res.sendStatus(200);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
