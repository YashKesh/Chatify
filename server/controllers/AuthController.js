import { compare } from "bcrypt";
import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import {renameSync,unlinkSync} from "fs"
const maxage = 3 * 24 * 60 * 60 * 1000;

const createToken = (email, password) => {
  return jwt.sign({ email, password }, process.env.JWT_KEY, {
    expiresIn: maxage,
  });
};

export const signup = async (request, response, next) => {
  try {
    const { email, password } = request.body;
    if (!email || !password) {
      return response.status(400).send("Email and password is required ");
    }
    const user = await User.create({ email, password });
    response.cookie("jwt", createToken(email, user.id), {
      maxage,
      secure: true,
      sameSite: "None",
    });
    return response.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        profileSetup: user.profileSetup,
      },
    });
  } catch (error) {
    console.log(error);
    return response.status(500).send("Internal Server Error");
  }
};

export const login = async (request, response, next) => {
  try {
    const { email, password } = request.body;
    if (!email || !password) {
      return response.status(400).send("Email and password is required ");
    }
    const user = await User.findOne({ email });
    if (!user) {
      return response.status(404).send("Invalid email or password");
    }
    const auth = await compare(password, user.password);
    if (!auth) {
      return response.status(400).send("Password is incorrect");
    }
    response.cookie("jwt", createToken(email, user.id), {
      maxage,
      secure: true,
      sameSite: "None",
    });
    return response.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        profileSetup: user.profileSetup,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
        color: user.color,
      },
    });
  } catch (error) {
    console.log(error);
    return response.status(500).send("Internal Server Error");
  }
};

export const getuserInfo = async (request, response, next) => {
  try {
    const userId = request.userId;
    const user = await User.findById(userId);
    if (!user) {
      return response.status(400).send("bad request user does not exist");
    }
    return response.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        profileSetup: user.profileSetup,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
        color: user.color,
      },
    });
  } catch (error) {
    return response.status(400).send("BAD Request");
  }
};

export const updateProfile = async (request, response, next) => {
  try {
    const userId = request.userId;
    const { firstName, lastName, color } = request.body;

    if (!firstName || !lastName || color === undefined) {
      return response
        .status(400)
        .send("firstname , lastname and color is required for this api");
    }
    const user = await User.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        color,
        profileSetup: true,
      },
      {
        new: true,
        runValidators: true,
      }
    );
    return response.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        profileSetup: user.profileSetup,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
        color: user.color,
      },
    });
  } catch (error) {
    return response.status(400).send("Bad Request");
  }
};

export const addProfileImage = async(request, response, next) => {
  try {
    if(!request.file){
      return response.status(400).send("No file is provided");
    }
    const date = Date.now();
    let filename = "uploads/profiles/" + date + request.file.originalname;
    renameSync(request.file.path,filename);
    const updatedUser = await User.findByIdAndUpdate(request.userId,{image: filename},{new : true,runValidators : true})
    return response.status(200).json({
      image : updatedUser.image
    })
  } catch (error) {
    console.log(error);
    return response
      .status(400)
      .send("Bad request or an exception has occurred");
  }
};


 
export const removeProfileImage = async (request, response, next) => {
  try {
    const {userId} = request;
    const user = await User.findById(userId);
    if(!user){
      return response.status(404).send("user not found")
    }
    if(user.image){
      unlinkSync(user.image);
    }
    user.image =null;
    await user.save();
    return response.status(200).send("profile image removed successfully")
  } catch (error) {
    console.log(error);
    return response
      .status(400)
      .send("Bad request or an exception has occurred");
  }
};

export const logout = async (request, response, next) => {
  try {
    response.cookie("jwt","",{maxage : 1,secure : true,sameSite : "None"})
    return response.status(200).send("Logout Successfull")
  } catch (error) {
    console.log(error);
    return response
      .status(400)
      .send("Bad request or an exception has occurred");
  }
};


 