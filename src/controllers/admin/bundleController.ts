import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import uniqid from "uniqid";
import store from "store";
import Bundle from "../../models/bundle";

export const uploadBundleDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { questions, title } = req.body;

    if (!questions || !title) {
      res.status(400);
      throw new Error("Please enter all the fields");
    }
    const regExp = new RegExp(`^${title}$`);

    const existBundle = await Bundle.findOne({
      title: { $regex: regExp, $options: "" },
      isDeleted: false,
    });
    if (existBundle) {
      res.status(400);
      throw new Error(`This bundle title already exists`);
    }
    let tx_uuid = uniqid();
    store.set("uuid", { tx: tx_uuid });
    const bundle = await Bundle.create({
      ...req.body,
      bundleId: tx_uuid,
    });
    if (!bundle) {
      res.status(400);
      throw new Error("Bundle upload failed");
    }

    res.status(201).json({
      success: true,
      msg: "Bundle details successfully uploaded",
    });
  }
);

// PATCH || update Bundle details

export const updateBundleDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { bundleId, title } = req.body;

    if (!bundleId) {
      res.status(400);
      throw new Error("Bundle Id  not found");
    }
    if (title) {
      const bundle = await Bundle.findOne({
        _id: bundleId,
        isDeleted: false,
      });
      if (!bundle) {
        res.status(404);
        throw new Error("Bundle not found");
      }

      if (bundle.title !== title) {
        const regExp = new RegExp(`^${title}$`);

        const existBundle = await Bundle.findOne({
          title: { $regex: regExp, $options: "" },
          isDeleted: false,
        });

        if (existBundle) {
          res.status(400);
          throw new Error("This bundle title already exists");
        }
      }
    }

    const updatedBundle = await Bundle.findOneAndUpdate(
      { _id: bundleId, isDeleted: false },
      req.body,
      { new: true }
    );
    if (!updatedBundle) {
      res.status(400);
      throw new Error("Bundle not updated");
    }

    res.status(200).json({
      success: true,
      msg: "Bundle details successfully updated",
    });
  }
);

// DELETE ||  delete Bundle details

export const deleteBundleDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { bundleId } = req.query;

    if (!bundleId) {
      res.status(400);
      throw new Error("bundleId not found");
    }

    const bundle = await Bundle.findByIdAndUpdate(
      { _id: bundleId },
      {
        isDeleted: true,
      },
      { new: true }
    );
    if (!bundle) {
      res.status(400);
      throw new Error("Deletion failed");
    }

    res.status(200).json({
      success: true,
      msg: `${bundle?.bundleId} successfully deleted`,
    });
  }
);

// GET || get Bundle details
export const getBundleDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as string) === "asc" ? 1 : -1;
    const searchData = (req.query.search as string) || "";
    const query: any = { isDeleted: false };
    if (searchData !== "") {
      query.bundleId = { $regex: new RegExp(`^${searchData}.*`, "i") };
    }

    const bundles = await Bundle.find(query).populate("questions")
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit);
    const totalDocuments = await Bundle.countDocuments(query);

    res.status(200).json({
      success: true,
      bundles: bundles || [],
      currentPage: page,
      totalPages: Math.ceil(totalDocuments / limit),
      msg: "Bundles details successfully retrieved",
    });
  }
);


// GET || get single Bundle details
export const getSingleBundleDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { bundleId } = req.params;
    if (!bundleId) {
      res.status(400);
      throw new Error("bundleId is required");
    }
    const bundle = await Bundle.findOne({ _id: bundleId, isDeleted: false })
      .populate({
        path: "questions",
      });
    if (!bundle) {
      res.status(400);
      throw new Error("Bundle not found");
    }
    res.status(200).json({
      success: true,
      bundle: bundle,
      msg: "Bundle details successfully retrieved",
    });
  }
);

