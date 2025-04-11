const express = require("express");
const app = express();
const fs = require('fs');
const path = require('path');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const { MongoDBUri } = require('./secrets');
app.use(cors());


const MongoDBConfig = {
    uri: MongoDBUri.uri,
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
    dbName: 'TaxiData',
}


const ClientOptions = {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
}




app.listen("3000", () => {
    console.log("=========server on=========");
});



app.get("/upload_all_local_geojson", async (req, res) => {
    const geojsonFolder = path.join(__dirname, 'data');  // Path to the folder with GeoJSON files

    try {
        const client = new MongoClient(MongoDBConfig.uri, ClientOptions);
        await client.connect();
        const db = client.db(MongoDBConfig.dbName);

        // Read all files in the data folder
        const files = fs.readdirSync(geojsonFolder);

        // Filter out non-GeoJSON files
        const geojsonFiles = files.filter(file => file.endsWith('.geojson'));

        for (const file of geojsonFiles) {
            const filePath = path.join(geojsonFolder, file);
            const collectionName = path.basename(file, '.geojson');

            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const geojsonData = JSON.parse(fileContent);

            const uploadData = {
                "name": collectionName,
                "data": geojsonData
            }

            const collection = db.collection(collectionName);
            await collection.insertOne(uploadData);

            console.log(`Uploaded ${file} to the ${collectionName} collection`);
        }

        await client.close();

        res.status(200).send("GeoJSON files have been uploaded successfully!");
    } catch (error) {
        console.error("Error uploading GeoJSON files:", error);
        res.status(500).send("Failed to upload GeoJSON files.");
    }
});




app.get("/delete_all_collections", async (req, res) => {
    try {
        const client = new MongoClient(MongoDBConfig.uri, ClientOptions);

        await client.connect();
        const db = client.db(MongoDBConfig.dbName);

        const collections = await db.listCollections().toArray();

        // Delete each collection
        for (const collection of collections) {
            await db.collection(collection.name).drop();
            console.log(`Deleted collection: ${collection.name}`);
        }

        await client.close();

        res.status(200).send("All collections have been deleted successfully!");
    } catch (error) {
        console.error("Error deleting collections:", error);
        res.status(500).send("Failed to delete collections.");
    }
});







app.get("/taxi_zones", async (req, res) => {
    try {
        const client = new MongoClient(MongoDBConfig.uri, ClientOptions);
        await client.connect();
        const db = client.db(MongoDBConfig.dbName);

        const collection = db.collection("taxi_zones");
        const document = await collection.findOne({ name: "taxi_zones" });

        await client.close();

        if (!document) {
            return res.status(404).json({ error: "Taxi zones data not found" });
        }

        res.json(document.data);
    } catch (error) {
        console.error("Error fetching taxi_zones from MongoDB:", error);
        res.status(500).json({ error: "Failed to load data from MongoDB" });
    }
});





app.get("/data_from_local/:year", async (req, res) => {
    const year = req.params.year;

    try {
        const client = new MongoClient(MongoDBConfig.uri, ClientOptions);
        await client.connect();
        const db = client.db(MongoDBConfig.dbName);

        const collection = db.collection(year);  // assuming collection name is the year
        const document = await collection.findOne({ name: year });

        await client.close();

        if (!document) {
            return res.status(404).json({ error: `Data for year ${year} not found` });
        }
        console.log("document", document);
        res.json(document.data);
    } catch (error) {
        console.error(`Error fetching data for year ${year}:`, error);
        res.status(500).json({ error: "Failed to load data from MongoDB" });
    }
});



