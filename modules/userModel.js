const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    firstName: {
        "type": String,
        "required": true,
        "default": "Empty"
    },
    lastName: {
        "type": String,
        "required": true,
        "default": "Empty"
    },
    email: {
        "type": String,
        "required": true,
        "unique": true,
        "default": "Empty"
    },
    password: {
        "type": String,
        "required": true,
        "default": "Empty"
    }
});

//Hash pasword
userSchema.pre("save", async function(next){
    let user = this;
    
    if(!user.isModified("password")) {
        return;
    }

    try {
        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(user.password, salt);

    }catch(err) {
        console.error(`Hash failed ${err}`);
    }

});

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;