const AppError = require("./../utils/appError")

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`
  return new AppError(message,400)
}

const handleDuplicate = (err) =>{
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0]
  const message = `Duplicate field value: ${value}. please use another value!`
  return new AppError(message,500)
}

const handleValidationErrorDB = (err) =>{
  const errors = Object.values(err.errors).map(el=>el.message)
  const message =  `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message,400)
}

const handleJWTError = (err) => new AppError('Invalid token. please log in again',401)

const handleJWTExpiredError = (err) => new AppError('Your token has expired. please log in again',401)

const sendErrorDev=(err, req, res)=>{
  // A) API 
  if(req.originalUrl.startsWith('/api')){
    return res.status(err.statusCode).json({
      status: err.status,
      error:err,
      message:err.message,
      stack:err.stack
    })
  }
  // B) RENDERED WEBSITE
  console.error('Error : ',err);
  return res.status(err.statusCode).render('error',{
    title:'Something went wrong!',
    msg:err.message
  })

}

const sendErrorProd = (err, req, res) => {
  // a) API
  if(req.originalUrl.startsWith('/api')){
    // A) Operational, trusted error: send message to client
    if(err.isOperational){
      return res.status(err.statusCode).json({
        status: err.status,
        message:err.message,
      }) 
    }
    // B) Programming or other unknown error: don't leak error details
    // 1) Log error
    console.error('Error : ',err);
    
    // 2) Send generic message
    return res.status(500).json({
      status: 'error',
      message:'Something went very wrong!',
    })
  
  }
  // B) RENDERED WEBSITE
  if(err.isOperational){
    return res.status(err.statusCode).render('error',{
      title:'Something went wrong!',
      msg:err.message
    })
  }
  console.error('Error : ',err);

  // RENDERED WEBSITE
  // Send generic message
  return res.status(err.statusCode).render('error',{
    title:'Something went wrong!',
    msg:'Please try again later'
  })
}


module.exports=(err,req,res,next)=>{
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error'

  if(process.env.NODE_ENV==='development'){
    sendErrorDev(err, req, res)
  }else if(process.env.NODE_ENV==='production'){
    let error = err
    if(error.name === "CastError") error = handleCastErrorDB(error);
    if(error.code === 11000) error = handleDuplicate(error);
    if(error.name === "ValidationError") error = handleValidationErrorDB(error);
    if(error.name === "JsonWebTokenError") error = handleJWTError(error);
    if(error.name === "TokenExpiredError") error = handleJWTExpiredError(error);
    
    sendErrorProd(error, req, res)
    // sendErrorDev(error,res)
  }

}