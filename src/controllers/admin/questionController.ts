import { Request, Response } from 'express'
import asyncHandler from 'express-async-handler'
import Question from '../../models/question'
import { createQuestionId } from '../../utils/app.utils'
import mongoose, { FilterQuery } from 'mongoose'
import Answer from '../../models/answers'

export const uploadQuestionDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { question, answer } = req.body

    if (!question || !answer) {
      res.status(400)
      throw new Error('Please enter all the fields')
    }
    const regExp = new RegExp(`^${question}$`)

    const existQuestion = await Question.findOne({
      question: { $regex: regExp, $options: '' },
      isDeleted: false,
    })
    if (existQuestion) {
      res.status(400)
      throw new Error(`This question already exists`)
    }
    const newQuestion = await Question.create({
      ...req.body,
      questionId: await createQuestionId(),
    })
    if (!newQuestion) {
      res.status(400)
      throw new Error('Question upload failed')
    }

    res.status(201).json({
      success: true,
      msg: 'Question details successfully uploaded',
    })
  },
)

// PATCH || update Question details

export const updateQuestionDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { id, question } = req.body

    if (!id) {
      res.status(400)
      throw new Error('Question Id  not found')
    }
    if (question) {
      const existingQuestion = await Question.findOne({
        _id: id,
        isDeleted: false,
      })
      if (!existingQuestion) {
        res.status(404)
        throw new Error('Zone not found')
      }

      if (existingQuestion.question !== question) {
        const regExp = new RegExp(`^${question}$`)

        const existQuestion = await Question.findOne({
          question: { $regex: regExp, $options: '' },
          isDeleted: false,
        })

        if (existQuestion) {
          res.status(400)
          throw new Error('This Question already exists')
        }
      }
    }

    const updatedQuestion = await Question.findOneAndUpdate(
      { _id: id, isDeleted: false },
      req.body,
      { new: true },
    )
    if (!updatedQuestion) {
      res.status(400)
      throw new Error('Question not updated')
    }

    res.status(200).json({
      success: true,
      msg: 'Question details successfully updated',
    })
  },
)

// DELETE ||  delete question details

export const deleteQuestionDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { questionId } = req.query

    if (!questionId) {
      res.status(400)
      throw new Error('questionId not found')
    }
    const isInLiveCompetition = await Answer.findOne({
      question_id: new mongoose.Types.ObjectId(String(questionId)),
      isCompleted: false,
      isDeleted: false,
    })

    if (isInLiveCompetition) {
      res.status(400)
      throw new Error('This question is already using in a live competition')
    }
    const question = await Question.findByIdAndUpdate(
      { _id: questionId },
      {
        isDeleted: true,
      },
      { new: true },
    )
    if (!question) {
      res.status(400)
      throw new Error('Deletion failed')
    }

    res.status(200).json({
      success: true,
      msg: `${question?.questionId} successfully deleted`,
    })
  },
)

// GET || get Question details
export const getQuestionDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const sortBy = (req.query.sortBy as string) || 'createdAt'
    const sortOrder = (req.query.sortOrder as string) === 'asc' ? 1 : -1
    let query: FilterQuery<typeof Question> = { isDeleted: false }
    const searchTerm = (req.query.search as string) || ''

    if (searchTerm) {
      console.log(searchTerm, 'searchTerm')

      // Normalize and escape searchTerm
      const normalizedSearchTerm = String(searchTerm).normalize('NFC')
      const escapedSearchTerm = normalizedSearchTerm.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&',
      ) // Escape special regex characters

      console.log(
        normalizedSearchTerm,
        'normalized',
        escapedSearchTerm,
        'escaped',
      )

      // Add regex conditions if escapedSearchTerm is not empty
      if (escapedSearchTerm) {
        query = {
          ...query,
          $or: [
            {
              question: {
                $regex: new RegExp(escapedSearchTerm, 'i'),
              },
            },
            {
              questionId: {
                $regex: new RegExp(escapedSearchTerm, 'i'),
              },
            },
          ],
        }
      }
    }

    // Log the final query for debugging
    console.log(query.$or, 'Final Query')

    // Set collation based on the detected language
    const locale = /^[\u0600-\u06FF]/.test(searchTerm)
      ? 'ar'
      : /^[\u0D00-\u0D7F]/.test(searchTerm)
      ? 'ml'
      : 'en'

    const questions = await Question.find(query)
      .collation({ locale, strength: 2 }) // Use appropriate collation for the detected language
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)

    const totalDocuments = await Question.countDocuments(query)

    res.status(200).json({
      success: true,
      questions: questions || [],
      currentPage: page,
      totalPages: Math.ceil(totalDocuments / limit),
      msg: 'Questions details successfully retrieved',
    })
  },
)

// GET || get question  and ids
export const getAllQuestionsNames = asyncHandler(
  async (req: Request, res: Response) => {
    const questions = await Question.find(
      { isDeleted: false },
      { question: 1, questionId: 1 },
    )

    res.status(200).json({
      success: true,
      questions: questions || [],
      msg: 'Question details successfully retrieved',
    })
  },
)

// GET || get single Question details
export const getSingleQuestionDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { questionId } = req.params
    if (!questionId) {
      res.status(400)
      throw new Error('questionId is required')
    }
    const question = await Question.findOne({
      _id: questionId,
      isDeleted: false,
    })

    if (!question) {
      res.status(400)
      throw new Error('Question not found')
    }
    res.status(200).json({
      success: true,
      question: question,
      msg: 'Question details successfully retrieved',
    })
  },
)
