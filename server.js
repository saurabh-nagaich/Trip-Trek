const mongoose = require('mongoose');
const dotenv = require('dotenv');


process.on("uncaughtException",err=>{
  console.log('uncaughtException Exception! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
})

dotenv.config({ path: './config.env' });

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);


// mongoose.connect(process.env.DATABASE_LOCAL,{
mongoose.connect(DB,{
  useNewUrlParser:true,
  useCreateIndex:true,
  useUnifiedTopology: true, 
  useFindAndModify:false,
}).then(()=> console.log('DB connection successful!'))

console.log(process.env.NODE_ENV);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`app running on port ${port}..`);
});


process.on('unhandledRejection',err=>{
  console.log('UNHANDLEDREJECTION REJECTION SHUTTING DOWN...');
  console.log(err.name, err.message);
  server.close(()=>{
    process.exit(1);
  })
})

