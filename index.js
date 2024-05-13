const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;
const corss = {
    origin: [
        "http://localhost:5173",
        "https://assignment-11-80fe3.web.app",
        "https://assignment-11-80fe3.firebaseapp.com",
    ],
    credentials: true,
    optionsSuccessStatus: 200
}
app.use(express.json());
app.use(cors(corss));

// const uri = "mongodb+srv://assignment_project:VprSRD9ta0EX0bZU@cluster0.iagloem.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const uri = "mongodb+srv://assignment_project:VprSRD9ta0EX0bZU@cluster0.iagloem.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function run() {
    const client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    });

    try {
        console.log("Connected to MongoDB");

        const alltaskCollection = client.db("assignmentproject").collection("projects");
        const bidCollection = client.db("assignmentproject").collection("bidassignment");

        app.get("/allproject", async (req, res) => {
            const result = await alltaskCollection.find().toArray()
            res.send(result)
        });
        app.delete("/allproject/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await alltaskCollection.deleteOne(query);
            res.send(result)
        });

        app.get("/updatepage/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await alltaskCollection.findOne(query);
            res.send(result)
        });

        app.get("/assignmentdetails/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await alltaskCollection.findOne(query);
            res.send(result)
        });


        app.put("/updatepage/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedatainfo = req.body;
            console.log(updatedatainfo)
            const options = { upsert: true };
            // Specify the update to set a value for the plot field
            const updateDoc = {
                $set: {
                    ...updatedatainfo
                },
            };
            // Update the first document that matches the filter
            const result = await alltaskCollection.updateOne(filter, updateDoc, options);
            res.send(result)
        });

        // my added post show 
        app.get("/mysubmitted/:email", async (req, res) => {
            const email = req.params?.email
            const query = { email }
            const result = await bidCollection.find(query).toArray()
            res.send(result)
        })
        // pendingadded post show 
        app.get("/pendingsubmitted/:email", async (req, res) => {
            const email = req.params?.email
            const query = { "bayer.bayerEmail": email }
            const result = await bidCollection.find(query).toArray()
            res.send(result)
        })

        // markassignment
        app.get("/markassignment/:id", async (req, res) => {
            const id = req.params?.id
            const query = { _id: new ObjectId(id) }
            const result = await bidCollection.findOne(query);
            res.send(result)
        })

        // markassignment
        app.patch("/assignmentresult/:id", async (req, res) => {
            const id = req.params?.id
            const body = req.body;
            const filter = { _id: new ObjectId(id) }
            const updateDoc = {
                $set: {
                    status: body.status,
                    obtainedmarks: body.obtainedmarks,
                    textarea : body.textarea
                },
            };
            const result = await bidCollection.updateOne(filter, updateDoc);
            res.send(result)
        })

        // post 
        app.post("/bidassignment", async (req, res) => {
            const info = req.body;
            const result = await bidCollection.insertOne(info)
            res.send(result)
        })
        app.post("/allproject", async (req, res) => {
            const info = req.body;
            const result = await alltaskCollection.insertOne(info)
            res.send(result)
        })

    } finally {
        // Close MongoDB client when done
        // await client.close();
    }
}

run().catch(console.error);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
