import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    questions: {
        favoriteFood: { type: String },
        favoriteArtist: { type: String },
        favoritePlace: { type: String },
        favoriteColor: { type: String },
    },
    image: { type: String },
    isAdmin: { type: Boolean, default: false },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;
