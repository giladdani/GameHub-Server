import express from 'express';
import { StatusCodes } from 'http-status-codes';
// @ts-ignore
import utils from '../utils.ts';
// @ts-ignore
import giftCodesDAL from '../DAL/GiftCodesDAL.ts';
// @ts-ignore
import usersDAL from '../DAL/UsersDAL.ts';
let router = express.Router()

async function generate_gift_code(req:any, res:any) {
    // TODO: verify that the requesting user is an admin
    const newCode = (Math.random() + 1).toString(36).slice(2,7);
    // TODO: check if code exists already and generate again if needed
    // TODO: check if the db insertion succeeded or failed
    const dbResponse = await giftCodesDAL.insert_gift_code({code: newCode, expired: false, amount: req.body.amount});
    res.status(StatusCodes.CREATED).send(newCode);
}

async function redeem_gift_code(req:any, res:any) {
    const foundCode = await giftCodesDAL.find_gift_code(req.body.code);
    if(foundCode) {
        // TODO: check that DB operations were successful
        await usersDAL.add_user_balance(req.username, foundCode.amount!);
        await giftCodesDAL.update_code_expired(foundCode, true);
        res.sendStatus(StatusCodes.OK);
    }
    else{
        res.status(StatusCodes.NOT_FOUND).send("Gift code not found");
    }
}

async function delete_expired_gift_codes(req:any, res:any) {
    const response = await giftCodesDAL.delete_expired_gift_codes();
    res.send(response);
}

router.post('/', utils.authenticate_token, (req, res) => { generate_gift_code(req, res) })
router.put('/', utils.authenticate_token, (req, res) => { redeem_gift_code(req, res) })
router.delete('/expired', (req, res) => { delete_expired_gift_codes(req, res) })

// module.exports = router;
export default router;