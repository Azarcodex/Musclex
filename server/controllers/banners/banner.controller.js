import {
  createBannerService,
  deleteBannerService,
  getActiveBannerService,
  updateBannerService,
} from "../../services/banner.service.js";
/**
 * CREATE
 */
export const createBanner = async (req, res) => {
  try {
    const payload = { ...req.body, image: req.file?.filename };
    const banner = await createBannerService(payload);
    res.status(201).json({ success: true, data: banner });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * READ
 */
export const getBanners = async (req, res) => {
  try {
    const banners = await getActiveBannerService();
    res.json({ success: true, data: banners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * UPDATE
 */
export const updateBanner = async (req, res) => {
  try {
    let payload = { ...req.body };
    if (req.file) {
      payload = { ...req.body, image: req.file?.filename };
    }
    const banner = await updateBannerService(req.params.id, payload);
    res.json({ success: true, data: banner });
  } catch (error) {
    console.log(error);
    res.status(404).json({ success: false, message: error.message });
  }
};

/**
 * DELETE
 */
export const deleteBanner = async (req, res) => {
  try {
    await deleteBannerService(req.params.id);
    res.json({ success: true, message: "Banner deleted" });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};
