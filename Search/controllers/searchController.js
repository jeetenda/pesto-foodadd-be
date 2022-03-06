const { validationResult } = require("express-validator");
const City = require("../../City/models/City");
const Restaurant = require("../../Restaurants/models/Restaurant");

const validateBody = validationResult.withDefaults({
  formatter: (err) => {
    return {
      err: true,
      message: err.msg,
    };
  },
});

const getCityId = async (req, res) => {
  const errors = validateBody(req);
  if (!errors.isEmpty()) {
    const { err, message } = errors.array({ onlyFirstError: true })[0];
    return res.status(422).json({ err, message });
  } else {
    try {
      let city = await City.findOne({
        // // city_id:4
        //  location: {
        //       type: "Point",
        //       // coordinates: [
        //       //   parseInt(req.body["long"]),
        //       //   parseInt(req.body["lat"]),
        //       // ],
        // },



        location: {
           $nearSphere: {
             $geometry: {
              type: "Point",
              coordinates: [
                parseInt(req.body["long"]),
                parseInt(req.body["lat"]),
              ],
            },
            $maxDistance: 5000000,
           },
        },
      });
      if (city) {
        return res.json({
          err: false,
          message: "Success",
          title: city.city_name.split(" ").join("-"),
          city_id: city.city_id,
        });
      } else {
        return res.json({
          err: true,
          message: "Failed to get the city id",
          title: "Banglore",
          city_id: 4,
        });
      }
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ err: true, message: "Something went wrong" });
    }
  }
};

const getCollection = async (req, res) => {
  const errors = validateBody(req);
  if (!errors.isEmpty()) {
    const { err, message } = errors.array({ onlyFirstError: true })[0];
    return res.status(422).json({ err, message });
  } else {
    try {
      let collections = await City.findOne(
        {
          city_id: parseInt(req.body["city_id"]),
        },
        { collections: 1 }
      );
      if (!collections) {
        return res.json({ err: true, message: "Failed", collections: [] });
      }
      return res.json({
        err: false,
        message: "Success",
        collections: collections.collections,
      });
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ err: true, message: "Something went wrong " });
    }
  }
};

const getLocalities = async (req, res) => {
  const errors = validateBody(req);
  if (!errors.isEmpty()) {
    const { err, message } = errors.array({ onlyFirstError: true })[0];
    return res.status(422).json({ err, message });
  } else {
    try {
      let localities = await Restaurant.find(
        {
          "location.city_id": parseInt(req.body["city_id"]),
        },
        { "location.locality": 1, "location.cords": 1 }
      );
      if (!localities) {
        return res.json({ err: true, message: "Failed", localities: [] });
      }
      return res.json({
        err: false,
        localities: localities,
        message: "Success",
      });
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ err: true, message: "Something went wrong" });
    }
  }
};

const getRestaurant = async (req, res) => {
  let { q, city_id } = req.query;
  //let query = new RegExp(q, "i");
  let query =q;
  console.log(query);
  try {

    // [{$unwind: "$menu"},
    // {$match:{"menu.dish":{$regex: "aviNash", $options: 'i'}, "location.city_id":2}},
    // {$group:{_id:"$name", total:{$sum: 1}, dished:{$push:"$menu.dish"}, location:{$first:"$location.city"}}}]



    let result = await Restaurant.aggregate(
      [{$unwind: "$menu"},
      {$match:{"menu.dish":{$regex: q, $options: 'i'}, "location.city_id":2}},
      {$group:{_id:"$name", total:{$sum: 1}, dished:{$push:"$menu.dish"}, 
      
      id:{$first:"$id"}}}]
      
    );
    return res.json({ err: false, message: "Success", result: result });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err: true, message: "Something went wrong 44" });
  }
};

module.exports = { getCityId, getCollection, getLocalities, getRestaurant };
