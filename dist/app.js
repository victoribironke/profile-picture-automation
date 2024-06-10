import { adventurerNeutral } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";
import { config } from "dotenv";
import express from "express";
import cors from "cors";
import axios from "axios";
import OAuth from "oauth-1.0a";
import { createHmac } from "crypto";
import sharp from "sharp";
config();
const app = express();
app.use(cors());
const port = process.env.PORT || 3001;
const SECRETS = {
    apiKey: process.env.API_KEY,
    apiKeySecret: process.env.API_KEY_SECRET,
    bearerToken: process.env.BEARER_TOKEN,
    accessToken: process.env.ACCESS_TOKEN,
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
};
const API_KEY = SECRETS.apiKey;
const API_SECRET_KEY = SECRETS.apiKeySecret;
const ACCESS_TOKEN = SECRETS.accessToken;
const ACCESS_TOKEN_SECRET = SECRETS.accessTokenSecret;
const getAvatar = () => createAvatar(adventurerNeutral, {
    seed: Date.now().toString(),
    flip: true,
});
app.get("/", async (req, res) => {
    try {
        const twitterAvatar = getAvatar().toString();
        const oauth = new OAuth({
            consumer: { key: API_KEY, secret: API_SECRET_KEY },
            signature_method: "HMAC-SHA1",
            hash_function: (base_string, key) => {
                return createHmac("sha1", key).update(base_string).digest("base64");
            },
        });
        const token = {
            key: ACCESS_TOKEN,
            secret: ACCESS_TOKEN_SECRET,
        };
        const svgBuffer = Buffer.from(twitterAvatar);
        const buffer = await sharp(svgBuffer).png().toBuffer();
        const image = buffer.toString("base64");
        const request_data = {
            url: "https://api.twitter.com/1.1/account/update_profile_image.json",
            method: "POST",
            data: {
                image,
            },
        };
        const headers = {
            ...oauth.toHeader(oauth.authorize(request_data, token)),
            "Content-Type": "application/x-www-form-urlencoded",
        };
        const response = await axios({
            url: request_data.url,
            method: request_data.method,
            headers,
            data: new URLSearchParams(request_data.data).toString(),
        });
        console.log("Profile image updated successfully", response.data);
        res.status(200).json({ data: "Successful" });
    }
    catch (e) {
        console.error("Error updating profile image", e.response.data);
        res.status(500).json({ error: "An error occured" });
    }
});
app.listen(port, () => console.log("Server running on port", port));
//# sourceMappingURL=app.js.map