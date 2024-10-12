const express = require("express");
const app = express();
const mongoose = require("mongoose");
const multer = require('multer');
const csv = require('csv-parser')
const fs = require('fs');
const path = require("path")
const fastCsv = require('fast-csv');

const upload = multer({ dest: 'uploads/' });
const cors = require('cors');
const { p_object } = require("./types");
const { product, campaign, Citem, Admin } = require("./db");

app.use(express.json())
app.use(cors({
  origin: ["https://88.222.214.8", "https://admin.jkvivo.in/"], // List all allowed origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Allow credentials to be sent
}));

//middleware for converting

  function validateCitemData(row) {
    const {WinnerImei,Selectedproduct}=row;
    if(!WinnerImei||!Selectedproduct){
      return false;
    }
    return true;
  }

  function validateProductData(row) {
    const { Name, Type ,U_id} = row;
    if (!Name || !Type ||!U_id) {
      return false;
    }
    
    return true;
  }
  const convertProductIdsToNames = async (req, res, next) => {
    const { Products } = req.body;
    
    try {
      // Fetch product names based on the ObjectIds in Products array
      const productsData = await Promise.all(Products.map(id => product.findById(id, 'Name')));
      
      if (productsData.includes(null)) {
        return res.status(400).json({ 
          message: 'One or more products do not exist.' 
        });
      }
  
      // Extract product names and replace Products in req.body
      req.body.Products = productsData.map(prod => prod.Name);
  
      // Proceed to the next middleware/route handler
      next();
    } catch (error) {
      return res.status(500).json({
        message: 'Error fetching product names',
        error: error.message
      });
    }
  };
  const checkRole = async (req, res, next) => {
    const { Mail, password } = req.body;
    try {
      const user = await Admin.findOne({ Mail, password });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (user.role === "main") {
        next(); // Proceed if the user is an admin
      } else {
        return res.status(403).json({ message: "Access denied. Admins only." });
      }
    } catch (error) {
      return res.status(500).json({
        message: "Server error",
        error: error.message
      });
    }
  };
  app.get("/admins",checkRole,async(req,res)=>{
    try {
      const result = await Admin.find({});
      res.status(200).json({
          message: "All records fetched",
          data: result
      });
  } catch (error) {
      return res.status(500).json({
          message: "Not fetched",
          error: error.message
      });
  }
});

app.get("/",(req,res)=>{
  res.send("server up");
});

  app.get("/Admin", async (req, res) => {
    try {
        const result = await Admin.find({});
        res.status(200).json({
            message: "All records fetched",
            data: result
        });
    } catch (error) {
        return res.status(500).json({
            message: "Not fetched",
            error: error.message
        });
    }
});

app.post("/Admin",async (req, res) => {
    try {
        const { Mail, password, role } = req.body;

        const newUser = new Admin({
            Mail,
            password,
            role,
        });

        const savedUser = await newUser.save();
        res.status(201).json({
            message: "User created successfully",
            data: savedUser,
        });
    } catch (error) {
        return res.status(500).json({
            message: "User not created",
            error: error.message,
        });
    }
});

app.put("/Admin/:Mail", async (req, res) => {
  try {
      const { Mail } = req.params;
      const { Mail: newMail, role, password } = req.body; // Destructure all required fields from req.body

      // Find the user and update their information
      const updatedUser = await Admin.findOneAndUpdate(
          { Mail }, // Find user by old email
          { Mail: newMail, role, password }, // Update mail, role, and password
          { new: true } // Return the updated user
      );

      if (!updatedUser) {
          return res.status(404).json({
              message: "User not found",
          });
      }

      res.status(200).json({
          message: "User updated successfully",
          data: updatedUser,
      });
  } catch (error) {
      return res.status(500).json({
          message: "User not updated",
          error: error.message,
      });
  }
});


app.delete("/Admin/:Mail",async (req, res) => {
    try {
        const { Mail } = req.params;

        const deletedUser = await Admin.findOneAndDelete({ Mail });

        if (!deletedUser) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        res.status(200).json({
            message: "User deleted successfully",
            data: deletedUser,
        });
    } catch (error) {
        return res.status(500).json({
            message: "User not deleted",
            error: error.message,
        });
    }
});
 

app.put("/citems/:Imei", upload.single('image'), async (req, res) => {
  const pimei = req.params.Imei;

  try {
    const { WinnerImei, Wheelprize, WinnerName, Scratchprize, Status, Claimedon } = req.body;  
    
    console.log(req.body); // Logging the request body for debugging

    // Check if neither Status nor Claimedon are provided
    if (!Status && !Claimedon) {
      const f = await Citem.findOneAndUpdate({ WinnerImei: pimei }, {
        WinnerImei,
        Wheelprize,
        WinnerName,
        Scratchprize,
        // Check if an image was uploaded
        ...(req.file && {
          Image: {
            data: req.file.buffer, // Store the binary data
            contentType: req.file.mimetype // Store the MIME type
          }
        })
      });

      if (!f) {
        return res.status(400).json({
          message: "Not found"
        });
      }
    } else {
      const f = await Citem.findOneAndUpdate({ WinnerImei: pimei }, {
        Status,
        Claimedon,
        WinnerName,
        // Check if an image was uploaded
        ...(req.file && {
          Image: {
            data: req.file.buffer, // Store the binary data
            contentType: req.file.mimetype // Store the MIME type
          }
        })
      });

      if (!f) {
        return res.status(400).json({
          message: "Not found"
        });
      }
    }
    
    return res.status(200).json({
      message: "Product updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating product",
      error: error.message,
    });
  }
});

const WinSchema = new mongoose.Schema({
  
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
  Claimedon: { 
    type: Date, 
    default: null,
    required: false 
  },
  
  WinnerName:{
  type:String,
  default:null,
  required:false
  }
});

app.put("/ncitems/:cname/:Imei", upload.single('image'), async (req, res) => {
  const {cname,Imei} = req.params;

  try {
    const cmodel=getCampaignModel(cname)
   
    const { WinnerImei, Wheelprize, WinnerName, Scratchprize, Status, location,Claimedon } = req.body;  
    
   // Logging the request body for debugging

    // Check if neither Status nor Claimedon are provided
    if (!Status && !Claimedon) {
      const f = await cmodel.findOneAndUpdate({ WinnerImei: Imei }, {
        WinnerImei,
        Wheelprize,
        WinnerName,
        Scratchprize,
        // Check if an image was uploaded
        ...(req.file && {
          Image: {
            data: req.file.buffer, // Store the binary data
            contentType: req.file.mimetype // Store the MIME type
          }
        })
      });

      if (!f) {
        return res.status(400).json({
          message: "Not found"
        });
      }
    } else {
      const f = await cmodel.findOneAndUpdate({ WinnerImei: Imei }, {
        Status,
        Claimedon,
        WinnerName,
        
      });
      
      if (!f) {
        return res.status(400).json({
          message: "Not found"
        });
      }
    }
    
    return res.status(200).json({
      message: "Product updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating product",
      error: error.message,
    });
  }
});
// Delete Campaign Item
app.delete("/citems/:Imei", async (req, res) => {
  const pimei = req.params.Imei;
  try {
    const del = await Citem.findOneAndDelete({ WinnerImei: pimei });
    if (!del) {
      return res.status(400).json({
        message: "no records found"
      });
    }
    return res.status(200).json({
      message: "deleted"
    });
  } catch (error) {
    return res.status(500).json({
      message: "not deleted",
      error: error.message
    });
  }
});
app.delete("/ncitems/:Cname/:Imei", async (req, res) => {
  const { Imei, Cname } = req.params;  // Correctly destructuring Imei and Cname
  const cmodel = getCampaignModel(Cname);
  
  try {
    const del = await cmodel.findOneAndDelete({ WinnerImei: Imei }); // Using Imei here
    if (!del) {
      return res.status(400).json({
        message: "No records found"
      });
    }
    return res.status(200).json({
      message: "Deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error while deleting",
      error: error.message
    });
  }
});
app.get("/citems",async (req,res)=>{
    try {
        const show =await Citem.find({
         
        })
        
        return res.status(200).json({
            message:"fetched successfully",
            data:show
        })
    } catch (error) {
        return res.status(500).json({
            message:"not fetched",
            error:error.message
        })
    }
})
const campaignSchema = new mongoose.Schema({
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
    default: null,
    required: false 
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
const getCampaignModel = (collectionName) => {
  return mongoose.model('Campaign', campaignSchema, collectionName);
};
app.post('/citems',async (req, res) => {
    const {Campaign_Name, Selectedproduct, WinnerImei, Wheelprize,Scratchprize } = req.body; 
  
try{
      // Create the citem with the Campaign reference
      const collectionName = `${Campaign_Name}`;
      const CampaignModel = getCampaignModel(collectionName);
      const newCampaign = await CampaignModel.create({
        Campaign_Name,
        Selectedproduct,
        WinnerImei,
        Wheelprize,
        Scratchprize,
      
      });
  
      
      
  return res.status(200).json({
    message:"added on both"
  })
  
    } catch (error) {
      return res.status(500).json({
        message: 'Failed to add item',
        error: error.message
      });
    }
  });
  app.get('/citem/:pid',async (req,res)=>{
    const pid=req.params.pid;
    try {
      const items=await Citem.find({WinnerImei:pid});
      if(items.length>0){
        res.json({ data: items });
      }else{
        res.status(404).json({ message: 'No items found for this pid' });
      }
    } catch (error) {
      console.error('Error fetching citems:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }) 
  app.get('/ncitem/:cname/:pid',async (req,res)=>{
    const {cname,pid}=req.params;
    const cmodel=getCampaignModel(cname)
    try {
      const items=await cmodel.find({WinnerImei:pid});
      if(items.length>0){
        res.json({ data: items });
      }else{
        res.status(404).json({ message: 'No items found for this pid' });
      }
    } catch (error) {
      console.error('Error fetching citems:', error);
      res.status(500).json({ message: 'Server error' });
    }
  })
  app.get('/citems/:Campaign_Name', async (req, res) => {
    const campaignName = req.params.Campaign_Name;
  
    try {
      // Find citems where Campaign_Name matches the provided campaignName
      const items = await Citem.find({ Campaign_Name: campaignName });
  
      if (items.length > 0) {
        // Send the found items as a response
        res.json({ data: items });
      } else {
        // No items found for the provided campaign name
        res.status(404).json({ message: 'No items found for this campaign' });
      }
    } catch (error) {
      console.error('Error fetching citems:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  app.get("/citemnew/:Campaign_Name", async (req, res) => {
    const campaignName = req.params.Campaign_Name;
    const lastId = req.query.lastId || null; // null means it's the first page
    const direction = req.query.direction || "next";
    const limit = 10; // Items per page

    try {
        const CampaignModel = getCampaignModel(campaignName);
        let query = {};

        if (lastId) {
            if (direction === "next") {
                query = { _id: { $gt: lastId } };
            } else if (direction === "previous") {
                query = { _id: { $lt: lastId } };
            }
        }

        const items = await CampaignModel.find(query)
            .sort({ _id: direction === "next" ? 1 : -1 })
            .limit(limit);

        res.json({ data: items });
    } catch (error) {
        console.error("Error fetching items:", error);
        res.status(500).json({ message: "Server error" });
    }
});


  
//campaign creation part

app.post('/campaign', convertProductIdsToNames, async (req, res) => {
  const {
    Name,
    Desc,
    FortuneWheel,
    ScratchCard,
    Prize_type,
    Start_date,
    End_date,
    Products,
    WheelPrizes, // Add this line
    Scratchprize // Add this line
  } = req.body;

  try {
    // Create the campaign with the product names and prizes
    await campaign.create({
      Name,
      Desc,
      ScratchCard,
      FortuneWheel,
      Prize_type,
      Start_date,
      End_date,
      Products,
      WheelPrizes: WheelPrizes || [], // Include WheelPrizes, default to empty array if not provided
      Scratchprize: Scratchprize || [] // Include Scratchprize, default to empty array if not provided
    });

    return res.status(200).json({
      message: 'Campaign created successfully'
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error while creating campaign',
      error: error.message
    });
  }
});

app.get('/campaign', async (req, res) => {
    try {
      const allCampaigns = await campaign.find({}).populate('Products', 'Name'); // Populating product names
      return res.status(200).json({
        message: 'done',
        data: allCampaigns
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Unable to show all campaigns',
        error: error.message
      });
    }
  });

app.put("/campaign/:Name",async (req,res)=>{
    const search_param=req.params.Name;
    const {Name,Desc,FortuneWheel,ScratchCard,Start_date,End_date,Products}=req.body;
    try {
       const f= await campaign.findOneAndUpdate({Name:search_param},{
         Name,Desc,FortuneWheel,ScratchCard,Start_date,End_date,Products
        })
        if(!f){
            return res.status(400).json({
                messsage:"not found"
            })
        }
        return res.status(200).json({
            message:"done updating"
        })
    } catch (error) {
        return res.status(500).json({message:'update error',
            error:error.message
        })
    }

})
app.delete("/campaign/:Name", async (req, res) => {
  const search_query = req.params.Name;
  const cmodel = getCampaignModel(search_query); // dynamically created model for the campaign
 const wmodel=getWinModel(`win_${search_query}`)
  try {
      // Attempt to delete the document from the 'campaign' collection first
      const f = await campaign.deleteOne({ Name: search_query }) 
      
      if (f.deletedCount === 0) {
          return res.status(404).json({
              message: "Campaign not found",
          });
      }

      // Attempt to drop the collection associated with this campaign model
      await cmodel.collection.drop();
      await  wmodel.collection.drop();
      return res.status(200).json({
          message: "Campaign and associated collection deleted successfully",
      });
  } catch (error) {
      // If the collection does not exist, handle the error gracefully
      if (error.codeName === 'NamespaceNotFound') {
          return res.status(404).json({
              message: "Associated collection not found",
          });
      }
      return res.status(500).json({
          message: 'Unable to delete campaign and associated collection',
          error: error.message,
      });
  }
});

//product all get,post,del,write

app.get('/product',async (req,res)=>{
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit)||150 ;
  const skip = (page - 1) * limit;

  try {
      const products = await product.find().skip(skip).limit(limit);
      const totalProducts = await product.countDocuments();

      res.json({
          data: products,
          currentPage: page,
          totalPages: Math.ceil(totalProducts / limit),
          totalRecords: totalProducts
      });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
})
app.post("/product", async (req, res) => {
  const req_body = req.body;

  // Validate request body using Zod
  const safeParse = p_object.safeParse(req_body);

  if (!safeParse.success) {
    // Extract the error details from Zod
    const zodError = safeParse.error;

    // Customize the error message
    const customErrorMessage = zodError.errors
      .map((err) => `${err.path.join(".")} - ${err.message}`)
      .join(", ");

    // Send the custom error message
    return res.status(400).send(`Invalid input: ${customErrorMessage}`);
  }

  try {
    // If validation is successful, proceed with inserting into the database
    await product.create({
       
      Name: safeParse.data.Name,
      Type: safeParse.data.Type,
      U_id: safeParse.data.U_id,
      // Ensure 'purchased' is a valid Date object
    });

    // Respond with success message
    return res.status(201).json({
      message: "Product added successfully",
    });

  } catch (error) {
    // Handle any errors during database operation
    return res.status(500).json({
      message: "Error saving product",
      error: error.message,
    });
  }
});
app.put("/product/:Name",async (req,res)=>{
    const req_body=req.body;
    const Name=req.params.Name;
    const safeParse=p_object.safeParse(req_body);
    if (!safeParse.success) {
        // Extract the error details from Zod
        const zodError = safeParse.error;
    
        // Customize the error message
        const customErrorMessage = zodError.errors
          .map((err) => `${err.path.join(".")} - ${err.message}`)
          .join(", ");
    
        // Send the custom error message
        return res.status(400).send(`Invalid input: ${customErrorMessage}`);
      }
      try {
       const f= await product.findOneAndUpdate({Name:Name},{
            Name: safeParse.data.Name,
            Type: safeParse.data.Type,
            U_id: safeParse.data.U_id,
            purchased: new Date(safeParse.data.purchased)

        })
    if(!f){
        return res.status(400).json({
            message:"Not found"
        })
    }
      return res.status(200).json({
        message: "Product updated successfully",
        
      });
      } catch (error) {
        return res.status(500).json({
            message: "Error updating product",
            error: error.message,
          });
      }

})
app.delete("/product/:Name",async(req,res)=>{
    const {Name}=req.params;
    try {
       const f= await product.deleteOne({Name:Name})
    if(f.deletedCount===0){
        return res.status(400).json({
            message:"not found"
        })
    }
       return res.status(200).json({
            message:"deleted successfully"
        })
    } catch (error) {
        return res.status(500).json({
            message:"unable to delete",
            error:error.message
    })
    }
})
app.post('/upload-citem', upload.single('file'), async (req, res, next) => {
  try {
    const cname = JSON.parse(req.body.Campaign_Name);
    const { wheel = [], scratch = [] } = JSON.parse(req.body.prizes || '{}');
    const results = [];
    const errors = [];
    let imeis = [];
    const cmodel = getCampaignModel(cname);

    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const stream = fs.createReadStream(req.file.path).pipe(csv());

    const allRecords = []; // Store all records here
    const prizeCounts = { wheel: {}, scratch: {} };

    // Initialize prizeCounts with available quantities
    wheel.forEach(prize => {
      prizeCounts.wheel[prize.name] = prize.quantity;
    });
    scratch.forEach(prize => {
      prizeCounts.scratch[prize.name] = prize.quantity;
    });

    // Set to track unique IMEIs in the CSV to prevent duplicate entries within the CSV
    let csvIMEIs = new Set();

    // Process each CSV row
    stream.on('data', (data) => {
      if (validateCitemData(data)) {
        const imei = data.WinnerImei;

        // Check if the IMEI is already in the set (i.e., a duplicate within the CSV)
        if (!csvIMEIs.has(imei)) {
          csvIMEIs.add(imei);
          allRecords.push(data); // Store the valid record
          imeis.push(imei);
        } else {
          errors.push({ message: `Duplicate IMEI in CSV: ${imei}`, data });
        }
      } else {
        errors.push({ message: 'Invalid data format', data });
      }
    });

    stream.on('end', async () => {
      // Shuffle all records before processing
      const shuffledRecords = shuffleArray(allRecords);

      // Counters for total successful and failed insertions
      let totalInserted = 0;
      let totalSkipped = 0;

      for (let i = 0; i < shuffledRecords.length; i += 1000) {
        const batch = shuffledRecords.slice(i, i + 1000);
        const { insertedCount, skippedCount } = await processBatch(cmodel, batch, cname, prizeCounts);
        totalInserted += insertedCount;
        totalSkipped += skippedCount;
      }

      res.status(200).json({
        message: 'Citems uploaded successfully',
        invalidRows: errors.length,
        totalRecordsProcessed: totalInserted,
        totalSkipped: totalSkipped + errors.length // Including rows skipped due to CSV duplicates or invalid data
      });

      unlinkFile(req.file.path); // Clean up uploaded file
    });

  } catch (error) {
    next(error);
  }
});
// Utility function to shuffle an array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
}
async function processBatch(cmodel, batch, cname, prizeCounts) {
  // Fetch existing records from DB based on batch IMEIs
  const existingRecords = await cmodel.find({ WinnerImei: { $in: batch.map(b => b.WinnerImei) } }, 'WinnerImei');
  const existingIMEIs = new Set(existingRecords.map(record => record.WinnerImei));

  let uniqueResults = [];
  let skippedCount = 0;

  for (const record of batch) {
    const imei = record.WinnerImei;

    if (!existingIMEIs.has(imei)) {
      record.Campaign_Name = cname;

      for (const prizeName in prizeCounts.wheel) {
        if (prizeCounts.wheel[prizeName] > 0) {
          record.Wheelprize = prizeName;
          prizeCounts.wheel[prizeName]--;
          break;
        } else {
          record.Wheelprize = "BadLuck";
        }
      }

      for (const prizeName in prizeCounts.scratch) {
        if (prizeCounts.scratch[prizeName] > 0) {
          record.Scratchprize = prizeName;
          prizeCounts.scratch[prizeName]--;
          break;
        } else {
          record.Scratchprize = "BadLuck";
        }
      }

      uniqueResults.push(record);
    } else {
      skippedCount++; // Count skipped records due to duplicate IMEIs in DB
    }
  }

  if (uniqueResults.length > 0) {
    await cmodel.insertMany(uniqueResults);
  }

  return { insertedCount: uniqueResults.length, skippedCount };
}

const unlinkFile = async (filePath) => {
  try {
    await fs.promises.unlink(filePath);
 
  } catch (err) {
    console.error(`Error deleting ${filePath}:`, err);
  }
};

app.get('/export-citems', async (req, res) => {
  console.log(req.query);
  try {
      // Get the condition from query parameters
      const condition = req.query.condition || ''; // Use query params to pass the condition
      const col = getCampaignModel(condition);
      
      // Create a cursor to find documents in batches
      const cursor = col.find({}).cursor(); // Use cursor to stream documents

      // Set the response headers for CSV
      res.setHeader('Content-disposition', 'attachment; filename=citems.csv');
      res.setHeader('Content-Type', 'text/csv');

      // Create a CSV stream
      const csvStream = fastCsv.format({ headers: true });

      // Pipe the CSV stream to the response
      csvStream.pipe(res);

      // Process each item in the cursor
      cursor.on('data', (item) => {
          csvStream.write({
              Campaign_Name: item.Campaign_Name,
              Selectedproduct: item.Selectedproduct,
              WinnerImei: item.WinnerImei,
              Wheelprize: item.Wheelprize,
              Scratchprize: item.Scratchprize,
              Claimedon: item.Claimedon ? new Date(item.Claimedon).toLocaleDateString() : '',
              Addedon: item.Addedon ? new Date(item.Addedon).toLocaleDateString() : '',
          });
      });

      // Handle the end of the cursor
      cursor.on('end', () => {
          csvStream.end(); // End the CSV stream
      });

      // Handle any errors in the cursor
      cursor.on('error', (error) => {
          console.error('Cursor error:', error);
          res.status(500).json({ message: 'Internal Server Error' });
      });

  } catch (error) {
      console.error('Error exporting data:', error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});
app.get('/api/data', async (req, res) => {
  try {
    const products = await Product.find(); // Adjust as necessary
    const campaigns = await Campaign.find(); // Adjust as necessary

    res.json({ products, campaigns });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching data' });
  }
});
app.post('/upload-products', upload.single('file'), (req, res) => {
  const results = [];
  const errors = [];
  
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }

  const uid = req.body.uniqueIdentifier;

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => {
      // Add u_id to each record
      data.U_id = uid;
      
      // Validate data and push to results or errors
      if (validateProductData(data)) {
        results.push(data);
      } else {
        errors.push(data); 
      }
    })
    .on('end', () => {
      if (results.length === 0) {
        return res.status(400).send('No valid product data found');
      }

      product.insertMany(results)
        .then(() => {
          const responseMessage = {
            message: 'Products uploaded successfully',
            invalidRows: errors.length,
            validRows: results.length
          };
          res.status(200).json(responseMessage);
        })
        .catch((error) => {
          res.status(500).send('Error uploading products: ' + error.message);
        })
        .finally(() => {
          fs.unlinkSync(req.file.path);
        });
    });
});


app.get("/dashboard", async (req, res) => {
  try {
    // Count all records in the campaign collection
    const totalCampaigns = await campaign.countDocuments(); // Count total campaigns

    // Fetch names of all campaigns
    const allCampaigns = await campaign.find({}, "Name"); // Fetch all names
    const campaignNames = allCampaigns.map(campaign => campaign.Name); // Extract campaign names

    // Prepare to hold product counts for each campaign
    const productCounts = {};
    const unclaimedCounts = {}; // To store counts of unclaimed records for each campaign

    // Loop through each campaign name to count products and unclaimed records
    for (const cname of campaignNames) {
      const cmodel = getCampaignModel(cname); // Get the dynamic model for each campaign collection

      // Count products in the collection
      const count = await cmodel.countDocuments();
      productCounts[cname] = count; // Store the count with the campaign name as the key

      // Count unclaimed records (where status is false)
      const unclaimedCount = await cmodel.countDocuments({ Status: false }); // Count unclaimed records
      unclaimedCounts[cname] = unclaimedCount; // Store unclaimed count
    }

    // Construct the response object
    const responseObject = {
      dashboard: {
        totalCampaigns,        // Total count of campaigns
        campaignDetails: campaignNames.map(cname => ({
          name: cname,
          productCount: productCounts[cname],
          unclaimedCount: unclaimedCounts[cname],
        })),
      },
    };

    return res.status(200).json(responseObject); // Send response object
  } catch (error) {
    console.error('Error retrieving dashboard data:', error); // Log the error for debugging
    return res.status(500).json({
      message: "Error retrieving dashboard data",
      error: error.message,
    });
  }
});
app.get('/export-wcitems', async (req, res) => {
  console.log(req.query);
  try {
      // Get the condition from query parameters
      const condition = req.query.condition || ''; // Use query params to pass the condition
      const col = getCampaignModel(condition);
      
      // Create a cursor to find documents in batches
      const cursor = col.find({}).cursor(); // Use cursor to stream documents

      // Set the response headers for CSV
      res.setHeader('Content-disposition', 'attachment; filename=citems.csv');
      res.setHeader('Content-Type', 'text/csv');

      // Create a CSV stream
      const csvStream = fastCsv.format({ headers: true });

      // Pipe the CSV stream to the response
      csvStream.pipe(res);

      // Process each item in the cursor
      cursor.on('data', (item) => {
          csvStream.write({
             WinnerName:item.WinnerName,
              WinnerImei: item.WinnerImei,
              location:item.location,
              Claimedon: item.Claimedon ? new Date(item.Claimedon).toLocaleDateString() : '',
              
          });
      });

      // Handle the end of the cursor
      cursor.on('end', () => {
          csvStream.end(); // End the CSV stream
      });

      // Handle any errors in the cursor
      cursor.on('error', (error) => {
          console.error('Cursor error:', error);
          res.status(500).json({ message: 'Internal Server Error' });
      });

  } catch (error) {
      console.error('Error exporting data:', error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/search-imei/:cname/:imei', async (req, res) => {
  const { imei ,cname} = req.params;
  const name=getCampaignModel(cname)

  try {
    const results = await name.find({
      // Modify this to match the fields you want to search
      WinnerImei: { $regex: imei, $options: 'i' }
    });

    res.json({ data: results });
  } catch (error) {
    console.error('Error fetching search results:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
app.get('/search-wimei/:cname/:imei', async (req, res) => {
  const { imei ,cname} = req.params;
  const name=getWinModel(`win_${cname}`)
  
  try {
    const results = await name.find({
      // Modify this to match the fields you want to search
      WinnerImei: { $regex: imei, $options: 'i' }
    });

    res.json({ data: results });
  } catch (error) {
    console.error('Error fetching search results:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
app.get("/uniqueProducts/:cname", async (req, res) => {
  const { cname } = req.params;
  const model = getCampaignModel(cname);

  try {
    // Use the distinct method to get unique selected products
    const uniqueProducts = await model.distinct("Selectedproduct");

    res.status(200).json({
      message: "Unique products fetched successfully",
      uniqueProducts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching unique products", error });
  }
});
const WinModelSchema = new mongoose.Schema({
  WinnerImei: { 
    type: String, 
    required: true,
    unique: true 
  },
  Claimedon: { 
    type: Date, 
    default: null,
    required: false 
  },
  WinnerName: {
    type: String,
    default: null,
    required: false
  },
  location: { 
    type: String, 
     
    required: false 
  },
  Prize:{
type:String,
required:false
  },
  invoice: { // New field for storing the image path
    type: String,
    required: false // This can be optional, depending on your requirements
  }
});

const getWinModel = (collectionName) => {
  return mongoose.model(`${collectionName}`, WinModelSchema, collectionName);
};

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory where files will be saved
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // File naming convention
  }
});

const uploading = multer({ storage });
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// POST route to handle the winner record creation with image upload
app.post("/nc/:cname", uploading.single('invoice'), async (req, res) => {
  const { cname } = req.params;
  const collectionName = `win_${cname}`;
  const WinModel = getWinModel(collectionName);
  
  const { WinnerImei, Claimedon, WinnerName, Prize,location } = req.body;

  // Get the path of the uploaded file
  const invoicePath = req.file ? req.file.path : null;



  try {
    const createdRecord = await WinModel.create({
      WinnerImei,
      Claimedon,
      WinnerName,
      location,
      Prize,
      invoice: invoicePath // Store the image path in the database
    });

    return res.status(201).json({
      message: "Winner record created successfully",
      data: createdRecord
    });
  } catch (error) {
    console.error("Error creating record:", error);
    return res.status(500).json({
      message: "Error creating winner record",
      error: error.message
    });
  }
});
app.get("/campaigndetails/:cname", async (req, res) => {
  const cname = req.params.cname;
  const wname = `win_${cname}`;
  const collect = getWinModel(wname);
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 30;
  
  try {
    const skip = (page - 1) * limit;
    const totalItems = await collect.countDocuments();
    const data = await collect.find({}).skip(skip).limit(limit);

    if (!data || data.length === 0) {
      return res.status(404).json({ message: 'No campaign details found' });
    }

    res.status(200).json({
      data,
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
    });
  } catch (error) {
    console.error('Error fetching campaign details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Start the server
app.listen(3000,'0.0.0.0', () => {
  console.log("Server is running on port 3000");
});