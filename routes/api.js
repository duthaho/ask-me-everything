const express = require("express");

const { getInstructions } = require("../utils/request");

const router = express.Router();

router.route("/ask-me").post((req, res) => {
  getInstructions(req.body, (err, answers) => {
    if (err) {
      return res.status(200).json({
        message: err.message,
        data: null,
      });
    }
    res.status(200).json({
      message: "Success",
      data: answers,
    });
  });
});

module.exports = router;
