import User from "../models/UserModel.js";

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
