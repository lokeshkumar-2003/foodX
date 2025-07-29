import { Router } from "express";

import {
  generateInvoice,
  getOrders,
  getSnackList,
  orderSnacks,
} from "../controllers/snack.js";

const router = Router();

router.get("/snacks", getSnackList);
router.post("/orders", orderSnacks);
router.get("/user/orders", getOrders);
router.get("/invoice/recipet/:orderId", generateInvoice);

export default router;
