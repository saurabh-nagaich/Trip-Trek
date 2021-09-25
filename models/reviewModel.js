const mongoose = require('mongoose');
const Tour = require('./tourModel');


const reviewSchema =mongoose.Schema({
    review:{
        type:String,
        required:[true,"Review can not be empty!"]
    },
    rating:{
        type:Number,
        max:5,
        min:1
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    tour:{
        type : mongoose.Schema.ObjectId,
        ref:'Tour',
        required:[true,'Review must belong to a tour.']
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:[true,'Review must belong to a user.']
    }
},
{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})

reviewSchema.index({ tour: 1 ,user: 1},{ unique:true})

// query middalware
reviewSchema.pre(/^find/,function(next){
    // this.populate({
    //     path:'tour',
    //     select:"name"
    // }).populate({
    //     path:'user',
    //     select:"name photo"
    // })

    this.populate({
        path:'user',
        select:"name photo"
    })

    next();
})

reviewSchema.statics.calcAverageRatings = async function (tourId){
    const stats = await this.aggregate([
        {
            $match: {tour :tourId}
        },
        {
            $group:{
                _id:'$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ])
    // console.log(stats)
    if(stats.length>0){
        await Tour.findByIdAndUpdate(tourId,{
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        })
    }
    else{
        await Tour.findByIdAndUpdate(tourId,{
            ratingsQuantity:0,
            ratingsAverage: 4.5
        })
    }
    // console.log(stats,tour)
}

reviewSchema.post('save',function(doc){
    // this point to current review

    this.constructor.calcAverageRatings(this.tour)
    
})

reviewSchema.pre(/^findOneAnd/,async function(next){
    this.r = await this.findOne();
    next()
})
reviewSchema.post(/^findOneAnd/,async function(doc){
    // console.log(this.r)
    await this.r.constructor.calcAverageRatings(this.r.tour)
})

const Review = mongoose.model('Review',reviewSchema);

module.exports= Review
//  ratingsAverage
//  ratingsQuantity