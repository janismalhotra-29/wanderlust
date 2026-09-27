require("dotenv").config();

const mongoose = require("mongoose");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const Listing = require("../models/listing.js");

const geocodingClient = mbxGeocoding({
    accessToken: process.env.MAP_TOKEN
});

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to DB");

    const listings = await Listing.find({
        $or: [
            { geometry: { $exists: false } },
            { "geometry.coordinates": { $exists: false } }
        ]
    });

    console.log(`Found ${listings.length} old listings`);

    for (let listing of listings) {

        if (!listing.location) {
            console.log(`Skipping ${listing.title} - no location`);
            continue;
        }

        try {
            const response = await geocodingClient
                .forwardGeocode({
                    query: listing.location,
                    limit: 1
                })
                .send();

            if (!response.body.features.length) {
                console.log(`❌ Location not found: ${listing.location}`);
                continue;
            }

            listing.geometry = response.body.features[0].geometry;

            await listing.save();

            console.log(
                `✅ Updated: ${listing.title} - ${listing.location}`,
                listing.geometry.coordinates
            );

        } catch (err) {
            console.log(
                `❌ Error updating ${listing.title}:`,
                err.message
            );
        }
    }

    console.log("Migration completed!");
    mongoose.connection.close();
}

main();