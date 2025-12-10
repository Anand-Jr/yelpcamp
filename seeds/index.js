const mongoose = require('mongoose');
const Campground = require("../models/campground");
const cities = require('./cities')
const {places, descriptors} = require('./seedHelpers'); 

mongoose.connect('mongodb://127.0.0.1:27017/yelpcamp').then(() =>{
    console.log("Connection successfull !!");
}).catch( err => {
    console.log("Connection failed !!");
});

const db = mongoose.connection;

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async() => {
    await Campground.deleteMany({});
    for (let i =0; i< 50 ;i++){
        const rand1000 = Math.floor(Math.random() * 1000);
        imageid= `https://picsum.photos/seed/${rand1000}/200/300`;
        const price = Math.floor(Math.random() * 20) +10;
        const camp =new Campground({
            author: "68d55353cf6f1907e49f80e8",
            location :`${cities[rand1000].city}, ${cities[rand1000].state}`,
            title:`${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                    url: `${imageid}`,
                    filename: `YelpCamp/${price}`,

                 }
            ],
            description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
            price: price
            });
             
            await camp.save();     
    }
    //const c = new Campground({title :'campekl gound'});
    
}
seedDB().then( () => {
    mongoose.connection.close();
});