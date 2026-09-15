import * as authService from "../services/auth.service.js";


const login = async (req, res) => {

  try {

    const result =
      await authService.login(req.body);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result
    });

  } catch (error) {

    console.error("❌ Login Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message
    });

  }

};


const getMe = async (req, res) => {

  try {

    const user =
      await authService.getMe(
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {

    console.error("❌ Get Me Error:", error);

    return res.status(404).json({
      success: false,
      message: error.message
    });

  }

};


export {
  login,
  getMe
};