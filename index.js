const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cookieParser = require('cookie-parser');
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

// middleware 
app.use(express.json());
app.use(cors(corss));
app.use(cookieParser())

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
};
// const uri = "mongodb+srv://assignment_project:VprSRD9ta0EX0bZU@cluster0.iagloem.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const uri = `mongodb+srv://${process.env.MD_NAME}:${process.env.MD_PASSWORD}@cluster0.iagloem.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        const fetures = client.db("assignmentproject").collection("fetures");



        const verifyToken = (req, res, next) => {
            const token = req?.cookies?.token
            // console.log(cookie)
            if (!token) return res.status(401).send({ message: "Unauthorized access" })
            if (token) {
                jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
                    if (err) {
                        console.log(err)
                        return res.status(401).send({ message: "Unauthorized access" })
                    }
                    console.log(decoded)
                    req.user = decoded;
                    next()
                })
            }
        }

        // jwttoken 
        app.post("/jwt", async (req, res) => {
            const user = req.body;
            // console.log("token user", user)
            var token = jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn: "7d" });
            // console.log(token)
            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            }).send({ success: true })
        })

        // logout loken 
        app.get("/logout", async (req, res) => {
            res.clearCookie("token", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
                maxAge: 0,
            }).send({ success: true })
        })


        // getdata 
        app.get("/allproject", async (req, res) => {
            // console.log("pagination query", req?.query)
            const page = parseInt(req.query.page)
            const size = parseInt(req.query.size)
            const filter = req.query.filter;
            const sort = req.query.sort;
            const search = req.query.search;
            // console.log(sort)
            let querysObj = {
                title: { $regex: search, $options: 'i' },
            };
            let option = {

            }
            // let marks = parseInt(marks);
            if (filter) querysObj.level = filter
            if (sort) option = { sort: { marks: sort === "asc" ? 1 : -1 } }
            const result = await alltaskCollection.find(querysObj, option).skip(size * page).limit(size).toArray()
            res.send(result)
        });

        app.get("/fetures", async (req, res) => {
            const result = await fetures.find().toArray()
            res.send(result)
        })
        // allassignemt count
        app.get("/allassignmentCount", async (req, res) => {
            const count = await alltaskCollection.estimatedDocumentCount()
            res.send({ count })
        })


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
        app.get("/mysubmitted/:email", verifyToken, async (req, res) => {
            const tokenData = req.user.email;
            const userEmai = req.params.email;
            if (tokenData !== userEmai) return res.status(403).send({ message: "Forbidden access" })
            console.log(tokenData, "form user")
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
                    textarea: body.textarea
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
