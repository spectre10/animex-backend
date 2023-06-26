import express from "express";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
import session from "express-session";
// import { Telegram } from "telegraf";
import dotenv from "dotenv";
// import { Telegraf } from "telegraf";
import passport from "passport";
// import passportLocalMongoose from "passport-local-mongoose";
// import GoogleStrategy from "passport-google-oauth20";
// import findOrCreate from "mongoose-findorcreate";
import cors from "cors";
import axios from "axios";
import isUserAuthenticated from "./auth.js";
import bot from "./contactBot.js";
import { User } from "./userModel.js";
import { Lib } from "./libModel.js";
import "./passportAuth.js";
// import { response } from "express";
import path from "path"
const result = dotenv.config();


// if (result.error) {
//     throw result.error;
// }

const app = express();
const __dirname = path.resolve();
app.use(express.static(path.resolve(__dirname, "client/Animex/build")))
// app.use(
//     cors({
//         origin: "http://localhost:5000",
//         credentials: true,
//     })
// );
// mongoose.connect("mongodb://localhost:27017/animexDB");
try {
    await mongoose.connect(process.env.MONGO_URI);
} catch (error) {
    console.log(error);
}
mongoose.connection.on("error", (err) => {
    console.log(err);
});

app.use(
    express.urlencoded({
        extended: true,
    })
);
app.use(express.json());

// const sessionStore = new MongoStore(
//   {
//     mongoUrl: connection,
//     collection: 'session'
//   }
// )

app.use(
    session({
        secret: process.env.MONGO_SECRET,
        resave: true,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URI,
            autoRemove: "native", // Default
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24, //equals one day
        },
    })
);
app.use(passport.initialize());
app.use(passport.session());
// mongoose.connect("mongodb://localhost:27017/animexDB");

// const userSchema = new mongoose.Schema({
//   username: String,
//   name: String,
//   googleId: String,
//   picture: String,
//   email:String
// },{ versionKey: false });

// // userSchema.plugin(passportLocalMongoose);
// userSchema.plugin(findOrCreate);

// const User = new mongoose.model("User", userSchema);

// passport.use(User.createStrategy());
// passport.serializeUser(function (user, done) {
//   done(null, user.id);
// });
// passport.deserializeUser(function (id, done) {
//   User.findById(id, function (err, user) {
//     done(err, user);
//   });
// });
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.CLIENT_ID,
//       clientSecret: process.env.CLIENT_SECRET,
//       callbackURL: "http://localhost:5000/auth/google/callback",
//       // userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
//       // passReqToCallback:true
//     },
//      async function (accessToken, refreshToken, profile, cb) {
//       // console.log(accessToken);
//       // console.log(refreshToken);
//       // console.log(profile.photos[0].value);
//       await User.findOrCreate(
//         { googleId: profile.id, username: profile.name.givenName ,picture:profile.photos[0].value ,email: profile.emails[0].value},
//         function (err, user) {
//           // console.log("from google:",user);
//           return cb(err, user);
//         }
//       );
//     }
//   )
// );

/////////////////////telegram/////////////////////////////
// const telegram = new Telegram(process.env.BOT_TOKEN, {
//   agent: null,
//   webhookReply: true,
// });

// const bot = new Telegraf(process.env.BOT_TOKEN);
// bot.use((ctx) => {
//   telegram.sendMessage(ctx.from.id, `Your Telegram id: ${ctx.from.id}`);
// });
// bot.startPolling();

app.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
        failureRedirect: "http://localhost:5000/signup",
    }),
    async function(req, res) {
        // console.log("in callback url:",req.user);

        const filter = {
            googleId: req.user.googleId,
        };
        // const lib_t = req.body.lib_t;  
        const update = { $set: { googleId: req.body.googleId } };
        const doc = await Lib.findOneAndUpdate(
            filter,
            update,
            { new: true, upsert: true }
        );
        // console.log(doc);
        // Successful authentication, redirect secrets.

        res.redirect("/");
    }
);

app.get("/auth/user", isUserAuthenticated, function(req, res, next) {
    // console.log(req.isAuthenticated());
    User.findById(req.user, function(err, result) {
        res.json(result);
    });
});

app.get("/user/library/:lib_id", isUserAuthenticated, async function(req, res) {
    let lib = (req.params.lib_id)
    const id = { googleId: req.user.googleId };
    const doc = await Lib.findOne(id);
    if (lib == 0) {
        if (doc.currentlyWatching === null) {
            res.json({});
            return;
        } else {
            const filter = await doc.currentlyWatching.join();
            const animeLib = await axios.get(
                "https://kitsu.io/api/edge/anime?filter%5Bid%5D=" + filter
            );
            res.json(animeLib.data);
        }
    }
    if (lib == 1) {
        if (doc.completed === null) {
            res.json({});
            return;
        } else {
            const filter = await doc.completed.join();
            const animeLib = await axios.get(
                "https://kitsu.io/api/edge/anime?filter%5Bid%5D=" + filter
            );
            res.json(animeLib.data);
        }
    }
    if (lib == 2) {
        if (doc.wantTo === null) {
            res.json({});
            return;
        } else {
            const filter = await doc.wantTo.join();
            const animeLib = await axios.get(
                "https://kitsu.io/api/edge/anime?filter%5Bid%5D=" + filter
            );
            res.json(animeLib.data);
        }
    }
    if (lib == 3) {
        if (doc.onHold === null) {
            res.json({});
            return;
        } else {
            const filter = await doc.onHold.join();
            const animeLib = await axios.get(
                "https://kitsu.io/api/edge/anime?filter%5Bid%5D=" + filter
            );
            res.json(animeLib.data);
        }
    }
    if (lib == 4) {
        if (doc.dropped === null) {
            res.json({});
            return;
        } else {
            const filter = await doc.dropped.join();
            const animeLib = await axios.get(
                "https://kitsu.io/api/edge/anime?filter%5Bid%5D=" + filter
            );
            res.json(animeLib.data);
        }
    }
});

app.post("/user/add", isUserAuthenticated, async function(req, res) {
    // console.log(req.body.id);
    const filter = {
        googleId: req.user.googleId,
    };
    const lib_t = req.body.lib_t;
    const update = { $push: { [lib_t]: req.body.id } };
    const doc = await Lib.findOneAndUpdate(
        filter,
        update,
        { new: true, upsert: true }
    );
    // console.log("doc: ", doc);
    res.send("oki");
});

app.post("/user/logout", isUserAuthenticated, function(req, res) {
    // req.logOut();
    req.session.destroy(function(err) {
        if (err) console.log(err);
    });
    // console.log("user: ", req.user);
    res.send("okie");
});

app.post("/contact", function(req, res) {
    bot.telegram.sendMessage(
        process.env.GHANSHYAM_ID,
        `Name: ${req.body.name}\nEmail Address: ${req.body.email}\nMessage: ${req.body.message}`
    );
    bot.stop()
});

app.get("/*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client/Animex/build", "index.html"))
})

if (process.env.NODE_ENV === "production") {
    app.use(express.static('client/build'))
}

app.listen(process.env.PORT || 5000, function() {
    console.log("server started on port 5000.");
});
