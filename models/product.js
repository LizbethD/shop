const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema  = new Schema({
    filename : {type: String, required: true},
    path: {type: String},
    originalname: {type: String},
    mimetype: {type: String},
    size: { type: Number},
    codigo: {type: String, required: true},
    title: {type: String, required: true},
    descripcion: {type: String, require: true},
    categoria: { type: String, require: true },
    precio: {type: Number, require: true}, 
    
});

module.exports = mongoose.model('Product', productSchema);