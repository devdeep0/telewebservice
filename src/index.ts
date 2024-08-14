import express from 'express';

const app = express();

const port = process.env.PORT || 3000;

app.get('/', (req : any, res:any) => {
  res.send('Hello World!');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${port}`);
});
