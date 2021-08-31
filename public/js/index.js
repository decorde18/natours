/* eslint-disable */
import '@babel/polyfill';
import {displayMap} from './mapbox';
import {login, logout} from './login';
// import {updateData} from './updateSettings'; //before password update added 
import {updateSettings} from './updateSettings';
import {bookTour} from './stripe';

// DOM elements
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav_el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');



//delegation
if (mapBox) {
	
	const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);
}

//loginform
if(loginForm) {
	loginForm.addEventListener('submit', e => {
		//this looks at the login form and the class .form to listen to events when submit bitton is clicked.  then the elements are passed to assure things happen
		e.preventDefault(); //prevents from loading another page
		
		//values
		const email = document.getElementById('email').value;
		const password = document.getElementById('password').value;
	login(email, password);}
)};

if(logOutBtn) logOutBtn.addEventListener('click', logout)

if(userDataForm)  //save settings button pushed
		userDataForm.addEventListener('submit', e => {
			e.preventDefault(); //won't save if there are no changes (I believe)
			const form = new FormData();
			form.append('name', document.getElementById('name').value);
			form.append('email', document.getElementById('email').value);
			form.append('photo', document.getElementById('photo').files[0]);
			//Commented out below so because they were appended to form with above code rather than the previous way which allows us to save file uploads as well.
			//const name = document.getElementById('name').value; //gets the info from the form
			//const email = document.getElementById('email').value;
			// updateData(name, email); //sends to updatesettings.js to run //before password update
			updateSettings(form/*{name, email}*/, 'data'); //update settings js
			console.log(form);

		} );

if(userPasswordForm)  //save settings for password button pushed
userPasswordForm.addEventListener('submit', async e => {
	document.querySelector('.btn--save-password').textContent = 'Updating...'
	e.preventDefault(); //won't save if there are no changes (I believe)
	const passwordCurrent = document.getElementById('password-current').value;
	const password = document.getElementById('password').value;
	const passwordConfirm = document.getElementById('password-confirm').value;
	// updateData(name, email); //sends to updatesettings.js to run //before password update
	await updateSettings({passwordCurrent, password, passwordConfirm}, 'password');

	document.querySelector('.btn--save-password').textContent = 'Save Password'
	document.getElementById('password-current').value = '';
	document.getElementById('password').value = '';
	document.getElementById('password-confirm').value = '';
} );

if(bookBtn) 
	bookBtn.addEventListener('click', e=> {;
		e.target.textContent = 'Processing...'
		const {tourId} = e.target.dataset //js reads dashes and converts to camel tex ie tour-id becomes tourId  ALSO don't need dataset.tourId because the const is the same so destructuring with {}
		bookTour(tourId);
	});