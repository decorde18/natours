const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');


const router = express.Router();
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

//Protect all routes from this middleware
router.use(authController.protect); //middleware runs in sequence so all routes that run after this will have to be authenticated

router.patch('/updateMyPassword',authController.updatePassword);
router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMe',
	userController.uploadUserPhoto,
	userController.resizeUserPhoto,
	userController.updateMe); //upload uses multer package to get file from photo field in form to save to file system....single means one file

router.delete('/deleteMe', userController.deleteMe);

router.use(authController.restrictTo('admin'));

router //
	.route('/')
	.get(userController.getAllUsers)
	.post(userController.createUser);
router //
	.route('/:id')
	.get(userController.getUser)
	.patch(userController.updateUser)
	.delete(userController.deleteUser);

module.exports = router;


