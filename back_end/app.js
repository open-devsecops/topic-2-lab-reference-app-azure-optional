const express = require("express");
const app = express();
const fs = require('fs');
const path = require('path');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const { MapboxToken, MongoDBUri } = require('./secrets');
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




// mapbox token
app.get("/mapbox_token", (req, res) => {
    // res.json(MapboxToken);
    try {
        res.json(MapboxToken);

    }
    catch (error) {
        console.error("Error getting Mapbox token:", error);
        res.status(500).send("Failed to get Mapbox token.");
    }
});













// @deprecated
app.get("/taxi_zones", (req, res) => {
    const filePath = path.join(__dirname, "data", "taxi_zones.geojson");

    // Read the file and send JSON response
    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
            console.error("Error reading file:", err);
            res.status(500).json({ error: "Failed to load data" });
        } else {
            try {
                const jsonData = JSON.parse(data); // Parse the geojson content
                res.json(jsonData);
            } catch (parseError) {
                console.error("Error parsing JSON:", parseError);
                res.status(500).json({ error: "Invalid JSON format" });
            }
        }
    });
});




// @ deprecated
app.get("/data_from_local/:year", (req, res) => {
    const year = req.params.year;
    const filePath = path.join(__dirname, "data", `${year}.geojson`);

    // Read the file and send JSON response
    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
            console.error("Error reading file:", err);
            res.status(500).json({ error: "Failed to load data" });
        } else {
            try {
                const jsonData = JSON.parse(data); // Parse the JSON content
                res.json(jsonData);
            } catch (parseError) {
                console.error("Error parsing JSON:", parseError);
                res.status(500).json({ error: "Invalid JSON format" });
            }
        }
    });
});



