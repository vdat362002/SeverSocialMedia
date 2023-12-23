import { makeResponseJson, sessionizeUser } from '../../../helpers/utils.js';
import { ErrorHandler } from '../../../middlewares/error.middleware.js';
import { schemas, validateBody } from '../../../validations/validations.js';
import passport from 'passport';
import { Router } from 'express';

const router = Router({ mergeParams: true });

//@route POST /api/v1/register
router.post('/v1/register', validateBody(schemas.registerSchema), (req, res, next) => {
    passport.authenticate('local-register', (err, user, info) => {
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
});

//@route POST /api/v1/authenticate
router.post('/v1/authenticate', validateBody(schemas.loginSchema), (req, res, next) => {
    console.log('FIREED');
    passport.authenticate('local-login', (err, user, info) => {
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
                return res.status(200).send(makeResponseJson({ auth: userData, user: req.user.toUserJSON() }));
            });
        }
    })(req, res, next);
});

//@route GET /api/v1/auth/facebook FACEBOOK AUTH
router.get('/v1/auth/facebook', passport.authenticate('facebook-auth', { scope: ['email', 'public_profile'] }));

//@route GET /api/v1/auth/facebook/callback FACEBOOK AUTH CALLBACK
router.get('/v1/auth/facebook/callback', passport.authenticate('facebook-auth', {
    failureRedirect: `${process.env.CLIENT_URL}/auth/facebook/failed`,
    successRedirect: `${process.env.CLIENT_URL}`
}));

//@route GET /api/v1/auth/github GITHUB AUTH
router.get('/v1/auth/github', passport.authenticate('github-auth'));

//@route GET /api/v1/auth/github/callback GITHUB AUTH CALLBACK
router.get('/v1/auth/github/callback', passport.authenticate('github-auth', {
    failureRedirect: `${process.env.CLIENT_URL}/auth/github/failed`,
    successRedirect: `${process.env.CLIENT_URL}`
}));

//@route GET /api/v1/auth/google GOOGLE AUTH
router.get('/v1/auth/google', passport.authenticate('google-auth', { scope: ['email', 'profile'] }));

//@route GET /api/v1/auth/google/callback GOOGLE AUTH CALLBACK
router.get('/v1/auth/google/callback', passport.authenticate('google-auth', {
    failureRedirect: `${process.env.CLIENT_URL}/auth/google/failed`,
    successRedirect: `${process.env.CLIENT_URL}`
}));

//@route DELETE /api/v1/logout
router.delete('/v1/logout', (req, res, next) => {
    try {
        req.logOut();
        res.sendStatus(200);
    } catch (e) {
        next(ErrorHandler(422, 'Unable to logout. Please try again.'));
    }
});

//@route GET /api/v1/checkSession
// Check if user session exists
router.get('/v1/check-session', (req, res, next) => {
    if (req.isAuthenticated()) {
        const user = sessionizeUser(req.user);
        res.status(200).send(makeResponseJson({ auth: user, user: req.user.toUserJSON() }));
    } else {
        next(ErrorHandler(404, 'Session invalid/expired.'));
    }
});

export default router;
