const mongoose = require('mongoose');
const { Schema } = mongoose;

const serviceSchema  = new Schema({
    filename : {type: String, required: true},
    path: {type: String},
    originalname: {type: String},
    mimetype: {type: String},
    size: { type: Number},
    title: {type: String, required: true},
    descripcion: {type: String, require: true},
    precio: {type: Number, require: true}, 
    
});

module.exports = mongoose.model('Service', serviceSchema);