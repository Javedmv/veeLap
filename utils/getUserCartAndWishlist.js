const mongoose = require("mongoose");
const userModel = require("../models/userModel")

async function getUserCartAndWishlist(userId) {
  const objectId = new mongoose.Types.ObjectId(userId);

  const result = await userModel.aggregate([
    { $match: { _id: objectId } },
    {
      $facet: {
        cart: [
          {
            $lookup: {
              from: "carts",
              localField: "_id",
              foreignField: "userId",
              as: "cartData"
            }
          },
          {
            $project: {
              cartCount: {
                $size: {
                  $ifNull: [
                    { $arrayElemAt: ["$cartData.products", 0] },
                    [] // 👈 fallback to empty array if missing
                  ]
                }
              }
            }
          }
        ],
        wishlist: [
          {
            $lookup: {
              from: "wishlists",
              localField: "_id",
              foreignField: "userId",
              as: "wishlistData"
            }
          },
          {
            $project: {
              wishlistCount: {
                $size: {
                  $ifNull: [
                    { $arrayElemAt: ["$wishlistData.products", 0] },
                    [] // 👈 fallback to empty array
                  ]
                }
              }
            }
          }
        ]
      }
    },
    {
      $project: {
        cartCount: { $ifNull: [{ $arrayElemAt: ["$cart.cartCount", 0] }, 0] },
        wishlistCount: { $ifNull: [{ $arrayElemAt: ["$wishlist.wishlistCount", 0] }, 0] }
      }
    }
  ]);

  return result[0] || { cartCount: 0, wishlistCount: 0 };
}


module.exports = getUserCartAndWishlist