import mongoose from "mongoose";
import User from "../models/UserModel.js";
import Message from "../models/MessagesModel.js";

export const searchContacts = async (request, response, next) => {
  try {
    const { searchterm } = request.body;
    if (searchterm === undefined || searchterm === null) {
      return response
        .status(400)
        .send("There should be something in the search");
    }
    const sanitizedSearchterm = searchterm.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );
    const regex = new RegExp(sanitizedSearchterm, "i");
    const contacts = await User.find({
      $and: [
        {
          _id: { $ne: request.userId },
        },
      ],
      $or: [
        {
          firstname: regex,
        },
        {
          lastName: regex,
        },
        {
          email: regex,
        },
      ],
    });

    return response.status(200).json({
        contacts
    })
  } catch (error) {
    console.log(error);
    return response
      .status(400)
      .send("Bad request or an exception has occurred");
  }
};



export const getContactForDMList = async (request, response, next) => {
  try {
    let { userId } = request;
    userId = new mongoose.Types.ObjectId(userId);
    const contacts = await Message.aggregate([
      {
        $match : {
          $or : [{sender : userId},{recipient : userId}],
        },
      },
      {
        $sort : {timestamp : -1}
      },
      {
        $group  :{
          _id:{
            $cond :{
              if:{$eq : ["$sender",userId]},
              then : "$recipient",
              else : "$sender"
            }
          },
          lastMessageTime : {$first : "$timestamp"},
        }

      },
      {
        $lookup:{
          from:"users",
          localField: "_id",
          foreignField: "_id",
          as : "contactInfo"
        }
      },
      {
        $unwind : "$contactInfo",
      },
      {
          $project :{
            _id : 1,
            lastMessageTime : 1,
            email : "$contactInfo.email",
            firstname : "$contactInfo.firstName",
            lastname : "$contactInfo.lastName",
            image : "$contactInfo.image",
            color : "$contactInfo.color",
          }
      },{
        $sort : {lastMessageTime : -1}
      }
    ])    
    
    return response.status(200).json({
        contacts
    })
  } catch (error) {
    console.log(error);
    return response
      .status(400)
      .send("Bad request or an exception has occurred");
  }
};
