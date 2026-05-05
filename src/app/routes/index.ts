import express from 'express';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { userRouter } from '../modules/user/user.router';
import { ItemDonation } from '../modules/itemDonation/itemDonation.router';
import { donationRouter } from '../modules/donation/donation.router';
import { paymentRouter } from '../modules/payment/payment.route';
import { campaignRouter } from '../modules/campain/campain.router';
import { BannerRouter } from '../modules/banner/banner.router';
import { CharityRouter } from '../modules/charity/charity.router';
import { CharityInquiryRouter } from '../modules/charityInquiry/charityInquiry.router';


const router = express.Router();

type Route = {
  path: string;
  route: express.Router;
};

const routes: Route[] = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/users',
    route: userRouter,
  },
  {
    path: '/campaign',
    route: campaignRouter,
  },
  {
    path: '/item-donation',
    route: ItemDonation,
  },
  {
    path: '/donation',
    route: donationRouter,
  },
  {
    path: '/payment',
    route: paymentRouter,
  },
  {
    path: '/banner',
    route: BannerRouter,
  },
  {
    path: '/charity',
    route: CharityRouter,
  },
  {
    path: '/charity-inquiry',
    route: CharityInquiryRouter,
  },
];
routes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
