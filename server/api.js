// import 
var mongoRestifier = require('mongo-restifier');
 
// configure the api 
mongoRestifier('./api.conf.json')
 
// define "Todo" model 
.register(mongoRestifier.defineModel("Todo", {
 
    // api end point 
    url: '/todo',
 
    // schema definition - supports everything that mongoose schema supports 
    schema: {
      index: {
        type: Number,         // type of this attribute 
        autoIncrement: true,  // auto increment this attribute 
        idField: true         // serves as id attribute replacing _id 
      },
      title: {
        type: String,
        required: true
      },
      description: String,    // attribute definition can be as simple as this 
      status: String,
    }
 
}))
 
// ... more models can be added here 
 
// and finally startup the server 
.startup();