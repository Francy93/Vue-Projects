////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////// MODULES //////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const express		= require("express");		// web framework
const path			= require("path");			// resources path handler
const cors			= require("cors")			// allow cross origin access

const urlModule		= require("url");			// url sections handler
const statusCodes	= require("../json/statusCodes.json");	// status codes collection
const publicPath	= path.resolve(__dirname, "../public");	// public/static folder path

const multer  		= require('multer');		// used to upload files and process any multipart POST request like multipart/form-data
const formData 		= multer();					//{ dest: 'uploads/' }); // https://www.npmjs.com/package/multer

const app			= express();				// middlewares handler
const port			= process.env.PORT || 3000;	// listening port

app.use(express.static(publicPath));			// Sends static files from the publicPath directory
app.use(cors());								// allowing cross origins access
app.use(express.json());
app.use(express.urlencoded({ extended: true }));// used for POST request like application/x-www-form-urlencoded

// database MongoDB
const mongoDB		= require('mongodb');
const MongoClient	= mongoDB.MongoClient;
const ObjectID		= mongoDB.ObjectId;
const uri			= 'mongodb+srv://fa1033:MDXuniversity@shopnow.kzvkn.mongodb.net/main?retryWrites=true&w=majority';
const client		= new MongoClient(uri);
var db;

// Connect to MongoDB
client.connect((err, client) => db = client.db('main'));





////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////// INITIAL SETTING ///////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////




/**
 * Checking whether astring is a json or not
 * @param	{any} data
 * @returns {boolean} true or false
 */
function isJSON(data){
    try  { JSON.parse(data); }
    catch(e) { return false; }  
    return true;
}

/**
 * Converting a request to an object
 * @param {object} req 
 * @returns {object} object
 */
function reqToObj(req){
	const obj = {
		headers		: req.headers,
		method		: req.method,
		url			: req.url,
		httpVersion	: req.httpVersion,
		body		: req.body,
		cookies		: req.cookies,
		path		: req.path,
		protocol	: req.protocol,
		query		: req.query,
		hostname	: req.hostname,
		ip			: req.ip,
		originalUrl	: req.originalUrl,
		params		: req.params,
		collection	: req.collection
	};
	return obj;
}


// requestes monitor
app.use(function(request,response,next) {
    console.log("Request IP: "		+ request.ip );
	console.log("Request URL: "		+ request.url);
    console.log("Request date: "	+ new Date() );
    next(); // computing the next middleware here below
});



// Set param for the MongoDB collection names
app.param("mongoCollection", (req, res, next, collectionName) => {
	req["collection"] = db.collection(collectionName);
	return next();
})




////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////// MONGO REQUESTS //////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////



// retrieving data with the get request
app.get('/mongoDB/:mongoCollection/:mongoOperation?', async (req, res, next) => {
	try{
		const method	= req.params.mongoOperation;
		let request		= isJSON(req.query.ajax)? JSON.parse(req.query.ajax): req.query.ajax;
		request			= typeof request === "object"? request: {_id: new ObjectID(request.toString())};
		let result;

		switch(method){
			case "aggregate": case "countDocuments": case "findOne": case "distinct": case "bulkWrite":
				if		(!Array.isArray(request))							result = await req.collection[method](request);
				else if	(Array.isArray(request) && request.length === 1)	result = await req.collection[method](request[0]);
				else if	(Array.isArray(request) && request.length === 2)	result = await req.collection[method](request[0], request[1]);
				else if	(Array.isArray(request) && request.length 	> 2 && method == "distinct"){
					result = await req.collection[method](request[0], request[1], request[2]);
				}
				//req.collection[method](request, (err,result) => {res.send(JSON.stringify(result)); console.log(result)});
				break;
			case "find":
				if		(!Array.isArray(request))							result = await req.collection[method](request).toArray();
				else if	(Array.isArray(request) && request.length === 1)	result = await req.collection[method](request[0]).toArray();
				else if	(Array.isArray(request) && request.length 	> 1)	result = await req.collection[method](request[0], request[1]).toArray();
				//req.collection[method](request).toArray((e, results) => {res.send(JSON.stringify(results)); console.log(results)});
		}

		if(result !== undefined) {
			res.send(JSON.stringify(result));
			console.log(result);
			return;
		}else throw new Error("Bad Request");
	} catch (e) { console.error(e); }
	res.status(statusCodes.clientError.badRequest).end();
});

// adding data with a post request
app.post('/mongoDB/:mongoCollection/:mongoOperation?', formData.none(), async (req, res, next) => {
	try{
		const method	= req.params.mongoOperation;
		let request		= isJSON(req.body.ajax)? JSON.parse(req.body.ajax): req.body.ajax;
		request			= typeof request === "object"? request: {_id: new ObjectID(request.toString())};
		let result;

		switch(method){
			case "insertOne": case "insertMany": case "bulkWrite":
				if		(!Array.isArray(request))							result = await req.collection[method](request);
				else if	(Array.isArray(request) && request.length === 1)	result = await req.collection[method](request[0]);
				else if	(Array.isArray(request) && request.length 	> 1)	result = await req.collection[method](request[0], request[1]);
				
				if(result !== undefined) {
					res.send(JSON.stringify(result));
					console.log(result);
					return;
				}else throw new Error("Bad Request");
		}
	} catch (e) { console.error(e); }
	res.status(statusCodes.clientError.badRequest).end();
});

// remove data with a delete request
app.delete("/mongoDB/:mongoCollection/:mongoOperation/:ajax*", async function(req, res, next) {
	try{
		const method	= req.params.mongoOperation;
		const reqAsseb	= isJSON(req.params.ajax)? req.params.ajax: isJSON(req.params.ajax+req.params[0])? req.params.ajax+req.params[0]: req.params.ajax;
		let request		= isJSON(reqAsseb)? JSON.parse(reqAsseb).ajax: reqAsseb.ajax;
		request			= typeof request === "object"? request: {_id: new ObjectID(request.toString())};
		let result;

		switch(method){
			case "deleteOne": case "deleteMany": case "remove": case "findOneAndDelete": case "bulkWrite":
				if		(!Array.isArray(request))							result = await req.collection[method](request);
				else if	(Array.isArray(request) && request.length === 1)	result = await req.collection[method](request[0]);
				else if	(Array.isArray(request) && request.length 	> 1)	result = await req.collection[method](request[0], request[1]);
				
				if(result !== undefined) {
					res.send(JSON.stringify(result));
					console.log(result);
					return;
				}else throw new Error("Bad Request");
		}
	} catch (e) { console.error(e); }
	res.status(statusCodes.clientError.badRequest).end();
});

// replacing entire data by a put request (replace)
app.put("/mongoDB/:mongoCollection/:mongoOperation/ajax", async function(req, res, next) {
	try{
		const method	= req.params.mongoOperation;
		let request		= isJSON(req.body.ajax)? JSON.parse(req.body.ajax): req.body.ajax;
		request			= typeof request === "object"? request: {_id: new ObjectID(request.toString())};
		let result;

		switch(method){
			case "bulkWrite":	result = await req.collection[method](request);
				break;
			case "replaceOne": case "findOneAndReplace":
				if		(Array.isArray(request) && request.length === 2) result = await req.collection[method](request[0], request[1]);
				else if	(Array.isArray(request) && request.length	> 2) result = await req.collection[method](request[0], request[1], request[2]);
		}

		if(result !== undefined) {
			res.send(JSON.stringify(result));
			console.log(result);
			return;
		}else throw new Error("Bad Request");
	} catch (e) { console.error(e); }
	res.status(statusCodes.clientError.badRequest).end();
});

// updating/editing data by a patch request (update)
app.patch("/mongoDB/:mongoCollection/:mongoOperation/ajax", async function(req, res, next) {
	try{
		const method	= req.params.mongoOperation;
		let request		= isJSON(req.body.ajax)? JSON.parse(req.body.ajax): req.body.ajax;
		request			= typeof request === "object"? request: {_id: new ObjectID(request.toString())};
		let result;
		
		switch(method){
			case "bulkWrite":	result = await req.collection[method](request);
				break;
			case "updateOne": case "updateMany": case "findOneAndUpdate":
				if		(Array.isArray(request) && request.length === 2) result = await req.collection[method](request[0], request[1]);
				else if	(Array.isArray(request) && request.length	> 2) result = await req.collection[method](request[0], request[1], request[2]);
		}
		
		if(result !== undefined) {
			res.send(JSON.stringify(result));
			console.log(result);
			return;
		}else throw new Error("Bad Request");
	} catch (e) { console.error(e); }
	res.status(statusCodes.clientError.badRequest).end();
});






////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////// SERVER REQUESTS //////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////




// lessons page
app.get("/lessons", async function(request, response) {
	const products = db.collection("products");
	
	switch(request.query.ajax){
		case "list":	response.send(JSON.stringify(await products.find({}).toArray()));
			break;
		case "amount":	response.send(JSON.stringify(await products.countDocuments({})));
			break;
		default:		response.status(statusCodes.clientError.badRequest).end();
	}
});
    
// search API
app.get("/search"	 , async function(request, response) {
    // response.render
    if (request.query.ajax && !(/^\s*$/.test(request.query.ajax)))	response.send(await mongoSearch(request.query.ajax));
    else															response.status(statusCodes.clientError.badRequest).end();
});



// searching method
async function mongoSearch(string){
	const value		= string.toString().toLowerCase();
	const products	= db.collection("products");
	const search	= x => { return {$or: [ {title: {'$regex': `${x}`, '$options': 'i'}}, {location:{'$regex': `${x}`, '$options': 'i'}} ]}; };

	if (!(/^\s*$/.test(value))){
		if(value.length < 2)	return await products.find(search(".*("+value+").*")).project({ id: 1, _id: 0}).toArray();
		else					return await products.find(search("^("+value+").*" )).project({ id: 1, _id: 0}).toArray();
	}else return null;
}


// testing post requestes (x-www-form-urlencoded, multipart/form-data and GrapQL)
/* app.post("/test", formData.none(), function(request, response) {
	response.send(request.body);
	console.log(reqToObj(request));
});

// testing put requests
app.put("/test/ajax", function(request, response) {
	response.send(request.body);
	console.log(reqToObj(request));
});

// testing patch requests
app.patch("/test/ajax", function(request, response) {
	response.send(request.body);
	console.log(reqToObj(request));
});

// testing delete request
app.delete("/test/:ajax", function(request, response) {
	response.send(request.params.ajax);
	console.log(reqToObj(request));
}); */

// page 404
app.use(function(request, response) {
    response.status(statusCodes.clientError.notFound);
    response.sendFile(path.join(__dirname+'/../client/404.html'));
	console.log(reqToObj(request));
});


// Starts the app on port 3000 and display a message when it’s started
app.listen(port, console.log("App started on port 3000"));
