var fs = require("fs");
var handlebars = require("handlebars");
var showdown = require("showdown");
const converter = new showdown.Converter();
const matter = require('gray-matter');
//const sharp = require('sharp');
//const config = require('./config');


console.log("starting build...");

handlebars.registerHelper("ifEq", function(v1, v2, options) {
    if (v1 === v2) {
        return options.fn(this);
    }
    return options.inverse(this);
});

const data = {};
data.entries = [];

//data.entries = dir.readFiles("./src/posts/", {sync:true});
var folder = "./src/posts/";
var files = fs.readdirSync(folder);
var i = 0;
files.forEach(function(file){
    let contents = fs.readFileSync(folder + file, 'utf8');
    data.entries[i] = matter(contents);
    i++;
});

console.log(data.entries);

// preprocess markdown
var i2 = 0;
data.entries.forEach(function(item) {
    data.entries[i2].body = converter.makeHtml(item.content);
    i2++;
});

let mydata = {};

// blog
mydata.entries = data.entries.filter((x) => x.data.category == "blog");
mydata.page = "Blog";
compile(mydata, "blog.html", "index.html");

// copy style
var style = fs.readFileSync("./src/assets/docs.css", "utf8");
fs.writeFileSync("./public/assets/docs.css", style, "utf8");

// copy js
var js = fs.readFileSync("./src/assets/app.js", "utf8");
fs.writeFileSync("./public/assets/app.js", js, "utf8");

function compile(mydata, src, dest) {
    var template = fs.readFileSync("./src/" + src, "utf8");
    var pageBuilder = handlebars.compile(template);
    var pageText = pageBuilder(mydata);
    fs.writeFileSync("./public/" + dest, pageText, "utf8");
}

/*
// resize images
var imageFolder = "./src/uploads/";
var imgs = fs.readdirSync(imageFolder);
var i = 0;
imgs.forEach(function(img){
   let buffer = fs.readFileSync(imageFolder + img);
   sharp(buffer)
      .resize(config.img_width)
      .toFile('public/uploads/'+img, (err, info) => {});
});
*/
  
console.log("build finished.");
