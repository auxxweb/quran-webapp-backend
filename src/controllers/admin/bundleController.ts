import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Bundle from "../../models/bundle";
import { createBundleId } from "../../utils/app.utils";
import Result from "../../models/result";
import mongoose from "mongoose";

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
    const bundle = await Bundle.create({
      ...req.body,
      bundleId: await createBundleId(),
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
    const { id, title } = req.body;

    if (!id) {
      res.status(400);
      throw new Error("Bundle Id  not found");
    }
    if (title) {
      const bundle = await Bundle.findOne({
        _id: id,
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
      { _id: id, isDeleted: false },
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
    const isInLiveCompetition = await Result.findOne({
      bundle_id: new mongoose.Types.ObjectId(String(bundleId)),
      isCompleted: false,
      isDeleted: false,
    })

    if (isInLiveCompetition) {
      res.status(400)
      throw new Error('This bundle is already using in a live competition')
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

    const bundles = await Bundle.find(query).populate({
      path: 'questions',
      match: { isDeleted: false },
      options: { sort: { createdAt: -1 } }, // Sort by createdAt in ascending order (oldest first)
    })
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
      path: 'questions',
      match: { isDeleted: false },
      options: { sort: { createdAt: -1 } }, // Sort by createdAt in ascending order (oldest first)
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

