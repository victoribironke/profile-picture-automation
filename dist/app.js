import { adventurerNeutral } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";
import sharp from "sharp";
import { TwitterApi } from "twitter-api-v2";
import { config } from "dotenv";
import express from "express";
import cors from "cors";
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
const twitterClient = new TwitterApi({
    appKey: SECRETS.apiKey,
    appSecret: SECRETS.apiKeySecret,
    accessToken: SECRETS.accessToken,
    accessSecret: SECRETS.accessTokenSecret,
});
const getAvatar = () => createAvatar(adventurerNeutral, {
    seed: Date.now().toString(),
    flip: true,
});
const saveImage = (str) => sharp(Buffer.from(str))
    .png()
    .toFile("output.png", (err, info) => {
    if (err) {
        console.error("Error converting SVG to PNG:", err);
    }
    else {
        console.log("SVG successfully converted to PNG:", info);
    }
});
app.get("/", (req, res) => {
    try {
        const twitterAvatar = getAvatar();
        saveImage(twitterAvatar.toString());
        setTimeout(async () => await twitterClient.v1.updateAccountProfileImage("output.png"), 1000);
        res.status(200).json({ data: "Successful" });
    }
    catch (e) {
        res.status(500).json({ error: "An error occured" });
    }
});
app.listen(port, () => console.log("Server running on port", port));
//# sourceMappingURL=app.js.map