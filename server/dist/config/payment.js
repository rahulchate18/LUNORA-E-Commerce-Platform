import dotenv from "dotenv";
import Razorpay from "razorpay";
import { logger } from "./logger.js";
dotenv.config();
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "rzp_test_mockKeyId123";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "mockSecretKey456";
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    logger.warn("RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing from environment. Payment module operating in test sandbox mode.");
}
export const razorpayConfig = {
    keyId: RAZORPAY_KEY_ID,
    keySecret: RAZORPAY_KEY_SECRET,
    isMockMode: !process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET,
};
export const razorpay = new Razorpay({
    key_id: razorpayConfig.keyId,
    key_secret: razorpayConfig.keySecret,
});
//# sourceMappingURL=payment.js.map