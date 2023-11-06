var express = require("express");
var path = require("path");

const{check,validationResult } = require("express-validator");
var myApp = express();

const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/finals',{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const Order = mongoose.model('Order',{
    name:String,
    number:String,
    mango:Number,
    berry:Number,
    apple:Number,
    subTotal:Number,
    tax:Number,
    total:Number
});

myApp.set('views', path.join(__dirname,"views"));
myApp.use(express.urlencoded({extended:false}));
myApp.use(express.static(__dirname + '/public'));
myApp.set('view engine', 'ejs');

myApp.get('/', function (req, res) {
    res.render('index');
});

var phoneRegex = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/;


function phoneValidator(value){
    if (phoneRegex.test(value)) {
        return true;
    } else {
        throw new Error('Enter valid phone number(xxx-xxx-xxxx)');
    }
}

myApp.post('/',[
    check('name', 'Must have a name').not().isEmpty(),
    check('number').custom(phoneValidator)
], function(req,res){

    const errors = validationResult(req);

    if(!errors.isEmpty()){
        res.render('index', {
            errors: errors.array()
        });
    }
    else{
        var name = req.body.name;
        var number = req.body.number;
        var mango = req.body.mango || 0;
        var berry = req.body.berry || 0;
        var apple = req.body.apple || 0;

        var inputs = Array.of(mango*2.99, berry*1.99, apple*2.49);

        var sum = 0

        for(var i = 0; i<inputs.length;i++){
            if(inputs[i]>0){
                sum +=inputs[i];
            }
        }
        var subTotal = sum;
        var tax = sum*0.13;
        var total = tax + sum;

        var pageData = {
            name:name,
            number:number,
            mango:mango,
            berry:berry,
            apple:apple,
            subTotal:subTotal,
            tax:tax,
            total:total
        }

        var newOrder = new Order(pageData);

        newOrder.save().then(function(){
            console.log('new Order Created');
        });

        res.render('success', pageData);
    }
});

myApp.get('/allorder', function(req,res){
    Order.find({}).then((orders)=>{
        console.log(orders);
        res.render('allorder', {orders: orders });
    }).catch((err) => {
        console.log(err);
    })
});


myApp.listen(8080);
console.log('Everything working fine...');