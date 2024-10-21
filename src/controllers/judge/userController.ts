import { NextFunction, Request, Response } from 'express'
import mongoose from 'mongoose'
import { plainToClass } from 'class-transformer'
import { validate } from 'class-validator'

import Participant from '../../models/participant'
import Result from '../../models/result'
import Answer from '../../models/answers'
import Bundle from '../../models/bundle'

import { handleValidationErrors } from '../../utils/handleValidationErrors'
import { ResultDto } from '../../dto/resultDto'
import { AnswersDto } from '../../dto/answers'
import Judge from '../../models/judge'

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { currentPage = 1, pageSize = 10, search } = req.query
    const page = parseInt(currentPage as string) || 1
    const limit = parseInt(pageSize as string) || 10
    const skip = (page - 1) * limit
    const zone = req.judge.zone
    const searchRegex = new RegExp(search as string, 'i')

    const query = {
      $and: [
        { zone },
        {
          $or: [
            { name: searchRegex },
            { email: searchRegex },
            { address: searchRegex },
          ],
        },
      ],
    }

    const participants = await Participant.find(query).skip(skip).limit(limit)

    const total = await Participant.countDocuments(query)

    return res.status(200).json({
      message: 'Participants fetched successfully',
      currentPage: page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      participants,
      success: true,
    })
  } catch (error) {
    next(error)
  }
}

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const participant = await Participant.findOne({ _id: req.params.id })
    if (!participant) {
      return res.status(404).json({
        message: 'participant not found',
        success: false,
      })
    }

    return res.status(200).json({
      message: 'participant fetched successfully',
      participant: participant,
      success: true,
    })
  } catch (error) {
    next(error)
  }
}

export const proceedToQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result_dto = plainToClass(ResultDto, req.body ?? {})
    const error_messages = await validate(result_dto)
    if (error_messages && error_messages.length > 0) {
      const error = await handleValidationErrors(res, error_messages)
      throw res.status(401).json({ error })
    }
    const { participant_id, startTime } = req.body

    const participant = await Participant.findOne({ _id: participant_id })

    if (participant == null) {
      return res.status(400).json({
        message: 'participant not found.',
      })
    }

    if (participant.zone.toString() != req.judge.zone.toString()) {
      return res.status(400).json({
        message: 'participant and judge zone not same.',
      })
    }
    const result = await Result.findOne({
      participant_id,
      zone: req.judge.zone,
    });

    if (result) {
      if (result?.isCompleted === false) {
        return res.status(200).json({
          questionId: result?.currentQuestion,
          _id: result?._id,
          message: "Participant has not completed all questions in the bundle.",
          success: true,
        })
      } else {
        return res.status(200).json({
          message:
            'Participant has already completed all questions in the bundle.',
          success: false,
        })
      }
    } else {
      const randomBundle = await Bundle.aggregate([
        { $match: { isDeleted: false, questions: { $exists: true, $ne: [] } } },
        { $sample: { size: 1 } }, 
      ]);
      
      const bundle_id = randomBundle.length > 0 ? randomBundle[0]._id : null;
      const firstQuestion = randomBundle.length > 0 ? randomBundle[0]?.questions[0] : null;
      const bundle = await Bundle.findOne({ _id: bundle_id, isDeleted: false })
      if (!bundle) {
        return res.status(200).json({
          message: 'Bundle not found',
          success: false,
        })
      }
      const result = new Result({
        participant_id: participant_id,
        bundle_id,
        startTime,
        zone: req.judge.zone,
        currentQuestion: firstQuestion,
      })
      await result.save()

      const judges = await Judge.find(
        { zone: req.judge.zone, isDeleted: false },
        { _id: 1 },
      )
      const answersPromises = judges.map(async (item: any) => {
        const createdAnswer = await Answer.create({
          question_id: firstQuestion,
          result_id: result?._id,
          judge_id: item._id,
          startTime,
        })
      })
      await Promise.all(answersPromises)

      return res.status(200).json({
        message: 'Result saved successfully',
        result: result,
        questionId: firstQuestion,
        success: true,
      })
    }
  } catch (error) {
    next(error)
  }
}

export const proceedToNextQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const judge = req.judge
    const {
      question_id,
      result_id,
      startTime,
      answer_id,
      isLastSubmit,
    } = req.body
    if (!result_id || !startTime) {
      return res.status(400).json({
        message: 'required field not provided',
        success: false,
      })
    }

    const answerData = await Answer.findOne({
      result_id,
      question_id,
      judge_id: judge?._id,
      isCompleted: true,
    })

    if (answerData) {
      return res.status(400).json({
        message: 'Answer already submitted',
        success: false,
      })
    }
    if (judge?.isMain) {
      const data = await Answer.findOneAndUpdate(
        { _id: answer_id },
        { endTime: startTime, isCompleted: true },
        { new: true },
      )
    }
    let data
    if (isLastSubmit) {
      const resultData = await Result.findOneAndUpdate(
        { _id: result_id },
        { endTime: startTime, isCompleted: true, currentQuestion: null },
        { new: true },
      )
    } else {
      const result = await Result.findOneAndUpdate(
        { _id: result_id },
        { currentQuestion: question_id },
        { new: true },
      )
      const judges = await Judge.find(
        { zone: req.judge.zone, isDeleted: false },
        { _id: 1 },
      )
      const answersPromises = judges.map(async (item: any) => {
        const createdAnswer = await Answer.create({
          question_id,
          result_id,
          judge_id: item._id,
          startTime,
        })
      })
      data = await Promise.all(answersPromises)
    }

    return res.status(200).json({
      message: 'Result saved successfully',
      result: data,
      success: true,
    })
  } catch (error) {
    next(error)
  }
}
export const answersSubmit = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const answers_dto = plainToClass(AnswersDto, req.body ?? {})
    const error_messages = await validate(answers_dto)
    if (error_messages && error_messages.length > 0) {
      const error = await handleValidationErrors(res, error_messages)
      throw res.status(404).json({ error })
    }

    const judge = req.judge
    const {
      question_id,
      result_id,
      answer_id,
      endTime,
      answer,
      score,
    } = req.body

    const answerData = await Answer.findOne({
      result_id,
      question_id,
      judge_id: judge?._id,
      isCompleted: true,
    })

    if (answerData) {
      return res.status(400).json({
        message: 'Answer already submitted',
        success: false,
      })
    }

    const data = await Answer.findOneAndUpdate(
      { _id: answer_id },
      { endTime, score, answer, isCompleted: true },
      { new: true },
    )

    return res.status(200).json({
      message: 'Result saved successfully',
      result: data,
      success: true,
    })
  } catch (error) {
    next(error)
  }
}

export const getParticipantQuestions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { result_id } = req.params

    const result = await Result.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(result_id),
        },
      },
      {
        $lookup: {
          from: 'bundles',
          localField: 'bundle_id',
          foreignField: '_id',
          as: 'bundle',
        },
      },
      {
        $unwind: {
          path: '$bundle',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'questions',
          localField: 'bundle.questions',
          foreignField: '_id',
          as: 'questions',
        },
      },
      {
        $unwind: {
          path: '$questions',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'answers',
          let: { result_id: '$_id', question_id: '$questions._id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$result_id', '$$result_id'] },
                    { $eq: ['$question_id', '$$question_id'] },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: 'judges',
                localField: 'judge_id',
                foreignField: '_id',
                as: 'judge',
              },
            },
            {
              $unwind: {
                path: '$judge',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                answer: 1,
                score: 1,
                judge_id: 1,
                isCompleted: 1,
                isMain: '$judge.isMain', // Flatten isMain to be part of the submittedAnswers
              },
            },
          ],
          as: 'submittedAnswers', // Keep all submitted answers as an array
        },
      },
      // Add a lookup for Participant to include name and zone
      {
        $lookup: {
          from: 'participants',
          localField: 'participant_id',
          foreignField: '_id',
          as: 'participant',
        },
      },
      {
        $unwind: {
          path: '$participant',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: '$_id',
          bundle_id: { $first: '$bundle_id' },
          participant_id: { $first: '$participant_id' },
          participant_name: { $first: '$participant.name' },
          participant_image: { $first: '$participant.image' },
          questions: {
            $push: {
              _id: '$questions._id',
              question: '$questions.question',
              answer: '$questions.answer',
              submittedAnswers: '$submittedAnswers', // Now an array of all answers with flattened isMain
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          bundle_id: 1,
          participant_id: 1,
          participant_name: 1,
          participant_image: 1,
          questions: 1,
        },
      },
    ])

    if (result.length === 0) {
      return res.status(404).json({
        message: 'No results found for the participant.',
        success: false,
      })
    }

    return res.status(200).json({
      message: 'Questions fetched successfully',
      success: true,
      data: result[0],
    })
  } catch (error) {
    next(error)
  }
}
export const getParticipantQuestionsByZone = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { zone_id } = req.params
    console.log(zone_id,"zoneId");
    

    const result = await Result.find({
      zone: new mongoose.Types.ObjectId(zone_id),
      isCompleted: false,
    })

    return res.status(200).json({
      message: 'Result fetched successfully',
      success: true,
      data: result,
    })
  } catch (error) {
    console.log(error,"error");
    
    next(error)
  }
}
