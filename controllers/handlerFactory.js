const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');




exports.deleteOne = Model => 
    catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndDelete(req.params.id);
        if (!doc) {
            return next(new AppError('No document found with that ID', 404)); //reminder, return keeps the code from going to the next code
        }
        res.status(204).json({
            //deleted code
            status : 'success',
            data   : null
        });
});

exports.updateOne = Model => catchAsync(async (req, res, next) => {
	const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
		new           : true,
		runValidators : true
	});
	if (!doc) {
		return next(new AppError('No document found with that ID', 404)); //reminder, return keeps the code from going to the next code
	}
	res.status(200).json({
		status : 'success',
		data   : {
			data : doc //is the same as doc:doc
		}
	});
});

exports.createOne = Model => catchAsync(async (req, res, next) => {
	const doc = await Model.create(req.body);

	res.status(201).json({
		status : 'success',
		data   : {
			data : doc
		}
	});
});

exports.getOne = (Model, popOptions) => catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

	if (!doc) {
		return next(new AppError('No document found with that ID', 404));
	}

	res.status(200).json({
		status : 'success',
		data   : {
			data: doc
		}
	});
});

exports.getAll = Model => 
    catchAsync(async (req, res, next) => {
     // to allow for nested GET reviews on Tour
        let filter = {}
        if (req.params.tourId) filter = {tour: req.params.tourId};
        
        //execute query
        const features = new APIFeatures(Model.find(filter), req.query) //
            .filter()
            .sort()
            .limitFields()
            .paginate();
        // const doc = await features.query.explain(); this gives us more information on our query
        const doc = await features.query;
        //send response
        res.status(200).json({
            status  : 'success',
            results : doc.length,
            data    : {
                data: doc
            }
        });
});
