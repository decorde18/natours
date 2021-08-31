const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const User = require('./userModel');

const tourSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [ true, 'A tour must have a name' ],
			unique: [ true, 'You already have a tour by that name' ],
			trim: true,
			maxlength: [ 40, 'The tour name must have less than or equal to 40 characters' ],
			minlength: [ 10, 'A tour length must have more than or equal to 10 characters' ]
			// validate: [validator.isAlpha, 'Tour name must only contain alpha characters'] don't use because it will not accept spaces
		},
		slug: {
			type: String
		},

		duration: {
			type: Number,
			required: [ true, 'A tour must have a duration' ]
		},
		maxGroupSize: {
			type: Number,
			required: [ true, 'A tour must have a group size' ]
		},
		difficulty: {
			type: String,
			required: [ true, 'A tour must have a difficulty' ],
			enum: {
				values: [ 'easy', 'medium', 'difficult' ],
				message: 'Difficulty is either easy, medium or difficult'
			}
		},
		ratingsAverage: {
			type: Number,
			default: 4.5,
			min: [ 1, 'Rating must be above 1.0' ],
			max: [ 5, 'A rating must be below 5' ],
			set: val=> Math.round(val * 10) / 10
		},
		ratingsQuantity: {
			type: Number,
			default: 0
		},
		price: {
			type: Number,
			required: [ true, 'A tour must have a price' ]
		},
		priceDiscount: {
			type: Number,
			validate: {
				validator: function(val) {
					// will only work on create, not on update when using 'this'
					return val < this.price; //discount should always be lower than the price
				},
				message: 'Discount price ({VALUE}) should be below regular price'
			}
		},
		summary: {
			type: String,
			trim: true,
			required: [ true, 'A tour must have a description' ]
		},
		description: {
			type: String,
			trim: true
		},
		imageCover: {
			type: String,
			required: [ true, 'A tour must have a cover image' ]
		},
		images: [ String ],
		createdAt: {
			type: Date,
			default: Date.now(),
			select: false //doesn't display to the user
		},
		startDates: [ Date ],
		secretTour: {
			type: Boolean,
			default: false
		},
		startLocation: {
			// GeoJSON
			type: {
				type: String,
				default: 'Point', 
				enum: ['Point']
			},
			coordinates: [Number], //longitude, latitude
				address: String,
				description: String
		},
		locations: [
			{
				type: {
					type: String,
					default: 'Point',
					enum: ['Point']
			},
			coordinates: [Number],
			address: String,
			description: String,
			day: Number
		}
		],
		guides: [
		{
			type: mongoose.Schema.ObjectId,
			ref:'User'  // where the objectId is coming from in order to reference.  Then in the TourController, it is populated in the queries
		}
		]
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true }
	}
);
tourSchema.index({price: 1, ratingsAverage:-1}); //adds index to price to improve query performance
tourSchema.index({slug:1});
tourSchema.index({startLocation: '2dsphere'})

tourSchema.virtual('durationWeeks').get(function() {
	//arrow functions do not get this keyword
	return this.duration / 7; //this points to current document
});

//populate virtual reviews. reviews are unlinked child reference and we want them to show with their parent but not stored in their parent record since it would be too large
tourSchema.virtual('reviews', {
	ref: 'Review',
	foreignField: 'tour',
	localField: '_id'
  });

//DOCUMENT MIDDLEWARE - runs before the save command and the create command
tourSchema.pre('save', function(next) {
	this.slug = slugify(this.name, { lower: true });
	next();
});
/* //THIS IS HOW TO EMBED GUIDES INTO THE TOURS
tourSchema.pre('save', async function(next) {
	const guidesPromises = this.guides.map(async id=> User.findById(id));
	this.guides = await Promise.all(guidesPromises);
	next(); //this code allows the guides to be an array inside the Tours schema by finding the guides information from their ID in the Users records, 
}); */



// tourSchema.post('save', function(doc, next) {
// 	next();
// });

// QUERY MIDDLEWARE
tourSchema.pre(/^find/, function(next) {
	//  /^find/ means all the strings that starts with find so it will do find or findone or findmany findeanddelete...
	this.find({ secretTour: { $ne: true } }); //$ne is not equal to
	next();
});
tourSchema.pre(/^find/, function(next) {
	this.populate({ 
	path: 'guides', //--- populate pulls the info from guides into the query (based off the ID given in the guides array)
	select: '-__v -passwordChangedAt'
	}); 
	next();
});
tourSchema.post(/^find/, function(docs, next) {
	next();
});

//Aggregation middleware
// tourSchema.pre('aggregate', function(next) {
// 	this.pipeline().unshift({ $match: { secretTour: { $ne: true } } }); // add to beginning of array, shift is end
// 	next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
