class APIFeatures {
	//build query
	constructor(query, queryString) {
		this.query = query;
		this.queryString = queryString;
	}

	filter() {
		//excluding query words that should not be queried. FILTERING
		const queryObj = { ...this.queryString };
		const excludedFields = [ 'page', 'sort', 'limit', 'fields' ];
		excludedFields.forEach((el) => delete queryObj[el]);

		//advanced filtering
		let queryStr = JSON.stringify(queryObj);
		queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
		this.query = this.query.find(JSON.parse(queryStr));
		return this;
	}

	sort() {
		//Sorting

		if (this.queryString.sort) {
			//mulitple sort fields
			const sortBy = this.queryString.sort.split(',').join(' ');
			this.query = this.query.sort(sortBy);
		} else {
			this.query = this.query.sort('-createdAt');
		}
		return this;
	}

	//field limiting
	limitFields() {
		if (this.queryString.fields) {
			const fields = this.queryString.fields.split(',').join(' ');
			this.query = this.query.select(fields);
		} else {
			this.query = this.query.select('-__v'); //excludes __v which is a field Mongoose adds
		}
		return this;
	}

	paginate() {
		//page selection and limit per page- PAGINATION
		const page = this.queryString.page * 1 || 1; //||is the default value
		const limit = this.queryString.limit * 1 || 100;
		const skip = (page - 1) * limit;
		this.query = this.query.skip(skip).limit(limit);
		// if (this.queryString.page) {
		// 	const numTours = await Tour.countDocuments(); // if they want a page that is too high
		// 	if (skip >= numTours) throw new Error('This Page Does Not Exist'); //the throw inside the try block immediately sends it to the catch with the error
		return this;
	}
}
module.exports = APIFeatures;
