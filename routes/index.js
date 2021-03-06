var express = require('express');
var router = express.Router();
var Cart = require('../models/cart');

var Product = require('../models/product');
var Service = require('../models/service');
var Order = require('../models/order');

/* GET home page. */
router.get('/', function(req, res) {
  var successMsg = req.flash('success')[0];
   Product.find(function(err, docs) { 
    var productChunks = [];
    var chunkSize = 3;
    for (var i = 0; i < docs.length; i += chunkSize) {
     productChunks.push(docs.slice(i, i + chunkSize));
   }
      res.render('shop/index', { title: 'Shopping Cart', products: productChunks, successMsg: successMsg, noMessages: !successMsg});
  });
});  

//Services
router.get('/services', function(req, res) {
  var successMsg = req.flash('success')[0];
   Service.find(function(err, docs) { 
    var serviceChunks = [];
    var chunkSize = 3;
    for (var i = 0; i < docs.length; i += chunkSize) {
     serviceChunks.push(docs.slice(i, i + chunkSize));
   }
      res.render('shop/services', { title: 'Paquetes', services: serviceChunks, successMsg: successMsg, noMessages: !successMsg});
  });
});

router.get('/add-to-cart/:id', function(req, res){
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  Product.findById(productId, function(err, product){
    if (err) {
      return res.redirect('/');
    }
    cart.add(product, product.id);
    req.session.cart = cart;
    console.log(req.session.cart)
    res.redirect('/');
  });
});

//services
router.get('/add-cart/:id', function(req, res){
  var serviceId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  Service.findById(serviceId, function(err, service){
    if (err) {
      return res.redirect('/');
    }
    cart.add(service, service.id);
    req.session.cart = cart;
    console.log(req.session.cart)
    res.redirect('/services');
  });
});

//services
router.get('/reduce/:id', function(req, res){
  var productId = req.params.id;
  var serviceId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.reduceByOne(productId, serviceId);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});

router.get('/remove/:id', function(req, res){
  var productId = req.params.id;
  var serviceId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.removeItem(productId, serviceId);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});

router.get('/shopping-cart', function(req, res){
  if(!req.session.cart){
    return res.render('shop/shopping-cart', {products: null});
  }
  var cart = new Cart(req.session.cart);
  res.render('shop/shopping-cart', {products: cart.generateArray(), totalPrecio: cart.totalPrecio})
});

router.get('/checkout', isLoggedIn, function(req, res){
  if(!req.session.cart){
    return res.redirect('/shopping-cart');
  }
  var cart = new Cart(req.session.cart);
  var errMsg = req.flash('error')[0];
  res.render('shop/checkout', {total: cart.totalPrecio, errMsg: errMsg, noError: !errMsg});
});

router.post('/checkout', isLoggedIn, function(req, res) {
  if (!req.session.cart) {
      return res.redirect('/shopping-cart');
  }

  var date = new Date();
  const cart = new Cart(req.session.cart);
  var stripe = require('stripe')('sk_test_4eC39HqLyjWDarjtT1zdp7dc');

stripe.charges.create({
  amount: cart.totalPrecio * 100,
  currency: "usd",
  source: "tok_amex", // obtained with Stripe.js
  description: " Test Charge"
}, function(err, charge) {
      if (err) {
          req.flash('error', err.message);
          return res.redirect('/checkout');
      }
      var order = new Order({
        user: req.user,
        cart: cart,
        address: req.body.address,
        name: req.body.name,
        fecha: req.body.fecha,
        date: date,
        paymentId: charge.id
      });
      order.save(function(){
        req.flash('success', 'Successfully bought product!');
        req.session.cart = null;
        res.redirect('/');
      });
  });
});

router.get('/order/:id', function(req, res){
  Order.findByIdAndDelete(req.params.id, function(error){
     if(error){
        res.send('Error al intentar eliminar la orden.');
     }else{ 
      res.render('user/profile')
     }
  });
});

router.get('/factura', isLoggedIn, function(req, res, next){
  Order.find({user: req.user}, function(err, orders){
      if(err){
          return res.write('Error!')
      }
      var cart;
      orders.forEach(function(order){
          cart = new Cart(order.cart);
          order.items = cart.generateArray();
      });
      res.render('user/factura', {orders: orders});
  }).sort({$natural:-1}).limit(1);
});

//pdf
const pdfMake = require('../pdfmake/pdfmake');
const vfsFonts = require('../pdfmake/vfs_fonts');

pdfMake.vfs = vfsFonts.pdfMake.vfs;

router.post('/pdf', (req, res, next)=>{ 
  var producto = req.body.producto;
  var cantidad = req.body.cantidad;
  var subtotal = req.body.subtotal;
  var total = req.body.total;

  var rows = [];
    rows.push(['Producto', 'Cantidad', 'Subtotal', 'Total']);

    for(var i of [1]) {
       rows.push([producto, cantidad, subtotal, total]);
  }

  const documentDefinition = {
        content: [
          {
            text: 'Factura',
            style: 'header',
          }, '\n\n',
          {
            text: [
              {text: 'La Bella Lola Marquesitas, \n', fontSize: 12,italics: true},
              {text: 'Calle Oaxaca No.8, \n', fontSize: 12, italics: true},
              {text: 'Dolores Hidalgo, Gto. Mx. ', italics: true, fontSize: 12},
              '\n\n'
            ]
          },
          { 
            table: {
              // headers are automatically repeated if the table spans over multiple pages
              // you can declare how many rows should be treated as headers
              headerRows: 1,
              widths: [250, '*', '*', '*'], 
              body: rows
            }      
        // {table: {headerRows: 1,  body: contentPDF} }
          }, '\n\n',
        {
          text: 'Gracias por su compra!!!',
          style: 'sub',
        }, '\n\n',
      ],
      styles: {
        header: {
          fontSize: 18,
          alignment: 'center',
          bold: true
        }, 
        sub: {
          fontSize: 14,
          alignment: 'center',
          bold: true
        }
      }       
    };
    const pdfDoc = pdfMake.createPdf(documentDefinition);
    pdfDoc.getBase64((data)=>{
        res.writeHead(200, 
        {
            'Content-Type': 'application/pdf',
            'Content-Disposition':'attachment;filename="filename.pdf"'
        });
        const download = Buffer.from(data.toString('utf-8'), 'base64');
        res.end(download);
    });
});
  //doc.image('wally.jpg', 50, 150, {width: 300});

module.exports = router;

function isLoggedIn(req, res, next){
  if (req.isAuthenticated()) {
      return next();
  }
  req.session.oldUrl = req.url;
  res.redirect('/user/signin');
}

/*`Factura`,
'Gracias por tu compra!!!',
`${order}`,
`${address}`,
`${total}`

 [
                  [ 'Producto', 'Cantidad', 'Subtotal' ],
                  [ `${producto}`,  `${cantidad}`, `${subtotal}`],
                  [ { text: 'Total a pagar  $', bold: true }, '', `${total}`]
              ]
});*/