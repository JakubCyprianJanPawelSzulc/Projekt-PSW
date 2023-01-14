import { combineReducers } from '@reduxjs/toolkit';
import loginReducer from '../reducers/loginReducer.js'

export default combineReducers({
    login: loginReducer,
});
