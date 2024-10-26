import { Request, Response } from 'express'
import asyncHandler from 'express-async-handler'
import uniqid from 'uniqid'
import store from 'store'

import Zone from '../../models/zones'
import mongoose from 'mongoose'
import Result from '../../models/result'
import Judge from '../../models/judge'
import Participant from '../../models/participant'

export const uploadZoneDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, description } = req.body
    if (!name || !description) {
      res.status(400)
      throw new Error('Please enter all the fields')
    }
    const regExp = new RegExp(`^${name.trim()}$`)

    const existZone = await Zone.findOne({
      name: { $regex: regExp, $options: 'i' },
      isDeleted: false,
    })
    if (existZone) {
      res.status(400)
      throw new Error(`${name} zone already exists`)
    }
    let tx_uuid = uniqid()
    store.set('uuid', { tx: tx_uuid })
    const zone = await Zone.create({ ...req.body, url: `${tx_uuid}` })
    if (!zone) {
      res.status(400)
      throw new Error('Zone upload failed')
    }

    res.status(201).json({
      success: true,
      msg: 'Zone details successfully uploaded',
    })
  },
)

// PATCH || update Zone details
export const updateZoneDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { zoneId, name } = req.body

    if (!zoneId) {
      res.status(400)
      throw new Error('Zone Id  not found')
    }
    if (name) {
      const zone = await Zone.findOne({
        _id: zoneId,
        isDeleted: false,
      })
      if (!zone) {
        res.status(404)
        throw new Error('Zone not found')
      }

      if (zone.name !== name) {
        const regExp = new RegExp(`^${name}$`)

        const existZone = await Zone.findOne({
          name: { $regex: regExp, $options: '' },
          isDeleted: false,
        })

        if (existZone) {
          res.status(400)
          throw new Error('This zone already exists')
        }
      }
    }

    const updatedZone = await Zone.findOneAndUpdate(
      { _id: zoneId, isDeleted: false },
      { ...req.body },
      { new: true },
    )
    if (!updatedZone) {
      res.status(400)
      throw new Error('Zone not updated')
    }

    res.status(200).json({
      success: true,
      msg: 'Zone details successfully updated',
    })
  },
)

// DELETE ||  delete zone details

export const deleteZoneDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { zoneId } = req.query

    if (!zoneId) {
      res.status(400)
      throw new Error('zoneId not found')
    }

    const isInLiveCompetition = await Result.findOne({
      zone: new mongoose.Types.ObjectId(String(zoneId)),
      isCompleted: false,
      isDeleted: false,
    })

    if (isInLiveCompetition) {
      res.status(400)
      throw new Error("Live competition in this zone; can't delete.")
    }

    try {
      // Update the zone to mark it as deleted
      const updatedZone = await Zone.findByIdAndUpdate(
        zoneId,
        { isDeleted: true },
        { new: true }
      );
    
      // Update judges and participants in parallel
     await Promise.all([
        Judge.updateMany(
          { zone: new mongoose.Types.ObjectId(String(zoneId)) },
          { isDeleted: true }
        ),
        Participant.updateMany(
          { zone: new mongoose.Types.ObjectId(String(zoneId)) },
          { isDeleted: true }
        ),
      ]);
    
      res.status(200).json({
        success: true,
        msg: `${updatedZone?.name} zone successfully deleted`,
      })
    } catch (error) {
      // Rollback changes if an error occurs
      await Promise.all([
        Zone.findByIdAndUpdate(zoneId, { isDeleted: false }),
        Judge.updateMany(
          { zone: new mongoose.Types.ObjectId(String(zoneId)) },
          { isDeleted: true }
        ),
        Participant.updateMany(
          { zone: new mongoose.Types.ObjectId(String(zoneId)) },
          { isDeleted: true }
        ),
      ]);
    
      res.status(400).json({ message: 'Deletion failed' });
    }
    

    // if (!zone) {
    //   res.status(400)
    //   throw new Error('Deletion failed')
    // }
  },
)

// GET || get Zone details
export const getZoneDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const sortBy = (req.query.sortBy as string) || 'createdAt'
    const sortOrder = (req.query.sortOrder as string) === 'asc' ? 1 : -1
    const searchData = (req.query.search as string) || ''
    const query: any = { isDeleted: false }
    if (searchData !== '') {
      query.name = { $regex: new RegExp(`^${searchData}.*`, 'i') }
    }

    const zones = await Zone.aggregate([
      // Match the initial query
      { $match: query },
      
      // Lookup judges to check for main judges
      {
        $lookup: {
          from: 'judges', // Make sure this matches your Judge collection name
          localField: '_id',
          foreignField: 'zone',
          as: 'judges'
        }
      },
      
      // Add a field to check for main judges
      {
        $addFields: {
          mainJudge: {
            $gt: [{ $size: { $filter: { input: '$judges', cond: { $eq: ['$$this.isMain', true] } } } }, 0]
          }
        }
      },
    
      // Sort the results
      { $sort: { [sortBy]: sortOrder } },
    
      // Paginate the results
      { $skip: (page - 1) * limit },
      { $limit: limit }
    ]);
    
    const totalDocuments = await Zone.countDocuments(query);

    console.log(zones,"zones");
    
    

    res.status(200).json({
      success: true,
      zones: zones || [],
      currentPage: page,
      totalPages: Math.ceil(totalDocuments / limit),
      msg: 'Zone details successfully retrieved',
    })
  },
)

// GET || get Zones names and ids
export const getAllZonesNames = asyncHandler(
  async (req: Request, res: Response) => {
    const zones = await Zone.find({ isDeleted: false }, { name: 1 })

    res.status(200).json({
      success: true,
      zones: zones || [],
      msg: 'Zone details successfully retrieved',
    })
  },
)
