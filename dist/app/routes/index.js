"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_routes_1 = require("../modules/auth/auth.routes");
const user_router_1 = require("../modules/user/user.router");
const itemDonation_router_1 = require("../modules/itemDonation/itemDonation.router");
const donation_router_1 = require("../modules/donation/donation.router");
const payment_route_1 = require("../modules/payment/payment.route");
const campain_router_1 = require("../modules/campain/campain.router");
const banner_router_1 = require("../modules/banner/banner.router");
const charity_router_1 = require("../modules/charity/charity.router");
const charityInquiry_router_1 = require("../modules/charityInquiry/charityInquiry.router");
const router = express_1.default.Router();
const routes = [
    {
        path: '/auth',
        route: auth_routes_1.AuthRoutes,
    },
    {
        path: '/users',
        route: user_router_1.userRouter,
    },
    {
        path: '/campaign',
        route: campain_router_1.campaignRouter,
    },
    {
        path: '/item-donation',
        route: itemDonation_router_1.ItemDonation,
    },
    {
        path: '/donation',
        route: donation_router_1.donationRouter,
    },
    {
        path: '/payment',
        route: payment_route_1.paymentRouter,
    },
    {
        path: '/banner',
        route: banner_router_1.BannerRouter,
    },
    {
        path: '/charity',
        route: charity_router_1.CharityRouter,
    },
    {
        path: '/charity-inquiry',
        route: charityInquiry_router_1.CharityInquiryRouter,
    },
];
routes.forEach((route) => {
    router.use(route.path, route.route);
});
exports.default = router;
