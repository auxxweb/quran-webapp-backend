import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import uniqid from "uniqid";
import store from "store";

import Zone from "../../models/zones";

export const uploadZoneDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, description, image } = req.body;

    if (!name || !description || !image) {
      res.status(400);
      throw new Error("Please enter all the fields");
    }
    const regExp = new RegExp(`^${name}$`);

    const existZone = await Zone.findOne({
      name: { $regex: regExp, $options: "" },
      isDeleted: false,
    });
    if (existZone) {
      res.status(400);
      throw new Error(`${name} zone already exists`);
    }
    let tx_uuid = uniqid();
    store.set("uuid", { tx: tx_uuid });
    const zone = await Zone.create({ ...req.body, url: `/${name}/${tx_uuid}` });
    if (!zone) {
      res.status(400);
      throw new Error("Zone upload failed");
    }

    res.status(201).json({
      success: true,
      msg: "Zone details successfully uploaded",
    });
  }
);

// PATCH || update Zone details
export const updateZoneDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { zoneId, name } = req.body;

    if (!zoneId) {
      res.status(400);
      throw new Error("Zone Id  not found");
    }
    if (name) {
      const zone = await Zone.findOne({
        _id: zoneId,
        isDeleted: false,
      });
      if (!zone) {
        res.status(404);
        throw new Error("Zone not found");
      }

      if (zone.name !== name) {
        const regExp = new RegExp(`^${name}$`);

        const existZone = await Zone.findOne({
          name: { $regex: regExp, $options: "" },
          isDeleted: false,
        });

        if (existZone) {
          res.status(400);
          throw new Error("This zone already exists");
        }
      }
    }

    const updatedZone = await Zone.findOneAndUpdate(
      { _id: zoneId, isDeleted: false },
      req.body,
      { new: true }
    );
    if (!updatedZone) {
      res.status(400);
      throw new Error("Zone not updated");
    }

    res.status(200).json({
      success: true,
      msg: "Zone details successfully updated",
    });
  }
);

// DELETE ||  delete zone details

export const deleteZoneDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { zoneId } = req.query;

    if (!zoneId) {
      res.status(400);
      throw new Error("zoneId not found");
    }

    const zone = await Zone.findByIdAndUpdate(
      { _id: zoneId },
      {
        isDeleted: true,
      },
      { new: true }
    );
    if (!zone) {
      res.status(400);
      throw new Error("Deletion failed");
    }

    res.status(200).json({
      success: true,
      msg: `${zone?.name} successfully deleted`,
    });
  }
);

// GET || get Zone details
export const getZoneDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as string) === "asc" ? 1 : -1;
    const searchData = (req.query.search as string) || "";
    const query: any = { isDeleted: false };
    if (searchData !== "") {
      query.name = { $regex: new RegExp(`^${searchData}.*`, "i") };
    }

    const zones = await Zone.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit);
    const totalDocuments = await Zone.countDocuments(query);

    res.status(200).json({
      success: true,
      zones: zones || [],
      currentPage: page,
      totalPages: Math.ceil(totalDocuments / limit),
      msg: "Zone details successfully retrieved",
    });
  }
);

// GET || get Zones names and ids
export const getAllZonesNames = asyncHandler(
  async (req: Request, res: Response) => {
    const zones = await Zone.find({ isDeleted: false }, { name: 1 });

    res.status(200).json({
      success: true,
      zones: zones || [],
      msg: "Zone details successfully retrieved",
    });
  }
);
