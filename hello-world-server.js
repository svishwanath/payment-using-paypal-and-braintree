var http = require('http');
var fs = require('fs');
var url = require("url");

var paypal_api = require('paypal-rest-sdk');
var braintree = require("braintree");
//$ = require('jquery/dist/jquery')(window); 

fs.readFile('./Index.html', function(err, html) {
    if (err) {
        throw err;
    }

    //	$("#Validateuser").click(function(){
    //	    alert("The paragraph was clicked.");
    //	});
    http.createServer(function(request, response) {
        response.writeHeader(200, {
            "Content-Type": "text/html"
        });

        var params = url.parse(request.url, true).query;
        //if()


        console.log(params.Currency == 'USD' || params.Currency == 'EUR' || params.Currency == 'AUD');
        console.log(params);

        if (params.Currency == 'USD' || params.Currency == 'EUR' || params.Currency == 'AUD') {
            var config_opts = {
                'host': 'api.sandbox.paypal.com',
                'port': '',
                'client_id': 'EBWKjlELKMYqRNQ6sYvFo64FtaRLRR5BdHEESmha49TM',
                'client_secret': 'EO422dn3gQLgDbuwqTjzrFgFtaRLRR5BdHEESmha49TM'
            };
            var listPayment = {
                'count': '1',
                'start_index': '1'
            };
            var create_payment_json = {
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "redirect_urls": {
                    "return_url": "http:\/\/localhost\/test\/rest\/rest-api-sdk-php\/sample\/payments\/ExecutePayment.php?success=true",
                    "cancel_url": "http:\/\/localhost\/test\/rest\/rest-api-sdk-php\/sample\/payments\/ExecutePayment.php?success=false"
                },
                "transactions": [{
                    "amount": {
                        "currency": "USD",
                        "total": "1.00"
                    },
                    "description": "This is the payment description."
                }]
            };
            paypal_api.payment.create(create_payment_json, config_opts, function(err, res) {
                if (err) {
                    throw err;
                }

                if (res) {
                    console.log("Create Payment Response");
                    console.log(res);
                }
            });


        } else {

            //Connection URL

            var gateway = braintree.connect({
                environment: braintree.Environment.Sandbox,
                merchantId: "3h4ng5qpn2j8jp7q",
                publicKey: "6wyvs7mmdytd9m6n",
                privateKey: "5ca28de9963ecef3da002429073e43f9",
            });

            module.exports.braintree = function(request, response) {

                console.log("Reached braintree portal");

                var data = request.query;

                var saleRequest = {
                    amount: data.price,
                    creditCard: {
                        number: data.number,
                        cvv: data.cvv2,
                        expirationDate: data.expire_month + "/" + data.expire_year.slice(2),
                    },
                    options: {
                        submitForSettlement: true
                    }

                };

                gateway.transaction.sale(saleRequest, function(error, result) {

                    if (error) {
                        console.log(error.name);
                        response.status(404).send(error.name);
                    }

                    if (result.success) {

                        <!-- Save data to DB -->

                        response.status(200).send("The payment was successfull, transaction id: " + result.transaction.id);

                    } else {
                        response.status(404).send(result.message);
                    }
                });

            };

        }




        response.write(html);
        response.end();


    }).listen(8080);

});
