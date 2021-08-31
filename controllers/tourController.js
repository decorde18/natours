const multer = require('multer');
const sharp = require('sharp');
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
	if (file.mimetype.startsWith('image')) {
		cb(null, true)
	} else {
		cb(new AppError('Not an image! Please upload only images.', 400), false);
	}
};

const upload = multer({
	storage : multerStorage,
	fileFilter: multerFilter
});

exports.uploadTourImages = upload.fields([ //uploads more than one file for the pictures, single did only one (in userController)
	{name: 'imageCover', maxCount: 1},
	{name:'images', maxCount: 3}
]); 

//upload.array('images', 3)  will generate req.files  if there wasn't a need for the imageCover, but just 3 files

exports.resizeTourImages = catchAsync( async (req, res, next) => {
	if( !req.files.imageCover || !req.files.images) return next();

//1 process cover image
	const imageCoverFilename = `tour-${req.params.id}-${Date.now()}-cover.jpeg` ///req.params.id is the tour id
	await sharp(req.files.imageCover[0].buffer)
		.resize(2000,1333)
		.toFormat('jpeg')
		.jpeg({quality: 90})
		.toFile(`public/img/tours/${imageCoverFilename}`); 
		//HUGE **** look in handlerFactory. when updating findById req.params, req.body.   DOES ALL THE STUFF THAT I WAS STRUGGLING WITH IT DELETING. Needs to update whole body
		//the next step will allow the req.body to added onto
	req.body.imageCover = imageCoverFilename; // can also just use req.body.imageCover in the 2 imageCoverFilename that are above


//2 process other images in the loop
req.body.images = [];  
await Promise.all( //the promise.all allows the map to work
	req.files.images.map(async (file, i) => { //the way to do i in foreach instead of the old way of doing a for loop  //map is there because the async is inside the foreach thus it will get to next, before the imagename gets pushed to the array.. map saves the 3 promises but not foreach
			const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`
			await sharp(file.buffer) //i had req.files.images[i] and file is obvious easier 
			.resize(2000,1333)
			.toFormat('jpeg')
			.jpeg({quality: 90})
			.toFile(`public/img/tours/${filename}`); 
			
			req.body.images.push(filename);
		})
		);
	next();
});

exports.aliasTopTours = (req, res, next) => {
	req.query.limit = '5';
	req.query.sort = '-ratingsAverage, price';
	req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
	next();
};

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, {path:'reviews'});
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
	const stats = await Tour.aggregate([
		{
			$match : { ratingsAverage: { $gte: 4.5 } }
		},
		{
			$group : {
				_id        : { $toUpper: '$difficulty' }, // can change for ratings or dificultiy and it will subdivide them so you get the information below for every category you want
				numTours   : { $sum: 1 },
				numRatings : { $sum: '$ratingsQuantity' },
				avgRating  : { $avg: '$ratingsAverage' },
				avgPrice   : { $avg: '$price' },
				minPrice   : { $min: '$price' },
				maxPrice   : { $max: '$price' }
			}
		},
		{
			$sort : { maxPrice: 1 } //must use field names from the group
			//the one is for ascending, -1 is for descending
		}
		//can then add a new match if you want that filters more.
	]);

	res.status(200).json({
		status : 'sucess',
		data   : {
			stats
		}
	});
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
	const year = req.params.year * 1;
	const plan = await Tour.aggregate([
		{
			$unwind : '$startDates' //this is how we break up arrays. Every time a player is subbed, every goal, etc????????
		},
		{
			$match : {
				startDates : {
					$gte : new Date(`${year}-01-01`), //year given month, date
					$lte : new Date(`${year}-12-31`)
				}
			}
		},
		{
			$group : {
				_id           : { $month: '$startDates' },
				numTourStarts : { $sum: 1 },
				tours         : { $push: '$name' }
			}
		},
		{
			$addFields : { month: '$_id' }
		},
		{
			$project : {
				_id : 0 //0 turns off that field, 1 turns it on which is default
			}
		},
		{
			$sort : { numTourStarts: -1 }
		},
		{
			$limit : 12 //limits the number of results
		}
	]);
	res.status(200).json({
		status : 'success',
		data   : {
			plan
		}
	});
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
	const { distance, latlng, unit} = req.params;
	const [lat, lng] = latlng.split(',');

	const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

	if(!lat || !lng) {
		next(
		new AppError('Please provide your latitude and longitude in the format lat, lng.',400));
	}

const tours = await Tour.find({startLocation: {$geoWithin: {$centerSphere: [[lng,lat], radius]}}});

	res.status(200).json({
		status:'success',
		results: tours.length,
		data: {
			data: tours
		}
	});
});
exports.getDistances = catchAsync(async(req, res, next) => {
	const { latlng, unit} = req.params;
	const [lat, lng] = latlng.split(',');

const multiplier = unit === 'mi' ? .000621371 : 0.001

	if(!lat || !lng) {
		next(
		new AppError('Please provide your latitude and longitude in the format lat, lng.',400));
	}
	const distance = await Tour.aggregate([
		{
			$geoNear: {
				near: {
					type: 'Point',
					coordinates: [lng * 1,lat * 1]
				},
				distanceField: 'distance',
				distanceMultiplier: multiplier
			}
		},
		{
			$project: {
				distance: 1, 
				name: 1
			}
		}
	]);
	res.status(200).json({
		status:'success',
		data: {
			data: distance
		}
	});
});