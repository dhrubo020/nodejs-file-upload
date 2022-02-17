const express = require("express")
const path = require("path")
const multer = require("multer")
const app = express() 

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";

MongoClient.connect(url, function(err, db) {
    if (err) throw err; 
    const dbo = db.db("mydb").collection("file_count");
    dbo.deleteOne({check:1})
    dbo.insertOne({check:0, count:0})

    app.post("/uploadProfilePicture",function (req, res, next) {
		
        // Error MiddleWare for multer file upload, so if any
        // error occurs, the image would not be uploaded!
        upload(req,res,function(err) {
    
            if(err) {
    
                // ERROR occured (here it can be occured due
                // to uploading image of size greater than
                // 1MB or uploading different file type)
                res.send(err)
            }
            else {
                // SUCCESS, image successfully uploaded
                dbo.find({check:0}).toArray((err, documents)=>{
                    if(documents[0].count >= 0 && documents[0].count < 4){
                        dbo.updateOne({check:0},{$set: {count:documents[0].count+1}})
                        res.send("Success, Image uploaded!")
                    }else{
                        res.send("Maximun reached!")
                    }
                })
            }
        })
    })

  });


// View Engine Setup
app.set("views",path.join(__dirname,"views"))
app.set("view engine","ejs")
	
// var upload = multer({ dest: "Upload_folder_name" })
// If you do not want to use diskStorage then uncomment it
	
var storage = multer.diskStorage({
	destination: function (req, file, cb) {

		// Uploads is the Upload_folder_name
		cb(null, "uploads")
	},
	filename: function (req, file, cb) {
	cb(null, file.fieldname + "-" + Date.now()+".jpg")
	}
})
	
// Define the maximum size for uploading
// picture i.e. 1 MB. it is optional
const maxSize = 1 * 1000 * 100;
	
var upload = multer({
	storage: storage,
	limits: { fileSize: maxSize },
	fileFilter: function (req, file, cb){
	
		// Set the filetypes, it is optional
		var filetypes = /jpeg|jpg|png/;
		var mimetype = filetypes.test(file.mimetype);

		var extname = filetypes.test(path.extname(
					file.originalname).toLowerCase());
		
		if (mimetype && extname) {
			return cb(null, true);
		}
	
		cb("Error: File upload only supports the "
				+ "following filetypes - " + filetypes);
	}

// mypic is the name of file attribute
}).single("mypic");	

app.get("/",function(req,res){
	res.render("signup");
})
	

	
// Take any port number of your choice which
// is not taken by any other process
app.listen(8080,function(error) {
	if(error) throw error
		console.log("Server created Successfully on PORT 8080")
})
