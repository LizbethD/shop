const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcrypt-nodejs');

const UsersSchema  = new Schema({
    fisrt_name: { type: String, require: true },
    last_name: { type: String, require: true },
    email: { type: String, require: true },
    password: { type: String, require: true }
});

UsersSchema.methods.encryptPassword = function(password){
    return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};
UsersSchema.methods.validPassword = function(password){
    return bcrypt.compareSync(password, this.password);
};


module.exports = mongoose.model('User', UsersSchema);
