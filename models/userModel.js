const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
	name                 : {
		type     : String,
		required : [
			true,
			'Please tell us your name!'
		]
		// unique: [ true, 'You already have a tour by that name' ],
		// trim: true,
		// maxlength: [ 40, 'The tour name must have less than or equal to 40 characters' ],
		// minlength: [ 10, 'A tour length must have more than or equal to 10 characters' ],
		// validate: [validator.isAlpha, 'Tour name must only contain alpha characters'] don't use because it will not accept spaces
	},
	email                : {
		type      : String,
		required  : [
			true,
			'Please provide your email'
		],
		unique    : [
			true,
			'That email is already associated with an account.'
		],
		lowercase : true,
		validate  : [
			validator.isEmail,
			'Please provide a valid email format.'
		]
	},
	photo                : {
		type: String, 
		default: 'default.jpg'
	},
	role                 : {
		type    : String,
		enum    : [
			'user',
			'guide',
			'lead-guide',
			'admin'
		], //different levels of admin access. change guide and lead-guide to whatever makes sense
		default : 'user'
	},
	password             : {
		type      : String,
		required  : [
			true,
			'Please provide a password.'
		],
		minlength : 8,
		select    : false
	},
	passwordConfirm      : {
		type     : String,
		required : [
			true,
			'Please confirm your password.'
		],
		validate : {
			//this only works on CREATE & SAVE !!!, not update that will need to be handled elsewhere
			validator : function(el) {
				return el === this.password;
			},
			message   : 'Passwords are not the same!'
		}
	},
	passwordChangedAt    : Date,
	passwordResetToken   : String,
	passwordResetExpires : Date,
	active: {
		type:Boolean,
		default:true,
		select: false,
	}
});

userSchema.pre('save', async function(next) {
	//only run function when password is modified
	if (!this.isModified('password')) return next();
	//hash the password with cost of 12
	this.password = await bcrypt.hash(this.password, 12); //10 is default, 12 is recommended now to safely encrypt without taking too much time
	//delete passwordconfirm field
	this.passwordConfirm = undefined;
	next();
});
userSchema.pre('save', function(next) {
	if (!this.isModified('password') || this.isNew) return next();
	this.passwordChangedAt = Date.now() - 1000;//subtract the second so it won't be written to DB after the token has been changed
	next();
});

userSchema.pre(/^find/,function(next){
	//this points to the current query
	this.find({active: {$ne: false}});
	next();
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
	return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
	if (this.passwordChangedAt) {
		const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
		return JWTTimestamp < changedTimestamp;
	}
	//False means not changed
	return false;
};
userSchema.methods.createPasswordResetToken = function() {
	const resetToken = crypto.randomBytes(32).toString('hex');

	this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
	console.log({ resetToken }, this.passwordResetToken);
	this.passwordResetExpires = Date.now() + 10 * 60 * 100; //10 minutes
	return resetToken;
};
const User = mongoose.model('User', userSchema);
module.exports = User;
