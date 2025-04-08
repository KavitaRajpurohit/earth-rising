import express from 'express';
import authController from '../auth/auth.controller';
//import controller from '../auth/auth.controller';
import validate from '../middlewares/validate';
import authValidation from './../auth/auth.validation';
import auth from '../middlewares/auth';
// const auth = require('../middlewares/auth');
const router = express.Router();

router.post('/auth/login', validate(authValidation.login), authController.login);
router.post('/auth/userSignup', validate(authValidation.userSignup), authController.userSignup);

router.post('/auth/userLogin', validate(authValidation), authController.userLogin);

router.post('/auth/forgotpassword', validate(authValidation.forgotPassword), authController.forgotpassword);

router.post('/auth/resetPassword/:token', validate(authValidation.resetPassword), authController.resetPassword);
router.post('/auth/checkLink/:token', authController.checkLink);
router.post('/auth/checkResetLink/:token', authController.checkResetLink);

router.post('/auth/sendVerifyEmail', validate(authValidation.forgotPassword), authController.sendVerifyEmail);

router.post('/auth/onBoarding/:id', validate(authValidation.update), authController.onBoarding);
router.put('/auth/updateProfile', validate(authValidation.updateProfile), authController.updateProfile);

router.post('/tribe/', validate(authValidation.createTribe), authController.createTribe);
router.get('/tribe/allTribes/', auth, validate(authValidation.allTribes), authController.getallTribes);
router.get('/tribe/:id', authController.getTribe);
router.put('/tribe/:id', validate(authValidation.createTribe), authController.updateTribe);
router.delete('/tribe/:id', authController.deleteTribe);

router.put('/follow/', validate(authValidation.updateRequest), authController.updateRequest);
router.post('/follow/', validate(authValidation.followRequest), authController.followRequest);

router.get('/dashboard/allRequestedTribe/', auth, validate(authValidation.getallRequestedTribes), authController.getallRequestedTribes);
router.get('/dashboard/tribeList/', auth, validate(authValidation.tribeList), authController.tribeList);
router.get('/dashboard/getFollowing/', auth, validate(authValidation.tribeFollowing), authController.getFollowing);
router.get('/dashboard/getFollower/', auth, validate(authValidation.tribeFollower), authController.getFollower);
router.get('/dashboard/yourTribes/', auth, validate(authValidation.tribeFollower), authController.getYourTribes);
router.get('/dashboard/publicTribes/', auth, validate(authValidation.tribeFollowing), authController.getPublicTribes);
router.delete('/dashboard/deleteRequests/', auth, validate(authValidation.deleteRequests), authController.deleteRequests);
router.get('/dashboard/getBadges/', auth, validate(authValidation.getBadges), authController.getBadges);
router.get('/dashboard/getTribeFollowers/', auth, validate(authValidation.getTribeFollowers), authController.getTribeFollowers);

router.put('/profile/updateProfile/', auth, validate(authValidation.editProfile), authController.editProfile);

router.get('/admin/customerList/', auth, validate(authValidation.getCustomerList), authController.getCustomerList);
router.put('/admin/customer/', auth, validate(authValidation.updateCustomer), authController.updateCustomer);
router.put('/admin/updateStatus/', auth, validate(authValidation.updateStatus), authController.updateStatus);
router.post('/refresh-tokens', validate(authValidation.refreshTokens), authController.refreshTokens);
router.put('/admin/changePassword/', auth, validate(authValidation.changePassword), authController.changePassword);
router.delete('/admin/deleteCustomer/:id', authController.deleteCustomer);
router.get('/admin/getTribeByCustomerDetials/:id', authController.getTribeByCustomerDetials);

router.post('/factor/addTariff', auth, validate(authValidation.addTariff), authController.addTariff);
router.put('/factor/updateTariff', auth, validate(authValidation.updateTariff), authController.updateTariff);
router.delete('/factor/deleteTariff', auth, validate(authValidation.deleteTariff), authController.deleteTariff);
router.get('/factor/tariffList', auth, validate(authValidation.tariffList), authController.tariffList);
router.get('/factor/getTariffList', auth, validate(authValidation.getAllTariff), authController.getAllTarrif);

router.post('/partner/', auth, validate(authValidation.createPartner), authController.createPartner);
router.delete('/partner/:id', auth, authController.deletePartner);
router.put('/partner/updatePartner/', auth, validate(authValidation.updatePartner), authController.updatePartner)
router.get('/partner/allPartners/', auth, validate(authValidation.allPartners), authController.getallPartners);
router.put('/partner/updateStatus/', auth, validate(authValidation.updateStatusPartner), authController.updateStatusPartner);

router.post('/product/', auth, validate(authValidation.createProduct), authController.createProduct);
router.get('/product/allProducts/', auth, validate(authValidation.allProducts), authController.getallProducts);
router.put('/product/updateStatus/', auth, validate(authValidation.updateStatusProduct), authController.updateStatusProduct);
router.delete('/product/:id', auth, authController.deleteProduct);
router.put('/product/updateProduct/', auth, validate(authValidation.updateProduct), authController.updateProduct)
router.get('/product/productCategory/:id', auth, authController.getProductCategoryById);
router.get('/product/getProductByPartnerId/:partnerId', auth, authController.getProductByPartnerId)

router.get('/task/getTaskByBadges/:id', auth, authController.getTasks);
router.post('/task/saveTaskAnswer', auth, authController.saveTaskAnswer);
router.get('/task/getTaskAnswer/:userId/:taskId', auth, authController.getTaskAnswer);
router.put('/task/updateTaskAnswer/:userId/:taskId', auth, authController.updateTaskAnswer);

export = router;
