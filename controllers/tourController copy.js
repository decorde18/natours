/* eslint-disable prettier/prettier */
// const fs = require('fs');
const Tour = require('./../models/tourModel');
//const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

// exports.checkID = (req, res, next, val) => {
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID',
//     });
//   }
//   next();
// };
// exports.checkBody = (req, res, next) => {
// 	if (!req.body.name || !req.body.price) {
// 		return res.status(400).json({
// 			status: 'fail',
// 			message: 'Missing name or price'
// 		});
// 	}
// 	next();
// };
exports.getAllTours = async (req, res) => {
	try {
		//execute query
		const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate();
		const tours = await features.query;
		//send response
		res.status(200).json({
			status: 'success',
			results: tours.length,
			data: {
				tours
			}
		});
	} catch (err) {
		res.status(404).json({
			status: 'fail',
			message: err
		});
	}
};

exports.getTour = (req, res) => {
	const id = req.params.id * 1;
	//   const tour = tours.find((el) => el.id === id);
	//   if (!tour) {
	//    	return res.status(404).json({
	//   status: 'fail',
	//   message: 'Invalid ID',
	// });
	//   }
	//   res.status(200).json({
	//     status: 'success',
	//     data: {
	//       tour,
	//     },
	//   });
};

exports.createTour = (req, res) => {
	// this is called the route hander the req, res
	res.status(201).json({
		//201 is created
		status: 'success'
		// data: {
		//   tour: newTour,
		// },
	});
	//   const newID = tours[tours.length - 1].id + 1; //create new ID. Does not need to be done with a DB as it will auto generate
	//   const newTour = Object.assign({ id: newID }, req.body);

	//   tours.push(newTour);
	//   fs.writeFile(
	//     `${__dirname}/../dev-data/data/tours-simple.json`,
	//     JSON.stringify(tours),
	//     (err) => {
	//       res.status(201).json({
	//         //201 is created
	//         status: 'success',
	//         data: {
	//           tour: newTour,
	//         },
	//       });
	//     }
	//   );
};

//res.send('Done'); // always need to finish the cycle by sending a response

exports.updateTour = (req, res) => {
	res.status(200).json({
		status: 'success',
		data: {
			tour: 'Updated tour here...'
		}
	});
};

exports.deleteTour = (req, res) => {
	res.status(204).json({
		//deleted code
		status: 'success',
		data: null
	});
};
