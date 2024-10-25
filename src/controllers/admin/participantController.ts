import { Request, Response } from 'express'
import asyncHandler from 'express-async-handler'
import Participant from '../../models/participant'
import Result from '../../models/result'
import mongoose from 'mongoose'

export const uploadParticipantDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, phone, address, gender, zone, age } = req.body
    const { image }: any = req.files || {}
    const imageUrl = image && image[0]?.location
    if (!name || !email || !phone || !address || !gender || !zone || !age) {
      res.status(400)
      throw new Error('Please enter all the fields')
    }

    const existParticipant = await Participant.findOne({
      email,
      isDeleted: false,
      zone: new mongoose.Types.ObjectId(String(zone)),
    })
    if (existParticipant) {
      res.status(400)
      throw new Error(`${email} Participant already exists`)
    }

    const participant = await Participant.create({
      ...req.body,
      image: imageUrl && imageUrl,
    })
    if (!participant) {
      res.status(400)
      throw new Error('Participant upload failed')
    }

    res.status(201).json({
      success: true,
      msg: 'Participant details successfully uploaded',
    })
  },
)

// PATCH || update Participant details
export const updateParticipantDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { participantId, email } = req.body
    const { image }: any = req.files || {}
    const imageUrl = image && image[0]?.location
    if (!participantId) {
      res.status(400)
      throw new Error('Participant Id  not found')
    }
    if (email) {
      const participant = await Participant.findOne({
        _id: participantId,
        isDeleted: false,
      })
      if (!participant) {
        res.status(404)
        throw new Error('Participant not found')
      }

      if (participant.email !== email) {
        const existParticipant = await Participant.findOne({
          email,
          isDeleted: false,
        })

        if (existParticipant) {
          res.status(400)
          throw new Error('This email already used')
        }
      }
    }

    const updatedParticipant = await Participant.findOneAndUpdate(
      { _id: participantId, isDeleted: false },
      { ...req.body, image: imageUrl && imageUrl },
      { new: true },
    )
    if (!updatedParticipant) {
      res.status(400)
      throw new Error('Participant not updated')
    }

    res.status(200).json({
      success: true,
      msg: 'Participant details successfully updated',
    })
  },
)

// DELETE ||  delete Participant details

export const deleteParticipantDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { participantId } = req.query

    if (!participantId) {
      res.status(400)
      throw new Error('participantId not found')
    }

    const isInLiveCompetition = await Result.findOne({
      participant_id: new mongoose.Types.ObjectId(String(participantId)),
      isCompleted: false,
      isDeleted: false,
    })

    if (isInLiveCompetition) {
      res.status(400)
      throw new Error('The Participant is already in a live competition')
    }

    const participant = await Participant.findByIdAndUpdate(
      { _id: participantId },
      {
        isDeleted: true,
      },
      { new: true },
    )
    if (!participant) {
      res.status(400)
      throw new Error('Deletion failed')
    }

    res.status(200).json({
      success: true,
      msg: `${participant?.name} successfully deleted`,
    })
  },
)

// GET || get Participant details
export const getParticipantDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const sortBy = (req.query.sortBy as string) || 'createdAt'
    const sortOrder = (req.query.sortOrder as string) === 'asc' ? 1 : -1
    const searchData = (req.query.search as string) || ''
    const zones = (req.query.zones as any) || ''

    const query: any = { isDeleted: false }
    if (searchData !== '') {
      query.name = { $regex: new RegExp(`^${searchData}.*`, 'i') }
    }
    if (zones !== '') {
      query.zone = { $in: zones }
    }

    const participant = await Participant.find(query)
      .populate('zone')
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
    const totalDocuments = await Participant.countDocuments(query)

    res.status(200).json({
      success: true,
      participant: participant || [],
      currentPage: page,
      totalPages: Math.ceil(totalDocuments / limit),
      msg: 'Participant details successfully retrieved',
    })
  },
)

// GET || get single Participant details
export const getSingleParticipantDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { participantId } = req.params
    if (!participantId) {
      res.status(400)
      throw new Error('participantId is required')
    }
    const participant = await Participant.findOne({
      _id: participantId,
      isDeleted: false,
    }).populate('zone')
    if (!participant) {
      res.status(400)
      throw new Error('Participant not found')
    }

    const competitions = await Result.find({
      participant: participantId,
      isDeleted: false,
    })
      .populate('zone')
      .populate('participant')
      .populate({
        path: 'results',
        populate: [
          {
            path: 'question',
            model: 'Question',
          },
          {
            path: 'responses.judge',
            model: 'Judge',
          },
        ],
      })
    res.status(200).json({
      success: true,
      participant: participant,
      competitions: competitions || [],
      msg: 'Participant details successfully retrieved',
    })
  },
)
