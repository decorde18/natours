// WITH API for updating user info name and email.  Without API used a nother route. this way does not use another route so it can catch errors on the page

import axios from 'axios';
import { showAlert } from './alerts';

// BEFORE HE ADDED THE UPDATE PASSWORD
//export const updateData = async (name, email) => {
//     try{
//         const res = await axios({
//             method: 'PATCH',
//             url: 'http://127.0.0.1:3000/api/v1/users/updateMe', //update CurrentUser that we created the route and can view in postman, not update User. That is a different route
//             data: {
//                 name, 
//                 email
//             }
//         });
//         if(res.data.status === 'success') {
//             showAlert('success', 'Data updated successfully!');
//         }
//     } catch (err) {
//         showAlert('error', err.response.data.message)
//     }
// }

//type is either password or data (name, email)
export const updateSettings = async (data, type) => {
    try{
        const url = 
        type ==='password' 
        ? 'http://127.0.0.1:3000/api/v1/users/updateMyPassword' 
        : 'http://127.0.0.1:3000/api/v1/users/updateMe';

        const res = await axios({
            method: 'PATCH',
            url, //update CurrentUser that we created the route and can view in postman, not update User. That is a different route
            data //or data:data
        });
        if(res.data.status === 'success') {
            showAlert('success', `${type.toUpperCase()} updated successfully!`);
        }
    } catch (err) {
        showAlert('error', err.response.data.message)
    }
}