const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const Tour = require("./../../models/tourModel");
const Review = require('../../models/reviewModel');

dotenv.config({ path: './config.env' });

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
// .catch(err=>console.log(err));

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`,'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`,'utf-8'));

// import data into DB
const importData= async ()=>{
    try{
        await Tour.create(tours);
        await Review.create(reviews);
        console.log("data successfully loaded!");
    }catch(err){
        console.log(err);
    }
    process.exit();
}

//  Delete all Data from DB
const deleteData= async ()=>{
    try{
        await Tour.deleteMany();
        await Review.deleteMany();
        console.log("Data successfullt Deleted! ")
    }catch(err){
        console.log(err);
    }
    process.exit();
}

if(process.argv[2]==="--import"){
    importData();
}else if(process.argv[2]==="--delete"){
    deleteData();
}

console.log(process.argv);