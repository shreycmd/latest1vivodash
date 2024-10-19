const mongoose = require("mongoose");
const { string, boolean } = require("zod");

// Connect to MongoDB (handle errors as well)
mongoose.connect("mongodb+srv://shrey03505:6dSQwRMvAXw492ve@cluster0.2v0lmym.mongodb.net/dashboardvivo")

// Define Product schema
const schema_product = new mongoose.Schema({
  Name: { type: String, required: true,unique: true},
  Type: { type: String, required: true },
  U_id: { type: String, required: true },
  Addedon: { type: Date,default:Date.now ,required: false },
});
const schema_campaign = new mongoose.Schema({
  Name: { type: String, unique: true, required: true },
  Desc: { type: String, required: true },
  ScratchCard:{type:Boolean,required:false},
  FortuneWheel:{type:Boolean,required:true},
  Prize_type: { type: String, required: true },
  Start_date: { type: Date, required: true },
  End_date: { type: Date, required: true },
  Products: [{ type: String, required: true }],
  WheelPrizes: [{
     prize:{ type: String, required: false },
     quantity:{type:String,required:false}
  }
  ],
  Scratchprize:[{
    prize:{ type: String, required: false },
    quantity:{type:String,required:false}}
  ]

});
  


const schema_citems = new mongoose.Schema({
 Campaign_Name:{
  type:String,required:true
 },
  Selectedproduct: {
    type: String,  // Product name
    required: true
  },
  
  WinnerImei: { 
    type: String, 
    required: true,
    unique: true 
  },
  Wheelprize: { 
    type: String, 
    required: false 
  },
  Scratchprize:{
type:String,
required:false
  },
  Status: {
    type: Boolean,
    default: false,
    required: false
  },
  Claimedon: { 
    type: Date, 
    default: new Date().toLocaleDateString(),
  },
  
  WinnerName:{
  type:String,
  default:null,
  required:false
  },
  Addedon: { 
    type: Date, 
    default: Date.now, 
    required: false 
  }
}); 

const schema_users=new mongoose.Schema({
  Mail: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String,  enum:["user","admin"] }
})
// Export the model
const Admin=mongoose.model("admin",schema_users)
const Citem = mongoose.model('citem', schema_citems);
// Create the product model
const product = mongoose.model("product", schema_product);
const campaign =mongoose.model("campaign",schema_campaign)
module.exports = {
  product,campaign,Citem,Admin
};
