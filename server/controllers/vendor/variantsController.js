import Product from "../../models/products/Product.js";
import Variant from "../../models/products/Variant.js";

export const getVariantsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const variants = await Variant.find({ productId });

    res.json({ success: true, variants });
  } catch (error) {
    console.error("Error fetching variants:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
export const addVariant = async (req, res) => {
  try {
    console.log(req.body);
    const { productId, flavour, sku } = req.body;
    const payload = JSON.parse(req.body.size);
    // console.log(payload);
    // console.log(payload);
    // console.log(req.files)
    // attach uploaded image URLs
    // if (req.files && req.files.length > 0) {
    //   payload.images = req.files.map((f) => `/uploads/${f.filename}`);
    // }
    // const variant = new Variant({
    //   productId: productId,
    //   flavour: flavour,
    //   size: payload,
    //   sku: sku,
    //   images: req.files.map((f) => `/uploads/${f.filename}`),
    // });

    // await variant.save();

    // res.status(201).json({ success: true, variant, message: "variant added" });
    // if (!productId || !flavour || !size?.length) {
    //   return res
    //     .status(400)
    //     .json({ success: false, message: "Missing fields" });
    // }
    const uploadedImages = req.files?.length
      ? req.files.map((f) => `/uploads/${f.filename}`)
      : [];
    const existingVariant = await Variant.findOne({ productId, flavour });
    if (existingVariant) {
      for (const s of payload) {
        const alreadyExist = existingVariant.size.some(
          (existingSize) => existingSize.label === s.label
        );
        if (!alreadyExist) {
          existingVariant.size.push(s);
        }
      }
      uploadedImages.forEach((img) => {
        if (!existingVariant.images.includes(img)) {
          existingVariant.images.push(img);
        }
      });
      await existingVariant.save();
      return res.status(200).json({
        success: true,
        message: "Variant updated with new size",
        variant: existingVariant,
      });
    }
    const newVariant = new Variant({
      productId,
      flavour,
      sku:sku,
      size: payload,
      images: uploadedImages,
    });

    await newVariant.save();

    return res.status(201).json({
      success: true,
      message: "New variant created successfully",
      variant: newVariant,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: error.message });
  }
};
export const relatedProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    console.log(productId);
    const product = await Product.findById(productId)
      .populate("catgid", "catgName")
      .populate("brandID", "brand_name");
    if (!product) {
      return res.status(401).json({ message: "product not found" });
    }
    res.status(200).json({ success: true, product: product });
  } catch (e) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const EditVariant = async (req, res) => {
  try {
    const { variantId } = req.params;
    const { flavour } = req.body;
    const payload = JSON.parse(req.body.size);
    const files = req.files;
    console.log(payload, files);
    const variant = await Variant.findById(variantId);
    if (!variant) {
      return res
        .status(404)
        .json({ success: false, message: "Variant not found" });
    }
    if (files && files.length > 0) {
      const new_image = files.map((file) => `/uploads/${file.filename}`);
      variant.images = [...variant.images, ...new_image];
    }
    if (flavour) {
      variant.flavour = flavour;
    }
    if (payload) {
      variant.size = payload;
    }
    await variant.save();
    res.status(200).json({ success: true, message: "Updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "internal server error" });
  }
};
//
export const editVariantImage = async (req, res) => {
  try {
    const { variantId, src } = req.body.variantId;
    console.log(variantId, src);
    const variant = await Variant.findById(variantId);
    if (!variant) {
      return res.status(401).json({ message: "Image not found" });
    }
    variant.images = variant.images.filter((i) => i !== src);
    await variant.save();
  } catch (e) {
    console.log(e);
    res
      .status(500)
      .json({ success: false, message: "Internal server occurred" });
  }
};
