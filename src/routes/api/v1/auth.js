import { makeResponseJson, sessionizeUser } from "../../../helpers/utils.js";
import { ErrorHandler } from "../../../middlewares/error.middleware.js";
import { schemas, validateBody } from "../../../validations/validations.js";
import passport from "passport";
import { Router } from "express";
import { isAuthenticatedCus } from '../../../middlewares/auth.js';
import { User } from "../../../schemas/index.js";
import { generateAccessToken, generateRefreshToken } from "../../../utils/generateToken.js";
const router = Router({ mergeParams: true });
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
//@route POST /api/v1/register
router.post(
  "/v1/register",
  validateBody(schemas.registerSchema),
  (req, res, next) => {
    passport.authenticate("local-register", (err, user, info) => {
      if (err) {
        return next(err);
      }

      if (user) {
        req.logIn(user, (err) => {
          if (err) {
            return next(err);
          }

          const userData = sessionizeUser(user);
          return res.status(200).send(makeResponseJson(userData));
        });
      } else {
        next(ErrorHandler(409, info.message));
      }
    })(req, res, next);
  }
);

//@route POST /api/v1/authenticate
router.post(
  "/v1/authenticate",
  validateBody(schemas.loginSchema),
  (req, res, next) => {
    console.log("FIREED");
    passport.authenticate("local-login", (err, user, info) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return next(ErrorHandler(400, info.message));
      } else {
        req.logIn(user, (err) => {
          if (err) {
            return next(err);
          }

          const userData = sessionizeUser(user);
          return res
            .status(200)
            .send(
              makeResponseJson({ auth: userData, user: req.user.toUserJSON() })
            );
        });
      }
    })(req, res, next);
  }
);

//@route POST /api/v1/forgot-password
router.post(
  "/v1/forgot-password",
  validateBody(schemas.forgotSchema),
  (req, res, next) => {
    console.log("FIREED");
    passport.authenticate("local-forgot-password", (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        // return next(ErrorHandler(400, info.message));
        return res.status(400).send(makeResponseJson(info.message));
      } else {
        req.logIn(user, (err) => {
          if (err) {
            return next(err);
          }
          const userData = sessionizeUser(user);
          return res
            .status(200)
            .send(
              makeResponseJson({ auth: userData, user: req.user.toUserJSON() })
            );
        });
      }
    })(req, res, next);
  }
);

//@route GET /api/v1/auth/facebook FACEBOOK AUTH
router.get(
  "/v1/auth/facebook",
  passport.authenticate("facebook-auth", { scope: ["email", "public_profile"] })
);

//@route GET /api/v1/auth/facebook/callback FACEBOOK AUTH CALLBACK
router.get(
  "/v1/auth/facebook/callback",
  passport.authenticate("facebook-auth", {
    failureRedirect: `${process.env.CLIENT_URL}/auth/facebook/failed`,
    successRedirect: `${process.env.CLIENT_URL}`,
  })
);

//@route GET /api/v1/auth/github GITHUB AUTH
router.get("/v1/auth/github", passport.authenticate("github-auth"));

//@route GET /api/v1/auth/github/callback GITHUB AUTH CALLBACK
router.get(
  "/v1/auth/github/callback",
  passport.authenticate("github-auth", {
    failureRedirect: `${process.env.CLIENT_URL}/auth/github/failed`,
    successRedirect: `${process.env.CLIENT_URL}`,
  })
);

//@route GET /api/v1/auth/google GOOGLE AUTH
router.get(
  "/v1/auth/google",
  passport.authenticate("google-auth", { scope: ["email", "profile"] })
);

//@route GET /api/v1/auth/google/callback GOOGLE AUTH CALLBACK
router.get(
  "/v1/auth/google/callback",
  passport.authenticate("google-auth", {
    failureRedirect: `${process.env.CLIENT_URL}/auth/google/failed`,
    successRedirect: `${process.env.CLIENT_URL}`,
  })
);
//@route GET /api/v1/auth/message/google GOOGLE AUTH
router.get(
  "/v1/auth/message/google",
  passport.authenticate("google-message-auth", { scope: ["email", "profile"] })
);

//@route GET /api/v1/auth/google/callback GOOGLE AUTH CALLBACK
// router.get(
//   "/v1/auth/message/google/callback",
//   passport.authenticate("google-message-auth", {
//     failureRedirect: `${process.env.MESSENGER_URL}/auth/google/failed`,
//     successRedirect: `${process.env.MESSENGER_URL}`,
//   })
// );
router.get(
  "/v1/auth/message/google/callback",
  passport.authenticate("google-message-auth", {
    failureRedirect: `${process.env.MESSENGER_URL}/auth/message/google/failed`,
  }),
  async (req, res) => {
    const accessToken = generateAccessToken({ id: req.user._id })
    const refreshToken = generateRefreshToken({ id: req.user._id }, res)

    await User.findOneAndUpdate({ _id: req.user._id }, {
      rf_token: refreshToken
    })
    console.log("=====================================================================")
    console.log(`${process.env.MESSENGER_URL}?id=${req.user.provider_id}`)

    res.redirect(`${process.env.MESSENGER_URL}?access_data=${JSON.stringify({
      user: {
        ...req.user._doc,
        password: ''
      },
      accessToken
    })}`);
  }
);

//@route DELETE /api/v1/logout
router.delete("/v1/logout", (req, res, next) => {
  try {
    req.logOut();
    res.sendStatus(200);
  } catch (e) {
    next(ErrorHandler(422, "Unable to logout. Please try again."));
  }
});

//@route GET /api/v1/checkSession
// Check if user session exists
router.get("/v1/check-session", (req, res, next) => {
  if (req.isAuthenticated()) {
    const user = sessionizeUser(req.user);
    res
      .status(200)
      .send(makeResponseJson({ auth: user, user: req.user.toUserJSON() }));
  } else {
    next(ErrorHandler(404, "Session invalid/expired."));
  }
});

//////////////////////////////////////////////////////////////////////////
router.route('/v1/auth/login').post(async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) return res.status(400).json({ msg: 'Please provide your email.' });
    if (!password) return res.status(400).json({ msg: 'Please provide your password.' });

    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ msg: 'Invalid credential.' });

    loginUser(user, password, res);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
})
const loginUser = async (user, password, res) => {
  const isPwMatch = await bcrypt.compare(password, user.password)
  let msg = ''

  if (user.type === 'register')
    msg = 'Invalid credential.'
  else
    msg = `This account login using ${user.type}`

  if (!isPwMatch)
    return res.status(400).json({ msg })

  const accessToken = generateAccessToken({ id: user._id })
  const refreshToken = generateRefreshToken({ id: user._id }, res)

  await User.findOneAndUpdate({ _id: user._id }, {
    rf_token: refreshToken
  })

  res.status(200).json({
    msg: `Authenticated as ${user.username}`,
    user: {
      ...user._doc,
      password: ''
    },
    accessToken
  })
}

router.route('/v1/auth/logout').post(isAuthenticatedCus, async (req, res) => {
  try {
    res.clearCookie('inspace_rfToken', {
      path: '/api/v1/auth/refresh_token',
    });

    await User.findOneAndUpdate({ _id: req.user._id }, {
      rf_token: '',
    });

    res.status(200).json({ msg: 'Logout success.' });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
})
router.route('/v1/auth/refresh_token').post(async (req, res) => {
  try {
    console.log(req.cookies);  // Log the entire cookies object to see what's available
    const rfToken = req.cookies['inspace_rfToken'];
    if (!rfToken) return res.status(400).json({ msg: 'Invalid token.' });

    const decoded = jwt.verify(rfToken, process.env.REFRESH_TOKEN_SECRET);
    if (!decoded.id) return res.status(400).json({ msg: 'Invalid token.' });

    const user = await User.findOne({ _id: decoded.id }).select('-password +rf_token')

    if (!user) return res.status(404).json({ msg: 'User not found.' });

    if (rfToken !== user.rf_token) return res.status(403).json({ msg: 'Invalid authentication.' });

    const accessToken = generateAccessToken({ id: user._id });
    const refreshToken = generateRefreshToken({ id: user._id }, res);

    await User.findOneAndUpdate({ _id: user._id }, {
      rf_token: refreshToken,
    });

    res.status(200).json({
      user: {
        ...user._doc,
        rf_token: '',
      },
      accessToken,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: err.message });
  }
})




export default router;
