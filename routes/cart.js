const express = require("express");
const router = express.Router();
const cartCollection = require("../models/cartModel");
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  //console.log('enter verify')

  const bearerHeader = req.header("Authorization");
  //console.log('bearerHeader',bearerHeader);

  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    req.token = bearerToken;
    //console.log(req.token)
    jwt.verify(req.token, "your_jwt_secret", (err, authData) => {
      if (err) {
        res.status(200).json({ err, statis: false });
      } else {
        req.authData = authData;
        next();
      }
    });
  } else {
    res.status(200).json({ err: "bearerHeader undefined", statis: false });
  }
};

router.post("/add", verifyToken, async (req, res) => {
  const cartData = req.body;
  const { _id } = cartData;
  const userId = req.authData.user.id;
  const existCartItem = await cartCollection.findOne({
    userId,
    productId: _id,
  });

  try {
    if (existCartItem === null) {
      const newCartItem = new cartCollection({
        name: cartData.productName,
        category: cartData.category,
        subcategory: cartData.subcategory,
        price: cartData.price,
        image: cartData.image,
        productId: cartData._id,
        userId,
        cartQuantity: 1,
        total: cartData.price,
      });
      await newCartItem.save();
      res.json({ status: true, message: "product successfully added" });
    } else {
      existCartItem.cartQuantity += 1;
      existCartItem.total = cartData.price * existCartItem.cartQuantity;
      await existCartItem.save();
      res.json({ status: true, message: "product successfully added" });
    }
  } catch (err) {
    res.json({ status: false, message: "somthing went wrong!" });
  }
});

router.post("/view", verifyToken, async (req, res) => {
  try {
    const userId = req.authData.user.id;
    // console.log(userId);
    const data = await cartCollection.find({ userId });
    // console.log(data)
    if (!data) {
      res.json({ message: "error occur while fetching cart List" });
    } else {
      res.json({ data: data, message: "successfully fetch cart list" });
    }
  } catch (err) {
    res.json({ status: false, message: err });
  }
});

router.delete("/del/:id", verifyToken, async (req, res) => {
  //console.log('enter delete')
  const { id } = req.params;
  //console.log(id)
  try {
    const userId = req.authData.user.id;
    //console.log(userId);
    const findCart = await cartCollection.findByIdAndDelete({
      userId,
      _id: id,
    });
    // console.log(findCart)
    if (!findCart) {
      res.json({ message: "cart Item not found", status: false });
    } else {
      res.json({
        data: findCart,
        message: "cart Item successfully deleted",
        status: true,
      });
    }
  } catch (err) {
    res.json({ status: false, message: err });
  }
});

// router.put('/update', async (req, res) => {
//     const { id, operation } = req.body;
//     console.log(id, operation)
//     try {
//         let findCart;

//         if (operation === "inc") {
//             findCart = await cartCollection.findByIdAndUpdate({ _id: id },
//                 {
//                     cartQuantity: cartQuantity + 1,
//                     total: total + price
//                 });

//         }
//         if (operation === "dec") {
//             findCart = await cartCollection.findByIdAndUpdate({ _id: id },
//                 {
//                     cartQuantity: cartQuantity - 1,
//                     total: total + price
//                 });

//         }

//         console.log(findCart)

//         if (!findCart) {

//             res.json({ message: "cart Item not found", status: false })
//         } else {
//             res.json({ data: findCart, message: "cart Item successfully updated", status: true })
//         }

//     } catch (err) {
//         res.json({ status: false, message: err })
//     }

// })

router.put("/update", async (req, res) => {
  const { id, operation } = req.body;
  console.log(id, operation);

  try {
    let findCart;

    if (operation === "inc") {
      findCart = await cartCollection.findByIdAndUpdate({ _id: id });
      findCart.cartQuantity = findCart.cartQuantity + 1;
      findCart.total = findCart.total + findCart.price;
      await findCart.save();
    } else if (operation === "dec") {
      findCart = await cartCollection.findByIdAndUpdate({ _id: id });
      findCart.cartQuantity = findCart.cartQuantity - 1;
      findCart.total = findCart.total - findCart.price;
      await findCart.save();
    } else {
      return res.json({
        status: false,
        message: "Invalid operation specified",
      });
    }

    if (!findCart) {
      return res.json({ message: "Cart item not found", status: false });
    }

    return res.json({
      data: findCart,
      message: "Cart item successfully updated",
      status: true,
    });
  } catch (err) {
    console.error("Error updating cart item:", err);
    return res.json({ status: false, message: err.message });
  }
});

module.exports = router;
