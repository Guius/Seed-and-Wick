const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log(
    'Uncaught Exception! 💣 Shutting application down...'
  );
  console.log(err);
  process.exit(1);
});

const app = require('./app');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() =>
    console.log('connection to the database successful!')
  );

const port = 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log(
    'Unhandled Rejection! 💣 Shutting application down...'
  );
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
